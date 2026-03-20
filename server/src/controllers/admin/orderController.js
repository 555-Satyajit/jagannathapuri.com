const prisma = require('../../lib/prisma');
const { logAction } = require('../../lib/auditLogger');
const invoiceService = require('../../services/invoiceService');

exports.getOrderList = async (req, res) => {
    try {
        const [pendingPayment, completed, failed, cancelled] = await Promise.all([
            prisma.order.count({ where: { paymentStatus: 2 } }),
            prisma.order.count({ where: { paymentStatus: 1 } }),
            prisma.order.count({ where: { paymentStatus: 3 } }),
            prisma.order.count({ where: { paymentStatus: 4 } })
        ]);

        const stats = {
            pendingPayment,
            completed,
            failed,
            cancelled
        };

        res.render('pages/admin-order-list', { stats }, (err, html) => {
            if (err) {
                console.error('Error rendering admin order list:', err);
                return res.status(500).send('Error rendering admin order list');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Orders List',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/js/app-ecommerce-order-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching order stats:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getOrderData = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                customer: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        const formattedOrders = orders.map(order => {
            // Map payment methods to available icons in admin-panel/assets/img/icons/payments
            let methodIcon = 'mastercard'; // default
            const pm = (order.paymentMethod || '').toLowerCase();
            if (pm.includes('visa')) methodIcon = 'visa';
            else if (pm.includes('paypal')) methodIcon = 'paypal';
            else if (pm.includes('cash') || pm.includes('delivery')) methodIcon = 'mastercard'; // Fallback to mastercard or generic
            else if (pm.includes('bank')) methodIcon = 'visa'; // Fallback

            return {
                id: order.id,
                order: order.orderNumber,
                date: order.date.toISOString(),
                customer: order.customer.fullName,
                customer_id: order.customer.id,
                email: order.customer.email,
                avatar: order.customer.avatar || '',
                payment: order.paymentStatus,
                status: order.status,
                method: methodIcon,
                method_number: order.methodNumber || 'COD'
            };
        });

        res.json({ data: formattedOrders });
    } catch (error) {
        console.error('Error fetching order data:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch order data' });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);

        // Use a transaction to delete items and then the order
        await prisma.$transaction([
            prisma.orderItem.deleteMany({
                where: { orderId: orderId }
            }),
            prisma.order.delete({
                where: { id: orderId }
            })
        ]);

        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, error: 'Failed to delete order' });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: {
                    include: {
                        addresses: true
                    }
                },
                shippingAddress: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        res.render('pages/admin-order-details', { order }, (err, html) => {
            if (err) {
                console.error('Error rendering admin order details:', err);
                return res.status(500).send('Error rendering admin order details');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: 'Order Details',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/vendor/libs/sweetalert2/sweetalert2.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status, paymentStatus } = req.body;

        const updateData = {};
        if (status !== undefined) updateData.status = parseInt(status);
        if (paymentStatus !== undefined) updateData.paymentStatus = parseInt(paymentStatus);

        await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });

        res.json({ success: true, message: 'Order status updated successfully' });
        await logAction(req, 'UPDATE_ORDER_STATUS', 'Order', orderId, `Updated order status/payment. Data: ${JSON.stringify(updateData)}`);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
};

exports.downloadInvoice = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { product: true }
                },
                customer: true,
                shippingAddress: true
            }
        });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        // Render the EJS template to a string
        res.render('pages/invoice-print', { order, baseUrl }, async (err, html) => {
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

exports.getInvoice = async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { product: true }
                },
                customer: {
                    include: { addresses: true }
                },
                shippingAddress: true
            }
        });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Calculate totals for the template
        const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05; // Assuming 5% tax or fetch from config
        const total = subtotal + tax + order.shippingFee;

        res.render('pages/admin-invoice-view', { order, subtotal, tax, total }, (err, html) => {
            if (err) {
                console.error('Error rendering admin invoice view:', err);
                return res.status(500).send('Error rendering invoice view');
            }
            res.render('layouts/admin-master', {
                body: html,
                title: `Invoice #${order.orderNumber}`
            });
        });

    } catch (error) {
        console.error('Error viewing invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};

