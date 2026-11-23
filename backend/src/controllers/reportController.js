const prisma = require('../config/db');

// Revenue Report (Directly querying SQL view `view_revenue_report`)
async function getRevenueReport(req, res, next) {
  try {
    const report = await prisma.$queryRaw`
      SELECT * FROM view_revenue_report ORDER BY realized_revenue DESC
    `;

    // Also get overall summary totals
    const totals = await prisma.$queryRaw`
      SELECT 
        COALESCE(SUM(total_appointments), 0) AS total_appointments,
        COALESCE(SUM(completed_appointments), 0) AS completed_appointments,
        COALESCE(SUM(gross_revenue), 0.00) AS gross_revenue,
        COALESCE(SUM(realized_revenue), 0.00) AS realized_revenue,
        COALESCE(SUM(pending_revenue), 0.00) AS pending_revenue,
        COALESCE(SUM(total_tax_collected), 0.00) AS total_tax_collected,
        COALESCE(SUM(total_discounts_given), 0.00) AS total_discounts_given
      FROM view_revenue_report
    `;

    return res.json({
      success: true,
      data: {
        centers: report,
        summary: totals[0] || {}
      }
    });
  } catch (error) {
    next(error);
  }
}

// Mechanics Performance Report (Querying SQL view `view_mechanic_performance`)
async function getMechanicsReport(req, res, next) {
  try {
    const report = await prisma.$queryRaw`
      SELECT * FROM view_mechanic_performance ORDER BY average_customer_rating DESC, jobs_completed DESC
    `;

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
}

// Low Stock & Inventory Valuation Report (Querying SQL view `view_inventory_status`)
async function getInventoryReport(req, res, next) {
  try {
    const report = await prisma.$queryRaw`
      SELECT * FROM view_inventory_status ORDER BY stock_quantity ASC
    `;

    const summary = await prisma.$queryRaw`
      SELECT 
        COUNT(part_id) AS total_parts_catalog,
        COALESCE(SUM(stock_quantity), 0) AS total_units_in_stock,
        COALESCE(SUM(inventory_valuation), 0.00) AS total_inventory_valuation,
        COUNT(CASE WHEN replenishment_recommendation = 'URGENT_REORDER' THEN 1 END) AS out_of_stock_count,
        COUNT(CASE WHEN replenishment_recommendation = 'REORDER_SOON' THEN 1 END) AS low_stock_count
      FROM view_inventory_status
    `;

    return res.json({
      success: true,
      data: {
        parts: report,
        summary: summary[0] || {}
      }
    });
  } catch (error) {
    next(error);
  }
}

// Customer Service History Report (Querying SQL view `view_customer_service_history`)
async function getCustomerHistoryReport(req, res, next) {
  try {
    const report = await prisma.$queryRaw`
      SELECT * FROM view_customer_service_history ORDER BY booking_date DESC LIMIT 100
    `;

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
}

// Services Demand & Popularity Report
async function getServicesReport(req, res, next) {
  try {
    const report = await prisma.$queryRaw`
      SELECT 
        s.id,
        s.name,
        s.category,
        s.price,
        s.estimated_hours,
        COUNT(a.id) AS booking_count,
        COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END) AS completed_count,
        COALESCE(SUM(inv.total_amount), 0.00) AS total_revenue
      FROM services s
      LEFT JOIN appointments a ON a.service_id = s.id
      LEFT JOIN invoices inv ON inv.appointment_id = a.id
      GROUP BY s.id, s.name, s.category, s.price, s.estimated_hours
      ORDER BY booking_count DESC, total_revenue DESC
    `;

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRevenueReport,
  getMechanicsReport,
  getInventoryReport,
  getCustomerHistoryReport,
  getServicesReport
};
