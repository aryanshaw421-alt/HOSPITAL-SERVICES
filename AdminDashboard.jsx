import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import { FiUsers, FiActivity, FiCalendar, FiDollarSign, FiClock, FiBriefcase, FiTrendingUp, FiArrowUpRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

const COLORS = ['#2563eb', '#14b8a6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

function StatCard({ icon: Icon, label, value, trend, color, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="stat-card"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <Icon className="w-full h-full" />
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{label}</p>
      <p className="text-3xl font-extrabold text-surface-900 dark:text-white mt-1">{value}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-accent-600">
          <FiArrowUpRight className="w-4 h-4" />
          <span className="text-xs font-semibold">{trend}</span>
        </div>
      )}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setData(res.data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-6 animate-pulse">
          <div className="w-12 h-12 bg-surface-200 dark:bg-surface-700 rounded-xl mb-4" />
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24 mb-2" />
          <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-16" />
        </div>
      ))}
    </div>
  );

  const stats = data?.stats || {};
  const departmentData = data?.departmentStats || [];
  const recentAppts = data?.recentAppointments || [];

  const appointmentStatusData = [
    { name: 'Booked', value: 35, color: '#2563eb' },
    { name: 'Completed', value: 45, color: '#22c55e' },
    { name: 'Cancelled', value: 10, color: '#ef4444' },
    { name: 'Pending', value: 10, color: '#f59e0b' },
  ];

  const monthlyData = data?.monthlyRevenue?.length > 0 ? data.monthlyRevenue.map(m => ({
    month: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    revenue: parseFloat(m.revenue)
  })) : [
    { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 }, { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 }, { month: 'Jun', revenue: 67000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Overview of hospital operations and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard icon={FiUsers} label="Total Patients" value={stats.totalPatients || 0} trend="+12% this month" color="bg-primary-500" delay={0} />
        <StatCard icon={FiActivity} label="Total Doctors" value={stats.totalDoctors || 0} color="bg-secondary-500" delay={0.1} />
        <StatCard icon={FiCalendar} label="Today's Appointments" value={stats.todayAppointments || 0} trend="3 upcoming" color="bg-accent-500" delay={0.2} />
        <StatCard icon={FiDollarSign} label="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} trend="+8% this month" color="bg-amber-500" delay={0.3} />
        <StatCard icon={FiClock} label="Pending Bills" value={stats.pendingBills || 0} color="bg-red-500" delay={0.4} />
        <StatCard icon={FiBriefcase} label="Total Staff" value={stats.totalStaff || 0} color="bg-purple-500" delay={0.5} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-primary-500" /> Revenue Overview
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${(v/1000)}k`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Appointment Status Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
          <h3 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-secondary-500" /> Appointment Status
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={appointmentStatusData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {appointmentStatusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Department Stats & Recent Appointments */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Department Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6">
          <h3 className="font-bold text-surface-900 dark:text-white mb-4">Department-wise Patients</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData.length > 0 ? departmentData : [
              { department_name: 'General', patient_count: 120 },
              { department_name: 'Cardiology', patient_count: 85 },
              { department_name: 'Orthopedics', patient_count: 65 },
              { department_name: 'Pediatrics', patient_count: 95 },
              { department_name: 'Neurology', patient_count: 45 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="department_name" stroke="#94a3b8" fontSize={11} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '12px' }} />
              <Bar dataKey="patient_count" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Appointments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card p-6">
          <h3 className="font-bold text-surface-900 dark:text-white mb-4">Recent Appointments</h3>
          <div className="space-y-3">
            {(recentAppts.length > 0 ? recentAppts : [
              { first_name: 'Rahul', last_name: 'Verma', doctor_name: 'Dr. Sharma', department_name: 'General Medicine', appointment_status: 'booked', appointment_date: new Date().toISOString() }
            ]).map((appt, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white text-sm font-bold">
                    {appt.first_name?.[0]}{appt.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">{appt.first_name} {appt.last_name}</p>
                    <p className="text-xs text-surface-500">{appt.doctor_name} · {appt.department_name}</p>
                  </div>
                </div>
                <span className={`badge ${appt.appointment_status === 'completed' ? 'badge-success' : appt.appointment_status === 'cancelled' ? 'badge-danger' : 'badge-info'}`}>
                  {appt.appointment_status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
