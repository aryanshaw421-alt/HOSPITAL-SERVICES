import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiHeart, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields.');
    
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back! Logged in as ${user.role}.`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    const creds = {
      admin: { email: 'admin@ateekaryanhospital.com', password: 'admin123' },
      doctor: { email: 'dr.sharma@ateekaryanhospital.com', password: 'admin123' },
      patient: { email: 'patient@example.com', password: 'admin123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-surface-950">
        <div className="w-full max-w-md animate-slide-up">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 mb-8 transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow-blue">
              <FiHeart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Welcome Back</h1>
          </div>
          <p className="text-surface-500 dark:text-surface-400 mb-8">Sign in to your account at Ateek Aryan Hospital</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12" placeholder="you@example.com" required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12" placeholder="Enter your password" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-6">
            <p className="text-xs text-surface-400 text-center mb-3">Quick Login (Demo)</p>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'doctor', 'patient'].map((role) => (
                <button key={role} onClick={() => quickLogin(role)}
                  className="py-2 px-3 text-xs font-semibold rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-700 capitalize transition-all"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-8">
            Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">Create Account</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute bottom-32 right-20 w-48 h-48 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-2 border-white rounded-full" />
        </div>
        <div className="text-center text-white relative z-10">
          <FiHeart className="w-20 h-20 mx-auto mb-6 animate-float" />
          <h2 className="text-4xl font-extrabold mb-4">Ateek Aryan Hospital</h2>
          <p className="text-xl text-primary-100 mb-2">Advanced Healthcare</p>
          <p className="text-primary-200">Powered by Artificial Intelligence</p>
          <div className="mt-10 flex justify-center gap-8">
            <div><p className="text-3xl font-bold">50+</p><p className="text-xs text-primary-200">Doctors</p></div>
            <div><p className="text-3xl font-bold">15</p><p className="text-xs text-primary-200">Departments</p></div>
            <div><p className="text-3xl font-bold">24/7</p><p className="text-xs text-primary-200">Emergency</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
