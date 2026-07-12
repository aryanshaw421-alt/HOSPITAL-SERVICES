-- =====================================================
-- Ateek Aryan Hospital - Database Schema
-- =====================================================

CREATE DATABASE IF NOT EXISTS ateek_aryan_hospital;
USE ateek_aryan_hospital;

-- =====================================================
-- USERS TABLE (Unified Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'doctor', 'patient') NOT NULL DEFAULT 'patient',
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  floor_number INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PATIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  date_of_birth DATE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT,
  blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  emergency_contact VARCHAR(20),
  profile_photo VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- DOCTORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS doctors (
  doctor_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  department_id INT,
  specialization VARCHAR(200),
  qualification VARCHAR(300),
  experience INT DEFAULT 0,
  phone VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  bio TEXT,
  profile_photo VARCHAR(500),
  consultation_fee DECIMAL(10, 2) DEFAULT 500.00,
  available_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
  available_from TIME DEFAULT '09:00:00',
  available_to TIME DEFAULT '17:00:00',
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_status ENUM('booked', 'pending', 'confirmed', 'completed', 'cancelled', 'no-show') DEFAULT 'booked',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  INDEX idx_appointment_date (appointment_date),
  INDEX idx_appointment_status (appointment_status)
);

-- =====================================================
-- MEDICAL RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS medical_records (
  record_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_id INT,
  diagnosis TEXT,
  prescription TEXT,
  doctor_notes TEXT,
  ai_summary TEXT,
  attachments JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
);

-- =====================================================
-- MEDICINES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS medicines (
  medicine_id INT AUTO_INCREMENT PRIMARY KEY,
  medicine_name VARCHAR(200) NOT NULL,
  generic_name VARCHAR(200),
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- BILLS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bills (
  bill_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  appointment_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0.00,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status ENUM('pending', 'paid', 'partial', 'refunded') DEFAULT 'pending',
  payment_method ENUM('cash', 'card', 'upi', 'insurance', 'online') DEFAULT 'cash',
  payment_date DATETIME,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
);

-- =====================================================
-- STAFF TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS staff (
  staff_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  salary DECIMAL(10, 2),
  joining_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT,
  appointment_id INT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('appointment', 'billing', 'general', 'reminder', 'alert') DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_notifications (user_id, is_read)
);

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action)
);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Departments
INSERT INTO departments (department_name, description, floor_number) VALUES
('General Medicine', 'Primary healthcare and internal medicine', 1),
('Cardiology', 'Heart and cardiovascular system specialists', 2),
('Orthopedics', 'Bone, joint, and musculoskeletal care', 2),
('Pediatrics', 'Healthcare for infants, children, and adolescents', 1),
('Dermatology', 'Skin, hair, and nail conditions', 3),
('Neurology', 'Brain and nervous system disorders', 3),
('Gynecology', 'Women\'s reproductive health', 4),
('ENT', 'Ear, nose, and throat specialists', 3),
('Ophthalmology', 'Eye care and vision specialists', 4),
('Psychiatry', 'Mental health and behavioral disorders', 5),
('Gastroenterology', 'Digestive system disorders', 2),
('Pulmonology', 'Lung and respiratory system', 4),
('Oncology', 'Cancer diagnosis and treatment', 5),
('Emergency Medicine', 'Emergency and urgent care', 1),
('Radiology', 'Medical imaging and diagnostics', 1);

-- Admin User (password: admin123)
INSERT INTO users (email, password_hash, role) VALUES
('admin@ateekaryanhospital.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkrsM7AHEqh3/pfBIly.FmEtmaZyC', 'admin');

-- Demo Doctor Users
INSERT INTO users (email, password_hash, role) VALUES
('dr.sharma@ateekaryanhospital.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkrsM7AHEqh3/pfBIly.FmEtmaZyC', 'doctor'),
('dr.patel@ateekaryanhospital.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkrsM7AHEqh3/pfBIly.FmEtmaZyC', 'doctor'),
('dr.gupta@ateekaryanhospital.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkrsM7AHEqh3/pfBIly.FmEtmaZyC', 'doctor'),
('dr.khan@ateekaryanhospital.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkrsM7AHEqh3/pfBIly.FmEtmaZyC', 'doctor'),
('dr.singh@ateekaryanhospital.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkrsM7AHEqh3/pfBIly.FmEtmaZyC', 'doctor'),
('dr.reddy@ateekaryanhospital.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkrsM7AHEqh3/pfBIly.FmEtmaZyC', 'doctor');

-- Demo Doctors
INSERT INTO doctors (user_id, name, department_id, specialization, qualification, experience, phone, email, bio, consultation_fee, rating) VALUES
(2, 'Dr. Rajesh Sharma', 1, 'Internal Medicine', 'MBBS, MD (Internal Medicine)', 15, '+91-9876543210', 'dr.sharma@ateekaryanhospital.com', 'Senior physician with 15 years of experience in internal medicine and preventive healthcare.', 800.00, 4.8),
(3, 'Dr. Priya Patel', 2, 'Interventional Cardiology', 'MBBS, MD, DM (Cardiology)', 12, '+91-9876543211', 'dr.patel@ateekaryanhospital.com', 'Expert cardiologist specializing in interventional procedures and heart failure management.', 1200.00, 4.9),
(4, 'Dr. Amit Gupta', 3, 'Joint Replacement Surgery', 'MBBS, MS (Ortho), Fellowship', 10, '+91-9876543212', 'dr.gupta@ateekaryanhospital.com', 'Orthopedic surgeon with expertise in joint replacement and sports medicine.', 1000.00, 4.7),
(5, 'Dr. Fatima Khan', 4, 'Neonatology', 'MBBS, MD (Pediatrics), DM', 8, '+91-9876543213', 'dr.khan@ateekaryanhospital.com', 'Pediatrician specializing in newborn care and childhood developmental disorders.', 700.00, 4.6),
(6, 'Dr. Manpreet Singh', 6, 'Neurosurgery', 'MBBS, MS, MCh (Neurosurgery)', 18, '+91-9876543214', 'dr.singh@ateekaryanhospital.com', 'Leading neurosurgeon with extensive experience in brain and spine surgeries.', 1500.00, 4.9),
(7, 'Dr. Kavitha Reddy', 5, 'Cosmetic Dermatology', 'MBBS, MD (Dermatology)', 7, '+91-9876543215', 'dr.reddy@ateekaryanhospital.com', 'Dermatologist specializing in skin disorders and cosmetic procedures.', 900.00, 4.5);

-- Demo Patient User
INSERT INTO users (email, password_hash, role) VALUES
('patient@example.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkrsM7AHEqh3/pfBIly.FmEtmaZyC', 'patient');

INSERT INTO patients (user_id, first_name, last_name, gender, date_of_birth, phone, email, blood_group, address, emergency_contact) VALUES
(8, 'Rahul', 'Verma', 'Male', '1995-03-15', '+91-9988776655', 'patient@example.com', 'O+', '123 MG Road, Bangalore, Karnataka', '+91-9988776600');

-- Demo Medicines
INSERT INTO medicines (medicine_name, generic_name, dosage, frequency, price) VALUES
('Paracetamol 500mg', 'Acetaminophen', '500mg', 'Every 6 hours', 5.00),
('Amoxicillin 250mg', 'Amoxicillin', '250mg', 'Every 8 hours', 12.00),
('Omeprazole 20mg', 'Omeprazole', '20mg', 'Once daily', 8.00),
('Metformin 500mg', 'Metformin', '500mg', 'Twice daily', 6.00),
('Atorvastatin 10mg', 'Atorvastatin', '10mg', 'Once daily', 15.00),
('Amlodipine 5mg', 'Amlodipine', '5mg', 'Once daily', 10.00),
('Cetirizine 10mg', 'Cetirizine', '10mg', 'Once daily', 4.00),
('Azithromycin 500mg', 'Azithromycin', '500mg', 'Once daily for 3 days', 25.00);

-- Demo Staff
INSERT INTO staff (name, role, department, phone, email, salary, joining_date) VALUES
('Anita Desai', 'Head Nurse', 'General Medicine', '+91-9876500001', 'anita@hospital.com', 45000.00, '2020-01-15'),
('Rajiv Kumar', 'Lab Technician', 'Radiology', '+91-9876500002', 'rajiv@hospital.com', 35000.00, '2021-06-01'),
('Meera Nair', 'Receptionist', 'Front Desk', '+91-9876500003', 'meera@hospital.com', 28000.00, '2022-03-10'),
('Suresh Yadav', 'Pharmacist', 'Pharmacy', '+91-9876500004', 'suresh@hospital.com', 40000.00, '2019-08-20'),
('Pooja Joshi', 'Ward Manager', 'ICU', '+91-9876500005', 'pooja@hospital.com', 50000.00, '2018-11-05');

-- Demo Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, appointment_status, reason) VALUES
(1, 1, CURDATE(), '10:00:00', 'booked', 'Regular checkup and fever'),
(1, 2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', 'booked', 'Chest pain evaluation'),
(1, 1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '11:00:00', 'completed', 'Follow-up consultation');

-- Demo Medical Record
INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, doctor_notes) VALUES
(1, 1, 3, 'Viral Fever with mild throat infection', 'Paracetamol 500mg TDS for 3 days, Azithromycin 500mg OD for 3 days, warm saline gargles', 'Patient presented with fever (101°F), sore throat, and body aches for 2 days. On examination: mild pharyngeal congestion, no lymphadenopathy. Advised rest and adequate hydration. Follow-up in 1 week if symptoms persist.');

-- Demo Bills
INSERT INTO bills (patient_id, appointment_id, amount, tax, discount, total_amount, payment_status, payment_method, description) VALUES
(1, 3, 800.00, 144.00, 0.00, 944.00, 'paid', 'upi', 'Consultation fee - Dr. Rajesh Sharma'),
(1, 1, 800.00, 144.00, 0.00, 944.00, 'pending', 'cash', 'Consultation fee - Dr. Rajesh Sharma (Upcoming)');

-- Demo Notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
(8, 'Appointment Confirmed', 'Your appointment with Dr. Rajesh Sharma is confirmed for today at 10:00 AM.', 'appointment'),
(8, 'Bill Generated', 'A bill of ₹944.00 has been generated for your upcoming consultation.', 'billing'),
(1, 'Welcome!', 'Welcome to Ateek Aryan Hospital Management System.', 'general');
