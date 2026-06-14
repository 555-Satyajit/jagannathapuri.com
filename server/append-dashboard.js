const fs = require('fs');
const path = require('path');

const codeToAppend = `
exports.apiGetDashboardOverview = async (req, res) => {
    try {
        const staff = req.user;

        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            totalRevenueAgg,
            totalOrders,
            totalProducts,
            totalCustomers,
            recentOrders,
            lowStockProducts,
            last7DaysOrders,
            paidOrdersForProfit,
            currentMonthOrders,
            lastMonthOrders,
            orderStatusCounts,
            totalNewsletter,
            recentLogs,
            totalUniqueVisitors,
            failedOrdersCount,
            topSellingData
        ] = await Promise.all([
            prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 1 } }),
            prisma.order.count(),
            prisma.product.count(),
            prisma.customer.count(),
            prisma.order.findMany({ take: 5, orderBy: { created_at: 'desc' }, include: { customer: true } }),
            prisma.$queryRaw\`SELECT * FROM "Product" WHERE quantity <= "lowStockThreshold" ORDER BY quantity ASC LIMIT 5\`,
            prisma.order.findMany({
                where: { created_at: { gte: sevenDaysAgo }, paymentStatus: 1 },
                select: { created_at: true, totalAmount: true }
            }),
            prisma.order.findMany({
                where: { paymentStatus: 1 },
                include: { items: { include: { product: { select: { costPrice: true } } } } }
            }),
            prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 1, created_at: { gte: firstDayCurrentMonth } } }),
            prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 1, created_at: { gte: firstDayLastMonth, lte: lastDayLastMonth } } }),
            prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
            prisma.newsletter.count(),
            prisma.visitorLog.findMany({ take: 1000, orderBy: { timestamp: 'desc' }, select: { userAgent: true } }),
            prisma.visitorLog.groupBy({ by: ['sessionId'], _count: { sessionId: true } }).then(res => res.length),
            prisma.order.count({ where: { paymentStatus: { in: [3, 4] } } }),
            prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 })
        ]);

        const totalRevenue = totalRevenueAgg._sum.totalAmount || 0;

        // Process User Statistics (Browsers & Platforms)
        const browserStats = { 'Chrome': 0, 'Safari': 0, 'Firefox': 0, 'Edge': 0, 'Other': 0 };
        const platformStats = { 'Windows': 0, 'MacOS': 0, 'Android': 0, 'iOS': 0, 'Linux': 0, 'Other': 0 };

        recentLogs.forEach(log => {
            const ua = log.userAgent || '';
            if (ua.includes('Edg/')) browserStats['Edge']++;
            else if (ua.includes('Chrome')) browserStats['Chrome']++;
            else if (ua.includes('Safari') && !ua.includes('Chrome')) browserStats['Safari']++;
            else if (ua.includes('Firefox')) browserStats['Firefox']++;
            else browserStats['Other']++;

            if (ua.includes('Windows')) platformStats['Windows']++;
            else if (ua.includes('Macintosh')) platformStats['MacOS']++;
            else if (ua.includes('Android')) platformStats['Android']++;
            else if (ua.includes('iPhone') || ua.includes('iPad')) platformStats['iOS']++;
            else if (ua.includes('Linux')) platformStats['Linux']++;
            else platformStats['Other']++;
        });

        const totalLogs = recentLogs.length || 1;
        const processedStats = Object.entries(browserStats)
            .map(([name, count]) => ({ name, count, percentage: ((count / totalLogs) * 100).toFixed(1) }))
            .sort((a, b) => b.count - a.count).slice(0, 5);

        const topProducts = await Promise.all(topSellingData.map(async (item) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId }, include: { category: true } });
            if (!product) return null;
            return {
                id: product.id,
                name: product.name,
                brand: product.brand || 'Generic',
                category: product.category?.name || 'Uncategorized',
                price: product.price,
                sold: item._sum.quantity,
                status: product.status === 1 ? 'Active' : 'Inactive'
            };
        }));

        let totalProfit = 0;
        paidOrdersForProfit.forEach(order => {
            order.items.forEach(item => {
                const cost = item.product?.costPrice || 0;
                const sellingPrice = item.price;
                const profit = (sellingPrice - cost) * item.quantity;
                totalProfit += profit;
            });
        });

        const currentMonthRevenue = currentMonthOrders._sum.totalAmount || 0;
        const lastMonthRevenue = lastMonthOrders._sum.totalAmount || 0;
        const averageDailySales = currentMonthRevenue / now.getDate();
        const salesPerformance = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 100;

        const salesData = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(d);
            salesData[dateStr] = 0;
        }

        last7DaysOrders.forEach(order => {
            const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(order.created_at);
            if (salesData[dateStr] !== undefined) {
                salesData[dateStr] += order.totalAmount;
            }
        });

        const revenueChartData = Object.entries(salesData).map(([date, revenue]) => ({ date, revenue }));

        let completed = 0, active = 0;
        orderStatusCounts.forEach(stat => {
            if (stat.status === 4) completed += stat._count.status;
            else active += stat._count.status;
        });

        const orderStatus = [
            { status: "Completed", count: completed, fill: "var(--color-Completed)" },
            { status: "Pending", count: active, fill: "var(--color-Pending)" },
            { status: "Failed", count: failedOrdersCount, fill: "var(--color-Failed)" }
        ];

        res.json({
            success: true,
            data: {
                staff: { name: staff ? staff.full_name : "Admin User", role: "Super Admin" },
                totalRevenue,
                totalProfit,
                totalOrders,
                totalProducts,
                currentMonthRevenue,
                averageDailySales,
                salesPerformance: parseFloat(salesPerformance.toFixed(1)),
                totalCustomers,
                totalNewsletter,
                totalUniqueVisitors,
                revenueChartData,
                orderStatus,
                topProducts: topProducts.filter(Boolean),
                visitorStats: processedStats,
                lowStockProducts
            }
        });
    } catch (error) {
        console.error('API Error fetching dashboard overview:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
`;

const targetFile = path.join(__dirname, 'src', 'controllers', 'api', 'adminApiDashboardController.js');
fs.appendFileSync(targetFile, codeToAppend);
console.log('Appended apiGetDashboardOverview to', targetFile);
