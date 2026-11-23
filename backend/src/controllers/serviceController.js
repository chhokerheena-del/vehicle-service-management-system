const prisma = require('../config/db');

// Get All Services
async function getAllServices(req, res, next) {
  try {
    const { category, search, activeOnly } = req.query;
    const filter = {};

    if (activeOnly !== 'false') {
      filter.isActive = true;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const services = await prisma.service.findMany({
      where: filter,
      orderBy: { price: 'asc' }
    });

    return res.json({
      success: true,
      data: services
    });
  } catch (error) {
    next(error);
  }
}

// Get Service by ID
async function getServiceById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    return res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}

// Create Service (Admin)
async function createService(req, res, next) {
  try {
    const { name, category, description, price, estimatedHours } = req.body;

    if (!name || !category || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, description, and price are required.'
      });
    }

    const newService = await prisma.service.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: parseFloat(price),
        estimatedHours: parseFloat(estimatedHours) || 2.0,
        isActive: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      data: newService
    });
  } catch (error) {
    next(error);
  }
}

// Update Service (Admin)
async function updateService(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { name, category, description, price, estimatedHours, isActive } = req.body;

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        category: category ? category.trim() : undefined,
        description: description ? description.trim() : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        estimatedHours: estimatedHours !== undefined ? parseFloat(estimatedHours) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined
      }
    });

    return res.json({
      success: true,
      message: 'Service updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// Toggle Service Active Status
async function toggleServiceStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const current = await prisma.service.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: { isActive: !current.isActive }
    });

    return res.json({
      success: true,
      message: `Service status set to ${updated.isActive ? 'Active' : 'Inactive'}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  toggleServiceStatus
};
