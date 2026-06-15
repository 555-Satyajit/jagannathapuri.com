const prisma = require('../../lib/prisma');

exports.getNewsletters = async (req, res) => {
    try {
        const newsletters = await prisma.newsletter.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: newsletters });
    } catch (error) {
        console.error('Error fetching newsletters:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const existingNewsletter = await prisma.newsletter.findUnique({ where: { id: parseInt(id) } });
        if (!existingNewsletter) {
            return res.status(404).json({ success: false, error: 'Subscriber not found' });
        }
        
        const newStatus = existingNewsletter.status === 'Subscribed' ? 'Unsubscribed' : 'Subscribed';
        
        const updatedNewsletter = await prisma.newsletter.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        
        res.json({ success: true, message: 'Status updated successfully', data: updatedNewsletter });
    } catch (error) {
        console.error('Error toggling newsletter status:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.deleteNewsletter = async (req, res) => {
    try {
        const { id } = req.params;
        
        const existingNewsletter = await prisma.newsletter.findUnique({ where: { id: parseInt(id) } });
        if (!existingNewsletter) {
            return res.status(404).json({ success: false, error: 'Subscriber not found' });
        }

        await prisma.newsletter.delete({
            where: { id: parseInt(id) }
        });

        res.json({ success: true, message: 'Subscriber deleted successfully' });
    } catch (error) {
        console.error('Error deleting newsletter subscriber:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
