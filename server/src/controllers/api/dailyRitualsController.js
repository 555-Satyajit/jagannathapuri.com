const prisma = require('../../lib/prisma');

// --- Daily Rituals ---

exports.getRituals = async (req, res) => {
    try {
        const rituals = await prisma.dailyRitual.findMany({ orderBy: { id: 'asc' } });
        res.json({ success: true, data: rituals });
    } catch (error) {
        console.error('Error fetching rituals:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.saveRitual = async (req, res) => {
    try {
        const { name, time, icon, status } = req.body;
        const newRitual = await prisma.dailyRitual.create({
            data: { name, time, icon: icon || 'Sun', status: status || 'Active' }
        });
        res.json({ success: true, message: 'Ritual added', data: newRitual });
    } catch (error) {
        console.error('Error adding ritual:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.updateRitual = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, time, icon, status } = req.body;
        const updatedRitual = await prisma.dailyRitual.update({
            where: { id: parseInt(id) },
            data: { name, time, icon, status }
        });
        res.json({ success: true, message: 'Ritual updated', data: updatedRitual });
    } catch (error) {
        console.error('Error updating ritual:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.toggleRitualStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.dailyRitual.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
        
        const newStatus = existing.status === 'Active' ? 'Inactive' : 'Active';
        const updated = await prisma.dailyRitual.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, message: 'Status updated', data: updated });
    } catch (error) {
        console.error('Error toggling ritual status:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.deleteRitual = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.dailyRitual.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Ritual deleted' });
    } catch (error) {
        console.error('Error deleting ritual:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// --- Darshan Timings ---

exports.getDarshans = async (req, res) => {
    try {
        const darshans = await prisma.darshanTiming.findMany({ orderBy: { id: 'asc' } });
        res.json({ success: true, data: darshans });
    } catch (error) {
        console.error('Error fetching darshans:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.saveDarshan = async (req, res) => {
    try {
        const { name, timeRange, type, status } = req.body;
        const newDarshan = await prisma.darshanTiming.create({
            data: { name, timeRange, type: type || 'General', status: status || 'Active' }
        });
        res.json({ success: true, message: 'Darshan timing added', data: newDarshan });
    } catch (error) {
        console.error('Error adding darshan:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.updateDarshan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, timeRange, type, status } = req.body;
        const updatedDarshan = await prisma.darshanTiming.update({
            where: { id: parseInt(id) },
            data: { name, timeRange, type, status }
        });
        res.json({ success: true, message: 'Darshan timing updated', data: updatedDarshan });
    } catch (error) {
        console.error('Error updating darshan:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.toggleDarshanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.darshanTiming.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
        
        const newStatus = existing.status === 'Active' ? 'Inactive' : 'Active';
        const updated = await prisma.darshanTiming.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, message: 'Status updated', data: updated });
    } catch (error) {
        console.error('Error toggling darshan status:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.deleteDarshan = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.darshanTiming.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Darshan timing deleted' });
    } catch (error) {
        console.error('Error deleting darshan:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// --- Temple Facts ---

exports.getFacts = async (req, res) => {
    try {
        const facts = await prisma.templeFact.findMany({ orderBy: { id: 'asc' } });
        res.json({ success: true, data: facts });
    } catch (error) {
        console.error('Error fetching facts:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.saveFact = async (req, res) => {
    try {
        const { title, description, icon, colorClass, status } = req.body;
        const newFact = await prisma.templeFact.create({
            data: { title, description, icon: icon || 'Info', colorClass: colorClass || 'primary', status: status || 'Active' }
        });
        res.json({ success: true, message: 'Fact added', data: newFact });
    } catch (error) {
        console.error('Error adding fact:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.updateFact = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, icon, colorClass, status } = req.body;
        const updatedFact = await prisma.templeFact.update({
            where: { id: parseInt(id) },
            data: { title, description, icon, colorClass, status }
        });
        res.json({ success: true, message: 'Fact updated', data: updatedFact });
    } catch (error) {
        console.error('Error updating fact:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.toggleFactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.templeFact.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
        
        const newStatus = existing.status === 'Active' ? 'Inactive' : 'Active';
        const updated = await prisma.templeFact.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, message: 'Status updated', data: updated });
    } catch (error) {
        console.error('Error toggling fact status:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.deleteFact = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.templeFact.delete({ where: { id: parseInt(id) } });
        res.json({ success: true, message: 'Fact deleted' });
    } catch (error) {
        console.error('Error deleting fact:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
