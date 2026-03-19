const prisma = require('../../lib/prisma');

exports.getRoleList = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                permissions: true,
                staff: true
            }
        });

        const permissions = await prisma.permission.findMany();

        req.app.render('pages/admin-role-list', { roles, permissions }, (err, html) => {
            if (err) {
                console.error('Error rendering role list:', err);
                return res.status(500).send('Error rendering role list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Roles List - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/@form-validation/umd/styles/index.min.css',
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/bundle/popular.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js',
                    '/admin-assets/js/app-access-roles.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching role list:', error);
        res.status(500).send('Error fetching role list');
    }
};

exports.getPermissionList = async (req, res) => {
    try {
        const permissions = await prisma.permission.findMany({
            orderBy: { id: 'desc' }
        });

        req.app.render('pages/admin-permission-list', { permissions }, (err, html) => {
            if (err) {
                console.error('Error rendering permission list:', err);
                return res.status(500).send('Error rendering permission list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Permissions List - Jagannatha-puri Admin',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/@form-validation/umd/styles/index.min.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/bundle/popular.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js',
                    '/admin-assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js',
                    '/admin-assets/js/app-access-permission.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching permission list:', error);
        res.status(500).send('Error fetching permission list');
    }
};

exports.saveRole = async (req, res) => {
    try {
        const { roleId, modalRoleName, permissions } = req.body;

        if (!modalRoleName) {
            return res.status(400).json({ error: 'Role name is required' });
        }

        let permsToSync = [];
        if (permissions && Array.isArray(permissions)) {
            const permissionRecords = await prisma.permission.findMany({
                where: { name: { in: permissions } }
            });
            permsToSync = permissionRecords.map(p => ({ id: p.id }));
        }

        if (roleId) {
            // Update existing role
            const id = parseInt(roleId);
            
            // Check if name is taken by another role
            const nameTaken = await prisma.role.findFirst({
                where: {
                    name: modalRoleName,
                    NOT: { id: id }
                }
            });

            if (nameTaken) {
                return res.status(400).json({ error: 'Another role with this name already exists' });
            }

            const updatedRole = await prisma.role.update({
                where: { id: id },
                data: {
                    name: modalRoleName,
                    permissions: {
                        set: permsToSync // Replace existing permissions with new set
                    }
                }
            });

            return res.status(200).json({ message: 'Role updated successfully', role: updatedRole });
        } else {
            // Create new role
            const existingRole = await prisma.role.findUnique({
                where: { name: modalRoleName }
            });

            if (existingRole) {
                return res.status(400).json({ error: 'Role already exists' });
            }

            const newRole = await prisma.role.create({
                data: {
                    name: modalRoleName,
                    permissions: {
                        connect: permsToSync
                    }
                }
            });

            return res.status(200).json({ message: 'Role created successfully', role: newRole });
        }

    } catch (error) {
        console.error('Error saving role:', error);
        res.status(500).json({ error: 'Error saving role' });
    }
};

exports.getStaffRolesData = async (req, res) => {
    try {
        const staffList = await prisma.staff.findMany({
            include: { role: true },
            orderBy: { created_at: 'desc' }
        });

        const statusMap = {
            'Active': 2,
            'Inactive': 3,
            'Pending': 1
        };

        const formattedData = staffList.map(staff => ({
            id: staff.id,
            full_name: staff.full_name,
            email: staff.email,
            role: staff.role ? staff.role.name : 'N/A',
            avatar: staff.avatar || '',
            status: statusMap[staff.status] || 1,
            current_plan: 'Enterprise', // Mocked as placeholders for now
            billing: 'Auto Debit'      // Mocked as placeholders for now
        }));

        res.json({ data: formattedData });
    } catch (error) {
        console.error('Error fetching staff roles data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.savePermission = async (req, res) => {
    try {
        const { modalPermissionName } = req.body;

        if (!modalPermissionName) {
            return res.status(400).json({ error: 'Permission name is required' });
        }

        const existingPermission = await prisma.permission.findUnique({
            where: { name: modalPermissionName }
        });

        if (existingPermission) {
            return res.status(400).json({ error: 'Permission already exists' });
        }

        const newPermission = await prisma.permission.create({
            data: {
                name: modalPermissionName
            }
        });

        res.status(200).json({ message: 'Permission created successfully', permission: newPermission });

    } catch (error) {
        console.error('Error saving permission:', error);
        res.status(500).json({ error: 'Error saving permission' });
    }
};
