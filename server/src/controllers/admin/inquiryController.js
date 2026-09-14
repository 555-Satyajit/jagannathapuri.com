const prisma = require('../../lib/prisma');

// Get all inquiries with pagination and search
exports.getInquiries = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const where = {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ]
        };

        const total = await prisma.inquiry.count({ where });
        const inquiries = await prisma.inquiry.findMany({
            where,
            include: {
                product: {
                    select: {
                        product_name: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: {
                created_at: 'desc'
            }
        });

        res.json({
            success: true,
            inquiries,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update inquiry status
exports.updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g. "Pending", "Contacted", "Resolved"

        const inquiry = await prisma.inquiry.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.json({ success: true, message: 'Status updated successfully', inquiry });
    } catch (error) {
        console.error('Error updating inquiry status:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete inquiry
exports.deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.inquiry.delete({
            where: { id: parseInt(id) }
        });

        res.json({ success: true, message: 'Inquiry deleted successfully' });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
