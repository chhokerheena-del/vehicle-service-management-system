const prisma = require('../config/db');

// Get Vehicles
async function getVehicles(req, res, next) {
  try {
    const { userId, search } = req.query;
    const filter = {};

    // Customer can only view their own vehicles
    if (req.user.role === 'CUSTOMER') {
      filter.userId = req.user.id;
    } else if (userId) {
      filter.userId = parseInt(userId);
    }

    if (search) {
      filter.OR = [
        { regNumber: { contains: search } },
        { make: { contains: search } },
        { model: { contains: search } }
      ];
    }

    const vehicles = await prisma.vehicle.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: { appointments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
}

// Get Vehicle By ID
async function getVehicleById(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        appointments: {
          include: {
            service: true,
            serviceCenter: true,
            serviceRecord: true,
            invoice: true
          },
          orderBy: { preferredDate: 'desc' }
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.'
      });
    }

    // Customer can only view their own vehicle
    if (req.user.role === 'CUSTOMER' && vehicle.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this vehicle.'
      });
    }

    return res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
}

// Create Vehicle
async function createVehicle(req, res, next) {
  try {
    const { regNumber, make, model, variant, year, fuelType, mileage, color, targetUserId } = req.body;

    if (!regNumber || !make || !model || !year) {
      return res.status(400).json({
        success: false,
        message: 'Registration number, make, model, and year are required.'
      });
    }

    // Check unique registration number
    const formattedReg = regNumber.toUpperCase().trim().replace(/\s+/g, '-');
    const existing = await prisma.vehicle.findUnique({
      where: { regNumber: formattedReg }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Vehicle with registration number ${formattedReg} is already registered.`
      });
    }

    // Determine owner
    let ownerId = req.user.id;
    if ((req.user.role === 'ADMIN' || req.user.role === 'STAFF') && targetUserId) {
      ownerId = parseInt(targetUserId);
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        userId: ownerId,
        regNumber: formattedReg,
        make: make.trim(),
        model: model.trim(),
        variant: variant ? variant.trim() : null,
        year: parseInt(year),
        fuelType: fuelType || 'PETROL',
        mileage: parseInt(mileage) || 0,
        color: color ? color.trim() : null
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle added successfully.',
      data: newVehicle
    });
  } catch (error) {
    next(error);
  }
}

// Update Vehicle
async function updateVehicle(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { make, model, variant, year, fuelType, mileage, color, regNumber } = req.body;

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    if (req.user.role === 'CUSTOMER' && existing.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this vehicle.' });
    }

    const dataToUpdate = {};
    if (make) dataToUpdate.make = make.trim();
    if (model) dataToUpdate.model = model.trim();
    if (variant !== undefined) dataToUpdate.variant = variant ? variant.trim() : null;
    if (year) dataToUpdate.year = parseInt(year);
    if (fuelType) dataToUpdate.fuelType = fuelType;
    if (mileage !== undefined) dataToUpdate.mileage = parseInt(mileage);
    if (color !== undefined) dataToUpdate.color = color ? color.trim() : null;

    if (regNumber && regNumber.trim().toUpperCase() !== existing.regNumber) {
      const formattedReg = regNumber.trim().toUpperCase().replace(/\s+/g, '-');
      const conflict = await prisma.vehicle.findUnique({ where: { regNumber: formattedReg } });
      if (conflict) {
        return res.status(409).json({ success: false, message: 'Registration number already in use.' });
      }
      dataToUpdate.regNumber = formattedReg;
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: dataToUpdate
    });

    return res.json({
      success: true,
      message: 'Vehicle updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// Delete Vehicle
async function deleteVehicle(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        appointments: {
          where: {
            status: { in: ['IN_PROGRESS', 'INSPECTION', 'VEHICLE_RECEIVED'] }
          }
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    if (req.user.role === 'CUSTOMER' && existing.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this vehicle.' });
    }

    if (existing.appointments && existing.appointments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle with active service appointments in progress.'
      });
    }

    await prisma.vehicle.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Vehicle deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
