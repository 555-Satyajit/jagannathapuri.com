const prisma = require('../../lib/prisma');


let dashboardCache = { data: null, lastFetch: 0 };
let engagementCache = { data: null, lastFetch: 0 };
const CACHE_TTL = 60 * 1000; // 60 seconds

exports.clearDashboardCache = () => {
    dashboardCache.lastFetch = 0;
};

exports.apiGetEngagementAnalytics = async (req, res) => {
    console.log('=> Hitting apiGetEngagementAnalytics');
    try {
        const { startDate, endDate } = req.query;
        
        // Only use cache if no custom date filters are applied
        const nowTime = Date.now();
        if (!startDate && !endDate && engagementCache.data && (nowTime - engagementCache.lastFetch < CACHE_TTL)) {
            console.log('Serving engagement from cache');
            return res.json({ success: true, data: engagementCache.data });
        }

        let dateFilter = {};
        const now = new Date();
        console.log('=> Starting Prisma queries');
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        if (startDate && endDate) {
            dateFilter = {
                timestamp: {
                    gte: new Date(startDate),
                    lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            };
        } else {
            // Default to last 7 days for the chart
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateFilter = { timestamp: { gte: sevenDaysAgo } };
        }

        const [
            visitorLogs,
            recentCustomers,
            libraryContent,
            libraryCategories
        ] = await Promise.all([
            prisma.visitorLog.findMany({
                where: dateFilter,
                orderBy: { timestamp: 'asc' }
            }),
            prisma.customer.findMany({ take: 5, orderBy: { created_at: 'desc' } }),
            prisma.libraryContent.findMany({ select: { id: true, title: true, slug: true } }),
            prisma.libraryCategory.findMany({ include: { contents: { select: { slug: true } } } })
        ]);

        // Mapping slug to title for easy lookup
        const slugToTitle = {};
        libraryContent.forEach(item => {
            slugToTitle[`/library/${item.slug}`] = item.title;
        });

        // Mapping slug to category names
        const slugToCategories = {};
        libraryCategories.forEach(cat => {
            cat.contents.forEach(content => {
                if (!slugToCategories[content.slug]) slugToCategories[content.slug] = [];
                slugToCategories[content.slug].push(cat.name);
            });
        });

        // Process data for charts
        const dailyHitsMap = {};
        const libraryHitsMap = {};
        const sections = { Library: 0, Store: 0, Home: 0, Other: 0 };
        const contentHits = {};
        const categoryHits = {};

        // Advanced Metrics: Engagement & Retention
        const totalHits = visitorLogs.length;
        const uniqueSessions = new Set(visitorLogs.map(l => l.sessionId));
        const totalUniqueVisitors = uniqueSessions.size;

        // Engagement: Sessions with > 1 hit
        const sessionHitCounts = {};
        visitorLogs.forEach(l => {
            sessionHitCounts[l.sessionId] = (sessionHitCounts[l.sessionId] || 0) + 1;
        });
        const engagedSessionsCount = Object.values(sessionHitCounts).filter(count => count > 1).length;
        const engagementRate = totalUniqueVisitors > 0 ? Math.round((engagedSessionsCount / totalUniqueVisitors) * 100) : 0;

        // Retention: Unique visitors in this window who had logs before this window
        const windowStart = startDate ? new Date(startDate) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        let returningVisitorsCount = 0;
        const sessionArray = Array.from(uniqueSessions);
        for (let i = 0; i < sessionArray.length; i += 500) {
            const chunk = sessionArray.slice(i, i + 500);
            const count = await prisma.visitorLog.findMany({
                where: {
                    sessionId: { in: chunk },
                    timestamp: { lt: windowStart }
                },
                distinct: ['sessionId'],
                select: { sessionId: true }
            }).then(res => res.length);
            returningVisitorsCount += count;
        }
        
        const retentionRate = totalUniqueVisitors > 0 ? Math.round((returningVisitorsCount / totalUniqueVisitors) * 100) : 0;

        // Library-Specific Metrics
        const libraryLogs = visitorLogs.filter(l => l.url.startsWith('/library'));
        const librarySessions = new Set(libraryLogs.map(l => l.sessionId));
        const totalLibVisitors = librarySessions.size;

        const libSessionHitCounts = {};
        libraryLogs.forEach(l => {
            libSessionHitCounts[l.sessionId] = (libSessionHitCounts[l.sessionId] || 0) + 1;
        });
        const engagedLibSessionsCount = Object.values(libSessionHitCounts).filter(count => count > 1).length;
        const libraryEngagementRate = totalLibVisitors > 0 ? Math.round((engagedLibSessionsCount / totalLibVisitors) * 100) : 0;

        let returningLibVisitorsCount = 0;
        const libSessionArray = Array.from(librarySessions);
        for (let i = 0; i < libSessionArray.length; i += 500) {
            const chunk = libSessionArray.slice(i, i + 500);
            const count = await prisma.visitorLog.findMany({
                where: {
                    sessionId: { in: chunk },
                    url: { startsWith: '/library' },
                    timestamp: { lt: windowStart }
                },
                distinct: ['sessionId'],
                select: { sessionId: true }
            }).then(res => res.length);
            returningLibVisitorsCount += count;
        }
        
        const libraryRetentionRate = totalLibVisitors > 0 ? Math.round((returningLibVisitorsCount / totalLibVisitors) * 100) : 0;

        visitorLogs.forEach(log => {
            const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(log.timestamp);
            dailyHitsMap[dateStr] = (dailyHitsMap[dateStr] || 0) + 1;
            
            if (log.url.startsWith('/library')) {
                const slug = log.url.split('/library/')[1]?.split('?')[0];
                if (slug) {
                    contentHits[log.url] = (contentHits[log.url] || 0) + 1;
                    (slugToCategories[slug] || ['Uncategorized']).forEach(catName => {
                        categoryHits[catName] = (categoryHits[catName] || 0) + 1;
                    });
                }
                libraryHitsMap[dateStr] = (libraryHitsMap[dateStr] || 0) + 1;
                sections.Library++;
            } else if (log.url.startsWith('/shop') || log.url.startsWith('/product')) {
                sections.Store++;
            } else if (log.url === '/') {
                sections.Home++;
            } else {
                sections.Other++;
            }
        });

        // Format Daily Hits Array for Recharts
        const dailyHits = Object.keys(dailyHitsMap).map(date => ({
            date,
            total: dailyHitsMap[date],
            library: libraryHitsMap[date] || 0
        }));

        // Format Section Popularity Array
        const sectionPopularity = Object.keys(sections).map(section => ({
            section,
            views: sections[section],
            fill: `var(--color-${section})`
        })).filter(s => s.views > 0);

        // Format Category Interest Array
        const categoryInterest = Object.keys(categoryHits).map(category => ({
            category,
            views: categoryHits[category],
            fill: "var(--color-primary)"
        })).sort((a, b) => b.views - a.views);

        // Sort Top Content
        const topContent = Object.keys(contentHits)
            .map((url, idx) => ({
                id: idx + 1,
                title: slugToTitle[url] || url.replace('/library/', '').replace('-', ' '),
                hits: contentHits[url],
                url
            }))
            .sort((a, b) => b.hits - a.hits)
            .slice(0, 5);

        // Format Recent Customers
        const formattedRecentCustomers = recentCustomers.map((c, idx) => ({
            id: c.id,
            fullName: c.fullName || 'Anonymous',
            email: c.email || 'N/A',
            status: c.status || 'Active',
            joined: c.created_at.toISOString().split('T')[0]
        }));

        
        const responseData = {
            engagementRate,
            retentionRate,
            libraryEngagementRate,
            libraryRetentionRate,
            dailyHits,
            sectionPopularity,
            categoryInterest,
            topContent,
            recentCustomers: formattedRecentCustomers
        };
        
        if (!startDate && !endDate) {
            engagementCache.data = responseData;
            engagementCache.lastFetch = Date.now();
        }

        res.json({
            success: true,
            data: responseData
        });


    } catch (error) {
        console.error('API Error fetching engagement analytics:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


exports.apiGetDashboardOverview = async (req, res) => {
    try {
        const staff = req.user;
        const nowTime = Date.now();
        const { selectedDate } = req.query;
        let selectedDateRevenue = 0;
        let selectedDateOrders = 0;
        const targetDateStr = selectedDate ? selectedDate : null;
        
        if (!selectedDate && dashboardCache.data && (nowTime - dashboardCache.lastFetch < CACHE_TTL)) {
            console.log('Serving dashboard from cache');
            const cachedData = { ...dashboardCache.data, staff: { name: staff ? staff.full_name : "Admin User", role: "Super Admin" } };
            return res.json({ success: true, data: cachedData });
        }

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
            prisma.$queryRaw`SELECT * FROM "Product" WHERE quantity <= "lowStockThreshold" ORDER BY quantity ASC LIMIT 5`,
            prisma.newsletter.count(),
            prisma.visitorLog.findMany({ take: 1000, orderBy: { timestamp: 'desc' }, select: { userAgent: true } }),
            prisma.$queryRaw`SELECT COUNT(DISTINCT "sessionId")::int as count FROM "VisitorLog"`,
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

        const dailySalesMap = {};
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            dailySalesMap[new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(d)] = 0;
        }

        const monthlySalesMap = {};
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthlySalesMap[new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(d)] = 0;
        }

        const yearlySalesMap = {};
        for (let i = 4; i >= 0; i--) {
            yearlySalesMap[now.getFullYear() - i] = 0;
        }

        allOrders.forEach(order => {
            const isPaid = order.paymentStatus === 1;
            const created = new Date(order.created_at);
            
            // Status counts
            if (order.status === 2) {
                completed++;
            } else if (order.status === 3 || order.paymentStatus === 3 || order.paymentStatus === 4) {
                failedOrdersCount++;
            } else {
                active++;
            }

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

                // Comprehensive charts
                if (created >= thirtyDaysAgo) {
                    const dayStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(created);
                    if (dailySalesMap[dayStr] !== undefined) dailySalesMap[dayStr] += order.totalAmount;
                }

                const monthStr = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(created);
                if (monthlySalesMap[monthStr] !== undefined) monthlySalesMap[monthStr] += order.totalAmount;

                const yearStr = created.getFullYear();
                if (yearlySalesMap[yearStr] !== undefined) yearlySalesMap[yearStr] += order.totalAmount;
            }

            if (targetDateStr) {
                const orderDateStr = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(created);
                if (orderDateStr === targetDateStr) {
                    if (isPaid) {
                        selectedDateRevenue += order.totalAmount;
                    }
                    if (order.status !== 3 && order.status !== 4 && order.status !== 5) {
                        selectedDateOrders++;
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
        const dailyRevenueChart = Object.entries(dailySalesMap).map(([date, revenue]) => ({ date, revenue }));
        const monthlyRevenueChart = Object.entries(monthlySalesMap).map(([date, revenue]) => ({ date, revenue }));
        const yearlyRevenueChart = Object.entries(yearlySalesMap).map(([date, revenue]) => ({ date, revenue }));
        
        const orderStatus = [
            { status: "Completed", count: completed, fill: "var(--color-Completed)" },
            { status: "Pending", count: active, fill: "var(--color-Pending)" },
            { status: "Failed", count: failedOrdersCount, fill: "var(--color-Failed)" }
        ];

        
        const responseData = {
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
            dailyRevenueChart,
            monthlyRevenueChart,
            yearlyRevenueChart,
            orderStatus,
            topProducts: topProducts.filter(Boolean),
            visitorStats: processedStats,
            lowStockProducts,
            selectedDateRevenue,
            selectedDateOrders,
            selectedDateStr: targetDateStr
        };
        
        if (!selectedDate) {
            dashboardCache.data = responseData;
            dashboardCache.lastFetch = Date.now();
        }

        res.json({
            success: true,
            data: {
                ...responseData,
                staff: { name: staff ? staff.full_name : "Admin User", role: "Super Admin" }
            }
        });

    } catch (error) {
        console.error('API Error fetching dashboard overview:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
// Trigger nodemon restart
