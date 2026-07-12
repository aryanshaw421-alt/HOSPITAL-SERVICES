import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  FiHeart, FiCalendar, FiMessageSquare, FiUsers, FiShield, FiClock, 
  FiAward, FiPhone, FiMail, FiMapPin, FiStar, FiArrowRight, FiMenu, 
  FiX, FiSun, FiMoon, FiActivity, FiZap, FiCheckCircle
} from 'react-icons/fi';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenu, setMobileMenu] = useState(false);

  const departments = [
    { name: 'Cardiology', icon: FiHeart, desc: 'Heart & cardiovascular care', color: 'from-red-500 to-pink-500' },
    { name: 'Neurology', icon: FiActivity, desc: 'Brain & nervous system', color: 'from-purple-500 to-indigo-500' },
    { name: 'Orthopedics', icon: FiShield, desc: 'Bone & joint specialists', color: 'from-blue-500 to-cyan-500' },
    { name: 'Pediatrics', icon: FiUsers, desc: 'Child healthcare', color: 'from-green-500 to-emerald-500' },
    { name: 'Dermatology', icon: FiStar, desc: 'Skin & hair care', color: 'from-amber-500 to-orange-500' },
    { name: 'Emergency', icon: FiZap, desc: '24/7 urgent care', color: 'from-rose-500 to-red-500' },
  ];

  const doctors = [
    { name: 'Dr. Rajesh Sharma', spec: 'Internal Medicine', exp: '15 years', rating: 4.8 },
    { name: 'Dr. Priya Patel', spec: 'Cardiology', exp: '12 years', rating: 4.9 },
    { name: 'Dr. Amit Gupta', spec: 'Orthopedics', exp: '10 years', rating: 4.7 },
    { name: 'Dr. Manpreet Singh', spec: 'Neurosurgery', exp: '18 years', rating: 4.9 },
  ];

  const testimonials = [
    { name: 'Priya Mehta', text: 'The AI assistant helped me book an appointment in seconds. Amazing experience!', rating: 5 },
    { name: 'Arjun Reddy', text: 'Best hospital experience. The doctors are very professional and caring.', rating: 5 },
    { name: 'Sneha Kapoor', text: 'Loved the digital medical records system. Everything is so organized!', rating: 4 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl border-b border-surface-200/50 dark:border-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow-blue">
                <FiHeart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-surface-900 dark:text-white leading-tight">Ateek Aryan</h1>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium -mt-0.5">Hospital</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {['Home', 'Departments', 'Doctors', 'About', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="btn-ghost text-sm">{item}</a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                {isDark ? <FiSun className="w-5 h-5 text-amber-400" /> : <FiMoon className="w-5 h-5 text-surface-500" />}
              </button>
              <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm font-semibold">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2.5 px-5">Get Started</Link>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800">
                {mobileMenu ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="lg:hidden pb-4 space-y-1">
              {['Home', 'Departments', 'Doctors', 'About', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenu(false)} className="block px-4 py-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 font-medium">{item}</a>
              ))}
              <Link to="/login" onClick={() => setMobileMenu(false)} className="block px-4 py-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 font-medium">Login</Link>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 md:pt-32 pb-16 md:pb-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/10 dark:bg-primary-400/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-400/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-400/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full mb-6">
                <FiZap className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">AI-Powered Healthcare</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-surface-900 dark:text-white leading-[1.1] mb-6">
                Your Health,{' '}
                <span className="text-gradient">Our Priority</span>
              </h1>
              <p className="text-lg text-surface-600 dark:text-surface-300 mb-8 leading-relaxed max-w-lg">
                Experience next-generation healthcare at Ateek Aryan Hospital. Our AI-powered platform makes appointments, medical records, and consultations seamless.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
                  Book Appointment <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
                  <FiMessageSquare className="w-5 h-5" /> Talk to AI
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12">
                {[
                  { value: 15000, suffix: '+', label: 'Patients Treated' },
                  { value: 50, suffix: '+', label: 'Expert Doctors' },
                  { value: 15, suffix: '', label: 'Departments' },
                  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl md:text-3xl font-extrabold text-gradient">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 font-medium mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Decorative circles */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-200/50 to-secondary-200/50 dark:from-primary-800/30 dark:to-secondary-800/30 animate-pulse-soft" />
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40" />
                <div className="absolute inset-16 rounded-full gradient-hero shadow-glow-blue flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <FiHeart className="w-16 h-16 mx-auto mb-4 animate-float" />
                    <h3 className="text-2xl font-bold mb-2">Ateek Aryan</h3>
                    <p className="text-primary-100 text-sm">Advanced Healthcare</p>
                    <p className="text-primary-200 text-xs mt-1">Powered by AI</p>
                  </div>
                </div>

                {/* Floating cards */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute top-8 right-0 glass-card p-3 flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                    <FiCheckCircle className="w-4 h-4 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-900 dark:text-white">AI Diagnosis</p>
                    <p className="text-[10px] text-surface-500">Instant insights</p>
                  </div>
                </motion.div>

                <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                  className="absolute bottom-12 left-0 glass-card p-3 flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FiCalendar className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-900 dark:text-white">Smart Booking</p>
                    <p className="text-[10px] text-surface-500">AI-powered scheduling</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="section-title text-surface-900 dark:text-white">Why Choose <span className="text-gradient">Ateek Aryan</span> Hospital?</h2>
            <p className="section-subtitle max-w-2xl mx-auto">We combine cutting-edge AI technology with compassionate care to deliver the best healthcare experience.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FiZap, title: 'AI-Powered Care', desc: 'Our AI assistant helps you book appointments, get health insights, and manage records effortlessly.', color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
              { icon: FiUsers, title: 'Expert Doctors', desc: '50+ highly qualified doctors across 15 specializations with years of clinical experience.', color: 'text-secondary-600', bg: 'bg-secondary-100 dark:bg-secondary-900/30' },
              { icon: FiClock, title: '24/7 Emergency', desc: 'Round-the-clock emergency services with rapid response teams and critical care units.', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
              { icon: FiShield, title: 'Secure Records', desc: 'Your medical data is encrypted and stored securely. Access your records anytime, anywhere.', color: 'text-accent-600', bg: 'bg-accent-100 dark:bg-accent-900/30' },
              { icon: FiCalendar, title: 'Easy Scheduling', desc: 'Book, reschedule, or cancel appointments with just a few clicks. No waiting on phone.', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
              { icon: FiAward, title: 'Quality Assured', desc: '98% patient satisfaction rate with internationally accredited facilities and protocols.', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="card p-6 group hover:scale-[1.02]">
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="section-title text-surface-900 dark:text-white">Our <span className="text-gradient">Departments</span></h2>
            <p className="section-subtitle">Comprehensive healthcare services across all major specializations</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card p-6 group hover:scale-[1.02] cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${dept.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <dept.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">{dept.name}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400">{dept.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section id="doctors" className="py-16 md:py-24 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="section-title text-surface-900 dark:text-white">Our <span className="text-gradient">Expert Doctors</span></h2>
            <p className="section-subtitle">Meet our team of highly qualified medical professionals</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card p-6 text-center group hover:scale-[1.02]"
              >
                <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-glow-blue group-hover:scale-110 transition-transform">
                  {doc.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <h3 className="font-bold text-surface-900 dark:text-white">{doc.name}</h3>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{doc.spec}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{doc.exp} experience</p>
                <div className="flex items-center justify-center gap-1 mt-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <FiStar key={j} className={`w-3.5 h-3.5 ${j < Math.floor(doc.rating) ? 'text-amber-400 fill-amber-400' : 'text-surface-300'}`} />
                  ))}
                  <span className="text-xs text-surface-500 ml-1">{doc.rating}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="section-title text-surface-900 dark:text-white">Patient <span className="text-gradient">Testimonials</span></h2>
            <p className="section-subtitle">Hear from our patients about their experience</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <FiStar key={j} className={`w-4 h-4 ${j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-300'}`} />
                  ))}
                </div>
                <p className="text-surface-600 dark:text-surface-300 mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <p className="font-semibold text-surface-900 dark:text-white">{t.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="py-12 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">🚨 Emergency? We're Here 24/7</h3>
              <p className="text-primary-100">Immediate medical assistance available round the clock</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:+911800123456" className="flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-colors">
                <FiPhone className="w-5 h-5" /> +91-1800-123-4567
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 md:py-24 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="section-title text-surface-900 dark:text-white">Get in <span className="text-gradient">Touch</span></h2>
            <p className="section-subtitle">We'd love to hear from you</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                { icon: FiMapPin, label: 'Address', value: '123 Healthcare Avenue, Medical District, New Delhi, India - 110001' },
                { icon: FiPhone, label: 'Phone', value: '+91-1800-123-4567 (Toll Free)' },
                { icon: FiMail, label: 'Email', value: 'info@ateekaryanhospital.com' },
                { icon: FiClock, label: 'Working Hours', value: 'OPD: Mon-Sat, 9:00 AM - 5:00 PM | Emergency: 24/7' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-white">{item.label}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Send us a Message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" className="input-field" />
                  <input type="email" placeholder="Your Email" className="input-field" />
                </div>
                <input type="text" placeholder="Subject" className="input-field" />
                <textarea placeholder="Your Message" rows="4" className="input-field resize-none" />
                <button type="submit" className="btn-primary w-full">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 dark:bg-surface-950 text-surface-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                  <FiHeart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Ateek Aryan Hospital</h3>
                  <p className="text-xs text-surface-400">AI-Powered Healthcare</p>
                </div>
              </div>
              <p className="text-sm text-surface-400">Advanced healthcare powered by artificial intelligence. Your health, our priority.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <div className="space-y-2">
                {['Home', 'Departments', 'Doctors', 'Book Appointment', 'Contact'].map((link) => (
                  <a key={link} href="#" className="block text-sm hover:text-primary-400 transition-colors">{link}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Departments</h4>
              <div className="space-y-2">
                {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology'].map((dept) => (
                  <a key={dept} href="#" className="block text-sm hover:text-primary-400 transition-colors">{dept}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Emergency</h4>
              <p className="text-sm text-surface-400 mb-2">24/7 Emergency Helpline</p>
              <p className="text-xl font-bold text-primary-400">+91-1800-123-4567</p>
              <p className="text-sm text-surface-400 mt-4">Email: info@ateekaryanhospital.com</p>
            </div>
          </div>
          <div className="border-t border-surface-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-surface-400">© {new Date().getFullYear()} Ateek Aryan Hospital. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-surface-400 hover:text-primary-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
