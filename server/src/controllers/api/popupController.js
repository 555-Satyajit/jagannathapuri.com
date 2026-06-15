const prisma = require('../../lib/prisma');
const fs = require('fs');
const path = require('path');

exports.getPopupsData = async (req, res) => {
    try {
        const popups = await prisma.popup.findMany({
            orderBy: { created_at: 'desc' }
        });
        
        res.json({ success: true, data: popups });
    } catch (error) {
        console.error('Error fetching popups:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.savePopup = async (req, res) => {
    try {
        const { startTime, endTime, status } = req.body;
        let imagePath = '';

        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        } else {
            return res.status(400).json({ success: false, error: 'Image is required' });
        }

        const newPopup = await prisma.popup.create({
            data: {
                image: imagePath,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status: status || 'Active',
            }
        });

        res.json({ success: true, message: 'Popup created successfully', data: newPopup });
    } catch (error) {
        console.error('Error creating popup:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.updatePopup = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, status } = req.body;

        const existingPopup = await prisma.popup.findUnique({ where: { id: parseInt(id) } });
        if (!existingPopup) {
            return res.status(404).json({ success: false, error: 'Popup not found' });
        }

        let imagePath = existingPopup.image;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
            // Optional: delete old image file from disk
            // if (existingPopup.image) {
            //     const oldPath = path.join(__dirname, '../../../public', existingPopup.image);
            //     if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            // }
        }

        const updatedPopup = await prisma.popup.update({
            where: { id: parseInt(id) },
            data: {
                image: imagePath,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status: status || 'Active',
            }
        });

        res.json({ success: true, message: 'Popup updated successfully', data: updatedPopup });
    } catch (error) {
        console.error('Error updating popup:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.deletePopup = async (req, res) => {
    try {
        const { id } = req.params;
        
        const existingPopup = await prisma.popup.findUnique({ where: { id: parseInt(id) } });
        if (!existingPopup) {
            return res.status(404).json({ success: false, error: 'Popup not found' });
        }

        // Delete image file from disk
        if (existingPopup.image) {
            const oldPath = path.join(__dirname, '../../../public', existingPopup.image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        await prisma.popup.delete({
            where: { id: parseInt(id) }
        });

        res.json({ success: true, message: 'Popup deleted successfully' });
    } catch (error) {
        console.error('Error deleting popup:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

exports.toggleStatusPopup = async (req, res) => {
    try {
        const { id } = req.params;
        const existingPopup = await prisma.popup.findUnique({ where: { id: parseInt(id) } });
        if (!existingPopup) {
            return res.status(404).json({ success: false, error: 'Popup not found' });
        }
        const newStatus = existingPopup.status === 'Active' ? 'Inactive' : 'Active';
        const updatedPopup = await prisma.popup.update({
            where: { id: parseInt(id) },
            data: { status: newStatus }
        });
        res.json({ success: true, message: 'Status updated', data: updatedPopup });
    } catch (error) {
        console.error('Error toggling popup status:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
