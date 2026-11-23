const prisma = require('../config/db');

// Get All Service Centers
async function getCenters(req, res, next) {
  try {
    const { city, search } = req.query;
    const filter = {};

    if (city) {
      filter.city = city;
    }

    if (search) {
      filter.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { address: { contains: search } }
      ];
    }

    const centers = await prisma.serviceCenter.findMany({
      where: filter,
      include: {
        mechanics: {
          select: {
            id: true,
            name: true,
            specialization: true,
            status: true
          }
        },
        _count: {
          select: {
            appointments: true,
            mechanics: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.json({
      success: true,
      data: centers
    });
  } catch (error) {
    next(error);
  }
}

// Get Center by ID
async function getCenterById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const center = await prisma.serviceCenter.findUnique({
      where: { id },
      include: {
        mechanics: true,
        appointments: {
          take: 10,
          orderBy: { preferredDate: 'desc' },
          include: {
            user: { select: { id: true, name: true, phone: true } },
            service: true
          }
        }
      }
    });

    if (!center) {
      return res.status(404).json({ success: false, message: 'Service center not found.' });
    }

    return res.json({ success: true, data: center });
  } catch (error) {
    next(error);
  }
}

// Create Service Center (Admin)
async function createCenter(req, res, next) {
  try {
    const { name, code, address, city, state, pincode, phone, email, openingHours } = req.body;

    if (!name || !code || !address || !city || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, code, address, city, and phone are required.'
      });
    }

    const formattedCode = code.trim().toUpperCase();
    const existing = await prisma.serviceCenter.findUnique({ where: { code: formattedCode } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Center code already exists.' });
    }

    const newCenter = await prisma.serviceCenter.create({
      data: {
        name: name.trim(),
        code: formattedCode,
        address: address.trim(),
        city: city.trim(),
        state: state ? state.trim() : 'Delhi',
        pincode: pincode ? pincode.trim() : '',
        phone: phone.trim(),
        email: email ? email.trim() : `${formattedCode.toLowerCase()}@autocare.com`,
        openingHours: openingHours || 'Mon - Sat: 8:00 AM - 7:00 PM',
        isActive: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Service center created successfully.',
      data: newCenter
    });
  } catch (error) {
    next(error);
  }
}

// Update Service Center (Admin)
async function updateCenter(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { name, address, city, state, pincode, phone, email, openingHours, isActive } = req.body;

    const updated = await prisma.serviceCenter.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        address: address ? address.trim() : undefined,
        city: city ? city.trim() : undefined,
        state: state ? state.trim() : undefined,
        pincode: pincode ? pincode.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        email: email ? email.trim() : undefined,
        openingHours: openingHours ? openingHours.trim() : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined
      }
    });

    return res.json({
      success: true,
      message: 'Service center updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCenters,
  getCenterById,
  createCenter,
  updateCenter
};
