import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiPhone, FiCalendar, FiHeart, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    gender: '', dateOfBirth: '', phone: '', bloodGroup: '', address: '', emergencyContact: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match.');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters.');

    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully! Welcome to Ateek Aryan Hospital.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-2/5 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute bottom-32 right-20 w-48 h-48 border-2 border-white rounded-full" />
        </div>
        <div className="text-center text-white relative z-10">
          <FiHeart className="w-20 h-20 mx-auto mb-6 animate-float" />
          <h2 className="text-4xl font-extrabold mb-4">Join Us Today</h2>
          <p className="text-xl text-primary-100 mb-2">Ateek Aryan Hospital</p>
          <p className="text-primary-200 max-w-xs mx-auto mt-4">Create your account and access AI-powered healthcare services, book appointments, and manage your medical records.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-surface-950 overflow-y-auto">
        <div className="w-full max-w-lg animate-slide-up">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 mb-6 transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Create Your Account</h1>
          <p className="text-surface-500 dark:text-surface-400 mb-6">Register as a patient at Ateek Aryan Hospital</p>

          {/* Progress Steps */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'gradient-hero text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'}`}>
                  {s}
                </div>
                <span className={`text-sm font-medium ${step >= s ? 'text-surface-900 dark:text-white' : 'text-surface-400'}`}>
                  {s === 1 ? 'Account Info' : 'Personal Info'}
                </span>
                {s === 1 && <div className={`flex-1 h-0.5 ${step > 1 ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">First Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="input-field pl-10 py-2.5" placeholder="First name" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="input-field py-2.5" placeholder="Last name" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field pl-10 py-2.5" placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="input-field pl-10 pr-10 py-2.5" placeholder="Min 6 characters" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field pl-10 py-2.5" placeholder="Repeat password" required />
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full py-3">Continue</button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="input-field py-2.5" required>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input-field py-2.5" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field pl-10 py-2.5" placeholder="+91-XXXXXXXXXX" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field py-2.5">
                      <option value="">Select</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Emergency Contact</label>
                    <input type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="input-field py-2.5" placeholder="Contact number" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} className="input-field py-2.5 resize-none" rows="2" placeholder="Your address" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
                    {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</span> : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
            Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
