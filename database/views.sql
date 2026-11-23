-- ============================================================================
-- SQL VIEWS FOR DBMS VIVA & PRODUCTION ANALYTICS
-- Database: vehicle_service_db
-- ============================================================================

USE vehicle_service_db;

-- ----------------------------------------------------------------------------
-- View 1: Customer Service History View
-- Multi-table JOIN combining Users, Vehicles, Appointments, Services,
-- Centers, Service Records, Invoices, and Feedback.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_customer_service_history AS
SELECT 
    a.id AS appointment_id,
    a.appointment_number,
    u.id AS customer_id,
    u.name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    v.id AS vehicle_id,
    v.reg_number,
    CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle_info,
    v.fuel_type,
    s.id AS service_id,
    s.name AS service_name,
    s.category AS service_category,
    sc.id AS service_center_id,
    sc.name AS service_center_name,
    sc.city AS service_center_city,
    a.preferred_date,
    a.preferred_time_slot,
    a.status AS appointment_status,
    sr.id AS service_record_id,
    m.name AS assigned_mechanic,
    sr.inspection_notes,
    sr.work_performed,
    sr.current_mileage,
    inv.id AS invoice_id,
    inv.invoice_number,
    inv.service_charges,
    inv.parts_charges,
    inv.total_amount,
    inv.payment_status,
    f.rating AS customer_rating,
    f.comments AS customer_feedback,
    a.created_at AS booking_date
FROM appointments a
INNER JOIN users u ON a.user_id = u.id
INNER JOIN vehicles v ON a.vehicle_id = v.id
INNER JOIN services s ON a.service_id = s.id
INNER JOIN service_centers sc ON a.service_center_id = sc.id
LEFT JOIN service_records sr ON sr.appointment_id = a.id
LEFT JOIN mechanics m ON sr.mechanic_id = m.id
LEFT JOIN invoices inv ON inv.appointment_id = a.id
LEFT JOIN feedback f ON f.appointment_id = a.id;

-- ----------------------------------------------------------------------------
-- View 2: Detailed Appointment Operations View
-- Used by Staff and Admin for active workflow tracking
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_appointment_details AS
SELECT 
    a.id AS appointment_id,
    a.appointment_number,
    a.status,
    a.preferred_date,
    a.preferred_time_slot,
    u.name AS customer_name,
    u.phone AS customer_phone,
    u.email AS customer_email,
    v.reg_number,
    v.make,
    v.model,
    v.fuel_type,
    s.name AS service_name,
    s.price AS base_service_price,
    sc.name AS service_center_name,
    m.name AS mechanic_name,
    m.specialization AS mechanic_specialization,
    COALESCE(inv.total_amount, 0.00) AS total_amount,
    COALESCE(inv.payment_status, 'PENDING') AS payment_status,
    a.created_at
FROM appointments a
JOIN users u ON a.user_id = u.id
JOIN vehicles v ON a.vehicle_id = v.id
JOIN services s ON a.service_id = s.id
JOIN service_centers sc ON a.service_center_id = sc.id
LEFT JOIN service_records sr ON sr.appointment_id = a.id
LEFT JOIN mechanics m ON sr.mechanic_id = m.id
LEFT JOIN invoices inv ON inv.appointment_id = a.id;

-- ----------------------------------------------------------------------------
-- View 3: Financial & Revenue Summary Report
-- Demonstrates Aggregate Functions (SUM, COUNT), Grouping, and Conditional Logic
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_revenue_report AS
SELECT 
    sc.id AS service_center_id,
    sc.name AS service_center_name,
    sc.city,
    COUNT(DISTINCT a.id) AS total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'COMPLETED' THEN a.id END) AS completed_appointments,
    COALESCE(SUM(inv.service_charges), 0.00) AS total_service_charges,
    COALESCE(SUM(inv.parts_charges), 0.00) AS total_parts_charges,
    COALESCE(SUM(inv.tax_amount), 0.00) AS total_tax_collected,
    COALESCE(SUM(inv.discount_amount), 0.00) AS total_discounts_given,
    COALESCE(SUM(inv.total_amount), 0.00) AS gross_revenue,
    COALESCE(SUM(CASE WHEN inv.payment_status = 'PAID' THEN inv.total_amount ELSE 0.00 END), 0.00) AS realized_revenue,
    COALESCE(SUM(CASE WHEN inv.payment_status = 'PENDING' THEN inv.total_amount ELSE 0.00 END), 0.00) AS pending_revenue
FROM service_centers sc
LEFT JOIN appointments a ON a.service_center_id = sc.id
LEFT JOIN invoices inv ON inv.appointment_id = a.id
GROUP BY sc.id, sc.name, sc.city;

-- ----------------------------------------------------------------------------
-- View 4: Mechanic Efficiency & Rating Report
-- Demonstrates Outer Joins, Aggregate Functions (COUNT, AVG), and Performance Metrics
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_mechanic_performance AS
SELECT 
    m.id AS mechanic_id,
    m.name AS mechanic_name,
    m.employee_id,
    m.specialization,
    m.experience_years,
    m.status AS current_status,
    sc.name AS service_center_name,
    COUNT(sr.id) AS total_jobs_assigned,
    COUNT(CASE WHEN a.status = 'COMPLETED' THEN 1 END) AS jobs_completed,
    COALESCE(ROUND(AVG(f.rating), 2), 0.00) AS average_customer_rating,
    COUNT(f.id) AS feedback_count
FROM mechanics m
JOIN service_centers sc ON m.service_center_id = sc.id
LEFT JOIN service_records sr ON sr.mechanic_id = m.id
LEFT JOIN appointments a ON sr.appointment_id = a.id
LEFT JOIN feedback f ON f.appointment_id = a.id
GROUP BY m.id, m.name, m.employee_id, m.specialization, m.experience_years, m.status, sc.name;

-- ----------------------------------------------------------------------------
-- View 5: Inventory Valuation & Reorder Status
-- Demonstrates Mathematical Expressions, CASE Statements, and Inventory Controls
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_inventory_status AS
SELECT 
    p.id AS part_id,
    p.name AS part_name,
    p.part_number,
    p.category,
    p.unit_price,
    p.stock_quantity,
    p.min_stock_level,
    p.status AS part_status,
    (p.unit_price * p.stock_quantity) AS inventory_valuation,
    CASE 
        WHEN p.stock_quantity <= 0 THEN 'URGENT_REORDER'
        WHEN p.stock_quantity <= p.min_stock_level THEN 'REORDER_SOON'
        ELSE 'ADEQUATE'
    END AS replenishment_recommendation,
    COALESCE(SUM(sp.quantity), 0) AS total_units_consumed
FROM parts p
LEFT JOIN service_parts sp ON sp.part_id = p.id
GROUP BY p.id, p.name, p.part_number, p.category, p.unit_price, p.stock_quantity, p.min_stock_level, p.status;
