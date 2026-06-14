const { apiGetDashboardOverview } = require('./src/controllers/api/adminApiDashboardController');

const req = { user: { id: 1, full_name: 'Test' } };
const res = {
    json: () => {},
    status: () => ({ json: () => {} })
};

async function test() {
    console.time('apiGetDashboardOverview_Cold');
    await apiGetDashboardOverview(req, res);
    console.timeEnd('apiGetDashboardOverview_Cold');

    console.time('apiGetDashboardOverview_Warm');
    await apiGetDashboardOverview(req, res);
    console.timeEnd('apiGetDashboardOverview_Warm');
}
test();
