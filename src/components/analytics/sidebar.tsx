import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Calendar, LogOut, Moon, Phone, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const { signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Call Mode', path: '/call-mode', icon: Phone },
    { name: 'Clients', path: '/clients', icon: Users },
  ];

  return (
    <div className="w-[280px] bg-[#0f172a] text-white h-screen flex flex-col p-6 shrink-0 relative">
      {/* Sidebar Edge Collapse Toggle */}
      <button className="absolute -right-3 top-24 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10 hidden lg:flex">
        <i className="fas fa-chevron-left text-[10px]"></i>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fas fa-chart-line text-lg"></i>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">CRM Pro</h1>
          <p className="text-[11px] text-slate-400 font-medium">SJS Pharma</p>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="mb-8 bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          TODAY'S PERFORMANCE
        </p>
        <div className="space-y-5">
          <div>
            <p className="text-slate-400 text-[11px] font-medium mb-1">Calls Made</p>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-white leading-none">24</p>
                <p className="text-[11px] font-bold text-indigo-400 flex items-center"><i className="fas fa-arrow-up mr-0.5 text-[9px]"></i>+17%</p>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-[11px] font-medium mb-1">Conversion</p>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-white leading-none">18%</p>
                <p className="text-[11px] font-bold text-indigo-400 flex items-center"><i className="fas fa-arrow-up mr-0.5 text-[9px]"></i>+5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/20'
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-semibold">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Options */}
      <div className="space-y-3 border-t border-slate-700 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 cursor-pointer text-slate-300">
          <Moon className="w-5 h-5" />
          <span className="text-sm">Theme Mode</span>
        </div>
        <div
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 cursor-pointer text-slate-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sign Out</span>
        </div>
      </div>
    </div>
  );
}
