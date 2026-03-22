const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

exports.getAccount = async (req, res) => {
    try {
        const customerId = req.session.customerId;

        // Fetch customer with addresses and orders
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                addresses: true,
                orders: {
                    include: {
                        items: true
                    },
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        });

        if (!customer) {
            return res.redirect('/login');
        }

        const safeCustomer = {
            ...customer,
            hasPassword: !!customer.password
        };
        // Remove password hash before sending to client
        delete safeCustomer.password;

        req.app.render('pages/account', { customer: safeCustomer }, (err, html) => {
            if (err) {
                console.error('Error rendering user-account:', err);
                return res.status(500).send('Error rendering user-account page');
            }
            res.render('layouts/master', { body: html, title: 'My Account' });
        });
    } catch (error) {
        console.error('Error in getAccount:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const customerId = req.session.customerId;
        const { fullName, phone } = req.body;

        await prisma.customer.update({
            where: { id: customerId },
            data: { fullName, phone }
        });

        // Update session name if changed
        req.session.customerName = fullName;
        req.session.save();

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const customerId = req.session.customerId;
        const { type, addressLine1, city, state, zipCode, country, phone } = req.body;
        console.log('Adding address for customer:', customerId, req.body);

        await prisma.address.create({
            data: {
                customer_id: customerId,
                type: type || 'Home',
                addressLine1,
                city,
                state,
                country: country || 'India',
                zipCode,
                phone: phone || null
            }
        });

        res.json({ success: true, message: 'Address added successfully' });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ success: false, error: 'Failed to add address' });
    }
};

exports.editAddress = async (req, res) => {
    try {
        const customerId = req.session.customerId;
        const addressId = parseInt(req.params.id);
        const { type, addressLine1, city, state, zipCode, country, phone } = req.body;

        // Ensure address belongs to customer
        const address = await prisma.address.findFirst({
            where: { id: addressId, customer_id: customerId }
        });

        if (!address) {
            return res.status(404).json({ success: false, error: 'Address not found' });
        }

        await prisma.address.update({
            where: { id: addressId },
            data: {
                type: type || 'Home',
                addressLine1,
                city,
                state,
                country: country || 'India',
                zipCode,
                phone: phone || null
            }
        });

        res.json({ success: true, message: 'Address updated successfully' });
    } catch (error) {
        console.error('Error editing address:', error);
        res.status(500).json({ success: false, error: 'Failed to update address' });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const customerId = req.session.customerId;
        const addressId = parseInt(req.params.id);

        // Ensure address belongs to customer
        const address = await prisma.address.findFirst({
            where: { id: addressId, customer_id: customerId }
        });

        if (!address) {
            return res.status(404).json({ success: false, error: 'Address not found' });
        }

        await prisma.address.delete({
            where: { id: addressId }
        });

        res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ success: false, error: 'Failed to delete address' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const customerId = req.session.customerId;
        const { currentPassword, newPassword } = req.body;

        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        if (!customer) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }

        // Check if user has a password (might be OAuth user)
        if (!customer.password) {
            // Allow setting password for the first time without current password
            if (currentPassword) {
                return res.json({ success: false, error: 'No current password set. Please leave current password empty to set a new one.' });
            }
        } else {
            // Standard flow: Verify current password
            if (!currentPassword) {
                return res.json({ success: false, error: 'Current password is required' });
            }
            const isMatch = await bcrypt.compare(currentPassword, customer.password);
            if (!isMatch) {
                return res.json({ success: false, error: 'Incorrect current password' });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.customer.update({
            where: { id: customerId },
            data: { password: hashedPassword }
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, error: 'Failed to update password' });
    }
};

const invoiceService = require('../services/invoiceService');

exports.downloadInvoice = async (req, res) => {
    try {
        const customerId = req.session.customerId;
        const orderId = req.params.orderId;

        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) },
            include: {
                items: {
                    include: { product: true }
                },
                customer: true
            }
        });

        if (!order || order.customer_id !== customerId) {
            return res.status(404).send('Order not found or unauthorized');
        }

        let shippingAddress = null;
        if (order.shippingAddressId) {
            shippingAddress = await prisma.address.findUnique({
                where: { id: order.shippingAddressId }
            });
        }
        order.shippingAddress = shippingAddress;

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        console.log(`[DEBUG] Rendering invoice-print for order ${orderId} with baseUrl ${baseUrl}`);
        // Render the EJS template to a string
        req.app.render('pages/invoice-print', { order, baseUrl }, async (err, html) => {
            console.log('[DEBUG] Template rendering finished. Error:', err ? err.message : 'None');
            if (err) {
                console.error('Error rendering invoice template:', err);
                return res.status(500).send('Error generating invoice');
            }

            try {
                const pdfBuffer = await invoiceService.generateInvoicePdf(html);

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
                res.send(pdfBuffer);
            } catch (pdfError) {
                console.error('Error causing PDF generation:', pdfError);
                res.status(500).send('Error generating PDF');
            }
        });

    } catch (error) {
        console.error('Error downloading invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const customerId = req.session.customerId;
        const orderId = parseInt(req.params.id);

        if (isNaN(orderId)) {
            return res.redirect('/user-account');
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!order || order.customer_id !== customerId) {
            return res.redirect('/user-account');
        }

        let shippingAddress = null;
        if (order.shippingAddressId) {
            shippingAddress = await prisma.address.findUnique({
                where: { id: order.shippingAddressId }
            });
        }
        order.shippingAddress = shippingAddress;

        const customer = await prisma.customer.findUnique({ where: { id: customerId } });

        // Timeline Logic
        const steps = [
            { status: 1, label: 'Ordered', icon: 'hgi-shopping-bag-02' },
            { status: 2, label: 'Processing', icon: 'hgi-settings-02' },
            { status: 3, label: 'Shipped', icon: 'hgi-delivery-truck-01' },
            { status: 4, label: 'Delivered', icon: 'hgi-tick-02' }
        ];

        let currentStepIndex = -1;
        let isCancelled = (order.status == 0 || order.status == 'Cancelled');

        if (!isCancelled) {
            if (order.status == 1 || order.status == 'Pending') currentStepIndex = 0;
            else if (order.status == 2 || order.status == 'Processing') currentStepIndex = 1;
            else if (order.status == 3 || order.status == 'Shipped') currentStepIndex = 2;
            else if (order.status == 4 || order.status == 'Delivered') currentStepIndex = 3;

            if (currentStepIndex === -1 && typeof order.status === 'number' && order.status >= 1) {
                currentStepIndex = order.status - 1;
            }
        }

        req.app.render('pages/order-details', { order, customer, steps, currentStepIndex, isCancelled }, (err, html) => {
            if (err) {
                console.error('Error rendering order-details:', err);
                return res.status(500).send('Error rendering order details page');
            }
            res.render('layouts/master', { body: html, title: `Order #${order.orderNumber || order.id}` });
        });

    } catch (error) {
        console.error('Error in getOrderDetails:', error);
        res.status(500).send('Internal Server Error');
    }
};
