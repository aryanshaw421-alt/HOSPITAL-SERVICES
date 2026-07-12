import { useState, useEffect } from 'react';
import api from '../lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiBriefcase, FiPlus, FiX, FiTrash2, FiPhone, FiMail } from 'react-icons/fi';

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', department: '', phone: '', email: '', salary: '', joiningDate: '' });

  useEffect(() => {
    api.get('/staff').then(res => setStaff(res.data.staff || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff', form);
      toast.success('Staff member added!');
      setShowAdd(false);
      setForm({ name: '', role: '', department: '', phone: '', email: '', salary: '', joiningDate: '' });
      const res = await api.get('/staff');
      setStaff(res.data.staff || []);
    } catch (e) { toast.error('Failed to add staff'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    try {
      await api.delete(`/staff/${id}`);
      setStaff(staff.filter(s => s.staff_id !== id));
      toast.success('Staff removed');
    } catch (e) { toast.error('Failed to remove'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Staff Management</h1>
          <p className="text-surface-500 text-sm mt-1">Manage hospital staff members</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="card p-6 h-40 animate-pulse" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s, i) => (
            <motion.div key={s.staff_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card p-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center text-white font-bold">{s.name?.[0]}</div>
                  <div>
                    <p className="font-bold text-surface-900 dark:text-white">{s.name}</p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">{s.role}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(s.staff_id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-surface-500">
                <div className="flex items-center gap-2"><FiBriefcase className="w-3.5 h-3.5" />{s.department}</div>
                {s.phone && <div className="flex items-center gap-2"><FiPhone className="w-3.5 h-3.5" />{s.phone}</div>}
                {s.salary && <p className="font-semibold text-surface-700 dark:text-surface-300 mt-2">₹{parseFloat(s.salary).toLocaleString()}/month</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAdd(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-surface-200 dark:border-surface-700">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">Add Staff</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"><FiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field" required />
                <input type="text" placeholder="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Salary" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="input-field" />
                <input type="date" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })} className="input-field" />
              </div>
              <button type="submit" className="btn-primary w-full py-3">Add Staff Member</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
