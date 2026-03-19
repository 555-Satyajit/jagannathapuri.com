const prisma = require('../../lib/prisma');
const moment = require('moment');

exports.getTicketList = async (req, res) => {
    try {
        const tickets = await prisma.ticket.findMany({
            include: {
                customer: true,
                assignee: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const [totalCount, openCount, inProgressCount, closedCount] = await Promise.all([
            prisma.ticket.count(),
            prisma.ticket.count({ where: { status: 'Open' } }),
            prisma.ticket.count({ where: { status: 'In Progress' } }),
            prisma.ticket.count({ where: { status: 'Closed' } })
        ]);

        const stats = {
            totalCount,
            openCount,
            inProgressCount,
            closedCount,
            // Simple percentage examples (could be calculated dynamically)
            totalGrowth: '+18%',
            openGrowth: '+25%',
            inProgressGrowth: '-14%',
            closedGrowth: '+31%'
        };

        req.app.render('pages/admin-ticket-list', { tickets, stats }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: 'Tickets - Jagannatha-puri Admin',
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
                    '/admin-assets/js/app-ticket-list.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching ticket list:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getTicketData = async (req, res) => {
    try {
        const tickets = await prisma.ticket.findMany({
            include: {
                customer: true,
                assignee: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        const formattedTickets = tickets.map(t => ({
            id: t.id,
            ticket_id: t.ticketId,
            subject: t.subject,
            customer: t.customer ? t.customer.fullName : 'Guest',
            priority: t.priority,
            status: t.status,
            created_at: moment(t.created_at).format('DD MMM YYYY'),
            assignee: t.assignee ? t.assignee.full_name : 'Unassigned',
            action: ''
        }));

        res.json({ data: formattedTickets });
    } catch (error) {
        console.error('Error fetching ticket data:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch ticket data' });
    }
};

exports.getTicketView = async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                customer: true,
                assignee: true,
                messages: {
                    include: {
                        authorStaff: true,
                        authorCustomer: true,
                        attachments: true
                    },
                    orderBy: {
                        created_at: 'asc'
                    }
                }
            }
        });

        if (!ticket) return res.status(404).send('Ticket not found');

        // Fetch all staff for assignee modal
        const staffList = await prisma.staff.findMany({
            where: { status: 'Active' },
            include: { role: true }
        });

        req.app.render('pages/admin-ticket-view', { ticket, staffList }, (err, html) => {
            if (err) {
                console.error('Error rendering page:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.render('layouts/admin-master', {
                body: html,
                title: `Ticket ${ticket.ticketId} - Jagannatha-puri Admin`,
                styles: [
                    '/admin-assets/vendor/libs/select2/select2.css'
                ],
                scripts: [
                    '/admin-assets/vendor/libs/select2/select2.js'
                ]
            });
        });
    } catch (error) {
        console.error('Error fetching ticket view:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.saveTicket = async (req, res) => {
    try {
        const { ticketSubject, ticketCustomer, ticketPriority, ticketDescription } = req.body;

        // Find existing customer or handle if not found
        let customer = await prisma.customer.findFirst({
            where: { fullName: { contains: ticketCustomer } }
        });

        if (!customer) {
            customer = await prisma.customer.findFirst(); // Fallback for testing
        }

        const count = await prisma.ticket.count();
        const ticketId = `TKT-${1001 + count}`;

        const ticket = await prisma.ticket.create({
            data: {
                ticketId,
                subject: ticketSubject,
                description: ticketDescription,
                priority: ticketPriority,
                customer_id: customer.id,
                messages: {
                    create: {
                        content: ticketDescription,
                        authorCustomer_id: customer.id
                    }
                }
            }
        });

        // Handle initial attachments
        if (req.files && req.files.length > 0) {
            const message = await prisma.ticketMessage.findFirst({
                where: { ticket_id: ticket.id },
                orderBy: { created_at: 'asc' }
            });

            for (const file of req.files) {
                await prisma.attachment.create({
                    data: {
                        message_id: message.id,
                        file_name: file.originalname,
                        file_path: `/uploads/${file.filename}`,
                        file_type: file.mimetype
                    }
                });
            }
        }

        res.redirect('/admin/tickets/list');
    } catch (error) {
        console.error('Error saving ticket:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.performTicketAction = async (req, res) => {
    try {
        const { ticket_id, action, reply_content, staff_id } = req.body;
        const id = parseInt(ticket_id);

        if (action === 'reply') {
            const adminId = req.session.admin.id;
            const message = await prisma.ticketMessage.create({
                data: {
                    ticket_id: id,
                    content: reply_content,
                    authorStaff_id: adminId
                }
            });

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    await prisma.attachment.create({
                        data: {
                            message_id: message.id,
                            file_name: file.originalname,
                            file_path: `/uploads/${file.filename}`,
                            file_type: file.mimetype
                        }
                    });
                }
            }
            return res.redirect(`/admin/tickets/view/${id}`);
        } else if (action === 'assign') {
            await prisma.ticket.update({
                where: { id },
                data: {
                    assignee_id: parseInt(staff_id),
                    status: 'In Progress'
                }
            });
            return res.redirect(`/admin/tickets/view/${id}`);
        } else if (action === 'close') {
            await prisma.ticket.update({
                where: { id },
                data: { status: 'Closed' }
            });
            return res.redirect(`/admin/tickets/view/${id}`);
        }

        res.redirect('/admin/tickets/list');
    } catch (error) {
        console.error('Error performing ticket action:', error);
        res.status(500).send('Internal Server Error');
    }
};
