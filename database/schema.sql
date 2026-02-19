-- Rivers Rwanda Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS rivers_rwanda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rivers_rwanda;

-- 1. USERS TABLE
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('client', 'agent', 'admin') NOT NULL,
    status ENUM('active', 'pending', 'suspended', 'deleted') DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- 2. OTPS TABLE (One-Time Passwords)
CREATE TABLE otps (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose ENUM('email_verification', 'password_reset') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id_purpose (user_id, purpose)
) ENGINE=InnoDB;

-- 3. CLIENTS TABLE
CREATE TABLE clients (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    country VARCHAR(100) DEFAULT 'Rwanda',
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- 4. AGENTS TABLE
CREATE TABLE agents (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    national_id VARCHAR(16) UNIQUE, -- Added for Agent Verification
    profile_image VARCHAR(255),
    business_name VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ... (rest of the tables: accommodations, vehicles, houses, bookings, etc. remain unchanged) ...

-- 5. ACCOMMODATIONS TABLE
CREATE TABLE accommodations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    type ENUM('apartment', 'hotel_room', 'event_hall') NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    street_address TEXT,
    price_per_night DECIMAL(10,2),
    price_per_event DECIMAL(10,2),
    currency ENUM('RWF', 'USD') DEFAULT 'USD',
    bedrooms INT,
    bathrooms INT,
    max_guests INT,
    capacity INT, -- for event halls
    amenities JSON,
    images JSON,
    status ENUM('available', 'unavailable', 'maintenance') DEFAULT 'available',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_city (city)
) ENGINE=InnoDB;

-- 6. VEHICLES TABLE
CREATE TABLE vehicles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    purpose ENUM('rent', 'buy', 'both') NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    vehicle_type ENUM('sedan', 'suv', 'truck', 'van', 'luxury', 'other') NOT NULL,
    transmission ENUM('automatic', 'manual') NOT NULL,
    fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid') NOT NULL,
    seating_capacity INT NOT NULL,
    daily_rate DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    currency ENUM('RWF', 'USD') DEFAULT 'USD',
    features JSON,
    images JSON,
    status ENUM('available', 'rented', 'sold', 'maintenance') DEFAULT 'available',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_purpose (purpose),
    INDEX idx_status (status),
    INDEX idx_make_model (make, model)
) ENGINE=InnoDB;

-- 7. HOUSES TABLE
CREATE TABLE houses (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    size VARCHAR(100),
    total_rooms INT,
    bedrooms INT,
    bathrooms INT,
    has_parking BOOLEAN DEFAULT FALSE,
    has_garden BOOLEAN DEFAULT FALSE,
    has_wifi BOOLEAN DEFAULT FALSE,
    amenities JSON,
    images JSON,
    province VARCHAR(100),
    district VARCHAR(100),
    sector VARCHAR(100),
    cell VARCHAR(100),
    village VARCHAR(100),
    full_address TEXT,
    monthly_rent_price DECIMAL(10,2),
    purchase_price DECIMAL(10,2),
    currency ENUM('RWF', 'USD') DEFAULT 'RWF',
    status ENUM('available', 'under maintenance', 'rented', 'purchased') DEFAULT 'available',
    contact_info JSON,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_province_district (province, district)
) ENGINE=InnoDB;

-- 8. BOOKINGS TABLE
CREATE TABLE bookings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_type ENUM('accommodation', 'vehicle_rent', 'vehicle_purchase', 'house_rent', 'house_purchase') NOT NULL,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    client_id CHAR(36) NOT NULL,
    agent_id CHAR(36),
    accommodation_id CHAR(36),
    vehicle_id CHAR(36),
    house_id CHAR(36),
    start_date DATE,
    end_date DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status ENUM('pending', 'approved', 'confirmed', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (house_id) REFERENCES houses(id),
    INDEX idx_client (client_id),
    INDEX idx_agent (agent_id),
    INDEX idx_status (booking_status),
    INDEX idx_reference (booking_reference)
) ENGINE=InnoDB;

-- 9. PAYMENTS TABLE
CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    booking_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('bank_transfer', 'mobile_money', 'cash', 'other') NOT NULL,
    transaction_id VARCHAR(255),
    payment_proof_path VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- 10. COMMISSIONS TABLE
CREATE TABLE commissions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    agent_id CHAR(36) NOT NULL,
    booking_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'approved', 'paid', 'cancelled') DEFAULT 'pending',
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_agent (agent_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- 11. CONTACT_INQUIRIES TABLE
CREATE TABLE contact_inquiries (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'in_progress', 'resolved') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- 12. REVIEWS TABLE
CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id CHAR(36) NOT NULL,
    accommodation_id CHAR(36),
    vehicle_id CHAR(36),
    house_id CHAR(36),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (house_id) REFERENCES houses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. SYSTEM_SETTINGS TABLE
CREATE TABLE system_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 14. ADMIN_PROFILES TABLE
CREATE TABLE admin_profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
