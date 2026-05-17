import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  GraduationCap,
  Shield,
  AlertTriangle,
  Award,
  Home,
  BarChart3,
  Search,
  FileText,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const staffLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/academics', icon: GraduationCap, label: 'Academics' },
  { to: '/discipline', icon: Shield, label: 'Discipline' },
  { to: '/penalties', icon: AlertTriangle, label: 'Penalties' },
  { to: '/bonuses', icon: Award, label: 'Bonuses' },
  { to: '/houses', icon: Home, label: 'Houses' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/search', icon: Search, label: 'Search' },
];

const studentLinks = [
  { to: '/portal', icon: LayoutDashboard, label: 'My Portal' },
  { to: '/portal/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/portal/academics', icon: GraduationCap, label: 'Academics' },
  { to: '/portal/discipline', icon: Shield, label: 'Discipline' },
  { to: '/portal/report', icon: FileText, label: 'Report' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, isStaff } = useAuth();
  const { dark, toggle } = useTheme();
  const links = isStaff ? staffLinks : studentLinks;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} aria-hidden />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-primary-600">EduTrack</h1>
          <p className="text-xs text-slate-500 mt-0.5">Smart Performance ERP</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button type="button" onClick={toggle} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="px-3 py-2 text-sm">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
          <button type="button" onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
