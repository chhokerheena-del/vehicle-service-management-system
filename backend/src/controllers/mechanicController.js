const prisma = require('../config/db');

// Get All Mechanics
async function getMechanics(req, res, next) {
  try {
    const { serviceCenterId, status, search } = req.query;
    const filter = {};

    if (serviceCenterId) {
      filter.serviceCenterId = parseInt(serviceCenterId);
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.OR = [
        { name: { contains: search } },
        { employeeId: { contains: search } },
        { specialization: { contains: search } }
      ];
    }

    const mechanics = await prisma.mechanic.findMany({
      where: filter,
      include: {
        serviceCenter: {
          select: { id: true, name: true, city: true }
        },
        _count: {
          select: { serviceRecords: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.json({
      success: true,
      data: mechanics
    });
  } catch (error) {
    next(error);
  }
}

// Get Mechanic by ID
async function getMechanicById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const mechanic = await prisma.mechanic.findUnique({
      where: { id },
      include: {
        serviceCenter: true,
        serviceRecords: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            appointment: {
              include: {
                vehicle: true,
                service: true,
                user: { select: { id: true, name: true } }
              }
            }
          }
        }
      }
    });

    if (!mechanic) {
      return res.status(404).json({ success: false, message: 'Mechanic not found.' });
    }

    return res.json({ success: true, data: mechanic });
  } catch (error) {
    next(error);
  }
}

// Create Mechanic (Staff/Admin)
async function createMechanic(req, res, next) {
  try {
    const { serviceCenterId, name, employeeId, phone, email, specialization, experienceYears, status } = req.body;

    if (!serviceCenterId || !name || !employeeId || !phone || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Service center, name, employee ID, phone, and specialization are required.'
      });
    }

    const formattedEmpId = employeeId.trim().toUpperCase();
    const existing = await prisma.mechanic.findUnique({ where: { employeeId: formattedEmpId } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Employee ID already in use.' });
    }

    const newMechanic = await prisma.mechanic.create({
      data: {
        serviceCenterId: parseInt(serviceCenterId),
        name: name.trim(),
        employeeId: formattedEmpId,
        phone: phone.trim(),
        email: email ? email.trim() : null,
        specialization: specialization.trim(),
        experienceYears: parseInt(experienceYears) || 3,
        status: status || 'AVAILABLE'
      },
      include: {
        serviceCenter: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Mechanic profile created successfully.',
      data: newMechanic
    });
  } catch (error) {
    next(error);
  }
}

// Update Mechanic (Staff/Admin)
async function updateMechanic(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { serviceCenterId, name, phone, email, specialization, experienceYears, status } = req.body;

    const updated = await prisma.mechanic.update({
      where: { id },
      data: {
        serviceCenterId: serviceCenterId ? parseInt(serviceCenterId) : undefined,
        name: name ? name.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        email: email !== undefined ? (email ? email.trim() : null) : undefined,
        specialization: specialization ? specialization.trim() : undefined,
        experienceYears: experienceYears !== undefined ? parseInt(experienceYears) : undefined,
        status: status || undefined
      },
      include: {
        serviceCenter: true
      }
    });

    return res.json({
      success: true,
      message: 'Mechanic updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMechanics,
  getMechanicById,
  createMechanic,
  updateMechanic
};
