-- DataNexus AI — Database Schema
-- Domain: Ride/Transportation Analytics

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS rides CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (customers)
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    phone       VARCHAR(20),
    city        VARCHAR(80),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Vehicles table (fleet)
CREATE TABLE vehicles (
    id              SERIAL PRIMARY KEY,
    registration_no VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type    VARCHAR(50) NOT NULL,  -- 'Sedan', 'SUV', 'Auto', 'Bike'
    model           VARCHAR(100),
    driver_name     VARCHAR(100),
    city            VARCHAR(80),
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Rides table (core transactional table)
CREATE TABLE rides (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id),
    vehicle_id      INTEGER REFERENCES vehicles(id),
    pickup_location VARCHAR(150),
    dropoff_location VARCHAR(150),
    distance_km     NUMERIC(8, 2),
    duration_min    INTEGER,
    ride_date       TIMESTAMP NOT NULL,
    status          VARCHAR(30) DEFAULT 'completed',  -- completed, cancelled, ongoing
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id              SERIAL PRIMARY KEY,
    ride_id         INTEGER REFERENCES rides(id),
    amount          NUMERIC(10, 2) NOT NULL,
    payment_method  VARCHAR(50),   -- 'Cash', 'UPI', 'Card', 'Wallet'
    payment_status  VARCHAR(30) DEFAULT 'success',  -- success, failed, pending
    paid_at         TIMESTAMP
);

-- Ratings table
CREATE TABLE ratings (
    id          SERIAL PRIMARY KEY,
    ride_id     INTEGER REFERENCES rides(id),
    user_id     INTEGER REFERENCES users(id),
    vehicle_id  INTEGER REFERENCES vehicles(id),
    rating      NUMERIC(3, 1) CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    rated_at    TIMESTAMP DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_rides_date         ON rides(ride_date);
CREATE INDEX idx_rides_user         ON rides(user_id);
CREATE INDEX idx_rides_vehicle      ON rides(vehicle_id);
CREATE INDEX idx_payments_ride      ON payments(ride_id);
CREATE INDEX idx_ratings_vehicle    ON ratings(vehicle_id);
CREATE INDEX idx_rides_status       ON rides(status);
