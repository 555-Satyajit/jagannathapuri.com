const { apiGetDashboardOverview } = require('./src/controllers/api/adminApiDashboardController');

const req = { user: { id: 1, full_name: 'Test' } };
const res = {
    json: (data) => {
        console.timeEnd('apiGetDashboardOverview');
        console.log('Success:', data.success);
    },
    status: (code) => {
        console.log('Status:', code);
        return { json: (err) => console.log(err) };
    }
};

console.time('apiGetDashboardOverview');
apiGetDashboardOverview(req, res);
