import React from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AIChatAssistant from '../ai/AIChatAssistant';

const Topbar: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="h-16 bg-white dark:bg-[var(--color-surface-dark)] border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] flex items-center justify-between px-6 sticky top-0 z-20">
            {/* Search / Command Palette Trigger */}
            <div className="flex-1 max-w-xl">
                <button className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center">
                    <i className="fas fa-search mr-3"></i>
                    <span className="flex-1">Search customers, deals, or commands...</span>
                    <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-gray-500 bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded shadow-sm">Ctrl K</kbd>
                </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-4">
                <button className="btn-primary text-sm flex items-center">
                    <i className="fas fa-plus mr-2"></i> <span className="hidden sm:inline">Add Client</span>
                </button>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                        {user?.email?.substring(0, 2).toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)] overflow-hidden font-sans transition-colors duration-200">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 relative">
                    {children}
                </main>
            </div>
            <AIChatAssistant />
        </div>
    );
};

export default Layout;
