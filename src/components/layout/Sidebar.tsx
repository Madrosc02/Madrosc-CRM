import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'fa-tachometer-alt' },
        { path: '/analytics', label: 'Analytics', icon: 'fa-chart-pie' },
        // { path: '/customers', label: 'Customers', icon: 'fa-users' }, // Future route
        // { path: '/settings', label: 'Settings', icon: 'fa-cog' }, // Future route
    ];

    return (
        <aside
            className={`
                fixed left-4 top-4 bottom-4 z-50 flex flex-col 
                glass-sidebar rounded-2xl transition-all duration-500 ease-in-out
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-between px-6 mb-2">
                {!isCollapsed && (
                    <div className="flex items-center gap-3 font-bold text-2xl text-gradient-primary">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-teal-300 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                            <i className="fas fa-plus text-sm"></i>
                        </div>
                        <span className="tracking-tight">MedCRM</span>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className={`
                        p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 
                        text-slate-400 hover:text-teal-600 transition-all
                        ${isCollapsed ? 'mx-auto' : ''}
                    `}
                >
                    <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                            ${isActive
                                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 translate-x-1'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-teal-600 dark:hover:text-teal-400'
                            }
                        `}
                        title={isCollapsed ? item.label : ''}
                    >
                        <i className={`
                            fas ${item.icon} text-lg transition-all duration-300
                            ${isCollapsed ? 'mx-auto' : 'mr-4'}
                            ${!isCollapsed && 'group-hover:scale-110'}
                        `}></i>

                        {!isCollapsed && (
                            <span className="font-semibold tracking-wide">{item.label}</span>
                        )}

                        {/* Active Indicator Dot */}
                        {!isCollapsed && (
                            <div className={`
                                absolute right-3 w-1.5 h-1.5 rounded-full bg-white/80
                                transition-all duration-300
                                ${({ isActive }: { isActive: boolean }) => isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                            `}></div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 mt-auto space-y-3">
                <button
                    onClick={toggleTheme}
                    className={`
                        w-full flex items-center px-4 py-3 rounded-xl 
                        text-slate-500 dark:text-slate-400 
                        hover:bg-slate-50 dark:hover:bg-slate-800/50 
                        transition-all duration-300
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title="Toggle Theme"
                >
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                        ${theme === 'light' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}
                        ${isCollapsed ? '' : 'mr-3'}
                    `}>
                        <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                    </div>
                    {!isCollapsed && <span className="font-medium text-sm">Theme Mode</span>}
                </button>

                <button
                    onClick={handleSignOut}
                    className={`
                        w-full flex items-center px-4 py-3 rounded-xl 
                        text-slate-500 dark:text-slate-400 
                        hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 
                        transition-all duration-300 group
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title="Sign Out"
                >
                    <div className={`
                        w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center 
                        group-hover:bg-red-100 dark:group-hover:bg-red-900/30 group-hover:text-red-600 transition-colors
                        ${isCollapsed ? '' : 'mr-3'}
                    `}>
                        <i className="fas fa-sign-out-alt"></i>
                    </div>
                    {!isCollapsed && <span className="font-medium text-sm">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;

