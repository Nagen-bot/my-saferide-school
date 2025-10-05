-- Users table (students, parents, drivers, admins)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'driver', 'admin')),
  school TEXT CHECK (school IN ('botani', 'imperial')),
  student_class TEXT,
  parent_student_id INTEGER, -- Reference to student for parents
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_student_id) REFERENCES users(id)
);

-- Vans table
CREATE TABLE IF NOT EXISTS vans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plate_number TEXT UNIQUE NOT NULL,
  driver_id INTEGER NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 15,
  school TEXT NOT NULL CHECK (school IN ('botani', 'imperial')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- Routes table (pickup/dropoff locations)
CREATE TABLE IF NOT EXISTS routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  school TEXT NOT NULL CHECK (school IN ('botani', 'imperial')),
  pickup_time TIME NOT NULL,
  dropoff_time TIME NOT NULL,
  area TEXT NOT NULL, -- General area like "Ipoh Garden", "Tambun", etc.
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Route stops (specific stops within a route)
CREATE TABLE IF NOT EXISTS route_stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id INTEGER NOT NULL,
  stop_name TEXT NOT NULL,
  address TEXT,
  pickup_time TIME NOT NULL,
  dropoff_time TIME NOT NULL,
  sequence_order INTEGER NOT NULL, -- Order of stops in the route
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- Van routes assignment
CREATE TABLE IF NOT EXISTS van_routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  van_id INTEGER NOT NULL,
  route_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
  is_morning BOOLEAN NOT NULL DEFAULT 1, -- 1=morning pickup, 0=afternoon dropoff
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (van_id) REFERENCES vans(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  UNIQUE(van_id, route_id, day_of_week, is_morning)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  van_route_id INTEGER NOT NULL,
  route_stop_id INTEGER NOT NULL,
  booking_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  booked_by INTEGER NOT NULL, -- User ID who made the booking (parent or student)
  special_instructions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (van_route_id) REFERENCES van_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (route_stop_id) REFERENCES route_stops(id) ON DELETE CASCADE,
  FOREIGN KEY (booked_by) REFERENCES users(id),
  UNIQUE(student_id, van_route_id, booking_date)
);

-- Monthly subscriptions for regular riders
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  van_route_id INTEGER NOT NULL,
  route_stop_id INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2024),
  fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_payment')),
  subscribed_by INTEGER NOT NULL, -- User ID who made the subscription
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (van_route_id) REFERENCES van_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (route_stop_id) REFERENCES route_stops(id) ON DELETE CASCADE,
  FOREIGN KEY (subscribed_by) REFERENCES users(id),
  UNIQUE(student_id, van_route_id, month, year)
);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school);
CREATE INDEX IF NOT EXISTS idx_vans_driver ON vans(driver_id);
CREATE INDEX IF NOT EXISTS idx_vans_school ON vans(school);
CREATE INDEX IF NOT EXISTS idx_routes_school ON routes(school);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_van_routes_van ON van_routes(van_id);
CREATE INDEX IF NOT EXISTS idx_van_routes_route ON van_routes(route_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_student ON subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period ON subscriptions(month, year);