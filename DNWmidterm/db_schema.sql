-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)
DROP TABLE IF EXISTS classes;

CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    date TEXT,
    time TEXT,
    capacity INTEGER,
    booked INTEGER DEFAULT 0,
    fullPriceTickets INTEGER DEFAULT 0,
    fullPriceCost REAL DEFAULT 0.0,
    concessionTickets INTEGER DEFAULT 0,
    concessionCost REAL DEFAULT 0.0
);


CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    siteName TEXT NOT NULL,
    description TEXT NOT NULL
);

DROP TABLE IF EXISTS events;

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    fullPriceTickets INTEGER NOT NULL,
    fullPriceCost REAL NOT NULL,
    concessionTickets INTEGER NOT NULL,
    concessionCost REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    lastModified TEXT NOT NULL
);


INSERT INTO settings (siteName, description) VALUES ('Your Fitness platform', 'Manage events and attendees with ease');


INSERT INTO classes (name, description, date, time, capacity, fullPriceTickets, fullPriceCost, concessionTickets, concessionCost) VALUES
('Spin class', 'High-energy cycling workout', '2025-01-15', '8:00', 20, 10, 20.0, 10, 10.0),
('Yoga', 'Relaxing and meditative stretching', '2025-01-16', '8:30', 15, 8, 15.0, 7, 8.0),
('Boxing', 'Intense boxing training session', '2025-01-16', '14:00', 10, 5, 30.0, 3, 15.0),
('Pilates', 'Core focused strength exercises', '2025-01-17', '10:00', 25, 20, 25.0, 5, 12.5),
('HIIT class', 'High Intensity interval training', '2025-01-18', '17:00', 30, 15, 20.0, 10, 10.0);

INSERT INTO events (title, description, fullPriceTickets, fullPriceCost, concessionTickets, concessionCost, status, lastModified) VALUES
('Spin Class', 'A high-energy cycling workout.', 10, 20.0, 10, 10.0, 'published', datetime('now')),
('Yoga', 'Relaxing and meditative stretching.', 8, 15.0, 7, 8.0, 'draft', datetime('now')),
('Boxing', 'Intense boxing training session.', 5, 30.0, 3, 15.0, 'published', datetime('now')),
('Pilates', 'Core-focused strength exercises.', 20, 25.0, 5, 12.5, 'draft', datetime('now')),
('HIIT Class', 'High-intensity interval training.', 15, 20.0, 10, 10.0, 'published', datetime('now'));


COMMIT;

