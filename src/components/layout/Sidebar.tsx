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
        <aside className="fixed left-0 top-0 bottom-0 z-50 flex flex-col w-[260px] bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-3 font-bold text-2xl text-slate-800 dark:text-white">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-teal-300 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                        <i className="fas fa-plus text-sm"></i>
                    </div>
                    <span className="tracking-tight">CRM Pro</span>
                </div>
            </div>

            {/* Performance Stats Box */}
            <div className="px-4 py-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Today's Performance</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                            <span className="block text-xl font-bold text-slate-700 dark:text-white">42</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Calls Made</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 text-center">
                            <span className="block text-xl font-bold text-teal-600 dark:text-teal-400">12%</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Conversion</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                            ${isActive
                                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                            }
                        `}
                    >
                        <i className={`
                            fas ${item.icon} w-6 text-center text-lg transition-colors
                            ${({ isActive }: { isActive: boolean }) => isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}
                        `}></i>
                        <span className="ml-3">{item.label}</span>

                        {/* Active Pill Indicator */}
                        <div className={`
                            ml-auto w-2 h-2 rounded-full bg-teal-500 shadow-sm shadow-teal-500/50
                            transition-all duration-300
                            ${({ isActive }: { isActive: boolean }) => isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                        `}></div>
                    </NavLink>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                    <div className={`
                        w-8 h-8 rounded-md flex items-center justify-center transition-colors mr-3
                        ${theme === 'light' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}
                    `}>
                        <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                    </div>
                    <span className="font-medium text-sm">Theme Mode</span>
                </button>

                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 group-hover:text-red-600 transition-colors mr-3">
                        <i className="fas fa-sign-out-alt"></i>
                    </div>
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
