import { useState, useEffect } from 'react';
import api from '../lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiDollarSign, FiCheckCircle, FiClock, FiCreditCard } from 'react-icons/fi';

export default function BillingPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get(`/bills${statusFilter ? `?status=${statusFilter}` : ''}`).then(res => setBills(res.data.bills || [])).catch(console.error).finally(() => setLoading(false));
  }, [statusFilter]);

  const handlePay = async (id) => {
    try {
      await api.patch(`/bills/${id}/pay`, { paymentMethod: 'online' });
      toast.success('Payment recorded successfully!');
      setBills(bills.map(b => b.bill_id === id ? { ...b, payment_status: 'paid', payment_date: new Date().toISOString() } : b));
    } catch (e) { toast.error('Payment failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Billing</h1>
        <p className="text-surface-500 text-sm mt-1">Manage bills and payments</p>
      </div>

      <div className="flex gap-2">
        {['', 'pending', 'paid'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === s ? 'gradient-primary text-white shadow-lg' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-200'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card p-6 h-20 animate-pulse" />)}</div>
      ) : bills.length === 0 ? (
        <div className="card p-12 text-center">
          <FiDollarSign className="w-16 h-16 mx-auto mb-4 text-surface-300" />
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">No Bills Found</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill, i) => (
            <motion.div key={bill.bill_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bill.payment_status === 'paid' ? 'bg-accent-100 dark:bg-accent-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  {bill.payment_status === 'paid' ? <FiCheckCircle className="w-6 h-6 text-accent-600" /> : <FiClock className="w-6 h-6 text-amber-600" />}
                </div>
                <div>
                  <p className="font-semibold text-surface-900 dark:text-white">{bill.description || 'Hospital Bill'}</p>
                  <p className="text-xs text-surface-500">{bill.patient_first_name} {bill.patient_last_name} · {new Date(bill.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-bold text-surface-900 dark:text-white">₹{parseFloat(bill.total_amount).toLocaleString()}</p>
                  <span className={`badge ${bill.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{bill.payment_status}</span>
                </div>
                {bill.payment_status === 'pending' && (
                  <button onClick={() => handlePay(bill.bill_id)} className="btn-primary py-2 px-4 text-sm flex items-center gap-1">
                    <FiCreditCard className="w-4 h-4" /> Pay
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
