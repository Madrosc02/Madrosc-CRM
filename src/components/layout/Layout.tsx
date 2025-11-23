import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import AIChatAssistant from '../ai/AIChatAssistant';

const Topbar: React.FC = () => {
    const { user } = useAuth();
    const { searchQuery, setSearchQuery, openAddCustomerModal } = useApp();

    return (
        <div className="h-16 bg-white dark:bg-[var(--color-surface-dark)] border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] flex items-center justify-between px-6 sticky top-0 z-20">
            {/* Search Input */}
            <div className="flex-1 max-w-xl relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search customers, deals, or commands..."
                    className="w-full pl-11 pr-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-4">
                <button onClick={openAddCustomerModal} className="btn-primary text-sm flex items-center">
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
