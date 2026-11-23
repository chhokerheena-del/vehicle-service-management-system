-- ============================================================================
-- SQL QUERIES REPERTOIRE FOR DBMS VIVA & LAB EXAMINATION
-- Project: Vehicle Service & Maintenance Management System (AutoCare Pro)
-- Database: vehicle_service_db
-- RDBMS: MySQL 8.0
-- ============================================================================

USE vehicle_service_db;

-- ----------------------------------------------------------------------------
-- QUERY 1: Basic Filtering & Sorting (SELECT, WHERE, ORDER BY)
-- Concept: Single-table projection, predicate filtering, multi-column sorting
-- Purpose: Retrieve all active, fuel-efficient petrol/diesel vehicles manufactured
--          after 2019, sorted by manufacturing year (descending) and mileage.
-- ----------------------------------------------------------------------------
SELECT 
    id, 
    reg_number, 
    make, 
    model, 
    variant, 
    year, 
    fuel_type, 
    mileage 
FROM vehicles
WHERE year >= 2020 
  AND fuel_type IN ('PETROL', 'DIESEL')
ORDER BY year DESC, mileage ASC;


-- ----------------------------------------------------------------------------
-- QUERY 2: Inner Join across Three Tables (INNER JOIN)
-- Concept: Relational equijoin combining Users, Vehicles, and Appointments
-- Purpose: List upcoming and confirmed appointments with customer name, vehicle
--          registration, and scheduled date/time slot.
-- ----------------------------------------------------------------------------
SELECT 
    a.appointment_number,
    u.name AS customer_name,
    u.phone AS customer_phone,
    v.reg_number,
    CONCAT(v.make, ' ', v.model) AS vehicle_name,
    a.preferred_date,
    a.preferred_time_slot,
    a.status
FROM appointments a
INNER JOIN users u ON a.user_id = u.id
INNER JOIN vehicles v ON a.vehicle_id = v.id
WHERE a.status IN ('CONFIRMED', 'VEHICLE_RECEIVED', 'IN_PROGRESS')
ORDER BY a.preferred_date ASC;


-- ----------------------------------------------------------------------------
-- QUERY 3: Multi-Table Join for Inventory & Service Consumption
-- Concept: Multi-entity join linking ServiceRecord -> ServicePart -> Part
-- Purpose: Audit all spare parts consumed in a specific appointment, calculating
--          the total parts cost incurred.
-- ----------------------------------------------------------------------------
SELECT 
    a.appointment_number,
    p.part_number,
    p.name AS part_name,
    p.category,
    sp.quantity,
    sp.unit_price,
    sp.total_cost
FROM service_parts sp
INNER JOIN parts p ON sp.part_id = p.id
INNER JOIN service_records sr ON sp.service_record_id = sr.id
INNER JOIN appointments a ON sr.appointment_id = a.id
ORDER BY a.appointment_number, sp.total_cost DESC;


-- ----------------------------------------------------------------------------
-- QUERY 4: Left Outer Join for Comprehensive Mechanic Workload
-- Concept: LEFT JOIN to include entities with zero associations (unassigned mechanics)
-- Purpose: Display every mechanic, their specialization, service center, and count
--          of service records currently assigned to them.
-- ----------------------------------------------------------------------------
SELECT 
    m.id AS mechanic_id,
    m.name AS mechanic_name,
    m.specialization,
    m.status AS availability_status,
    sc.name AS service_center,
    COUNT(sr.id) AS total_assigned_records
FROM mechanics m
INNER JOIN service_centers sc ON m.service_center_id = sc.id
LEFT JOIN service_records sr ON sr.mechanic_id = m.id
GROUP BY m.id, m.name, m.specialization, m.status, sc.name
ORDER BY total_assigned_records DESC;


-- ----------------------------------------------------------------------------
-- QUERY 5: Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)
-- Concept: Full statistical aggregation over financial records
-- Purpose: Compute executive revenue summary: total invoices generated, total sum,
--          average invoice value, and lowest/highest invoice bills.
-- ----------------------------------------------------------------------------
SELECT 
    COUNT(id) AS total_invoices,
    SUM(service_charges) AS total_service_charges,
    SUM(parts_charges) AS total_parts_charges,
    SUM(total_amount) AS gross_revenue,
    ROUND(AVG(total_amount), 2) AS average_invoice_value,
    MIN(total_amount) AS minimum_bill,
    MAX(total_amount) AS maximum_bill
FROM invoices
WHERE payment_status = 'PAID';


-- ----------------------------------------------------------------------------
-- QUERY 6: GROUP BY with Category Breakdown
-- Concept: Grouping by discrete dimensions to analyze service popularity
-- Purpose: Analyze which automotive service categories generate the most demand
--          and revenue.
-- ----------------------------------------------------------------------------
SELECT 
    s.category AS service_category,
    COUNT(a.id) AS booking_count,
    ROUND(AVG(s.price), 2) AS average_catalog_price,
    SUM(inv.total_amount) AS total_revenue_generated
FROM services s
INNER JOIN appointments a ON a.service_id = s.id
LEFT JOIN invoices inv ON inv.appointment_id = a.id
GROUP BY s.category
ORDER BY total_revenue_generated DESC;


-- ----------------------------------------------------------------------------
-- QUERY 7: GROUP BY with HAVING Clause (Aggregate Filter)
-- Concept: HAVING clause used to filter groups AFTER aggregation (unlike WHERE)
-- Purpose: Identify VIP customers who have booked more than 1 service and have
--          spent more than ₹3,000 in total.
-- ----------------------------------------------------------------------------
SELECT 
    u.id AS customer_id,
    u.name AS customer_name,
    u.email,
    COUNT(a.id) AS total_bookings,
    SUM(inv.total_amount) AS total_expenditure
FROM users u
INNER JOIN appointments a ON a.user_id = u.id
INNER JOIN invoices inv ON inv.appointment_id = a.id
WHERE inv.payment_status = 'PAID'
GROUP BY u.id, u.name, u.email
HAVING COUNT(a.id) >= 1 AND SUM(inv.total_amount) > 3000.00
ORDER BY total_expenditure DESC;


-- ----------------------------------------------------------------------------
-- QUERY 8: Subquery in WHERE Clause using IN
-- Concept: Nested subquery returning a set of foreign key IDs
-- Purpose: Find all vehicles that have received a service in the 'Periodic Maintenance'
--          or 'Engine Diagnostics' category.
-- ----------------------------------------------------------------------------
SELECT 
    v.id,
    v.reg_number,
    v.make,
    v.model,
    v.mileage
FROM vehicles v
WHERE v.id IN (
    SELECT DISTINCT a.vehicle_id 
    FROM appointments a
    INNER JOIN services s ON a.service_id = s.id
    WHERE s.category IN ('Periodic Maintenance', 'Diagnostic')
);


-- ----------------------------------------------------------------------------
-- QUERY 9: Subquery using EXISTS (Correlated Subquery)
-- Concept: Correlated evaluation where outer query attributes are tested in subquery
-- Purpose: Find customers who have submitted at least one 5-star rating feedback.
-- ----------------------------------------------------------------------------
SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.phone
FROM users u
WHERE EXISTS (
    SELECT 1 
    FROM feedback f
    WHERE f.user_id = u.id 
      AND f.rating = 5
);


-- ----------------------------------------------------------------------------
-- QUERY 10: Scalar Subquery with Comparison Operator
-- Concept: Nested subquery returning a single scalar value for row comparison
-- Purpose: List all invoices whose total amount exceeds the overall average
--          invoice amount across the entire service chain.
-- ----------------------------------------------------------------------------
SELECT 
    inv.invoice_number,
    inv.total_amount,
    inv.payment_status,
    inv.created_at
FROM invoices inv
WHERE inv.total_amount > (
    SELECT AVG(total_amount) 
    FROM invoices 
    WHERE payment_status != 'CANCELLED'
)
ORDER BY inv.total_amount DESC;


-- ----------------------------------------------------------------------------
-- QUERY 11: Querying a Pre-Defined SQL View (Abstraction & Security)
-- Concept: Database View encapsulation
-- Purpose: Retrieve high-level customer service history filtered by city and rating.
-- ----------------------------------------------------------------------------
SELECT 
    appointment_number,
    customer_name,
    reg_number,
    vehicle_info,
    service_name,
    service_center_city,
    total_amount,
    customer_rating
FROM view_customer_service_history
WHERE appointment_status = 'COMPLETED'
  AND customer_rating >= 4
ORDER BY booking_date DESC;


-- ----------------------------------------------------------------------------
-- QUERY 12: Inventory Reorder Alert Query using CASE and Mathematical Logic
-- Concept: Conditional branching in SQL using CASE WHEN ... THEN ... ELSE
-- Purpose: Identify all spare parts that are low in stock or out of stock,
--          recommending the quantity needed to reach 2x minimum threshold.
-- ----------------------------------------------------------------------------
SELECT 
    part_number,
    name AS part_name,
    category,
    stock_quantity,
    min_stock_level,
    CASE 
        WHEN stock_quantity = 0 THEN 'CRITICAL: OUT OF STOCK'
        WHEN stock_quantity <= min_stock_level THEN 'WARNING: LOW STOCK'
        ELSE 'HEALTHY'
    END AS inventory_health,
    GREATEST(0, (min_stock_level * 2) - stock_quantity) AS suggested_reorder_qty
FROM parts
WHERE stock_quantity <= min_stock_level
ORDER BY stock_quantity ASC;


-- ----------------------------------------------------------------------------
-- QUERY 13: Correlated Aggregate: Service Center Revenue Comparison
-- Concept: Querying aggregate view with WHERE and ORDER BY
-- Purpose: Rank service centers by total realized cash inflow and completed appointments.
-- ----------------------------------------------------------------------------
SELECT 
    service_center_name,
    city,
    completed_appointments,
    realized_revenue,
    pending_revenue,
    ROUND((realized_revenue / NULLIF(gross_revenue, 0)) * 100, 2) AS realization_percentage
FROM view_revenue_report
ORDER BY realized_revenue DESC;


-- ----------------------------------------------------------------------------
-- QUERY 14: Safe Update with Subquery & Transaction Concept
-- Concept: DML Data Manipulation with Referential Integrity
-- Purpose: Decrement inventory stock when parts are dispensed for a service.
-- ----------------------------------------------------------------------------
-- Step 1: Check availability
SELECT id, part_number, stock_quantity FROM parts WHERE id = 1 AND stock_quantity >= 2;

-- Step 2: Update stock quantity safely
UPDATE parts 
SET stock_quantity = stock_quantity - 2,
    status = CASE 
        WHEN stock_quantity - 2 <= 0 THEN 'OUT_OF_STOCK'
        WHEN stock_quantity - 2 <= min_stock_level THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END
WHERE id = 1 AND stock_quantity >= 2;


-- ----------------------------------------------------------------------------
-- QUERY 15: Database Transaction (ACID Properties)
-- Concept: Atomic Unit of Work ensuring all-or-nothing execution
-- Purpose: Service completion workflow:
--          1. Mark appointment as COMPLETED
--          2. Set service record completion timestamp
--          3. Generate official invoice with subtotal, tax, and total
-- ----------------------------------------------------------------------------
START TRANSACTION;

-- 1. Update appointment status
UPDATE appointments 
SET status = 'COMPLETED', updated_at = NOW() 
WHERE id = 1;

-- 2. Update service record status
UPDATE service_records 
SET status = 'COMPLETED', completion_date = NOW(), updated_at = NOW()
WHERE appointment_id = 1;

-- 3. Insert Invoice
INSERT INTO invoices (
    invoice_number, 
    appointment_id, 
    service_charges, 
    parts_charges, 
    subtotal, 
    tax_rate, 
    tax_amount, 
    discount_amount, 
    total_amount, 
    payment_status, 
    due_date
) VALUES (
    'INV-DEMO-TX-01', 
    1, 
    1500.00, 
    1200.00, 
    2700.00, 
    18.00, 
    486.00, 
    100.00, 
    3086.00, 
    'PENDING', 
    DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)
) ON DUPLICATE KEY UPDATE updated_at = NOW();

-- If all queries succeed, commit the changes atomically:
COMMIT;
-- If any error occurs: ROLLBACK;
