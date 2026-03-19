const prisma = require('../../lib/prisma');
const { logAction } = require('../../lib/auditLogger');

exports.getDailyRitualsAdmin = async (req, res) => {
    try {
        const [rituals, darshans, facts] = await Promise.all([
            prisma.dailyRitual.findMany({ orderBy: { time: 'asc' } }),
            prisma.darshanTiming.findMany({ orderBy: { created_at: 'asc' } }),
            prisma.templeFact.findMany({ orderBy: { created_at: 'desc' } })
        ]);

        req.app.render('pages/admin-rituals-list', { rituals, darshans, facts }, (err, html) => {
            if (err) {
                console.error('Error rendering rituals admin:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Daily Rituals - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                ]
            });
        });
    } catch (error) {
        console.error('Error in getDailyRitualsAdmin:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Rituals CRUD
exports.saveRitual = async (req, res) => {
    try {
        const { id, name, time, icon, status } = req.body;
        const data = { name, time, icon, status: status || 'Active' };

        if (id) {
            await prisma.dailyRitual.update({ where: { id: parseInt(id) }, data });
        } else {
            await prisma.dailyRitual.create({ data });
        }
        res.redirect('/admin/daily-rituals');
        await logAction(req, id ? 'UPDATE_RITUAL' : 'CREATE_RITUAL', 'DailyRitual', id || null, `Saved daily ritual: ${name}`);
    } catch (error) {
        console.error('Error saving ritual:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteRitual = async (req, res) => {
    try {
        const ritualId = parseInt(req.params.id);
        const ritual = await prisma.dailyRitual.findUnique({ where: { id: ritualId } });
        await prisma.dailyRitual.delete({ where: { id: ritualId } });
        res.json({ success: true });
        await logAction(req, 'DELETE_RITUAL', 'DailyRitual', ritualId, `Deleted daily ritual: ${ritual ? ritual.name : ritualId}`);
    } catch (error) {
        console.error('Error deleting ritual:', error);
        res.status(500).json({ success: false });
    }
};

// Darshan Timings CRUD
exports.saveDarshanTiming = async (req, res) => {
    try {
        const { id, name, timeRange, type, status } = req.body;
        const data = { name, timeRange, type, status: status || 'Active' };

        if (id) {
            await prisma.darshanTiming.update({ where: { id: parseInt(id) }, data });
        } else {
            await prisma.darshanTiming.create({ data });
        }
        res.redirect('/admin/daily-rituals');
        await logAction(req, id ? 'UPDATE_DARSHAN' : 'CREATE_DARSHAN', 'DarshanTiming', id || null, `Saved darshan timing: ${name}`);
    } catch (error) {
        console.error('Error saving darshan timing:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteDarshanTiming = async (req, res) => {
    try {
        await prisma.darshanTiming.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting darshan timing:', error);
        res.status(500).json({ success: false });
    }
};

// Temple Facts CRUD
exports.saveTempleFact = async (req, res) => {
    try {
        const { id, title, description, icon, colorClass, status } = req.body;
        const data = { title, description, icon, colorClass, status: status || 'Active' };

        if (id) {
            await prisma.templeFact.update({ where: { id: parseInt(id) }, data });
        } else {
            await prisma.templeFact.create({ data });
        }
        res.redirect('/admin/daily-rituals');
        await logAction(req, id ? 'UPDATE_FACT' : 'CREATE_FACT', 'TempleFact', id || null, `Saved temple fact: ${title}`);
    } catch (error) {
        console.error('Error saving temple fact:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteTempleFact = async (req, res) => {
    try {
        const factId = parseInt(req.params.id);
        const fact = await prisma.templeFact.findUnique({ where: { id: factId } });
        await prisma.templeFact.delete({ where: { id: factId } });
        res.json({ success: true });
        await logAction(req, 'DELETE_FACT', 'TempleFact', factId, `Deleted temple fact: ${fact ? fact.title : factId}`);
    } catch (error) {
        console.error('Error deleting temple fact:', error);
        res.status(500).json({ success: false });
    }
};

// --- Manage Panchang ---

exports.getPanchangList = async (req, res) => {
    try {
        const panchangList = await prisma.panchang.findMany({
            orderBy: { date: 'desc' }
        });

        req.app.render('pages/admin-panchang-list', { panchangList }, (err, html) => {
            if (err) {
                console.error('Error rendering panchang list admin:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Panchang - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                ]
            });
        });
    } catch (error) {
        console.error('Error in getPanchangList:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAddPanchang = (req, res) => {
    req.app.render('pages/admin-panchang-add', { panchang: null }, (err, html) => {
        if (err) {
            console.error('Error rendering add panchang:', err);
            return res.status(500).send('Error rendering page');
        }
        res.render('layouts/admin-master', {
            body: html,
            title: 'Add Panchang - Jagannatha-puri Admin',
            styles: [
                '/admin-assets/vendor/libs/flatpickr/flatpickr.css'
            ],
            scripts: [
                '/admin-assets/vendor/libs/flatpickr/flatpickr.js',
                '/admin-assets/vendor/libs/select2/select2.js'
            ]
        });
    });
};

exports.getEditPanchang = async (req, res) => {
    try {
        const panchang = await prisma.panchang.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!panchang) return res.status(404).send('Panchang entry not found');

        req.app.render('pages/admin-panchang-add', { panchang }, (err, html) => {
            if (err) {
                console.error('Error rendering edit panchang:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Panchang - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error in getEditPanchang:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.savePanchang = async (req, res) => {
    try {
        const { id, date, sections_json } = req.body;
        const data = JSON.parse(sections_json);

        const panchangData = {
            date: new Date(date),
            data: data
        };

        if (id) {
            await prisma.panchang.update({
                where: { id: parseInt(id) },
                data: panchangData
            });
        } else {
            await prisma.panchang.create({
                data: panchangData
            });
        }

        res.redirect('/admin/panchang');
        await logAction(req, id ? 'UPDATE_PANCHANG' : 'CREATE_PANCHANG', 'Panchang', id || null, `Saved panchang for: ${new Date(date).toDateString()}`);
    } catch (error) {
        console.error('Error in savePanchang:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deletePanchang = async (req, res) => {
    try {
        const panchangId = parseInt(req.params.id);
        const panchang = await prisma.panchang.findUnique({ where: { id: panchangId } });
        await prisma.panchang.delete({
            where: { id: panchangId }
        });
        res.json({ success: true });
        await logAction(req, 'DELETE_PANCHANG', 'Panchang', panchangId, `Deleted panchang entry for: ${panchang ? panchang.date.toDateString() : panchangId}`);
    } catch (error) {
        console.error('Error deleting panchang:', error);
        res.status(500).json({ success: false });
    }
};

// --- Manage Festivals ---

exports.getFestivalList = async (req, res) => {
    try {
        const festivals = await prisma.festival.findMany({
            orderBy: { date: 'asc' }
        });

        req.app.render('pages/admin-festival-list', { festivals }, (err, html) => {
            if (err) {
                console.error('Error rendering festival list admin:', err);
                return res.status(500).send('Error rendering page');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Manage Festivals - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js',
                ]
            });
        });
    } catch (error) {
        console.error('Error in getFestivalList:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.saveFestival = async (req, res) => {
    try {
        const { id, name, date, description, type, status } = req.body;
        const data = {
            name,
            date: new Date(date),
            description,
            type,
            status: status || 'Active'
        };

        if (id) {
            await prisma.festival.update({
                where: { id: parseInt(id) },
                data
            });
        } else {
            await prisma.festival.create({
                data
            });
        }
        res.redirect('/admin/festivals');
        await logAction(req, id ? 'UPDATE_FESTIVAL' : 'CREATE_FESTIVAL', 'Festival', id || null, `Saved festival: ${name}`);
    } catch (error) {
        console.error('Error saving festival:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteFestival = async (req, res) => {
    try {
        const festivalId = parseInt(req.params.id);
        const festival = await prisma.festival.findUnique({ where: { id: festivalId } });
        await prisma.festival.delete({
            where: { id: festivalId }
        });
        res.json({ success: true });
        await logAction(req, 'DELETE_FESTIVAL', 'Festival', festivalId, `Deleted festival: ${festival ? festival.name : festivalId}`);
    } catch (error) {
        console.error('Error deleting festival:', error);
        res.status(500).json({ success: false });
    }
};
