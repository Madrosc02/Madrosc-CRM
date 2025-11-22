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
            className={`h-screen sticky top-0 flex flex-col bg-white dark:bg-[var(--color-surface-dark)] border-r border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]">
                {!isCollapsed && (
                    <div className="flex items-center gap-2 font-bold text-xl text-[var(--color-primary)]">
                        <i className="fas fa-headset"></i>
                        <span>CRM</span>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]"
                >
                    <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center px-3 py-3 rounded-md transition-colors group
                            ${isActive
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[var(--color-primary)]'
                            }
                        `}
                        title={isCollapsed ? item.label : ''}
                    >
                        <i className={`fas ${item.icon} w-6 text-center text-lg ${isCollapsed ? 'mx-auto' : 'mr-3'}`}></i>
                        {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] space-y-2">
                <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    title="Toggle Theme"
                >
                    <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} w-6 text-center ${isCollapsed ? '' : 'mr-3'}`}></i>
                    {!isCollapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
                </button>

                <button
                    onClick={handleSignOut}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    title="Sign Out"
                >
                    <i className={`fas fa-sign-out-alt w-6 text-center ${isCollapsed ? '' : 'mr-3'}`}></i>
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
