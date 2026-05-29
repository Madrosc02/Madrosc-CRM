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
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col p-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold">📊</span>
        </div>
        <div>
          <h1 className="font-bold text-lg">CRM Pro</h1>
          <p className="text-xs text-slate-400">SJS Pharma</p>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="mb-10">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
          TODAY&apos;S PERFORMANCE
        </p>
        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-sm">Calls Made</p>
            <p className="text-3xl font-bold text-white">24</p>
            <p className="text-xs text-green-400">↑ +17%</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Conversion</p>
            <p className="text-3xl font-bold text-white">18%</p>
            <p className="text-xs text-green-400">↑ +5%</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-3 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-800 text-slate-300'
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
