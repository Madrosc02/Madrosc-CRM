import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar: React.FC = () => {
    const { signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'fa-tachometer-alt' },
        { path: '/analytics', label: 'Analytics', icon: 'fa-chart-pie' },
        { path: '/call-mode', label: 'Call Mode', icon: 'fa-headset' },
        { path: '/clients', label: 'Clients', icon: 'fa-users' },
        { path: '/reports', label: 'Reports', icon: 'fa-file-alt' },
        { path: '/settings', label: 'Settings', icon: 'fa-cog' },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 z-50 flex flex-col w-[260px] bg-white dark:bg-slate-900 rounded-r-3xl shadow-xl transition-all duration-300">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-8">
                <div className="flex items-center gap-3 font-bold text-2xl text-slate-800 dark:text-white">
                    <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                        <i className="fas fa-check text-sm"></i>
                    </div>
                    <span className="tracking-tight">CRM Pro</span>
                </div>
            </div>

            {/* Performance Stats Box */}
            <div className="px-6 py-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today's Performance</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                        <span className="block text-lg font-bold text-slate-700 dark:text-white">42</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Calls Made</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                        <span className="block text-lg font-bold text-teal-600 dark:text-teal-400">12%</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Conversion</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center px-4 py-3 rounded-xl transition-all duration-200
                            ${isActive
                                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 font-semibold'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                            }
                        `}
                    >
                        <i className={`fas ${item.icon} w-6 text-center text-lg`}></i>
                        <span className="ml-3 text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-6 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} w-6 text-center text-lg`}></i>
                    <span className="ml-3 text-sm font-medium">Theme Mode</span>
                </button>

                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors"
                >
                    <i className="fas fa-sign-out-alt w-6 text-center text-lg"></i>
                    <span className="ml-3 text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
