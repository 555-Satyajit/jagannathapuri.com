const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

// Helpers
const deleteFile = (filePath) => {
  if (filePath) {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

// --- Hero Section ---
exports.getHeroes = async (req, res) => {
  try {
    const data = await prisma.heroSection.findMany({ orderBy: { order: 'asc' } });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.saveHero = async (req, res) => {
  try {
    const { header, title, description, buttonText, buttonLink, order, status } = req.body;
    
    let image = null;
    let mobileImage = null;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        image = '/uploads/hero/' + req.files.image[0].filename;
      }
      if (req.files.mobileImage && req.files.mobileImage[0]) {
        mobileImage = '/uploads/hero/' + req.files.mobileImage[0].filename;
      }
    }

    const hero = await prisma.heroSection.create({
      data: {
        header,
        title,
        description,
        buttonText,
        buttonLink,
        order: order ? parseInt(order) : 0,
        status: status || 'Active',
        image,
        mobileImage
      }
    });

    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { header, title, description, buttonText, buttonLink, order, status } = req.body;
    
    const existingHero = await prisma.heroSection.findUnique({ where: { id: parseInt(id) } });
    if (!existingHero) return res.status(404).json({ success: false, error: 'Not found' });

    let image = existingHero.image;
    let mobileImage = existingHero.mobileImage;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        deleteFile(existingHero.image);
        image = '/uploads/hero/' + req.files.image[0].filename;
      }
      if (req.files.mobileImage && req.files.mobileImage[0]) {
        deleteFile(existingHero.mobileImage);
        mobileImage = '/uploads/hero/' + req.files.mobileImage[0].filename;
      }
    }

    const hero = await prisma.heroSection.update({
      where: { id: parseInt(id) },
      data: {
        header,
        title,
        description,
        buttonText,
        buttonLink,
        order: order ? parseInt(order) : 0,
        status,
        image,
        mobileImage
      }
    });

    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteHero = async (req, res) => {
  try {
    const existingHero = await prisma.heroSection.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existingHero) return res.status(404).json({ success: false, error: 'Not found' });

    deleteFile(existingHero.image);
    deleteFile(existingHero.mobileImage);

    await prisma.heroSection.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleHeroStatus = async (req, res) => {
  try {
    const existingHero = await prisma.heroSection.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existingHero) return res.status(404).json({ success: false, error: 'Not found' });
    const newStatus = existingHero.status === 'Active' ? 'Inactive' : 'Active';
    const hero = await prisma.heroSection.update({
      where: { id: parseInt(req.params.id) },
      data: { status: newStatus }
    });
    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Promo Banner ---
exports.getPromos = async (req, res) => {
  try {
    const data = await prisma.promoBanner.findMany({ orderBy: { order: 'asc' } });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.savePromo = async (req, res) => {
  try {
    const { icon, title, subtitle, order, status } = req.body;
    const promo = await prisma.promoBanner.create({
      data: {
        icon, title, subtitle, order: order ? parseInt(order) : 0, status: status || 'Active'
      }
    });
    res.json({ success: true, data: promo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePromo = async (req, res) => {
  try {
    const { icon, title, subtitle, order, status } = req.body;
    const promo = await prisma.promoBanner.update({
      where: { id: parseInt(req.params.id) },
      data: { icon, title, subtitle, order: order ? parseInt(order) : 0, status }
    });
    res.json({ success: true, data: promo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deletePromo = async (req, res) => {
  try {
    await prisma.promoBanner.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.togglePromoStatus = async (req, res) => {
  try {
    const existing = await prisma.promoBanner.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    const newStatus = existing.status === 'Active' ? 'Inactive' : 'Active';
    const promo = await prisma.promoBanner.update({
      where: { id: parseInt(req.params.id) },
      data: { status: newStatus }
    });
    res.json({ success: true, data: promo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Home Tab ---
exports.getHomeTabs = async (req, res) => {
  try {
    const data = await prisma.homeTab.findMany({ orderBy: { order: 'asc' }, include: { category: true } });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.saveHomeTab = async (req, res) => {
  try {
    const { title, categoryId, order, status } = req.body;
    const tab = await prisma.homeTab.create({
      data: { title, categoryId: parseInt(categoryId), order: order ? parseInt(order) : 0, status: status || 'Active' }
    });
    res.json({ success: true, data: tab });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateHomeTab = async (req, res) => {
  try {
    const { title, categoryId, order, status } = req.body;
    const tab = await prisma.homeTab.update({
      where: { id: parseInt(req.params.id) },
      data: { title, categoryId: parseInt(categoryId), order: order ? parseInt(order) : 0, status }
    });
    res.json({ success: true, data: tab });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteHomeTab = async (req, res) => {
  try {
    await prisma.homeTab.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleHomeTabStatus = async (req, res) => {
  try {
    const existing = await prisma.homeTab.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    const newStatus = existing.status === 'Active' ? 'Inactive' : 'Active';
    const tab = await prisma.homeTab.update({
      where: { id: parseInt(req.params.id) },
      data: { status: newStatus }
    });
    res.json({ success: true, data: tab });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Service ---
exports.getServices = async (req, res) => {
  try {
    const data = await prisma.service.findMany({ orderBy: { id: 'asc' } });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.saveService = async (req, res) => {
  try {
    const { title, subtitle, description, icon, phone, rating, reviewsCount, link, status } = req.body;
    let image = null;
    if (req.file) {
      image = '/uploads/services/' + req.file.filename;
    }

    // Auto-generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const service = await prisma.service.create({
      data: {
        title, slug, subtitle, description, icon, image, phone,
        rating: rating ? parseFloat(rating) : 5.0,
        reviewsCount: reviewsCount ? parseInt(reviewsCount) : 0,
        link, status: status || 'Active'
      }
    });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, icon, phone, rating, reviewsCount, link, status } = req.body;
    
    const existing = await prisma.service.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

    let image = existing.image;
    if (req.file) {
      deleteFile(existing.image);
      image = '/uploads/services/' + req.file.filename;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        title, slug, subtitle, description, icon, image, phone,
        rating: rating ? parseFloat(rating) : 5.0,
        reviewsCount: reviewsCount ? parseInt(reviewsCount) : 0,
        link, status
      }
    });

    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const existing = await prisma.service.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    deleteFile(existing.image);
    await prisma.service.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleServiceStatus = async (req, res) => {
  try {
    const existing = await prisma.service.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });
    const newStatus = existing.status === 'Active' ? 'Inactive' : 'Active';
    const service = await prisma.service.update({
      where: { id: parseInt(req.params.id) },
      data: { status: newStatus }
    });
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Helper for Home Tabs ---
exports.getCategories = async (req, res) => {
  try {
    const data = await prisma.category.findMany({ 
      where: { status: 'Active' }, 
      select: { id: true, name: true } 
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
