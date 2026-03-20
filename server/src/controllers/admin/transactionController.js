const prisma = require('../../lib/prisma');

exports.getTransactionList = async (req, res) => {
    try {
        const [totalCount, totalAmountResult, successfulCount, otherCount] = await Promise.all([
            prisma.transaction.count(),
            prisma.transaction.aggregate({
                _sum: { amount: true }
            }),
            prisma.transaction.count({ where: { status: 'Paid' } }),
            prisma.transaction.count({ where: { status: { in: ['Pending', 'Failed'] } } })
        ]);

        const stats = {
            totalCount,
            totalAmount: totalAmountResult._sum.amount || 0,
            successfulCount,
            otherCount
        };

        res.render('pages/admin-transaction-list', { stats }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Transactions - eCommerce',
                styles: [
                    '/admin-assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
                    '/admin-assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/moment/moment.js',
                    '/admin-assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
                    '/admin-assets/js/app-ecommerce-transaction-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getTransactionData = async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                customer: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        const formattedTransactions = transactions.map(t => ({
            id: t.id,
            transaction_id: t.transactionId,
            customer_id: t.customer_id,
            customer_name: t.customer.fullName,
            customer_email: t.customer.email,
            amount: t.amount,
            date: t.date.toISOString(),
            payment_method: t.paymentMethod,
            payment_last4: t.paymentLast4,
            status: t.status
        }));

        res.json({ data: formattedTransactions });
    } catch (error) {
        console.error('Error fetching transaction data:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch transaction data' });
    }
};
