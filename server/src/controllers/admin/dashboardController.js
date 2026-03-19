const prisma = require('../../lib/prisma');

exports.getAuditLogs = async (req, res) => {
    try {
        const staff = req.user;

        // Fetch metadata for filters
        const [admins, actions, entities] = await Promise.all([
            prisma.staff.findMany({
                where: { auditLogs: { some: {} } },
                select: { id: true, full_name: true }
            }),
            prisma.auditLog.groupBy({ by: ['action'] }),
            prisma.auditLog.groupBy({ by: ['entity'], where: { entity: { not: null } } })
        ]);

        req.app.render('pages/audit-logs', {
            admins,
            actions: actions.map(a => a.action),
            entities: entities.map(e => e.entity),
            user: req.user,
            staff
        }, (err, html) => {
            if (err) {
                console.error('Error rendering audit logs:', err);
                return res.status(500).send('Error rendering audit logs');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Audit Logs',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js',
                    '/admin-assets/js/audit-logs-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching audit logs metadata:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAuditLogsData = async (req, res) => {
    try {
        const { adminId, action, entity, search, startDate, endDate, ipAddress } = req.query;
        let where = {};

        if (adminId) where.adminId = parseInt(adminId);
        if (action) where.action = action;
        if (entity) where.entity = entity;
        if (ipAddress) where.ipAddress = { contains: ipAddress, mode: 'insensitive' };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                // Parse as local start of day and convert to Date
                where.createdAt.gte = new Date(startDate + 'T00:00:00');
            }
            if (endDate) {
                // Parse as local end of day
                where.createdAt.lte = new Date(endDate + 'T23:59:59.999');
            }
        }
    
        // Combined filters (admin, action, entity, date, ip)
        let finalWhere = { ...where };

        // If search is provided, it must also satisfy the filters above
        if (search) {
            finalWhere = {
                AND: [
                    where,
                    {
                        OR: [
                            { oldValues: { contains: search, mode: 'insensitive' } },
                            { newValues: { contains: search, mode: 'insensitive' } },
                            { metadata: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                ]
            };
        }

        const logs = await prisma.auditLog.findMany({
            where: finalWhere,
            orderBy: { createdAt: 'desc' },
            include: { admin: { select: { full_name: true } } }
        });

        res.json({ data: logs });
    } catch (error) {
        console.error('Error fetching audit logs data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getDashboard = async (req, res) => {
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
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    paymentStatus: 1 // Paid
                }
            }),
            prisma.order.count(),
            prisma.product.count(),
            prisma.customer.count(),
            prisma.order.findMany({
                take: 5,
                orderBy: { created_at: 'desc' },
                include: { customer: true }
            }),
            prisma.$queryRaw`SELECT * FROM "Product" WHERE quantity <= "lowStockThreshold" ORDER BY quantity ASC LIMIT 5`,

            prisma.order.findMany({
                where: {
                    created_at: {
                        gte: sevenDaysAgo
                    },
                    paymentStatus: 1
                },
                select: {
                    created_at: true,
                    totalAmount: true
                }
            }),
            prisma.order.findMany({
                where: {
                    paymentStatus: 1
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: { costPrice: true }
                            }
                        }
                    }
                }
            }),
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    paymentStatus: 1,
                    created_at: { gte: firstDayCurrentMonth }
                }
            }),
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    paymentStatus: 1,
                    created_at: { gte: firstDayLastMonth, lte: lastDayLastMonth }
                }
            }),
            prisma.order.groupBy({
                by: ['status'],
                _count: { status: true }
            }),
            prisma.newsletter.count(),
            prisma.visitorLog.findMany({
                take: 1000,
                orderBy: { timestamp: 'desc' },
                select: { userAgent: true }
            }),
            prisma.visitorLog.groupBy({
                by: ['sessionId'],
                _count: { sessionId: true }
            }).then(res => res.length),
            prisma.order.count({
                where: {
                    paymentStatus: { in: [3, 4] } // 3: Failed, 4: Cancelled
                }
            }),
            prisma.orderItem.groupBy({
                by: ['productId'],
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5
            })
        ]);

        const totalRevenue = totalRevenueAgg._sum.totalAmount || 0;

        // Process User Statistics (Browsers & Platforms)
        const browserStats = {
            'Chrome': 0,
            'Safari': 0,
            'Firefox': 0,
            'Edge': 0,
            'Other': 0
        };
        const platformStats = {
            'Windows': 0,
            'MacOS': 0,
            'Android': 0,
            'iOS': 0,
            'Linux': 0,
            'Other': 0
        };

        recentLogs.forEach(log => {
            const ua = log.userAgent || '';
            
            // Simple Browser Detection
            if (ua.includes('Edg/')) browserStats['Edge']++;
            else if (ua.includes('Chrome')) browserStats['Chrome']++;
            else if (ua.includes('Safari') && !ua.includes('Chrome')) browserStats['Safari']++;
            else if (ua.includes('Firefox')) browserStats['Firefox']++;
            else browserStats['Other']++;

            // Simple Platform Detection
            if (ua.includes('Windows')) platformStats['Windows']++;
            else if (ua.includes('Macintosh')) platformStats['MacOS']++;
            else if (ua.includes('Android')) platformStats['Android']++;
            else if (ua.includes('iPhone') || ua.includes('iPad')) platformStats['iOS']++;
            else if (ua.includes('Linux')) platformStats['Linux']++;
            else platformStats['Other']++;
        });

        // Convert to Percentages for top 5
        const totalLogs = recentLogs.length || 1;
        const processedStats = Object.entries(browserStats)
            .map(([name, count]) => ({
                name,
                count,
                percentage: ((count / totalLogs) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Fetch details for top selling products
        const topProducts = await Promise.all(topSellingData.map(async (item) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                include: { category: true }
            });
            return {
                ...product,
                totalSold: item._sum.quantity
            };
        }));

        // Calculate Profit
        let totalProfit = 0;
        paidOrdersForProfit.forEach(order => {
            order.items.forEach(item => {
                const cost = item.product.costPrice || 0;
                const sellingPrice = item.price;
                const profit = (sellingPrice - cost) * item.quantity;
                totalProfit += profit;
            });
        });

        // Sales Overview Data
        const currentMonthRevenue = currentMonthOrders._sum.totalAmount || 0;
        const lastMonthRevenue = lastMonthOrders._sum.totalAmount || 0;
        const averageDailySales = currentMonthRevenue / now.getDate();
        const salesPerformance = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 100;

        // Process last 7 days revenue (Revenue Growth Chart)
        const salesData = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            salesData[d.toISOString().split('T')[0]] = 0;
        }

        last7DaysOrders.forEach(order => {
            const date = order.created_at.toISOString().split('T')[0];
            if (salesData[date] !== undefined) {
                salesData[date] += order.totalAmount;
            }
        });

        const revenueChartLabels = Object.keys(salesData);
        const revenueChartData = Object.values(salesData);

        // Weekly Order Summary (Area Chart) - Using Revenue for graph
        const weeklyOrderSummaryData = Object.values(salesData); // Reuse same daily data for consistency
        const weeklyOrderSummaryLabels = Object.keys(salesData);

        let completed = 0, active = 0;
        orderStatusCounts.forEach(stat => {
            if (stat.status === 4) {
                completed += stat._count.status; // Delivered
            } else {
                active += stat._count.status; // Active/Pending
            }
        });

        const orderStatusSeries = [completed, active, failedOrdersCount];

        req.app.render('pages/admin-dashboard', {
            totalRevenue,
            totalProfit,
            totalOrders,
            totalProducts,
            totalCustomers,
            recentOrders,
            lowStockProducts,
            revenueChartLabels: JSON.stringify(revenueChartLabels),
            revenueChartData: JSON.stringify(revenueChartData),
            weeklyOrderSummaryData: JSON.stringify(weeklyOrderSummaryData),
            weeklyOrderSummaryLabels: JSON.stringify(weeklyOrderSummaryLabels),
            orderStatusSeries: JSON.stringify(orderStatusSeries),
            orderStatusLabels: JSON.stringify(['Completed', 'Pending', 'Failed']),
            currentMonthRevenue,
            averageDailySales,
            salesPerformance: salesPerformance.toFixed(1),
            totalNewsletter,
            totalUniqueVisitors,
            visitorStats: processedStats,
            topProducts,
            staff
        }, (err, html) => {
            if (err) {
                console.error('Error rendering admin dashboard:', err);
                return res.status(500).send('Error rendering admin dashboard');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Admin Dashboard',
                staff,
                scripts: ['/admin-assets/vendor/libs/apex-charts/apexcharts.js', '/admin-assets/js/admin-dashboard-real.js']
            });
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getEngagementAnalytics = async (req, res) => {
    try {
        const staff = req.user;

        // Date Filtering
        const { startDate, endDate } = req.query;
        let dateFilter = {};
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        if (startDate && endDate) {
            dateFilter = {
                timestamp: {
                    gte: new Date(startDate),
                    lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
                }
            };
        } else {
            dateFilter = { timestamp: { gte: thirtyDaysAgo } };
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
        const dailyHits = {};
        const libraryHits = {};
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
        const engagementRate = totalUniqueVisitors > 0 ? (engagedSessionsCount / totalUniqueVisitors) * 100 : 0;

        // Retention: Unique visitors in this window who had logs before this window
        const windowStart = startDate ? new Date(startDate) : thirtyDaysAgo;
        const returningVisitorsCount = await prisma.visitorLog.groupBy({
            by: ['sessionId'],
            where: {
                sessionId: { in: Array.from(uniqueSessions) },
                timestamp: { lt: windowStart }
            }
        }).then(res => res.length);
        const retentionRate = totalUniqueVisitors > 0 ? (returningVisitorsCount / totalUniqueVisitors) * 100 : 0;

        // Library-Specific Metrics
        const libraryLogs = visitorLogs.filter(l => l.url.startsWith('/library'));
        const librarySessions = new Set(libraryLogs.map(l => l.sessionId));
        const totalLibVisitors = librarySessions.size;

        const libSessionHitCounts = {};
        libraryLogs.forEach(l => {
            libSessionHitCounts[l.sessionId] = (libSessionHitCounts[l.sessionId] || 0) + 1;
        });
        const engagedLibSessionsCount = Object.values(libSessionHitCounts).filter(count => count > 1).length;
        const libraryEngagementRate = totalLibVisitors > 0 ? (engagedLibSessionsCount / totalLibVisitors) * 100 : 0;

        const returningLibVisitorsCount = await prisma.visitorLog.groupBy({
            by: ['sessionId'],
            where: {
                sessionId: { in: Array.from(librarySessions) },
                url: { startsWith: '/library' },
                timestamp: { lt: windowStart }
            }
        }).then(res => res.length);
        const libraryRetentionRate = totalLibVisitors > 0 ? (returningLibVisitorsCount / totalLibVisitors) * 100 : 0;

        visitorLogs.forEach(log => {
            const date = log.timestamp.toISOString().split('T')[0];
            dailyHits[date] = (dailyHits[date] || 0) + 1;
            
            if (log.url.startsWith('/library')) {
                const slug = log.url.split('/library/')[1]?.split('?')[0]; // Handle query params if any
                if (slug) {
                    contentHits[log.url] = (contentHits[log.url] || 0) + 1;
                    (slugToCategories[slug] || ['Uncategorized']).forEach(catName => {
                        categoryHits[catName] = (categoryHits[catName] || 0) + 1;
                    });
                }
                libraryHits[date] = (libraryHits[date] || 0) + 1;
                sections.Library++;
            } else if (log.url.startsWith('/shop') || log.url.startsWith('/product')) {
                sections.Store++;
            } else if (log.url === '/') {
                sections.Home++;
            } else {
                sections.Other++;
            }
        });

        // Sort Top Content
        const topContent = Object.keys(contentHits)
            .map(url => ({
                url,
                title: slugToTitle[url] || url.replace('/library/', '').replace('-', ' '),
                hits: contentHits[url]
            }))
            .sort((a, b) => b.hits - a.hits)
            .slice(0, 5);

        // Prepare data for the view
        const chartData = {
            dates: Object.keys(dailyHits).sort(),
            dailyHits: Object.keys(dailyHits).sort().map(d => dailyHits[d]),
            libraryHits: Object.keys(dailyHits).sort().map(d => libraryHits[d] || 0),
            sections: [sections.Library, sections.Store, sections.Home, sections.Other],
            categoryLabels: Object.keys(categoryHits),
            categoryData: Object.values(categoryHits)
        };

        req.app.render('pages/admin-engagement-analytics', {
            chartData,
            recentCustomers,
            topContent,
            engagementRate: engagementRate.toFixed(1),
            retentionRate: retentionRate.toFixed(1),
            libraryEngagementRate: libraryEngagementRate.toFixed(1),
            libraryRetentionRate: libraryRetentionRate.toFixed(1),
            currentFilters: { startDate, endDate },
            staff
        }, (err, html) => {
            if (err) {
                console.error('Error rendering engagement analytics:', err);
                return res.status(500).send('Error rendering engagement analytics');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Engagement Analytics',
                staff,
                scripts: [
                    '/admin-assets/vendor/libs/apex-charts/apexcharts.js',
                    '/admin-assets/vendor/libs/chartjs/chartjs.js',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js'
                ],
                styles: ['/admin-assets/vendor/libs/flatpickr/flatpickr.css']
            });
        });
    } catch (error) {
        console.error('Error fetching engagement analytics data:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.update({
            where: { id: parseInt(id) },
            data: { isArchived: true }
        });
        res.json({ success: true, message: 'Notification removed' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await prisma.notification.update({
            where: { id: parseInt(id) },
            data: { isRead: true }
        });

        // Redirect to the notification's link (Product View page)
        res.redirect(notification.link);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.redirect('/admin'); // Fallback
    }
};
