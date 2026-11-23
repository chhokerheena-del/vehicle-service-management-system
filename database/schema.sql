-- ============================================================================
-- VEHICLE SERVICE & MAINTENANCE MANAGEMENT SYSTEM (AutoCare Pro)
-- Database: vehicle_service_db
-- RDBMS: MySQL 8.0
-- BTech CSE DBMS Project - Production-Grade Relational Schema
-- ============================================================================

CREATE DATABASE IF NOT EXISTS vehicle_service_db;
USE vehicle_service_db;

-- Drop tables in reverse foreign-key order
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS service_parts;
DROP TABLE IF EXISTS parts;
DROP TABLE IF EXISTS service_records;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS mechanics;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS service_centers;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;

-- ----------------------------------------------------------------------------
-- Table 1: USERS
-- Entities: Customers, Staff, Administrators
-- Normalization: 3NF (Atomic attributes, key-dependent, no transitive dependencies)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('CUSTOMER', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    address VARCHAR(255),
    city VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 2: VEHICLES
-- User 1 ---- N Vehicles
-- ----------------------------------------------------------------------------
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reg_number VARCHAR(30) NOT NULL UNIQUE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    variant VARCHAR(50),
    year INT NOT NULL,
    fuel_type ENUM('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG') NOT NULL DEFAULT 'PETROL',
    mileage INT NOT NULL DEFAULT 0,
    color VARCHAR(30),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_vehicles_user (user_id),
    INDEX idx_vehicles_make_model (make, model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 3: SERVICE_CENTERS
-- Workshop locations across metropolitan regions
-- ----------------------------------------------------------------------------
CREATE TABLE service_centers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(150) NOT NULL,
    opening_hours VARCHAR(100) NOT NULL DEFAULT 'Mon - Sat: 8:00 AM - 7:00 PM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_centers_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 4: SERVICES
-- Standard automotive catalog items with baseline pricing & hours
-- ----------------------------------------------------------------------------
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    estimated_hours DECIMAL(4, 1) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_services_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 5: MECHANICS
-- ServiceCenter 1 ---- N Mechanics
-- ----------------------------------------------------------------------------
CREATE TABLE mechanics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_center_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(30) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(150),
    specialization VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL DEFAULT 3,
    status ENUM('AVAILABLE', 'BUSY', 'ON_LEAVE') NOT NULL DEFAULT 'AVAILABLE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mechanics_center FOREIGN KEY (service_center_id) REFERENCES service_centers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_mechanics_center (service_center_id),
    INDEX idx_mechanics_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 6: APPOINTMENTS
-- Central entity orchestrating User, Vehicle, Center, and Service
-- ----------------------------------------------------------------------------
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_number VARCHAR(40) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    service_center_id INT NOT NULL,
    service_id INT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time_slot VARCHAR(40) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'VEHICLE_RECEIVED', 'INSPECTION', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    cancellation_reason VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_appointments_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_appointments_center FOREIGN KEY (service_center_id) REFERENCES service_centers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_appointments_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_appointments_user (user_id),
    INDEX idx_appointments_vehicle (vehicle_id),
    INDEX idx_appointments_center (service_center_id),
    INDEX idx_appointments_status (status),
    INDEX idx_appointments_date (preferred_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 7: SERVICE_RECORDS
-- Appointment 1 ---- 1 ServiceRecord
-- Detailed technician log of vehicle intake, diagnostics, and repairs
-- ----------------------------------------------------------------------------
CREATE TABLE service_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL UNIQUE,
    mechanic_id INT,
    inspection_notes TEXT,
    work_performed TEXT,
    current_mileage INT,
    status VARCHAR(40) NOT NULL DEFAULT 'INSPECTION',
    completion_date DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_records_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_service_records_mechanic FOREIGN KEY (mechanic_id) REFERENCES mechanics(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_service_records_mechanic (mechanic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 8: PARTS
-- Spare parts inventory catalog with real-time stock control
-- ----------------------------------------------------------------------------
CREATE TABLE parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    part_number VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 5,
    status ENUM('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK') NOT NULL DEFAULT 'IN_STOCK',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_stock_non_negative CHECK (stock_quantity >= 0),
    INDEX idx_parts_category (category),
    INDEX idx_parts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 9: SERVICE_PARTS
-- Junction table implementing ServiceRecord N ---- N Parts
-- ----------------------------------------------------------------------------
CREATE TABLE service_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_record_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_service_parts_record FOREIGN KEY (service_record_id) REFERENCES service_records(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_service_parts_part FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_service_parts_qty CHECK (quantity > 0),
    INDEX idx_service_parts_record (service_record_id),
    INDEX idx_service_parts_part (part_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 10: INVOICES
-- Appointment 1 ---- 1 Invoice
-- Subtotal = ServiceCharges + PartsCharges; Total = Subtotal + Tax - Discount
-- ----------------------------------------------------------------------------
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(40) NOT NULL UNIQUE,
    appointment_id INT NOT NULL UNIQUE,
    service_charges DECIMAL(10, 2) NOT NULL,
    parts_charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    tax_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    due_date DATE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_invoices_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 11: PAYMENTS
-- Invoice 1 ---- N Payments
-- Multiple installments or payment methods supported
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_number VARCHAR(40) NOT NULL UNIQUE,
    invoice_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('UPI', 'CARD', 'CASH', 'NET_BANKING') NOT NULL,
    transaction_ref VARCHAR(100),
    status ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL DEFAULT 'SUCCESS',
    paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    INDEX idx_payments_invoice (invoice_id),
    INDEX idx_payments_method (payment_method),
    INDEX idx_payments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 12: FEEDBACK
-- Appointment 1 ---- 1 Feedback
-- ----------------------------------------------------------------------------
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    service_quality INT NOT NULL DEFAULT 5,
    staff_courtesy INT NOT NULL DEFAULT 5,
    timely_delivery INT NOT NULL DEFAULT 5,
    comments TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5),
    INDEX idx_feedback_user (user_id),
    INDEX idx_feedback_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
