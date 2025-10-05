-- Seed data for van ride app

-- Insert admin users
INSERT OR IGNORE INTO users (email, password_hash, name, phone, role, school) VALUES 
  ('admin@botani.edu.my', 'hashed_password_123', 'Admin Botani', '+60123456789', 'admin', 'botani'),
  ('admin@imperial.edu.my', 'hashed_password_456', 'Admin Imperial', '+60123456790', 'admin', 'imperial');

-- Insert drivers
INSERT OR IGNORE INTO users (email, password_hash, name, phone, role, school) VALUES 
  ('driver1@botani.com', 'hashed_password_789', 'Ahmad Rahman', '+60123456791', 'driver', 'botani'),
  ('driver2@botani.com', 'hashed_password_012', 'Lim Wei Ming', '+60123456792', 'driver', 'botani'),
  ('driver3@imperial.com', 'hashed_password_345', 'Raj Kumar', '+60123456793', 'driver', 'imperial'),
  ('driver4@imperial.com', 'hashed_password_678', 'Tan Siew Ling', '+60123456794', 'driver', 'imperial');

-- Insert sample students for Botani
INSERT OR IGNORE INTO users (email, password_hash, name, phone, role, school, student_class) VALUES 
  ('student1@botani.edu.my', 'hashed_password_901', 'Sarah Lim', '+60123456795', 'student', 'botani', 'Form 4A'),
  ('student2@botani.edu.my', 'hashed_password_234', 'Daniel Wong', '+60123456796', 'student', 'botani', 'Form 5B'),
  ('student3@botani.edu.my', 'hashed_password_567', 'Aisha Rahman', '+60123456797', 'student', 'botani', 'Form 3C');

-- Insert sample students for Imperial
INSERT OR IGNORE INTO users (email, password_hash, name, phone, role, school, student_class) VALUES 
  ('student4@imperial.edu.my', 'hashed_password_890', 'Kevin Tan', '+60123456798', 'student', 'imperial', 'Year 10'),
  ('student5@imperial.edu.my', 'hashed_password_123', 'Priya Devi', '+60123456799', 'student', 'imperial', 'Year 11'),
  ('student6@imperial.edu.my', 'hashed_password_456', 'Marcus Lee', '+60123456800', 'student', 'imperial', 'Year 9');

-- Insert parents
INSERT OR IGNORE INTO users (email, password_hash, name, phone, role, parent_student_id) VALUES 
  ('parent1@gmail.com', 'hashed_password_789', 'Robert Lim', '+60123456801', 'parent', 3), -- Sarah's parent
  ('parent2@gmail.com', 'hashed_password_012', 'Alice Wong', '+60123456802', 'parent', 4), -- Daniel's parent
  ('parent3@gmail.com', 'hashed_password_345', 'Hassan Rahman', '+60123456803', 'parent', 5), -- Aisha's parent
  ('parent4@gmail.com', 'hashed_password_678', 'Linda Tan', '+60123456804', 'parent', 6), -- Kevin's parent
  ('parent5@gmail.com', 'hashed_password_901', 'Suresh Devi', '+60123456805', 'parent', 7), -- Priya's parent
  ('parent6@gmail.com', 'hashed_password_234', 'Jennifer Lee', '+60123456806', 'parent', 8); -- Marcus's parent

-- Insert vans for both schools
INSERT OR IGNORE INTO vans (plate_number, driver_id, capacity, school, status) VALUES 
  ('PKA 1234', 3, 15, 'botani', 'active'),   -- Ahmad's van
  ('PKB 5678', 4, 12, 'botani', 'active'),   -- Lim's van
  ('PKC 9012', 5, 15, 'imperial', 'active'), -- Raj's van
  ('PKD 3456', 6, 14, 'imperial', 'active'); -- Tan's van

-- Insert routes for Botani International School
INSERT OR IGNORE INTO routes (name, description, school, pickup_time, dropoff_time, area, status) VALUES 
  ('Ipoh Garden Route', 'Covers Ipoh Garden and surrounding areas', 'botani', '07:00:00', '14:30:00', 'Ipoh Garden', 'active'),
  ('Tambun Route', 'Covers Tambun and nearby residential areas', 'botani', '07:15:00', '14:45:00', 'Tambun', 'active'),
  ('City Centre Route', 'Covers Ipoh city centre areas', 'botani', '07:30:00', '15:00:00', 'City Centre', 'active');

-- Insert routes for Imperial International School  
INSERT OR IGNORE INTO routes (name, description, school, pickup_time, dropoff_time, area, status) VALUES 
  ('Bercham Route', 'Covers Bercham and surrounding areas', 'imperial', '07:00:00', '14:30:00', 'Bercham', 'active'),
  ('Greentown Route', 'Covers Greentown and nearby areas', 'imperial', '07:15:00', '14:45:00', 'Greentown', 'active');

-- Insert route stops for Botani routes
INSERT OR IGNORE INTO route_stops (route_id, stop_name, address, pickup_time, dropoff_time, sequence_order, latitude, longitude) VALUES 
  -- Ipoh Garden Route stops
  (1, 'Ipoh Garden Shopping Mall', 'Jalan Sultan Abdul Jalil, Ipoh Garden', '07:00:00', '14:30:00', 1, 4.5975, 101.0901),
  (1, 'Taman Ipoh Jaya', 'Jalan Ipoh Jaya 1', '07:05:00', '14:35:00', 2, 4.5985, 101.0911),
  (1, 'Medan Ipoh Bistari', 'Jalan Medan Ipoh Bistari 2', '07:10:00', '14:40:00', 3, 4.5995, 101.0921),
  
  -- Tambun Route stops  
  (2, 'Tambun Inn', 'Jalan Tambun, Tambun', '07:15:00', '14:45:00', 1, 4.6100, 101.1234),
  (2, 'Taman Tambun Permai', 'Jalan Tambun Permai 5', '07:20:00', '14:50:00', 2, 4.6110, 101.1244),
  (2, 'Sunway Lost World', 'Persiaran Lagun Sunway 1, Tambun', '07:25:00', '14:55:00', 3, 4.6120, 101.1254),
  
  -- City Centre Route stops
  (3, 'Parade Shopping Mall', 'Jalan Sultan Abdul Jalil Shah', '07:30:00', '15:00:00', 1, 4.5951, 101.0829),
  (3, 'Kinta City Shopping Centre', 'No 1, Jalan Datuk Onn Jaafar', '07:35:00', '15:05:00', 2, 4.5961, 101.0839),
  (3, 'Ipoh Railway Station', 'Jalan Panglima Bukit Gantang Wahab', '07:40:00', '15:10:00', 3, 4.5971, 101.0849);

-- Insert route stops for Imperial routes  
INSERT OR IGNORE INTO route_stops (route_id, stop_name, address, pickup_time, dropoff_time, sequence_order, latitude, longitude) VALUES 
  -- Bercham Route stops
  (4, 'Aeon Mall Kinta City', 'Jalan Datuk Onn Jaafar, Bercham', '07:00:00', '14:30:00', 1, 4.6284, 101.1059),
  (4, 'Taman Bercham Permai', 'Jalan Bercham Permai 3', '07:05:00', '14:35:00', 2, 4.6294, 101.1069),
  (4, 'Hospital Besar Ipoh', 'Jalan Hospital', '07:10:00', '14:40:00', 3, 4.6304, 101.1079),
  
  -- Greentown Route stops
  (5, 'Greentown Business Centre', 'Jalan Greentown 9', '07:15:00', '14:45:00', 1, 4.5847, 101.0736),  
  (5, 'Taman Greentown', 'Jalan Greentown 5', '07:20:00', '14:50:00', 2, 4.5857, 101.0746),
  (5, 'Jusco Kinta City', 'Jalan Datuk Onn Jaafar', '07:25:00', '14:55:00', 3, 4.5867, 101.0756);

-- Assign vans to routes (Monday to Friday)
INSERT OR IGNORE INTO van_routes (van_id, route_id, day_of_week, is_morning, status) VALUES 
  -- Botani vans (van 1 & 2) covering routes 1, 2, 3
  (1, 1, 1, 1, 'active'), (1, 1, 2, 1, 'active'), (1, 1, 3, 1, 'active'), (1, 1, 4, 1, 'active'), (1, 1, 5, 1, 'active'), -- Van 1 Monday-Friday morning Ipoh Garden
  (1, 1, 1, 0, 'active'), (1, 1, 2, 0, 'active'), (1, 1, 3, 0, 'active'), (1, 1, 4, 0, 'active'), (1, 1, 5, 0, 'active'), -- Van 1 Monday-Friday afternoon Ipoh Garden
  
  (2, 2, 1, 1, 'active'), (2, 2, 2, 1, 'active'), (2, 2, 3, 1, 'active'), (2, 2, 4, 1, 'active'), (2, 2, 5, 1, 'active'), -- Van 2 Monday-Friday morning Tambun
  (2, 2, 1, 0, 'active'), (2, 2, 2, 0, 'active'), (2, 2, 3, 0, 'active'), (2, 2, 4, 0, 'active'), (2, 2, 5, 0, 'active'), -- Van 2 Monday-Friday afternoon Tambun
  
  -- Imperial vans (van 3 & 4) covering routes 4, 5  
  (3, 4, 1, 1, 'active'), (3, 4, 2, 1, 'active'), (3, 4, 3, 1, 'active'), (3, 4, 4, 1, 'active'), (3, 4, 5, 1, 'active'), -- Van 3 Monday-Friday morning Bercham
  (3, 4, 1, 0, 'active'), (3, 4, 2, 0, 'active'), (3, 4, 3, 0, 'active'), (3, 4, 4, 0, 'active'), (3, 4, 5, 0, 'active'), -- Van 3 Monday-Friday afternoon Bercham
  
  (4, 5, 1, 1, 'active'), (4, 5, 2, 1, 'active'), (4, 5, 3, 1, 'active'), (4, 5, 4, 1, 'active'), (4, 5, 5, 1, 'active'), -- Van 4 Monday-Friday morning Greentown
  (4, 5, 1, 0, 'active'), (4, 5, 2, 0, 'active'), (4, 5, 3, 0, 'active'), (4, 5, 4, 0, 'active'), (4, 5, 5, 0, 'active'); -- Van 4 Monday-Friday afternoon Greentown

-- Insert some sample bookings (next week)
INSERT OR IGNORE INTO bookings (student_id, van_route_id, route_stop_id, booking_date, status, booked_by) VALUES 
  -- Botani student bookings
  (7, 1, 1, '2025-10-07', 'confirmed', 13),   -- Sarah booked by parent for Monday morning
  (7, 11, 1, '2025-10-07', 'confirmed', 13),  -- Sarah afternoon return
  (8, 21, 4, '2025-10-08', 'confirmed', 14), -- Daniel Tuesday morning  
  (8, 31, 4, '2025-10-08', 'confirmed', 14), -- Daniel Tuesday afternoon
  (9, 1, 2, '2025-10-09', 'confirmed', 15),  -- Aisha Wednesday morning
  (9, 11, 2, '2025-10-09', 'confirmed', 15), -- Aisha Wednesday afternoon
  
  -- Imperial student bookings  
  (10, 41, 10, '2025-10-07', 'confirmed', 16), -- Kevin Monday morning
  (10, 51, 10, '2025-10-07', 'confirmed', 16), -- Kevin Monday afternoon
  (11, 61, 13, '2025-10-08', 'confirmed', 17), -- Priya Tuesday morning
  (11, 71, 13, '2025-10-08', 'confirmed', 17), -- Priya Tuesday afternoon
  (12, 41, 11, '2025-10-09', 'confirmed', 18), -- Marcus Wednesday morning
  (12, 51, 11, '2025-10-09', 'confirmed', 18); -- Marcus Wednesday afternoon

-- Insert sample emergency contacts
INSERT OR IGNORE INTO emergency_contacts (user_id, name, phone, relationship) VALUES 
  (7, 'Robert Lim', '+60123456801', 'Father'),
  (7, 'Susan Lim', '+60123456807', 'Mother'),
  (8, 'Alice Wong', '+60123456802', 'Mother'),
  (9, 'Hassan Rahman', '+60123456803', 'Father'),
  (10, 'Linda Tan', '+60123456804', 'Mother'),
  (11, 'Suresh Devi', '+60123456805', 'Father'),
  (12, 'Jennifer Lee', '+60123456806', 'Mother');