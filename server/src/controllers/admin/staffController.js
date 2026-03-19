const prisma = require('../../lib/prisma');
const bcrypt = require('bcryptjs');
const { logAction } = require('../../lib/auditLogger');

exports.getStaffList = async (req, res) => {
    try {
        const staffList = await prisma.staff.findMany({
            orderBy: { created_at: 'desc' },
            include: { role: true } // Include role relation
        });

        const roles = await prisma.role.findMany(); // Fetch all roles

        // Format date for display
        const formattedStaff = staffList.map(staff => ({
            ...staff,
            role: staff.role ? staff.role.name : 'N/A', // Display role name
            joining_date: staff.joining_date || new Date(staff.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        }));

        req.app.render('pages/admin-staff-list', { staffList: formattedStaff, roles }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Our Staff - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/@form-validation/umd/styles/index.min.css'
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
                    '/admin-assets/js/app-staff-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching staff list:', error);
        res.status(500).send('Error fetching staff list');
    }
};

exports.getStaffView = async (req, res) => {
    try {
        const staffId = parseInt(req.params.id);
        const staff = await prisma.staff.findUnique({
            where: { id: staffId }
        });

        if (!staff) {
            return res.status(404).send('Staff member not found');
        }

        req.app.render('pages/admin-staff-view', { staff }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Staff View - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/animate-css/animate.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/@form-validation/umd/styles/index.min.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                    '/admin-assets/vendor/libs/cleavejs/cleave.js',
                    '/admin-assets/vendor/libs/cleavejs/cleave-phone.js',
                    '/admin-assets/vendor/libs/select2/select2.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/bundle/popular.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js',
                    '/admin-assets/js/app-staff-view.js',
                    '/admin-assets/js/app-user-view.js',
                    '/admin-assets/js/app-user-view-account.js'
                ]

            });
        });
    } catch (error) {
        console.error('Error fetching staff details:', error);
        res.status(500).send('Error fetching staff details');
    }
};

exports.saveStaff = async (req, res) => {
    try {
        const { userFullname, userEmail, userContact, userRole, userPassword } = req.body;

        // Check if user exists
        const existingUser = await prisma.staff.findFirst({
            where: {
                OR: [
                    { email: userEmail },
                    { username: userEmail } // Using email as username for now as per form
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Find role
        const role = await prisma.role.findUnique({
            where: { name: userRole }
        });

        // Hash password
        const hashedPassword = await bcrypt.hash(userPassword, 10);

        const newStaff = await prisma.staff.create({
            data: {
                full_name: userFullname,
                email: userEmail,
                username: userEmail, // Defaulting username to email
                contact: userContact,
                password: hashedPassword,
                roleId: role ? role.id : null,
                // role: userRole, // Deprecated string field
                status: 'Active',
                avatar: '' // Default empty
            }
        });

        res.status(200).json({ message: 'Staff added successfully', staff: newStaff });
        await logAction(req, 'CREATE_STAFF', 'Staff', newStaff.id, `Created staff member: ${userFullname} (${userRole})`);
    } catch (error) {
        console.error('Error saving staff:', error);
        res.status(500).json({ error: 'Error saving staff' });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const {
            staff_id,
            modalEditUserFirstName,
            modalEditUserLastName,
            modalEditUserName,
            modalEditUserEmail,
            modalEditUserStatus,
            modalEditUserPhone,
            modalEditUserPassword // New field
        } = req.body;

        const updateData = {
            full_name: `${modalEditUserFirstName} ${modalEditUserLastName}`.trim(),
            username: modalEditUserName,
            email: modalEditUserEmail,
            status: modalEditUserStatus,
            contact: modalEditUserPhone
        };

        // Update password only if provided
        if (modalEditUserPassword && modalEditUserPassword.trim() !== '') {
            updateData.password = await bcrypt.hash(modalEditUserPassword, 10);
        }

        await prisma.staff.update({
            where: { id: parseInt(staff_id) },
            data: updateData
        });

        res.redirect(`/admin/staff/view/${staff_id}`);
        await logAction(req, 'UPDATE_STAFF', 'Staff', staff_id, `Updated staff member: ${updateData.full_name}`);
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).send('Error updating staff');
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const staffId = parseInt(req.params.id);
        const staff = await prisma.staff.findUnique({ where: { id: staffId } });

        if (!staff) {
            return res.status(404).json({ success: false, error: 'Staff member not found' });
        }

        if (req.user.id === staffId) {
            return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
        }

        await prisma.staff.delete({ where: { id: staffId } });
        res.json({ success: true, message: 'Staff deleted successfully' });
        await logAction(req, 'DELETE_STAFF', 'Staff', staffId, `Deleted staff member: ${staff.full_name}`);
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({ success: false, error: 'Error deleting staff' });
    }
};
