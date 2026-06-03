import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Calendar, LogOut, Moon, Sun, Phone, Users, Package, FileText, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export function Sidebar() {
  const { signOut, userRole } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Call Mode', path: '/call-mode', icon: Phone },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Reports', path: '/reports', icon: FileText },
    ...(userRole === 'admin' ? [{ name: 'Settings', path: '/settings', icon: Settings }] : []),
    ...(userRole === 'admin' ? [{ name: 'Admin Panel', path: '/admin', icon: Shield }] : []),
  ];

  return (
    <div className="w-[240px] bg-[#0f172a] text-white h-screen flex flex-col p-4 shrink-0 relative">
      {/* Sidebar Edge Collapse Toggle */}
      <button className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10 hidden lg:flex">
        <i className="fas fa-chevron-left text-[10px]"></i>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fas fa-chart-line text-sm"></i>
        </div>
        <div>
          <h1 className="font-bold text-[15px] leading-tight">CRM Pro</h1>
          <p className="text-[10px] text-slate-400 font-medium">SJS Pharma</p>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="mb-6 bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          TODAY'S PERFORMANCE
        </p>
        <div className="space-y-3.5">
          <div>
            <p className="text-slate-400 text-[10px] font-medium mb-0.5">Calls Made</p>
            <div className="flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-white leading-none">24</p>
                <p className="text-[10px] font-bold text-indigo-400 flex items-center"><i className="fas fa-arrow-up mr-0.5 text-[8px]"></i>+17%</p>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-medium mb-0.5">Conversion</p>
            <div className="flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-white leading-none">18%</p>
                <p className="text-[10px] font-bold text-indigo-400 flex items-center"><i className="fas fa-arrow-up mr-0.5 text-[8px]"></i>+5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-500/90 text-white shadow-md shadow-indigo-500/20'
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span className="text-[13px] font-semibold">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Options */}
      <div className="space-y-1 border-t border-slate-800 pt-3">
        <div 
          onClick={toggleTheme}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-400 hover:text-white transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span className="text-[13px] font-medium">Theme Mode</span>
        </div>
        <div
          onClick={signOut}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[13px] font-medium">Sign Out</span>
        </div>
      </div>
    </div>
  );
}
