// ==================== DATABASE CONFIGURATION ====================
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const today = new Date().toISOString().split('T')[0];
const now = new Date().toISOString();
const demoPasswordHash = bcrypt.hashSync('admin123', 10);

const mockState = {
  users: [
    {
      id: 1,
      email: 'admin@ateekaryanhospital.com',
      password_hash: demoPasswordHash,
      role: 'admin',
      is_active: true,
      last_login: null,
      created_at: now
    },
    {
      id: 2,
      email: 'dr.sharma@ateekaryanhospital.com',
      password_hash: demoPasswordHash,
      role: 'doctor',
      is_active: true,
      last_login: null,
      created_at: now
    },
    {
      id: 3,
      email: 'patient@example.com',
      password_hash: demoPasswordHash,
      role: 'patient',
      is_active: true,
      last_login: null,
      created_at: now
    }
  ],
  departments: [
    { department_id: 1, department_name: 'General Medicine', description: 'Primary healthcare and internal medicine', floor_number: 1, is_active: true, doctor_count: 1 },
    { department_id: 2, department_name: 'Cardiology', description: 'Heart and cardiovascular system specialists', floor_number: 2, is_active: true, doctor_count: 1 },
    { department_id: 3, department_name: 'Orthopedics', description: 'Bone, joint, and musculoskeletal care', floor_number: 2, is_active: true, doctor_count: 1 }
  ],
  patients: [
    {
      patient_id: 1,
      user_id: 3,
      first_name: 'Rahul',
      last_name: 'Verma',
      gender: 'Male',
      date_of_birth: '1995-03-15',
      phone: '+91-9988776655',
      email: 'patient@example.com',
      blood_group: 'O+',
      address: '123 MG Road, Bangalore, Karnataka',
      emergency_contact: '+91-9988776600',
      created_at: now
    }
  ],
  doctors: [
    {
      doctor_id: 1,
      user_id: 2,
      name: 'Dr. Rajesh Sharma',
      department_id: 1,
      specialization: 'Internal Medicine',
      qualification: 'MBBS, MD (Internal Medicine)',
      experience: 15,
      phone: '+91-9876543210',
      email: 'dr.sharma@ateekaryanhospital.com',
      bio: 'Senior physician with 15 years of experience in internal medicine and preventive healthcare.',
      consultation_fee: 800,
      available_days: 'Mon,Tue,Wed,Thu,Fri',
      available_from: '09:00:00',
      available_to: '17:00:00',
      is_active: true,
      rating: 4.8,
      created_at: now
    }
  ],
  appointments: [
    {
      appointment_id: 1,
      patient_id: 1,
      doctor_id: 1,
      appointment_date: today,
      appointment_time: '10:00:00',
      appointment_status: 'booked',
      reason: 'Regular checkup',
      created_at: now
    }
  ],
  medical_records: [
    {
      record_id: 1,
      patient_id: 1,
      doctor_id: 1,
      appointment_id: 1,
      diagnosis: 'Viral fever',
      prescription: 'Paracetamol 500mg',
      doctor_notes: 'Patient advised rest.',
      created_at: now
    }
  ],
  bills: [
    {
      bill_id: 1,
      patient_id: 1,
      appointment_id: 1,
      amount: 800,
      tax: 144,
      discount: 0,
      total_amount: 944,
      payment_status: 'pending',
      payment_method: 'cash',
      payment_date: null,
      description: 'Consultation fee',
      created_at: now
    }
  ],
  staff: [
    { staff_id: 1, name: 'Anita Desai', role: 'Head Nurse', department: 'General Medicine', phone: '+91-9876500001', email: 'anita@hospital.com', salary: 45000, joining_date: '2020-01-15', is_active: true, created_at: now },
    { staff_id: 2, name: 'Rajiv Kumar', role: 'Lab Technician', department: 'Radiology', phone: '+91-9876500002', email: 'rajiv@hospital.com', salary: 35000, joining_date: '2021-06-01', is_active: true, created_at: now }
  ],
  notifications: [
    { notification_id: 1, user_id: 3, title: 'Welcome!', message: 'Welcome to Ateek Aryan Hospital Management System.', type: 'general', is_read: false, created_at: now }
  ]
};

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function nextId(table) {
  const rows = mockState[table] || [];
  return rows.length ? Math.max(...rows.map(row => Number(row[Object.keys(row)[0]] || 0))) + 1 : 1;
}

function getTableName(sql) {
  const lower = sql.toLowerCase();
  if (lower.includes('from users')) return 'users';
  if (lower.includes('from patients')) return 'patients';
  if (lower.includes('from doctors')) return 'doctors';
  if (lower.includes('from appointments')) return 'appointments';
  if (lower.includes('from departments')) return 'departments';
  if (lower.includes('from medical_records')) return 'medical_records';
  if (lower.includes('from bills')) return 'bills';
  if (lower.includes('from notifications')) return 'notifications';
  if (lower.includes('from staff')) return 'staff';
  return null;
}

function makeRows(sql, params) {
  const lower = sql.toLowerCase();
  const table = getTableName(sql);
  let rows = cloneData(mockState[table] || []);

  if (table === 'users') {
    if (lower.includes('where email = ?') || lower.includes('where email=?')) {
      rows = rows.filter(row => row.email === params[0]);
    } else if (lower.includes('where id = ?') || lower.includes('where id=?')) {
      const id = Number(params[0]);
      rows = rows.filter(row => Number(row.id) === id);
    }
  }

  if (table === 'patients') {
    if (lower.includes('where patient_id = ?') || lower.includes('where patient_id=?')) {
      rows = rows.filter(row => Number(row.patient_id) === Number(params[0]));
    } else if (lower.includes('where user_id = ?') || lower.includes('where user_id=?')) {
      rows = rows.filter(row => Number(row.user_id) === Number(params[0]));
    } else if (lower.includes('where p.first_name') || lower.includes('where p.last_name')) {
      const search = String(params[0] || '').replace(/%/g, '').toLowerCase();
      rows = rows.filter(row => [row.first_name, row.last_name, row.email, row.phone].some(value => String(value).toLowerCase().includes(search)));
    }
  }

  if (table === 'doctors') {
    if (lower.includes('where d.doctor_id = ?') || lower.includes('where d.doctor_id=?') || lower.includes('where doctor_id = ?') || lower.includes('where doctor_id=?')) {
      rows = rows.filter(row => Number(row.doctor_id) === Number(params[0]));
    } else if (lower.includes('where d.department_id = ?') || lower.includes('where d.department_id=?') || lower.includes('where department_id = ?') || lower.includes('where department_id=?')) {
      rows = rows.filter(row => Number(row.department_id) === Number(params[0]));
    } else if (lower.includes('where d.name like') || lower.includes('where (d.name') || lower.includes('where d.name')) {
      const search = String(params[0] || '').replace(/%/g, '').toLowerCase();
      rows = rows.filter(row => [row.name, row.specialization].some(value => String(value).toLowerCase().includes(search)));
    }
  }

  if (table === 'appointments') {
    if (lower.includes('where a.appointment_id') || lower.includes('where appointment_id')) {
      rows = rows.filter(row => Number(row.appointment_id) === Number(params[0]));
    }
    if (lower.includes('where a.patient_id') || lower.includes('where patient_id')) {
      rows = rows.filter(row => Number(row.patient_id) === Number(params[0]));
    }
    if (lower.includes('where a.doctor_id') || lower.includes('where doctor_id')) {
      rows = rows.filter(row => Number(row.doctor_id) === Number(params[0]));
    }
    if (lower.includes('appointment_date = ?') || lower.includes('appointment_date=?')) {
      rows = rows.filter(row => row.appointment_date === params[0]);
    }
    if (lower.includes('appointment_status') && lower.includes('not in')) {
      rows = rows.filter(row => row.appointment_status !== 'cancelled');
    }
  }

  if (table === 'departments') {
    rows = rows.filter(row => row.is_active !== false);
  }

  if (table === 'medical_records') {
    if (lower.includes('where mr.patient_id') || lower.includes('where patient_id')) {
      rows = rows.filter(row => Number(row.patient_id) === Number(params[0]));
    }
    if (lower.includes('where mr.doctor_id') || lower.includes('where doctor_id')) {
      rows = rows.filter(row => Number(row.doctor_id) === Number(params[0]));
    }
  }

  if (table === 'bills') {
    if (lower.includes('where b.patient_id') || lower.includes('where patient_id')) {
      rows = rows.filter(row => Number(row.patient_id) === Number(params[0]));
    }
    if (lower.includes('payment_status = ?') || lower.includes('payment_status=?')) {
      rows = rows.filter(row => row.payment_status === params[0]);
    }
  }

  if (table === 'notifications') {
    if (lower.includes('where user_id = ?') || lower.includes('where user_id=?')) {
      rows = rows.filter(row => Number(row.user_id) === Number(params[0]));
    }
  }

  if (table === 'staff') {
    rows = rows.filter(row => row.is_active !== false);
  }

  return rows;
}

function enrichRows(sql, rows) {
  const lower = sql.toLowerCase();
  if (lower.includes('from patients p join users u') || lower.includes('from patients p') && lower.includes('join users')) {
    return rows.map(patient => ({
      ...patient,
      user_email: mockState.users.find(user => user.id === patient.user_id)?.email || patient.email,
      is_active: mockState.users.find(user => user.id === patient.user_id)?.is_active ?? true,
      last_login: mockState.users.find(user => user.id === patient.user_id)?.last_login || null
    }));
  }

  if (lower.includes('from doctors d left join departments') || lower.includes('from doctors d') && lower.includes('departments')) {
    return rows.map(doctor => ({
      ...doctor,
      department_name: mockState.departments.find(dept => dept.department_id === doctor.department_id)?.department_name || null
    }));
  }

  if (lower.includes('from appointments a') && lower.includes('join patients') && lower.includes('join doctors')) {
    return rows.map(appointment => {
      const patient = mockState.patients.find(item => item.patient_id === appointment.patient_id);
      const doctor = mockState.doctors.find(item => item.doctor_id === appointment.doctor_id);
      const department = mockState.departments.find(item => item.department_id === doctor?.department_id);
      return {
        ...appointment,
        patient_first_name: patient?.first_name || null,
        patient_last_name: patient?.last_name || null,
        patient_phone: patient?.phone || null,
        doctor_name: doctor?.name || null,
        specialization: doctor?.specialization || null,
        department_name: department?.department_name || null
      };
    });
  }

  if (lower.includes('from medical_records mr') && lower.includes('join doctors') && lower.includes('join patients')) {
    return rows.map(record => {
      const patient = mockState.patients.find(item => item.patient_id === record.patient_id);
      const doctor = mockState.doctors.find(item => item.doctor_id === record.doctor_id);
      return {
        ...record,
        doctor_name: doctor?.name || null,
        specialization: doctor?.specialization || null,
        patient_first_name: patient?.first_name || null,
        patient_last_name: patient?.last_name || null
      };
    });
  }

  if (lower.includes('from bills b') && lower.includes('join patients')) {
    return rows.map(bill => {
      const patient = mockState.patients.find(item => item.patient_id === bill.patient_id);
      return {
        ...bill,
        patient_first_name: patient?.first_name || null,
        patient_last_name: patient?.last_name || null,
        patient_phone: patient?.phone || null
      };
    });
  }

  return rows;
}

function createMockPool() {
  return {
    async query(sql, params = []) {
      const normalizedSql = String(sql || '').replace(/\s+/g, ' ').trim();
      const lower = normalizedSql.toLowerCase();
      const values = Array.isArray(params) ? params : [params];

      if (lower.includes('select 1')) {
        return [[{ '1': 1 }]];
      }

      if (lower.includes('select count(*)') || lower.includes('select count(*) as count')) {
        const table = getTableName(normalizedSql);
        const rows = makeRows(normalizedSql, values);
        const countValue = Array.isArray(rows) ? rows.length : 0;
        return [[{ count: countValue, total: countValue }]];
      }

      if (lower.includes('select coalesce(sum(total_amount), 0)')) {
        const total = mockState.bills.reduce((sum, bill) => sum + (bill.payment_status === 'paid' ? Number(bill.total_amount || 0) : 0), 0);
        return [[{ total }]];
      }

      if (lower.includes('insert into users')) {
        const newUser = {
          id: mockState.users.length + 1,
          email: values[0],
          password_hash: values[1],
          role: values[2] || 'patient',
          is_active: true,
          last_login: null,
          created_at: now
        };
        mockState.users.push(newUser);
        return [{ insertId: newUser.id, affectedRows: 1 }];
      }

      if (lower.includes('insert into patients')) {
        const newPatient = {
          patient_id: mockState.patients.length + 1,
          user_id: values[0],
          first_name: values[1],
          last_name: values[2],
          gender: values[3],
          date_of_birth: values[4],
          phone: values[5],
          email: values[6],
          blood_group: values[7] || null,
          address: values[8] || null,
          emergency_contact: values[9] || null,
          created_at: now
        };
        mockState.patients.push(newPatient);
        return [{ insertId: newPatient.patient_id, affectedRows: 1 }];
      }

      if (lower.includes('insert into doctors')) {
        const newDoctor = {
          doctor_id: mockState.doctors.length + 1,
          user_id: values[0],
          name: values[1],
          department_id: values[2],
          specialization: values[3],
          qualification: values[4],
          experience: values[5] || 0,
          phone: values[6],
          email: values[7],
          bio: values[8],
          consultation_fee: values[9] || 500,
          available_days: 'Mon,Tue,Wed,Thu,Fri',
          available_from: '09:00:00',
          available_to: '17:00:00',
          is_active: true,
          rating: 0,
          created_at: now
        };
        mockState.doctors.push(newDoctor);
        return [{ insertId: newDoctor.doctor_id, affectedRows: 1 }];
      }

      if (lower.includes('insert into appointments')) {
        const newAppointment = {
          appointment_id: mockState.appointments.length + 1,
          patient_id: values[0],
          doctor_id: values[1],
          appointment_date: values[2],
          appointment_time: values[3],
          appointment_status: 'booked',
          reason: values[4],
          created_at: now
        };
        mockState.appointments.push(newAppointment);
        return [{ insertId: newAppointment.appointment_id, affectedRows: 1 }];
      }

      if (lower.includes('insert into medical_records')) {
        const newRecord = {
          record_id: mockState.medical_records.length + 1,
          patient_id: values[0],
          doctor_id: values[1],
          appointment_id: values[2],
          diagnosis: values[3],
          prescription: values[4],
          doctor_notes: values[5],
          created_at: now
        };
        mockState.medical_records.push(newRecord);
        return [{ insertId: newRecord.record_id, affectedRows: 1 }];
      }

      if (lower.includes('insert into bills')) {
        const newBill = {
          bill_id: mockState.bills.length + 1,
          patient_id: values[0],
          appointment_id: values[1],
          amount: values[2],
          tax: values[3],
          discount: values[4],
          total_amount: values[5],
          payment_status: 'pending',
          payment_method: values[7] || 'cash',
          payment_date: null,
          description: values[6],
          created_at: now
        };
        mockState.bills.push(newBill);
        return [{ insertId: newBill.bill_id, affectedRows: 1 }];
      }

      if (lower.includes('insert into notifications')) {
        const newNotification = {
          notification_id: mockState.notifications.length + 1,
          user_id: values[0],
          title: values[1],
          message: values[2],
          type: values[3] || 'general',
          is_read: false,
          created_at: now
        };
        mockState.notifications.push(newNotification);
        return [{ insertId: newNotification.notification_id, affectedRows: 1 }];
      }

      if (lower.includes('insert into staff')) {
        const newStaff = {
          staff_id: mockState.staff.length + 1,
          name: values[0],
          role: values[1],
          department: values[2],
          phone: values[3],
          email: values[4],
          salary: values[5],
          joining_date: values[6],
          is_active: true,
          created_at: now
        };
        mockState.staff.push(newStaff);
        return [{ insertId: newStaff.staff_id, affectedRows: 1 }];
      }

      if (lower.includes('update users set')) {
        const userId = Number(values[values.length - 1]);
        const target = mockState.users.find(item => Number(item.id) === userId);
        if (target) {
          if (lower.includes('last_login')) target.last_login = now;
          if (lower.includes('is_active')) target.is_active = values[0] === 1 || values[0] === true;
        }
        return [{ affectedRows: target ? 1 : 0 }];
      }

      if (lower.includes('update patients set')) {
        const patientId = Number(values[values.length - 1]);
        const target = mockState.patients.find(item => Number(item.patient_id) === patientId);
        if (target) {
          target.first_name = values[0];
          target.last_name = values[1];
          target.gender = values[2];
          target.date_of_birth = values[3];
          target.phone = values[4];
          target.address = values[5];
          target.blood_group = values[6];
          target.emergency_contact = values[7];
        }
        return [{ affectedRows: target ? 1 : 0 }];
      }

      if (lower.includes('update doctors set')) {
        const doctorId = Number(values[values.length - 1]);
        const target = mockState.doctors.find(item => Number(item.doctor_id) === doctorId);
        if (target) {
          target.name = values[0];
          target.department_id = values[1];
          target.specialization = values[2];
          target.qualification = values[3];
          target.experience = values[4];
          target.phone = values[5];
          target.bio = values[6];
          target.consultation_fee = values[7];
          target.available_days = values[8];
          target.available_from = values[9];
          target.available_to = values[10];
        }
        return [{ affectedRows: target ? 1 : 0 }];
      }

      if (lower.includes('update appointments set')) {
        const appointmentId = Number(values[values.length - 1]);
        const target = mockState.appointments.find(item => Number(item.appointment_id) === appointmentId);
        if (target) {
          if (lower.includes('appointment_status')) target.appointment_status = values[0];
          if (lower.includes('appointment_date')) target.appointment_date = values[0];
          if (lower.includes('appointment_time')) target.appointment_time = values[1];
        }
        return [{ affectedRows: target ? 1 : 0 }];
      }

      if (lower.includes('update medical_records set')) {
        const recordId = Number(values[values.length - 1]);
        const target = mockState.medical_records.find(item => Number(item.record_id) === recordId);
        if (target) {
          target.diagnosis = values[0];
          target.prescription = values[1];
          target.doctor_notes = values[2];
        }
        return [{ affectedRows: target ? 1 : 0 }];
      }

      if (lower.includes('update bills set')) {
        const billId = Number(values[values.length - 1]);
        const target = mockState.bills.find(item => Number(item.bill_id) === billId);
        if (target) {
          target.payment_status = values[0];
          target.payment_method = values[1] || target.payment_method;
          target.payment_date = now;
        }
        return [{ affectedRows: target ? 1 : 0 }];
      }

      if (lower.includes('update notifications set')) {
        const target = mockState.notifications.filter(item => Number(item.user_id) === Number(values[values.length - 1]));
        target.forEach(item => { item.is_read = true; });
        return [{ affectedRows: target.length }];
      }

      if (lower.includes('update staff set')) {
        const staffId = Number(values[values.length - 1]);
        const target = mockState.staff.find(item => Number(item.staff_id) === staffId);
        if (target) target.is_active = false;
        return [{ affectedRows: target ? 1 : 0 }];
      }

      if (lower.includes('delete from users')) {
        const userId = Number(values[0]);
        mockState.users = mockState.users.filter(item => Number(item.id) !== userId);
        return [{ affectedRows: 1 }];
      }

      if (lower.includes('delete from patients')) {
        const patientId = Number(values[0]);
        mockState.patients = mockState.patients.filter(item => Number(item.patient_id) !== patientId);
        return [{ affectedRows: 1 }];
      }

      if (lower.includes('select * from')) {
        const rows = makeRows(normalizedSql, values);
        const enriched = enrichRows(normalizedSql, rows);
        if (lower.includes('order by') || lower.includes('limit') || lower.includes('offset')) {
          return [enriched];
        }
        return [enriched];
      }

      if (lower.includes('select')) {
        const rows = makeRows(normalizedSql, values);
        return [enrichRows(normalizedSql, rows)];
      }

      return [[]];
    },
    async getConnection() {
      return {
        async query(sql, params) {
          return this._pool.query(sql, params);
        },
        release() {}
      };
    },
    async end() {}
  };
}

const pool = createMockPool();

async function initializeDatabase() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Demo data store ready');
  } catch (error) {
    console.error('⚠️ Database initialization warning:', error.message);
  }
}

async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Demo database connection available');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// ==================== AI CONFIGURATION ====================
let genAI = null;
let model = null;

function initializeAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      genAI = new GoogleGenerativeAI(apiKey);
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('✅ Google Gemini AI initialized');
      return true;
    } catch (error) {
      console.error('⚠️  AI initialization failed:', error.message);
      return false;
    }
  } else {
    console.log('ℹ️  AI features disabled (no API key configured)');
    return false;
  }
}

async function generateAIResponse(prompt, systemInstruction = '') {
  if (!model) {
    return {
      success: false,
      message: 'AI is not configured. Please add your Gemini API key to the .env file.',
      fallback: true
    };
  }

  try {
    const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return {
      success: true,
      text: response.text(),
      fallback: false
    };
  } catch (error) {
    console.error('AI generation error:', error.message);
    return {
      success: false,
      message: 'AI service temporarily unavailable. Please try again later.',
      fallback: true
    };
  }
}

function isAIAvailable() {
  return model !== null;
}

module.exports = { pool, initializeDatabase, testConnection, initializeAI, generateAIResponse, isAIAvailable };
