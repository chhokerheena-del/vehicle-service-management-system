const prisma = require('../config/db');

// Get All Parts
async function getAllParts(req, res, next) {
  try {
    const { category, status, search, lowStockOnly } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (lowStockOnly === 'true') {
      filter.status = { in: ['LOW_STOCK', 'OUT_OF_STOCK'] };
    }

    if (search) {
      filter.OR = [
        { name: { contains: search } },
        { partNumber: { contains: search } },
        { category: { contains: search } }
      ];
    }

    const parts = await prisma.part.findMany({
      where: filter,
      include: {
        _count: {
          select: { serviceParts: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.json({
      success: true,
      data: parts
    });
  } catch (error) {
    next(error);
  }
}

// Get Part by ID
async function getPartById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const part = await prisma.part.findUnique({
      where: { id },
      include: {
        serviceParts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            serviceRecord: {
              include: {
                appointment: {
                  include: {
                    vehicle: true,
                    user: { select: { name: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!part) {
      return res.status(404).json({ success: false, message: 'Part not found.' });
    }

    return res.json({ success: true, data: part });
  } catch (error) {
    next(error);
  }
}

// Create Part (Staff/Admin)
async function createPart(req, res, next) {
  try {
    const { name, partNumber, category, unitPrice, stockQuantity, minStockLevel } = req.body;

    if (!name || !partNumber || !category || unitPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, part number, category, and unit price are required.'
      });
    }

    const formattedPartNum = partNumber.trim().toUpperCase();
    const existing = await prisma.part.findUnique({ where: { partNumber: formattedPartNum } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Part number already exists.' });
    }

    const stock = parseInt(stockQuantity) || 0;
    const minStock = parseInt(minStockLevel) || 5;

    let status = 'IN_STOCK';
    if (stock <= 0) {
      status = 'OUT_OF_STOCK';
    } else if (stock <= minStock) {
      status = 'LOW_STOCK';
    }

    const newPart = await prisma.part.create({
      data: {
        name: name.trim(),
        partNumber: formattedPartNum,
        category: category.trim(),
        unitPrice: parseFloat(unitPrice),
        stockQuantity: stock,
        minStockLevel: minStock,
        status
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Part created in inventory.',
      data: newPart
    });
  } catch (error) {
    next(error);
  }
}

// Update Part (Staff/Admin)
async function updatePart(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { name, category, unitPrice, minStockLevel } = req.body;

    const existing = await prisma.part.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Part not found.' });
    }

    const minStock = minStockLevel !== undefined ? parseInt(minStockLevel) : existing.minStockLevel;
    let status = existing.status;
    if (existing.stockQuantity <= 0) {
      status = 'OUT_OF_STOCK';
    } else if (existing.stockQuantity <= minStock) {
      status = 'LOW_STOCK';
    } else {
      status = 'IN_STOCK';
    }

    const updated = await prisma.part.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        category: category ? category.trim() : undefined,
        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : undefined,
        minStockLevel: minStock,
        status
      }
    });

    return res.json({
      success: true,
      message: 'Part updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// Adjust Stock / Restock (Staff/Admin)
async function adjustStock(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { quantityToAdd, newStockQuantity, reason } = req.body;

    const existing = await prisma.part.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Part not found.' });
    }

    let finalStock = existing.stockQuantity;
    if (newStockQuantity !== undefined) {
      finalStock = parseInt(newStockQuantity);
    } else if (quantityToAdd !== undefined) {
      finalStock = existing.stockQuantity + parseInt(quantityToAdd);
    }

    if (finalStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity cannot be negative.'
      });
    }

    let status = 'IN_STOCK';
    if (finalStock === 0) {
      status = 'OUT_OF_STOCK';
    } else if (finalStock <= existing.minStockLevel) {
      status = 'LOW_STOCK';
    }

    const updated = await prisma.part.update({
      where: { id },
      data: {
        stockQuantity: finalStock,
        status
      }
    });

    return res.json({
      success: true,
      message: `Inventory stock updated for '${updated.name}'. New stock: ${updated.stockQuantity}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllParts,
  getPartById,
  createPart,
  updatePart,
  adjustStock
};
