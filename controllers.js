const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, generateAIResponse, isAIAvailable } = require('./config');
const { generateTokens } = require('./middleware');

// ==================== AUTH CONTROLLER ====================
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, gender, dateOfBirth, phone, bloodGroup, address, emergencyContact } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [userResult] = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, 'patient']
    );

    await pool.query(
      'INSERT INTO patients (user_id, first_name, last_name, gender, date_of_birth, phone, email, blood_group, address, emergency_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userResult.insertId, firstName, lastName, gender, dateOfBirth, phone, email, bloodGroup || null, address || null, emergencyContact || null]
    );

    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userResult.insertId, 'Welcome to Ateek Aryan Hospital!', 'Your account has been created successfully. You can now book appointments and access all patient features.', 'general']
    );

    const tokens = generateTokens({ id: userResult.insertId, email, role: 'patient' });

    res.status(201).json({
      message: 'Registration successful!',
      user: { id: userResult.insertId, email, role: 'patient', firstName, lastName },
      ...tokens
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

    let profile = {};
    if (user.role === 'patient') {
      const [patients] = await pool.query('SELECT * FROM patients WHERE user_id = ?', [user.id]);
      if (patients.length > 0) profile = patients[0];
    } else if (user.role === 'doctor') {
      const [doctors] = await pool.query('SELECT d.*, dep.department_name FROM doctors d LEFT JOIN departments dep ON d.department_id = dep.department_id WHERE d.user_id = ?', [user.id]);
      if (doctors.length > 0) profile = doctors[0];
    }

    res.json({
      message: 'Login successful!',
      user: { id: user.id, email: user.email, role: user.role, profile },
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];
    let profile = {};

    if (user.role === 'patient') {
      const [patients] = await pool.query('SELECT * FROM patients WHERE user_id = ?', [user.id]);
      if (patients.length > 0) profile = patients[0];
    } else if (user.role === 'doctor') {
      const [doctors] = await pool.query('SELECT d.*, dep.department_name FROM doctors d LEFT JOIN departments dep ON d.department_id = dep.department_id WHERE d.user_id = ?', [user.id]);
      if (doctors.length > 0) profile = doctors[0];
    }

    res.json({ user: { ...user, profile } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user data.' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const [users] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [decoded.id]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const tokens = generateTokens(users[0]);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};

// ==================== PATIENT CONTROLLER ====================
const getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ? OR p.phone LIKE ?';
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm, searchTerm];
    }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM patients p ${whereClause}`, params);
    const total = countResult[0].total;

    const [patients] = await pool.query(
      `SELECT p.*, u.is_active, u.last_login FROM patients p JOIN users u ON p.user_id = u.id ${whereClause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      patients,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Failed to fetch patients.' });
  }
};

const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const [patients] = await pool.query(
      'SELECT p.*, u.email as user_email, u.is_active, u.last_login FROM patients p JOIN users u ON p.user_id = u.id WHERE p.patient_id = ?',
      [id]
    );

    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    res.json({ patient: patients[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patient.' });
  }
};

const getPatientHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const [records] = await pool.query(
      `SELECT mr.*, d.name as doctor_name, d.specialization 
       FROM medical_records mr 
       JOIN doctors d ON mr.doctor_id = d.doctor_id 
       WHERE mr.patient_id = ? 
       ORDER BY mr.created_at DESC`,
      [id]
    );

    const [appointments] = await pool.query(
      `SELECT a.*, d.name as doctor_name, d.specialization, dep.department_name 
       FROM appointments a 
       JOIN doctors d ON a.doctor_id = d.doctor_id 
       LEFT JOIN departments dep ON d.department_id = dep.department_id 
       WHERE a.patient_id = ? 
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [id]
    );

    const [bills] = await pool.query(
      'SELECT * FROM bills WHERE patient_id = ? ORDER BY created_at DESC',
      [id]
    );

    res.json({ records, appointments, bills });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch patient history.' });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, gender, dateOfBirth, phone, address, bloodGroup, emergencyContact } = req.body;

    await pool.query(
      `UPDATE patients SET first_name = ?, last_name = ?, gender = ?, date_of_birth = ?, phone = ?, address = ?, blood_group = ?, emergency_contact = ? WHERE patient_id = ?`,
      [firstName, lastName, gender, dateOfBirth, phone, address, bloodGroup, emergencyContact, id]
    );

    res.json({ message: 'Patient updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update patient.' });
  }
};

const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const [patient] = await pool.query('SELECT user_id FROM patients WHERE patient_id = ?', [id]);
    if (patient.length === 0) return res.status(404).json({ message: 'Patient not found.' });

    await pool.query('DELETE FROM users WHERE id = ?', [patient[0].user_id]);
    res.json({ message: 'Patient deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete patient.' });
  }
};

// ==================== DOCTOR CONTROLLER ====================
const getAllDoctors = async (req, res) => {
  try {
    const { department, search } = req.query;
    let query = `SELECT d.*, dep.department_name FROM doctors d LEFT JOIN departments dep ON d.department_id = dep.department_id WHERE 1=1`;
    let params = [];

    if (department) {
      query += ' AND d.department_id = ?';
      params.push(department);
    }
    if (search) {
      query += ' AND (d.name LIKE ? OR d.specialization LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY d.rating DESC';
    const [doctors] = await pool.query(query, params);
    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors.' });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const [doctors] = await pool.query(
      `SELECT d.*, dep.department_name FROM doctors d LEFT JOIN departments dep ON d.department_id = dep.department_id WHERE d.doctor_id = ?`,
      [req.params.id]
    );
    if (doctors.length === 0) return res.status(404).json({ message: 'Doctor not found.' });
    res.json({ doctor: doctors[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctor.' });
  }
};

const createDoctor = async (req, res) => {
  try {
    const { name, email, password, departmentId, specialization, qualification, experience, phone, bio, consultationFee } = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'doctor123', salt);

    const [userResult] = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, passwordHash, 'doctor']
    );

    const [doctorResult] = await pool.query(
      `INSERT INTO doctors (user_id, name, department_id, specialization, qualification, experience, phone, email, bio, consultation_fee) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userResult.insertId, name, departmentId, specialization, qualification, experience || 0, phone, email, bio, consultationFee || 500]
    );

    res.status(201).json({ message: 'Doctor added successfully.', doctorId: doctorResult.insertId });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ message: 'Failed to create doctor.' });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { name, departmentId, specialization, qualification, experience, phone, bio, consultationFee, availableDays, availableFrom, availableTo } = req.body;

    await pool.query(
      `UPDATE doctors SET name=?, department_id=?, specialization=?, qualification=?, experience=?, phone=?, bio=?, consultation_fee=?, available_days=?, available_from=?, available_to=? WHERE doctor_id=?`,
      [name, departmentId, specialization, qualification, experience, phone, bio, consultationFee, availableDays, availableFrom, availableTo, req.params.id]
    );

    res.json({ message: 'Doctor updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update doctor.' });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const [doctor] = await pool.query('SELECT user_id FROM doctors WHERE doctor_id = ?', [req.params.id]);
    if (doctor.length === 0) return res.status(404).json({ message: 'Doctor not found.' });

    await pool.query('DELETE FROM users WHERE id = ?', [doctor[0].user_id]);
    res.json({ message: 'Doctor deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete doctor.' });
  }
};

const getDoctorSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const [doctors] = await pool.query('SELECT available_from, available_to FROM doctors WHERE doctor_id = ?', [id]);
    if (doctors.length === 0) return res.status(404).json({ message: 'Doctor not found.' });

    const doctor = doctors[0];
    const [bookedSlots] = await pool.query(
      `SELECT appointment_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_status NOT IN ('cancelled')`,
      [id, date || new Date().toISOString().split('T')[0]]
    );

    const bookedTimes = bookedSlots.map(s => s.appointment_time);
    const slots = [];
    let current = new Date(`2000-01-01T${doctor.available_from}`);
    const end = new Date(`2000-01-01T${doctor.available_to}`);

    while (current < end) {
      const timeStr = current.toTimeString().slice(0, 8);
      slots.push({
        time: timeStr,
        display: current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        available: !bookedTimes.includes(timeStr)
      });
      current.setMinutes(current.getMinutes() + 30);
    }

    res.json({ slots });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch slots.' });
  }
};

// ==================== APPOINTMENT CONTROLLER ====================
const getAllAppointments = async (req, res) => {
  try {
    const { status, date, doctorId, patientId, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = `
      SELECT a.*, 
        p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone,
        d.name as doctor_name, d.specialization, dep.department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN departments dep ON d.department_id = dep.department_id
      WHERE 1=1`;
    let params = [];

    if (req.user.role === 'patient') {
      const [pat] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.id]);
      if (pat.length > 0) {
        query += ' AND a.patient_id = ?';
        params.push(pat[0].patient_id);
      }
    } else if (req.user.role === 'doctor') {
      const [doc] = await pool.query('SELECT doctor_id FROM doctors WHERE user_id = ?', [req.user.id]);
      if (doc.length > 0) {
        query += ' AND a.doctor_id = ?';
        params.push(doc[0].doctor_id);
      }
    }

    if (status) { query += ' AND a.appointment_status = ?'; params.push(status); }
    if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }
    if (doctorId) { query += ' AND a.doctor_id = ?'; params.push(doctorId); }
    if (patientId) { query += ' AND a.patient_id = ?'; params.push(patientId); }

    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [appointments] = await pool.query(query, params);

    res.json({
      appointments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments.' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, appointmentTime, reason } = req.body;

    const [existing] = await pool.query(
      `SELECT appointment_id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND appointment_status NOT IN ('cancelled')`,
      [doctorId, appointmentDate, appointmentTime]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'This time slot is already booked. Please choose another.' });
    }

    let actualPatientId = patientId;
    if (!actualPatientId && req.user.role === 'patient') {
      const [pat] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.id]);
      if (pat.length > 0) actualPatientId = pat[0].patient_id;
    }

    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason) VALUES (?, ?, ?, ?, ?)',
      [actualPatientId, doctorId, appointmentDate, appointmentTime, reason]
    );

    const [patient] = await pool.query('SELECT user_id, first_name FROM patients WHERE patient_id = ?', [actualPatientId]);
    const [doctor] = await pool.query('SELECT name FROM doctors WHERE doctor_id = ?', [doctorId]);

    if (patient.length > 0) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [patient[0].user_id, 'Appointment Booked!', `Your appointment with ${doctor[0]?.name || 'Doctor'} on ${appointmentDate} at ${appointmentTime} has been booked.`, 'appointment']
      );
    }

    res.status(201).json({ message: 'Appointment booked successfully!', appointmentId: result.insertId });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Failed to book appointment.' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query('UPDATE appointments SET appointment_status = ? WHERE appointment_id = ?', [status, id]);

    const [appt] = await pool.query(
      'SELECT a.*, p.user_id FROM appointments a JOIN patients p ON a.patient_id = p.patient_id WHERE a.appointment_id = ?',
      [id]
    );

    if (appt.length > 0) {
      const statusMessages = {
        confirmed: 'Your appointment has been confirmed.',
        completed: 'Your appointment has been completed.',
        cancelled: 'Your appointment has been cancelled.'
      };

      if (statusMessages[status]) {
        await pool.query(
          'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [appt[0].user_id, `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`, statusMessages[status], 'appointment']
        );
      }
    }

    res.json({ message: `Appointment ${status} successfully.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update appointment.' });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentDate, appointmentTime } = req.body;

    const [appt] = await pool.query('SELECT doctor_id FROM appointments WHERE appointment_id = ?', [id]);
    if (appt.length === 0) return res.status(404).json({ message: 'Appointment not found.' });

    const [existing] = await pool.query(
      `SELECT appointment_id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND appointment_status NOT IN ('cancelled') AND appointment_id != ?`,
      [appt[0].doctor_id, appointmentDate, appointmentTime, id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'This slot is already booked.' });
    }

    await pool.query(
      'UPDATE appointments SET appointment_date = ?, appointment_time = ?, appointment_status = ? WHERE appointment_id = ?',
      [appointmentDate, appointmentTime, 'booked', id]
    );

    res.json({ message: 'Appointment rescheduled successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reschedule appointment.' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    await pool.query(`UPDATE appointments SET appointment_status = 'cancelled' WHERE appointment_id = ?`, [req.params.id]);
    res.json({ message: 'Appointment cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel appointment.' });
  }
};

// ==================== DEPARTMENT CONTROLLER ====================
const getDepartments = async (req, res) => {
  try {
    const [departments] = await pool.query(
      `SELECT d.*, COUNT(doc.doctor_id) as doctor_count 
       FROM departments d 
       LEFT JOIN doctors doc ON d.department_id = doc.department_id AND doc.is_active = 1
       WHERE d.is_active = 1
       GROUP BY d.department_id 
       ORDER BY d.department_name`
    );
    res.json({ departments });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch departments.' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { departmentName, description, floorNumber } = req.body;
    const [result] = await pool.query(
      'INSERT INTO departments (department_name, description, floor_number) VALUES (?, ?, ?)',
      [departmentName, description, floorNumber]
    );
    res.status(201).json({ message: 'Department created successfully.', departmentId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create department.' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { departmentName, description, floorNumber } = req.body;
    await pool.query(
      'UPDATE departments SET department_name = ?, description = ?, floor_number = ? WHERE department_id = ?',
      [departmentName, description, floorNumber, req.params.id]
    );
    res.json({ message: 'Department updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update department.' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await pool.query('UPDATE departments SET is_active = 0 WHERE department_id = ?', [req.params.id]);
    res.json({ message: 'Department deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete department.' });
  }
};

// ==================== RECORD CONTROLLER ====================
const getRecords = async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = `
      SELECT mr.*, d.name as doctor_name, d.specialization,
        p.first_name as patient_first_name, p.last_name as patient_last_name
      FROM medical_records mr
      JOIN doctors d ON mr.doctor_id = d.doctor_id
      JOIN patients p ON mr.patient_id = p.patient_id
      WHERE 1=1`;
    let params = [];

    if (req.user.role === 'patient') {
      const [pat] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.id]);
      if (pat.length > 0) { query += ' AND mr.patient_id = ?'; params.push(pat[0].patient_id); }
    } else if (req.user.role === 'doctor') {
      const [doc] = await pool.query('SELECT doctor_id FROM doctors WHERE user_id = ?', [req.user.id]);
      if (doc.length > 0) { query += ' AND mr.doctor_id = ?'; params.push(doc[0].doctor_id); }
    }

    if (patientId) { query += ' AND mr.patient_id = ?'; params.push(patientId); }

    query += ' ORDER BY mr.created_at DESC';
    const [records] = await pool.query(query, params);
    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch records.' });
  }
};

const createRecord = async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, prescription, doctorNotes } = req.body;

    const [doc] = await pool.query('SELECT doctor_id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doc.length === 0) return res.status(403).json({ message: 'Only doctors can create records.' });

    const [result] = await pool.query(
      'INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, doctor_notes) VALUES (?, ?, ?, ?, ?, ?)',
      [patientId, doc[0].doctor_id, appointmentId || null, diagnosis, prescription, doctorNotes]
    );

    if (appointmentId) {
      await pool.query(`UPDATE appointments SET appointment_status = 'completed' WHERE appointment_id = ?`, [appointmentId]);
    }

    res.status(201).json({ message: 'Medical record created.', recordId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create record.' });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { diagnosis, prescription, doctorNotes } = req.body;
    await pool.query(
      'UPDATE medical_records SET diagnosis = ?, prescription = ?, doctor_notes = ? WHERE record_id = ?',
      [diagnosis, prescription, doctorNotes, req.params.id]
    );
    res.json({ message: 'Record updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update record.' });
  }
};

// ==================== BILL CONTROLLER ====================
const getBills = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = `
      SELECT b.*, p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone
      FROM bills b
      JOIN patients p ON b.patient_id = p.patient_id WHERE 1=1`;
    let params = [];

    if (req.user.role === 'patient') {
      const [pat] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.id]);
      if (pat.length > 0) { query += ' AND b.patient_id = ?'; params.push(pat[0].patient_id); }
    }

    if (status) { query += ' AND b.payment_status = ?'; params.push(status); }

    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);

    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    const [bills] = await pool.query(query, params);

    res.json({ bills, pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bills.' });
  }
};

const createBill = async (req, res) => {
  try {
    const { patientId, appointmentId, amount, tax, discount, description, paymentMethod } = req.body;
    const totalAmount = parseFloat(amount) + parseFloat(tax || 0) - parseFloat(discount || 0);

    const [result] = await pool.query(
      'INSERT INTO bills (patient_id, appointment_id, amount, tax, discount, total_amount, description, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [patientId, appointmentId || null, amount, tax || 0, discount || 0, totalAmount, description, paymentMethod || 'cash']
    );

    res.status(201).json({ message: 'Bill created.', billId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create bill.' });
  }
};

const payBill = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    await pool.query(
      'UPDATE bills SET payment_status = ?, payment_method = ?, payment_date = NOW() WHERE bill_id = ?',
      ['paid', paymentMethod || 'cash', req.params.id]
    );
    res.json({ message: 'Payment recorded successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process payment.' });
  }
};

// ==================== DASHBOARD CONTROLLER ====================
const getAdminDashboard = async (req, res) => {
  try {
    const [totalPatients] = await pool.query('SELECT COUNT(*) as count FROM patients');
    const [totalDoctors] = await pool.query('SELECT COUNT(*) as count FROM doctors WHERE is_active = 1');
    const [todayAppointments] = await pool.query(`SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURDATE()`);
    const [totalRevenue] = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM bills WHERE payment_status = 'paid'`);
    const [pendingBills] = await pool.query(`SELECT COUNT(*) as count FROM bills WHERE payment_status = 'pending'`);
    const [totalStaff] = await pool.query('SELECT COUNT(*) as count FROM staff WHERE is_active = 1');

    const [monthlyRevenue] = await pool.query(`
      SELECT DATE_FORMAT(payment_date, '%Y-%m') as month, SUM(total_amount) as revenue
      FROM bills WHERE payment_status = 'paid' AND payment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m') ORDER BY month
    `);

    const [weeklyAppointments] = await pool.query(`
      SELECT appointment_date as date, COUNT(*) as count, appointment_status as status
      FROM appointments WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY appointment_date, appointment_status ORDER BY appointment_date
    `);

    const [departmentStats] = await pool.query(`
      SELECT dep.department_name, COUNT(DISTINCT a.patient_id) as patient_count
      FROM departments dep
      LEFT JOIN doctors d ON dep.department_id = d.department_id
      LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
      GROUP BY dep.department_id ORDER BY patient_count DESC LIMIT 10
    `);

    const [recentAppointments] = await pool.query(`
      SELECT a.*, p.first_name, p.last_name, d.name as doctor_name, dep.department_name
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.patient_id 
      JOIN doctors d ON a.doctor_id = d.doctor_id
      LEFT JOIN departments dep ON d.department_id = dep.department_id
      ORDER BY a.created_at DESC LIMIT 5
    `);

    res.json({
      stats: {
        totalPatients: totalPatients[0].count,
        totalDoctors: totalDoctors[0].count,
        todayAppointments: todayAppointments[0].count,
        totalRevenue: totalRevenue[0].total,
        pendingBills: pendingBills[0].count,
        totalStaff: totalStaff[0].count
      },
      monthlyRevenue,
      weeklyAppointments,
      departmentStats,
      recentAppointments
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard.' });
  }
};

const getDoctorDashboard = async (req, res) => {
  try {
    const [doc] = await pool.query('SELECT doctor_id FROM doctors WHERE user_id = ?', [req.user.id]);
    if (doc.length === 0) return res.status(404).json({ message: 'Doctor profile not found.' });
    const doctorId = doc[0].doctor_id;

    const [todayAppts] = await pool.query(
      `SELECT a.*, p.first_name, p.last_name, p.phone, p.blood_group 
       FROM appointments a JOIN patients p ON a.patient_id = p.patient_id 
       WHERE a.doctor_id = ? AND a.appointment_date = CURDATE() 
       ORDER BY a.appointment_time`, [doctorId]
    );

    const [upcomingAppts] = await pool.query(
      `SELECT a.*, p.first_name, p.last_name 
       FROM appointments a JOIN patients p ON a.patient_id = p.patient_id 
       WHERE a.doctor_id = ? AND a.appointment_date > CURDATE() AND a.appointment_status NOT IN ('cancelled','completed') 
       ORDER BY a.appointment_date, a.appointment_time LIMIT 10`, [doctorId]
    );

    const [completedToday] = await pool.query(
      `SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE() AND appointment_status = 'completed'`, [doctorId]
    );

    const [pendingReports] = await pool.query(
      `SELECT COUNT(*) as count FROM appointments a 
       LEFT JOIN medical_records mr ON a.appointment_id = mr.appointment_id
       WHERE a.doctor_id = ? AND a.appointment_status = 'completed' AND mr.record_id IS NULL`, [doctorId]
    );

    const [totalPatients] = await pool.query(
      'SELECT COUNT(DISTINCT patient_id) as count FROM appointments WHERE doctor_id = ?', [doctorId]
    );

    res.json({
      todayAppointments: todayAppts,
      upcomingAppointments: upcomingAppts,
      stats: {
        todayTotal: todayAppts.length,
        completedToday: completedToday[0].count,
        pendingReports: pendingReports[0].count,
        totalPatients: totalPatients[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load dashboard.' });
  }
};

const getPatientDashboard = async (req, res) => {
  try {
    const [pat] = await pool.query('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.id]);
    if (pat.length === 0) return res.status(404).json({ message: 'Patient profile not found.' });
    const patientId = pat[0].patient_id;

    const [nextAppt] = await pool.query(
      `SELECT a.*, d.name as doctor_name, d.specialization, dep.department_name
       FROM appointments a JOIN doctors d ON a.doctor_id = d.doctor_id
       LEFT JOIN departments dep ON d.department_id = dep.department_id
       WHERE a.patient_id = ? AND a.appointment_date >= CURDATE() AND a.appointment_status NOT IN ('cancelled','completed')
       ORDER BY a.appointment_date, a.appointment_time LIMIT 1`, [patientId]
    );

    const [recentRecords] = await pool.query(
      `SELECT mr.*, d.name as doctor_name FROM medical_records mr 
       JOIN doctors d ON mr.doctor_id = d.doctor_id
       WHERE mr.patient_id = ? ORDER BY mr.created_at DESC LIMIT 5`, [patientId]
    );

    const [pendingBills] = await pool.query(
      `SELECT * FROM bills WHERE patient_id = ? AND payment_status = 'pending' ORDER BY created_at DESC`, [patientId]
    );

    const [totalVisits] = await pool.query(
      `SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND appointment_status = 'completed'`, [patientId]
    );

    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [req.user.id]
    );

    res.json({
      nextAppointment: nextAppt[0] || null,
      recentRecords,
      pendingBills,
      stats: { totalVisits: totalVisits[0].count, pendingBillsCount: pendingBills.length },
      notifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load dashboard.' });
  }
};

// ==================== NOTIFICATION & STAFF CONTROLLER ====================
const getNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    const [unreadCount] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ notifications, unreadCount: unreadCount[0].count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notification.' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notifications.' });
  }
};

const getStaff = async (req, res) => {
  try {
    const [staff] = await pool.query('SELECT * FROM staff WHERE is_active = 1 ORDER BY name');
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staff.' });
  }
};

const createStaff = async (req, res) => {
  try {
    const { name, role, department, phone, email, salary, joiningDate } = req.body;
    const [result] = await pool.query(
      'INSERT INTO staff (name, role, department, phone, email, salary, joining_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, role, department, phone, email, salary, joiningDate]
    );
    res.status(201).json({ message: 'Staff added.', staffId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add staff.' });
  }
};

const deleteStaff = async (req, res) => {
  try {
    await pool.query('UPDATE staff SET is_active = 0 WHERE staff_id = ?', [req.params.id]);
    res.json({ message: 'Staff removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove staff.' });
  }
};

// ==================== AI CONTROLLER ====================
const HOSPITAL_SYSTEM_PROMPT = `You are the AI assistant for Ateek Aryan Hospital, a modern healthcare facility. You help patients and staff with:
- Hospital information (timings: 24/7 Emergency, OPD: 9 AM - 5 PM Mon-Sat)
- Department information
- Doctor availability
- Appointment guidance
- General healthcare FAQs
- Billing inquiries

You are friendly, professional, and concise. You do NOT provide medical diagnoses or treatment recommendations.
You always recommend consulting a qualified doctor for medical concerns.
Format responses with clear paragraphs. Use bullet points for lists.`;

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!isAIAvailable()) {
      const fallbackResponses = {
        'timing': 'Ateek Aryan Hospital operates 24/7 for emergencies. OPD timings are 9:00 AM to 5:00 PM, Monday to Saturday.',
        'department': 'We have 15 departments including General Medicine, Cardiology, Orthopedics, Pediatrics, Dermatology, Neurology, and more.',
        'doctor': 'We have highly qualified doctors across all departments. You can view doctor profiles and book appointments through the dashboard.',
        'appointment': 'To book an appointment, go to the Appointments section, select a department and doctor, choose a date and time, and confirm.',
        'emergency': 'For emergencies, call our 24/7 helpline: +91-1800-123-4567. Our emergency department is always open.',
        'bill': 'You can view and pay your bills from the Billing section. We accept cash, card, UPI, and insurance payments.',
      };

      const lowerMsg = message.toLowerCase();
      let fallbackReply = 'I can help you with hospital timings, departments, doctors, appointments, billing, and more. What would you like to know?';

      for (const [key, response] of Object.entries(fallbackResponses)) {
        if (lowerMsg.includes(key)) {
          fallbackReply = response;
          break;
        }
      }

      return res.json({ reply: fallbackReply, aiPowered: false });
    }

    let context = '';
    try {
      const [departments] = await pool.query('SELECT department_name FROM departments WHERE is_active = 1');
      const [doctors] = await pool.query('SELECT d.name, d.specialization, dep.department_name FROM doctors d LEFT JOIN departments dep ON d.department_id = dep.department_id WHERE d.is_active = 1');
      context = `\nAvailable Departments: ${departments.map(d => d.department_name).join(', ')}\nDoctors: ${doctors.map(d => `${d.name} (${d.specialization}, ${d.department_name})`).join('; ')}`;
    } catch (e) { /* continue without context */ }

    const result = await generateAIResponse(message, HOSPITAL_SYSTEM_PROMPT + context);

    res.json({
      reply: result.success ? result.text : result.message,
      aiPowered: result.success
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Chat service unavailable.' });
  }
};

const scheduleAppointment = async (req, res) => {
  try {
    const { message } = req.body;

    const [departments] = await pool.query('SELECT department_id, department_name FROM departments WHERE is_active = 1');
    const [doctors] = await pool.query(
      `SELECT d.doctor_id, d.name, d.specialization, d.consultation_fee, d.available_days, dep.department_name, dep.department_id
       FROM doctors d LEFT JOIN departments dep ON d.department_id = dep.department_id WHERE d.is_active = 1`
    );

    if (!isAIAvailable()) {
      const lowerMsg = message.toLowerCase();
      let suggestedDept = null;

      const keywords = {
        'fever': 'General Medicine', 'cold': 'General Medicine', 'cough': 'General Medicine', 'flu': 'General Medicine',
        'headache': 'General Medicine', 'stomach': 'Gastroenterology', 'heart': 'Cardiology', 'chest': 'Cardiology',
        'bone': 'Orthopedics', 'joint': 'Orthopedics', 'fracture': 'Orthopedics',
        'skin': 'Dermatology', 'rash': 'Dermatology', 'acne': 'Dermatology',
        'child': 'Pediatrics', 'baby': 'Pediatrics', 'kid': 'Pediatrics',
        'brain': 'Neurology', 'nerve': 'Neurology', 'eye': 'Ophthalmology',
        'ear': 'ENT', 'nose': 'ENT', 'throat': 'ENT',
        'mental': 'Psychiatry', 'anxiety': 'Psychiatry', 'depression': 'Psychiatry',
        'breathing': 'Pulmonology', 'lung': 'Pulmonology', 'asthma': 'Pulmonology',
        'cancer': 'Oncology', 'women': 'Gynecology', 'pregnancy': 'Gynecology',
      };

      for (const [key, dept] of Object.entries(keywords)) {
        if (lowerMsg.includes(key)) { suggestedDept = dept; break; }
      }

      const dept = departments.find(d => d.department_name === suggestedDept) || departments[0];
      const deptDoctors = doctors.filter(d => d.department_id === dept.department_id);

      return res.json({
        suggestion: {
          department: dept,
          doctors: deptDoctors,
          message: `Based on your description, I recommend the **${dept.department_name}** department. ${deptDoctors.length > 0 ? `Available doctors: ${deptDoctors.map(d => d.name).join(', ')}.` : 'Please check doctor availability.'}`
        },
        aiPowered: false
      });
    }

    const aiPrompt = `Based on the patient's request: "${message}"
    
Available departments: ${departments.map(d => `${d.department_id}:${d.department_name}`).join(', ')}
Available doctors: ${doctors.map(d => `${d.doctor_id}:${d.name}(${d.specialization},${d.department_name},Fee:₹${d.consultation_fee})`).join('; ')}

Respond in JSON format ONLY (no markdown, no code blocks):
{"department_id": <number>, "department_name": "<string>", "doctor_id": <number>, "doctor_name": "<string>", "reason": "<brief explanation>", "urgency": "low|medium|high"}`;

    const result = await generateAIResponse(aiPrompt, 'You are a hospital appointment scheduling assistant. Respond only in valid JSON format.');

    let suggestion;
    try {
      const cleanText = result.text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      const dept = departments.find(d => d.department_id === parsed.department_id) || departments[0];
      const deptDoctors = doctors.filter(d => d.department_id === dept.department_id);

      suggestion = {
        department: dept,
        doctors: deptDoctors,
        recommendedDoctor: parsed.doctor_id,
        message: parsed.reason,
        urgency: parsed.urgency
      };
    } catch {
      const dept = departments[0];
      suggestion = {
        department: dept,
        doctors: doctors.filter(d => d.department_id === dept.department_id),
        message: result.text
      };
    }

    res.json({ suggestion, aiPowered: true });
  } catch (error) {
    console.error('AI schedule error:', error);
    res.status(500).json({ message: 'AI scheduling unavailable.' });
  }
};

const summarizeRecord = async (req, res) => {
  try {
    const { doctorNotes, diagnosis, prescription } = req.body;

    if (!isAIAvailable()) {
      return res.json({
        summary: `**Diagnosis:** ${diagnosis || 'N/A'}\n\n**Prescription:** ${prescription || 'N/A'}\n\n**Notes:** ${doctorNotes || 'N/A'}`,
        aiPowered: false
      });
    }

    const prompt = `Summarize these medical notes concisely. Highlight: Diagnosis, Prescribed Medicines, Recommended Tests, Follow-up Instructions.

Doctor's Notes: ${doctorNotes || 'None'}
Diagnosis: ${diagnosis || 'None'}
Prescription: ${prescription || 'None'}`;

    const result = await generateAIResponse(prompt, 'You are a medical records summarizer. Create clear, structured summaries. Do NOT add diagnoses or medical advice not present in the notes.');

    res.json({
      summary: result.success ? result.text : `**Diagnosis:** ${diagnosis}\n**Prescription:** ${prescription}`,
      aiPowered: result.success
    });
  } catch (error) {
    res.status(500).json({ message: 'Summarization failed.' });
  }
};

const smartSearch = async (req, res) => {
  try {
    const { query } = req.body;

    const lowerQuery = query.toLowerCase();
    let results = null;

    if (lowerQuery.includes('today') && lowerQuery.includes('appointment')) {
      const [rows] = await pool.query(
        `SELECT a.*, p.first_name, p.last_name, d.name as doctor_name FROM appointments a 
         JOIN patients p ON a.patient_id = p.patient_id JOIN doctors d ON a.doctor_id = d.doctor_id
         WHERE a.appointment_date = CURDATE() ORDER BY a.appointment_time`
      );
      results = { type: 'appointments', data: rows, description: "Today's appointments" };
    } else if (lowerQuery.includes('pending') && lowerQuery.includes('bill')) {
      const [rows] = await pool.query(
        `SELECT b.*, p.first_name, p.last_name FROM bills b JOIN patients p ON b.patient_id = p.patient_id WHERE b.payment_status = 'pending'`
      );
      results = { type: 'bills', data: rows, description: 'Pending bills' };
    } else if (lowerQuery.includes('doctor')) {
      const [rows] = await pool.query(
        'SELECT d.*, dep.department_name FROM doctors d LEFT JOIN departments dep ON d.department_id = dep.department_id WHERE d.is_active = 1'
      );
      results = { type: 'doctors', data: rows, description: 'All active doctors' };
    } else {
      const [patients] = await pool.query(
        `SELECT * FROM patients WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?`,
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );
      results = { type: 'patients', data: patients, description: `Search results for "${query}"` };
    }

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Search failed.' });
  }
};

module.exports = {
  // Auth
  register, login, getMe, refreshToken,
  // Patient
  getAllPatients, getPatientById, getPatientHistory, updatePatient, deletePatient,
  // Doctor
  getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor, getDoctorSlots,
  // Appointment
  getAllAppointments, createAppointment, updateAppointmentStatus, rescheduleAppointment, deleteAppointment,
  // Department
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  // Record
  getRecords, createRecord, updateRecord,
  // Bill
  getBills, createBill, payBill,
  // Dashboard
  getAdminDashboard, getDoctorDashboard, getPatientDashboard,
  // Notification & Staff
  getNotifications, markAsRead, markAllAsRead, getStaff, createStaff, deleteStaff,
  // AI
  chat, scheduleAppointment, summarizeRecord, smartSearch
};
