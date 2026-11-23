const prisma = require('../config/db');

// Registry of 15 Curated DBMS Viva Queries
const VIVA_QUERIES = [
  {
    id: 'query-1',
    title: 'Vehicles Filter & Sorting',
    category: 'SELECT, WHERE, ORDER BY',
    concepts: ['Single-Table Projection', 'Predicate Filtering', 'Multi-Column Sorting'],
    purpose: 'Retrieve all petrol/diesel vehicles manufactured in 2020 or later, sorted by year (descending) and mileage.',
    sql: `SELECT id, reg_number, make, model, variant, year, fuel_type, mileage 
FROM vehicles 
WHERE year >= 2020 AND fuel_type IN ('PETROL', 'DIESEL') 
ORDER BY year DESC, mileage ASC;`
  },
  {
    id: 'query-2',
    title: 'Active Appointments with Customer & Vehicle',
    category: 'INNER JOIN (3 Tables)',
    concepts: ['Relational Equijoin', 'Foreign Key Navigation', 'String Concatenation'],
    purpose: 'Display confirmed or ongoing appointments linking appointments, users, and vehicles.',
    sql: `SELECT a.appointment_number, u.name AS customer_name, u.phone, v.reg_number, 
CONCAT(v.make, ' ', v.model) AS vehicle_name, a.preferred_date, a.preferred_time_slot, a.status 
FROM appointments a 
INNER JOIN users u ON a.user_id = u.id 
INNER JOIN vehicles v ON a.vehicle_id = v.id 
WHERE a.status IN ('CONFIRMED', 'VEHICLE_RECEIVED', 'IN_PROGRESS', 'READY_FOR_PICKUP') 
ORDER BY a.preferred_date ASC;`
  },
  {
    id: 'query-3',
    title: 'Parts Consumed per Service Record',
    category: 'Multi-Table Join (Many-to-Many Junction)',
    concepts: ['Many-to-Many Bridge Table', 'Financial Aggregation', 'Referential Integrity'],
    purpose: 'Audit all spare parts consumed across service records with unit prices and total costs.',
    sql: `SELECT a.appointment_number, p.part_number, p.name AS part_name, p.category, 
sp.quantity, sp.unit_price, sp.total_cost 
FROM service_parts sp 
INNER JOIN parts p ON sp.part_id = p.id 
INNER JOIN service_records sr ON sp.service_record_id = sr.id 
INNER JOIN appointments a ON sr.appointment_id = a.id 
ORDER BY sp.total_cost DESC;`
  },
  {
    id: 'query-4',
    title: 'Mechanic Workload & Assigned Jobs',
    category: 'LEFT OUTER JOIN & Aggregates',
    concepts: ['LEFT OUTER JOIN', 'Handling NULLs', 'COUNT Aggregate', 'GROUP BY'],
    purpose: 'List every mechanic including those with 0 current jobs, along with service center.',
    sql: `SELECT m.id AS mechanic_id, m.name AS mechanic_name, m.specialization, 
m.status AS availability, sc.name AS service_center, COUNT(sr.id) AS assigned_jobs 
FROM mechanics m 
INNER JOIN service_centers sc ON m.service_center_id = sc.id 
LEFT JOIN service_records sr ON sr.mechanic_id = m.id 
GROUP BY m.id, m.name, m.specialization, m.status, sc.name 
ORDER BY assigned_jobs DESC;`
  },
  {
    id: 'query-5',
    title: 'Executive Financial Summary',
    category: 'Aggregates (COUNT, SUM, AVG, MIN, MAX)',
    concepts: ['Aggregate Functions', 'Statistical Summary', 'Rounding Precision'],
    purpose: 'Compute total invoices, gross revenue, average bill, and minimum/maximum bills.',
    sql: `SELECT COUNT(id) AS total_invoices, 
SUM(service_charges) AS total_service_charges, 
SUM(parts_charges) AS total_parts_charges, 
SUM(total_amount) AS gross_revenue, 
ROUND(AVG(total_amount), 2) AS average_bill, 
MIN(total_amount) AS min_bill, 
MAX(total_amount) AS max_bill 
FROM invoices 
WHERE payment_status = 'PAID';`
  },
  {
    id: 'query-6',
    title: 'Revenue & Bookings by Service Category',
    category: 'GROUP BY with Aggregates',
    concepts: ['Dimensional Grouping', 'Cross-Table Metrics', 'Revenue Attribution'],
    purpose: 'Analyze automotive service categories by booking demand and total revenue generated.',
    sql: `SELECT s.category, COUNT(a.id) AS total_bookings, 
ROUND(AVG(s.price), 2) AS avg_catalog_price, 
COALESCE(SUM(inv.total_amount), 0.00) AS total_revenue 
FROM services s 
INNER JOIN appointments a ON a.service_id = s.id 
LEFT JOIN invoices inv ON inv.appointment_id = a.id 
GROUP BY s.category 
ORDER BY total_revenue DESC;`
  },
  {
    id: 'query-7',
    title: 'High-Value Loyal Customers',
    category: 'GROUP BY with HAVING Clause',
    concepts: ['HAVING Clause vs WHERE', 'Post-Aggregation Filtering', 'Customer Lifetime Value'],
    purpose: 'Identify customers with at least 1 booking and more than ₹3,000 in paid service invoices.',
    sql: `SELECT u.id AS customer_id, u.name AS customer_name, u.email, 
COUNT(a.id) AS total_bookings, SUM(inv.total_amount) AS total_spent 
FROM users u 
INNER JOIN appointments a ON a.user_id = u.id 
INNER JOIN invoices inv ON inv.appointment_id = a.id 
WHERE inv.payment_status = 'PAID' 
GROUP BY u.id, u.name, u.email 
HAVING COUNT(a.id) >= 1 AND SUM(inv.total_amount) > 3000.00 
ORDER BY total_spent DESC;`
  },
  {
    id: 'query-8',
    title: 'Vehicles Serviced for Maintenance/Diagnostics',
    category: 'Subquery with IN Operator',
    concepts: ['Non-Correlated Subquery', 'Set Membership (IN)', 'Modular Data Filtering'],
    purpose: 'Find all vehicles that have undergone Periodic Maintenance or Diagnostic services.',
    sql: `SELECT v.id, v.reg_number, v.make, v.model, v.fuel_type, v.mileage 
FROM vehicles v 
WHERE v.id IN (
    SELECT DISTINCT a.vehicle_id 
    FROM appointments a 
    INNER JOIN services s ON a.service_id = s.id 
    WHERE s.category IN ('Periodic Maintenance', 'Diagnostic')
);`
  },
  {
    id: 'query-9',
    title: 'Customers with 5-Star Feedback',
    category: 'Correlated Subquery with EXISTS',
    concepts: ['Correlated Subquery', 'EXISTS Operator', 'Boolean Existence Evaluation'],
    purpose: 'Locate customers who have rated their service experience with full 5 stars.',
    sql: `SELECT u.id, u.name, u.email, u.phone 
FROM users u 
WHERE EXISTS (
    SELECT 1 
    FROM feedback f 
    WHERE f.user_id = u.id AND f.rating = 5
);`
  },
  {
    id: 'query-10',
    title: 'Invoices Above System Average',
    category: 'Scalar Subquery Comparison',
    concepts: ['Scalar Subquery', 'Comparison Operator (> Subquery)', 'Dynamic Threshold'],
    purpose: 'Filter invoices whose total amount exceeds the overall average bill value.',
    sql: `SELECT invoice_number, total_amount, payment_status, created_at 
FROM invoices 
WHERE total_amount > (
    SELECT AVG(total_amount) 
    FROM invoices 
    WHERE payment_status != 'CANCELLED'
) 
ORDER BY total_amount DESC;`
  },
  {
    id: 'query-11',
    title: 'Querying SQL View: Customer Service History',
    category: 'Database View Query',
    concepts: ['View Abstraction', 'Information Hiding', 'Complex Query Simplification'],
    purpose: 'Extract high-satisfaction completed services directly from pre-defined SQL view.',
    sql: `SELECT appointment_number, customer_name, reg_number, vehicle_info, 
service_name, service_center_city, total_amount, customer_rating 
FROM view_customer_service_history 
WHERE appointment_status = 'COMPLETED' 
ORDER BY booking_date DESC;`
  },
  {
    id: 'query-12',
    title: 'Inventory Stock Alerts & Reorder Calculation',
    category: 'Conditional CASE Expression',
    concepts: ['CASE WHEN Conditional Branching', 'Inventory Control Logic', 'Arithmetic Expressions'],
    purpose: 'Identify low-stock and out-of-stock parts and recommend replenishment quantities.',
    sql: `SELECT part_number, name AS part_name, category, stock_quantity, min_stock_level, 
CASE 
    WHEN stock_quantity = 0 THEN 'CRITICAL: OUT OF STOCK' 
    WHEN stock_quantity <= min_stock_level THEN 'WARNING: LOW STOCK' 
    ELSE 'HEALTHY' 
END AS stock_health, 
GREATEST(0, (min_stock_level * 2) - stock_quantity) AS recommended_reorder_qty 
FROM parts 
ORDER BY stock_quantity ASC;`
  },
  {
    id: 'query-13',
    title: 'Querying SQL View: Service Center Revenue',
    category: 'Database View & Revenue Analysis',
    concepts: ['Multi-Dimensional View', 'Realization Ratio Calculation', 'Financial Performance'],
    purpose: 'Review performance across regional service centers from the revenue SQL view.',
    sql: `SELECT service_center_name, city, total_appointments, completed_appointments, 
gross_revenue, realized_revenue, pending_revenue, 
ROUND((realized_revenue / NULLIF(gross_revenue, 0)) * 100, 2) AS realization_percentage 
FROM view_revenue_report 
ORDER BY realized_revenue DESC;`
  },
  {
    id: 'query-14',
    title: 'Mechanic Ratings and Efficiency View',
    category: 'View Exploration & Aggregate Ratings',
    concepts: ['Pre-Calculated View', 'Multi-Table Performance Aggregation'],
    purpose: 'Rank automotive technicians by verified customer satisfaction rating and completed jobs.',
    sql: `SELECT mechanic_name, employee_id, specialization, experience_years, 
service_center_name, jobs_completed, average_customer_rating, feedback_count 
FROM view_mechanic_performance 
ORDER BY average_customer_rating DESC, jobs_completed DESC;`
  },
  {
    id: 'query-15',
    title: 'Payment Method Breakdown',
    category: 'Aggregates & Grouping by Enum',
    concepts: ['ENUM Column Grouping', 'Transaction Auditing', 'Percentage Share'],
    purpose: 'Evaluate payment collections partitioned by payment method (UPI, Card, Cash, Net Banking).',
    sql: `SELECT payment_method, COUNT(id) AS transaction_count, 
SUM(amount) AS total_collected, 
ROUND(AVG(amount), 2) AS avg_transaction_value 
FROM payments 
WHERE status = 'SUCCESS' 
GROUP BY payment_method 
ORDER BY total_collected DESC;`
  }
];

// Get List of Curated DBMS Viva Queries
function getAvailableQueries(req, res) {
  return res.json({
    success: true,
    data: VIVA_QUERIES
  });
}

// Execute Live SQL Query
async function executeQuery(req, res, next) {
  try {
    const { queryId, customSql } = req.body;

    let sqlToRun = customSql;
    if (queryId) {
      const found = VIVA_QUERIES.find(q => q.id === queryId);
      if (found) {
        sqlToRun = found.sql;
      }
    }

    if (!sqlToRun || typeof sqlToRun !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid SQL query is required.'
      });
    }

    // Sanitize: disallow destructive DDL in viva explorer (DROP DATABASE, etc.)
    const upper = sqlToRun.toUpperCase().trim();
    if (upper.includes('DROP DATABASE') || upper.includes('TRUNCATE')) {
      return res.status(400).json({
        success: false,
        message: 'Destructive DDL operations (DROP DATABASE, TRUNCATE) are disabled in the query explorer.'
      });
    }

    const startTime = process.hrtime();
    const rows = await prisma.$queryRawUnsafe(sqlToRun);
    const diff = process.hrtime(startTime);
    const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    // Extract column keys
    let columns = [];
    if (Array.isArray(rows) && rows.length > 0) {
      columns = Object.keys(rows[0]);
    }

    return res.json({
      success: true,
      data: {
        sql: sqlToRun,
        executionTimeMs: `${executionTimeMs} ms`,
        rowCount: Array.isArray(rows) ? rows.length : 1,
        columns,
        rows
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'SQL Execution Error: ' + error.message,
      sqlError: error.message
    });
  }
}

module.exports = {
  getAvailableQueries,
  executeQuery,
  VIVA_QUERIES
};
