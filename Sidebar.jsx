import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, FiCalendar, FiUsers, FiUser, FiGrid, FiFileText, 
  FiDollarSign, FiBriefcase, FiSettings, FiLogOut, FiX, 
  FiChevronLeft, FiChevronRight, FiMessageSquare, FiActivity,
  FiHeart
} from 'react-icons/fi';

const menuItems = {
  admin: [
    { path: '/dashboard/admin', label: 'Dashboard', icon: FiHome },
    { path: '/dashboard/appointments', label: 'Appointments', icon: FiCalendar },
    { path: '/dashboard/doctors', label: 'Doctors', icon: FiActivity },
    { path: '/dashboard/patients', label: 'Patients', icon: FiUsers },
    { path: '/dashboard/departments', label: 'Departments', icon: FiGrid },
    { path: '/dashboard/medical-records', label: 'Medical Records', icon: FiFileText },
    { path: '/dashboard/billing', label: 'Billing', icon: FiDollarSign },
    { path: '/dashboard/staff', label: 'Staff', icon: FiBriefcase },
    { path: '/dashboard/ai-assistant', label: 'AI Assistant', icon: FiMessageSquare },
    { path: '/dashboard/profile', label: 'Settings', icon: FiSettings },
  ],
  doctor: [
    { path: '/dashboard/doctor', label: 'Dashboard', icon: FiHome },
    { path: '/dashboard/appointments', label: 'Appointments', icon: FiCalendar },
    { path: '/dashboard/patients', label: 'My Patients', icon: FiUsers },
    { path: '/dashboard/medical-records', label: 'Medical Records', icon: FiFileText },
    { path: '/dashboard/ai-assistant', label: 'AI Assistant', icon: FiMessageSquare },
    { path: '/dashboard/profile', label: 'Profile', icon: FiSettings },
  ],
  patient: [
    { path: '/dashboard/patient', label: 'Dashboard', icon: FiHome },
    { path: '/dashboard/appointments', label: 'Appointments', icon: FiCalendar },
    { path: '/dashboard/doctors', label: 'Find Doctors', icon: FiActivity },
    { path: '/dashboard/departments', label: 'Departments', icon: FiGrid },
    { path: '/dashboard/medical-records', label: 'Medical Records', icon: FiFileText },
    { path: '/dashboard/billing', label: 'My Bills', icon: FiDollarSign },
    { path: '/dashboard/ai-assistant', label: 'AI Assistant', icon: FiMessageSquare },
    { path: '/dashboard/profile', label: 'Profile', icon: FiSettings },
  ],
};

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = menuItems[user?.role] || menuItems.patient;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`
      fixed top-0 left-0 h-full z-50 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700
      transition-all duration-300 flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      ${collapsed ? 'w-20' : 'w-72'}
    `}>
      {/* Logo Area */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow-blue">
              <FiHeart className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-sm text-surface-900 dark:text-white leading-tight">Ateek Aryan</h1>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">Hospital</p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.includes('/admin') || item.path.includes('/doctor') || item.path.includes('/patient')}
            onClick={onClose}
            className={({ isActive }) => `
              sidebar-link ${isActive ? 'active' : ''}
              ${collapsed ? 'justify-center px-2' : ''}
            `}
            title={collapsed ? item.label : ''}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="animate-fade-in">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <button 
        onClick={onToggleCollapse}
        className="hidden lg:flex items-center justify-center p-3 border-t border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
      >
        {collapsed ? <FiChevronRight className="w-5 h-5 text-surface-400" /> : <FiChevronLeft className="w-5 h-5 text-surface-400" />}
      </button>

      {/* User & Logout */}
      <div className="p-3 border-t border-surface-200 dark:border-surface-700">
        {!collapsed && (
          <div className="mb-3 px-3 animate-fade-in">
            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
              {user?.profile?.first_name || user?.profile?.name || user?.email}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400 capitalize">{user?.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-link text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 w-full ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <FiLogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
