const prisma = require('../../lib/prisma');
const { logAction } = require('../../lib/auditLogger');

exports.getCouponList = async (req, res) => {
    try {
        const staff = req.user;
        const coupons = await prisma.coupon.findMany({
            orderBy: { created_at: 'desc' }
        });

        // Formatting for DataTable (Status mapping etc)
        const formattedCoupons = coupons.map(coupon => ({
            id: coupon.id,
            coupon_name: coupon.code,
            coupon_code: coupon.code,
            discount: `${coupon.discount}${coupon.type === 'PERCENT' ? '%' : ''}`,
            start_date: coupon.startDate,
            end_date: coupon.endDate,
            expiry_date: coupon.endDate,
            status: coupon.status
        }));


        req.app.render('pages/admin-coupon-list', { coupons: formattedCoupons, staff }, (err, html) => {
            if (err) {
                console.error('Error rendering coupon list:', err);
                return res.status(500).send('Error rendering coupon list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Coupons - eCommerce',
                staff,
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/@form-validation/umd/styles/index.min.css',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/bundle/popular.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js',
                    '/admin-assets/vendor/libs/cleavejs/cleave.js',
                    '/admin-assets/vendor/libs/cleavejs/cleave-phone.js',
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js',
                    '/admin-assets/js/app-ecommerce-coupon-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching coupon list:', error);
        res.status(500).send('Error fetching coupon list');
    }
};

exports.addCoupon = (req, res) => {
    const staff = req.user;
    req.app.render('pages/admin-coupon-add', { staff }, (err, html) => {
        if (err) {
            console.error('Error rendering coupon add:', err);
            return res.status(500).send('Error rendering coupon add');
        }
        res.render('layouts/admin-master', {
            body: html,
            title: 'Add Coupon',
            staff,
            styles: [
                '/admin-assets/vendor/libs/flatpickr/flatpickr.css',
                '/admin-assets/vendor/libs/select2/select2.css'
            ],
            scripts: [
                '/admin-assets/vendor/libs/flatpickr/flatpickr.js',
                '/admin-assets/vendor/libs/select2/select2.js'
            ]
        });
    });
};

exports.saveCoupon = async (req, res) => {
    try {
        const { couponName, couponCode, discount, couponType, startDate, endDate, status } = req.body;
        const newCoupon = await prisma.coupon.create({
            data: {
                name: couponName,
                code: couponCode,
                discount: parseFloat(discount),
                type: couponType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: status || 'Scheduled'
            }
        });
        res.json({ success: true, coupon: newCoupon });
        await logAction(req, 'CREATE_COUPON', 'Coupon', newCoupon.id, `Created coupon: ${newCoupon.code}`);
    } catch (error) {
        console.error('Error saving coupon:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.editCoupon = async (req, res) => {
    try {
        const staff = req.user;
        const couponId = parseInt(req.params.id);
        const coupon = await prisma.coupon.findUnique({
            where: { id: couponId }
        });

        if (!coupon) return res.status(404).send('Coupon not found');

        req.app.render('pages/admin-coupon-edit', { coupon, staff }, (err, html) => {
            if (err) {
                console.error('Error rendering coupon edit:', err);
                return res.status(500).send('Error rendering coupon edit');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Edit Coupon',
                staff,
                styles: [
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.css',
                    '/admin-assets/vendor/libs/select2/select2.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/flatpickr/flatpickr.js',
                    '/admin-assets/vendor/libs/select2/select2.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching coupon for edit:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const couponId = parseInt(req.params.id);
        const { couponName, couponCode, discount, couponType, startDate, endDate, status } = req.body;
        const updatedCoupon = await prisma.coupon.update({
            where: { id: couponId },
            data: {
                name: couponName,
                code: couponCode,
                discount: parseFloat(discount),
                type: couponType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: status || 'Scheduled'
            }
        });
        res.json({ success: true, coupon: updatedCoupon });
        await logAction(req, 'UPDATE_COUPON', 'Coupon', couponId, `Updated coupon: ${updatedCoupon.code}`);
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ success: false, error: 'Error updating coupon' });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const couponId = parseInt(req.params.id);
        const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
        await prisma.coupon.delete({ where: { id: couponId } });
        res.json({ success: true });
        if (coupon) {
            await logAction(req, 'DELETE_COUPON', 'Coupon', couponId, `Deleted coupon: ${coupon.code}`);
        }
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ success: false, error: 'Error deleting coupon' });
    }
};
