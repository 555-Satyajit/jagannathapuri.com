const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'controllers', 'api', 'adminApiDashboardController.js');
let content = fs.readFileSync(file, 'utf8');

const cacheLogic = `
let dashboardCache = { data: null, lastFetch: 0 };
let engagementCache = { data: null, lastFetch: 0 };
const CACHE_TTL = 60 * 1000; // 60 seconds

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
`;

content = content.replace(/exports\.apiGetEngagementAnalytics = async \(req, res\) => \{\n    console\.log\('=> Hitting apiGetEngagementAnalytics'\);\n    try \{/g, cacheLogic);

const cacheDashboardLogic = `
exports.apiGetDashboardOverview = async (req, res) => {
    try {
        const staff = req.user;
        const nowTime = Date.now();
        
        if (dashboardCache.data && (nowTime - dashboardCache.lastFetch < CACHE_TTL)) {
            console.log('Serving dashboard from cache');
            const cachedData = { ...dashboardCache.data, staff: { name: staff ? staff.full_name : "Admin User", role: "Super Admin" } };
            return res.json({ success: true, data: cachedData });
        }
`;

content = content.replace(/exports\.apiGetDashboardOverview = async \(req, res\) => \{\n    try \{/g, cacheDashboardLogic);

// We need to save to cache at the end of Engagement
const engSaveLogic = `
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
`;
content = content.replace(/res\.json\(\{\n\s+success: true,\n\s+data: \{\n\s+engagementRate,[\s\S]*?recentCustomers: formattedRecentCustomers\n\s+\}\n\s+\}\);/g, engSaveLogic);

// We need to save to cache at the end of Dashboard
const dashSaveLogic = `
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
            orderStatus,
            topProducts: topProducts.filter(Boolean),
            visitorStats: processedStats,
            lowStockProducts
        };
        
        dashboardCache.data = responseData;
        dashboardCache.lastFetch = Date.now();

        res.json({
            success: true,
            data: {
                ...responseData,
                staff: { name: staff ? staff.full_name : "Admin User", role: "Super Admin" }
            }
        });
`;
content = content.replace(/res\.json\(\{\n\s+success: true,\n\s+data: \{\n\s+staff: \{ name: staff \? staff\.full_name : "Admin User", role: "Super Admin" \},[\s\S]*?lowStockProducts\n\s+\}\n\s+\}\);/g, dashSaveLogic);

fs.writeFileSync(file, content);
console.log('Added 60-second in-memory caching');
