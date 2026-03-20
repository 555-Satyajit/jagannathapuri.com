const prisma = require('../../lib/prisma');
const { logAction } = require('../../lib/auditLogger');
const moment = require('moment');

exports.getCustomerList = (req, res) => {
    req.app.render('pages/admin-customer-list', (err, html) => {
        if (err) {
            console.error('Error rendering admin customer list:', err);
            return res.status(500).send('Error rendering admin customer list');
        }
        res.render('layouts/admin-master', {
            body: html,
            title: 'Customers List',
            styles: [
                '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                '/admin-assets/vendor/libs/select2/select2.css',
                '/admin-assets/vendor/libs/formvalidation/dist/css/formValidation.min.css'
            ],
            scripts: [
                '/admin-assets/vendor/libs/moment/moment.js',
                '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                '/admin-assets/vendor/libs/select2/select2.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/FormValidation.min.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/plugins/Bootstrap5.min.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/plugins/AutoFocus.min.js',
                '/admin-assets/vendor/libs/cleavejs/cleave.js',
                '/admin-assets/vendor/libs/cleavejs/cleave-phone.js',
                '/admin-assets/js/app-ecommerce-customer-all.js'
            ]
        });
    });
};

exports.getCustomerData = async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                addresses: true,
                orders: {
                    select: {
                        totalAmount: true,
                        paymentStatus: true
                    }
                }
            }
        });

        const formattedData = customers.map(c => {
            // Find default address or fallback to first one
            const displayAddress = c.addresses.find(a => a.isDefault) || c.addresses[0];

            // Calculate total spent from paid orders (paymentStatus: 1)
            const paidOrders = c.orders.filter(o => o.paymentStatus === 1);
            const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

            return {
                id: c.id,
                customer: c.fullName,
                customer_id: c.id.toString().padStart(4, '0'),
                country: displayAddress?.country || 'N/A',
                country_code: displayAddress?.country ? 'in' : 'xx', // Simplification for now, but better than hardcoded 'in' always
                order: c.orders.length,
                total_spent: totalSpent.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                }),
                email: c.email,
                image: c.avatar || ''
            };
        });

        res.json({ data: formattedData });
    } catch (error) {
        console.error('Error fetching customer data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.saveCustomer = async (req, res) => {
    try {
        const { customerName, customerEmail, customerContact, customerAddress1, customerAddress2, customerTown, customerState, pin } = req.body;

        // Basic implementation: Create customer and their default shipping address
        const newCustomer = await prisma.customer.create({
            data: {
                fullName: customerName,
                email: customerEmail,
                phone: customerContact,
                status: 'Active',
                addresses: {
                    create: {
                        addressLine1: customerAddress1,
                        addressLine2: customerAddress2,
                        city: customerTown,
                        state: customerState,
                        zipCode: pin,
                        country: 'India', // Hardcoded for now as per the select in EJS
                        isDefault: true,
                        type: 'Shipping'
                    }
                }
            }
        });

        res.json({ success: true, customer: newCustomer });
    } catch (error) {
        console.error('Error saving customer:', error);

        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(400).json({ success: false, error: 'A customer with this email already exists.' });
        }

        res.status(500).json({ success: false, error: 'An unexpected error occurred while saving the customer.' });
    }
};

exports.getCustomerDetails = async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        const tab = req.params.tab || 'overview';

        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                addresses: true,
                orders: true
            }
        });

        if (!customer) {
            return res.status(404).send('Customer not found');
        }

        // Format for EJS (mapping Prisma model to expected UI object if needed)
        const formattedCustomer = {
            ...customer,
            customer: customer.fullName, // UI expects .customer
            customer_id: customer.id.toString().padStart(4, '0'),
            total_spent: `₹${customer.totalSpent}`,
            order: customer.orderCount,
            image: customer.avatar || '',
            phone: customer.phone || '',
            username: customer.fullName.toLowerCase().replace(/\s/g, '.'),
            country: customer.addresses.find(a => a.isDefault)?.country || 'N/A'
        };

        res.render('pages/admin-customer-details', { customer: formattedCustomer, activeTab: tab }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            const scripts = [
                '/admin-assets/vendor/libs/moment/moment.js',
                '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js',
                '/admin-assets/vendor/libs/cleavejs/cleave.js',
                '/admin-assets/vendor/libs/cleavejs/cleave-phone.js',
                '/admin-assets/vendor/libs/select2/select2.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/FormValidation.min.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/plugins/Bootstrap5.min.js',
                '/admin-assets/vendor/libs/formvalidation/dist/js/plugins/AutoFocus.min.js',
                '/admin-assets/js/app-ecommerce-customer-detail.js'
            ];

            if (tab === 'overview') {
                scripts.push('/admin-assets/js/app-ecommerce-customer-detail-overview.js');
            } else if (tab === 'security') {
                scripts.push('/admin-assets/js/modal-enable-otp.js');
                scripts.push('/admin-assets/js/app-user-view-security.js');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Customer Details - Customers',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/animate-css/animate.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css',
                    '/admin-assets/vendor/libs/select2/select2.css',
                    '/admin-assets/vendor/libs/formvalidation/dist/css/formValidation.min.css'
                ],
                scripts: scripts
            });
        });
    } catch (error) {
        console.error('Error fetching customer details:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getCustomerOrdersData = async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        const orders = await prisma.order.findMany({
            where: { customer_id: customerId },
            orderBy: { id: 'desc' }
        });

        // Mapping statuses to the ones expected by the JS
        // 1: Ready to Pickup, 2: Dispatched, 3: Delivered, 4: Out for delivery
        const statusMap = {
            'Pending': 1,
            'Dispatched': 2,
            'Delivered': 3,
            'Out for delivery': 4
        };

        const formattedOrders = orders.map(o => ({
            id: o.id,
            order: o.id.toString().padStart(4, '0'),
            date: o.created_at || new Date(),
            status: statusMap[o.status] || 1,
            spent: `₹${o.totalAmount || 0}`
        }));

        res.json({ data: formattedOrders });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);

        // Delete associated addresses and orders first
        await prisma.address.deleteMany({ where: { customer_id: customerId } });
        await prisma.order.deleteMany({ where: { customer_id: customerId } });

        await prisma.customer.delete({
            where: { id: customerId }
        });

        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ success: false, error: 'Failed to delete customer' });
    }
};
