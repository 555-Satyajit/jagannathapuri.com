const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'controllers', 'api', 'adminApiDashboardController.js');
let content = fs.readFileSync(file, 'utf8');

// The new fast version
const fastFunction = `exports.apiGetDashboardOverview = async (req, res) => {
    try {
        const staff = req.user;
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Fetch just 7 queries instead of 16
        const [
            allOrders,
            totalProducts,
            totalCustomers,
            lowStockProducts,
            totalNewsletter,
            recentLogs,
            uniqueVisitorsCount,
            topSellingData
        ] = await Promise.all([
            prisma.order.findMany({
                include: { customer: true, items: { include: { product: { select: { costPrice: true } } } } }
            }),
            prisma.product.count(),
            prisma.customer.count(),
            prisma.$queryRaw\`SELECT * FROM "Product" WHERE quantity <= "lowStockThreshold" ORDER BY quantity ASC LIMIT 5\`,
            prisma.newsletter.count(),
            prisma.visitorLog.findMany({ take: 1000, orderBy: { timestamp: 'desc' }, select: { userAgent: true } }),
            prisma.$queryRaw\`SELECT COUNT(DISTINCT "sessionId")::int as count FROM "VisitorLog"\`,
            prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 })
        ]);

        // Aggregate orders in memory (extremely fast in JS)
        let totalRevenue = 0;
        let totalProfit = 0;
        let currentMonthRevenue = 0;
        let lastMonthRevenue = 0;
        let completed = 0;
        let active = 0;
        let failedOrdersCount = 0;
        
        const salesData = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(d);
            salesData[dateStr] = 0;
        }

        allOrders.forEach(order => {
            const isPaid = order.paymentStatus === 1;
            const created = new Date(order.created_at);
            
            // Status counts
            if (order.status === 4) completed++;
            else active++;
            if (order.paymentStatus === 3 || order.paymentStatus === 4) failedOrdersCount++;

            if (isPaid) {
                totalRevenue += order.totalAmount;
                
                // Profit calculation
                order.items.forEach(item => {
                    const cost = item.product?.costPrice || 0;
                    totalProfit += (item.price - cost) * item.quantity;
                });

                // Monthly comparisons
                if (created >= firstDayCurrentMonth) currentMonthRevenue += order.totalAmount;
                if (created >= firstDayLastMonth && created <= lastDayLastMonth) lastMonthRevenue += order.totalAmount;

                // 7 days chart
                if (created >= sevenDaysAgo) {
                    const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(created);
                    if (salesData[dateStr] !== undefined) {
                        salesData[dateStr] += order.totalAmount;
                    }
                }
            }
        });

        const recentOrders = allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
        const totalOrders = allOrders.length;
        const totalUniqueVisitors = uniqueVisitorsCount[0]?.count || 0;

        // Process User Statistics
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

        const averageDailySales = currentMonthRevenue / now.getDate();
        const salesPerformance = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 100;
        const revenueChartData = Object.entries(salesData).map(([date, revenue]) => ({ date, revenue }));
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
};`;

// replace everything from exports.apiGetDashboardOverview = async to the end of the file
content = content.replace(/exports\.apiGetDashboardOverview = async [\s\S]*$/, fastFunction);

fs.writeFileSync(file, content);
console.log('Optimized dashboard queries');
