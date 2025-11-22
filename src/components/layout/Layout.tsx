import React from 'react';
import Sidebar from './Sidebar';
import { useApp } from '../../contexts/AppContext';

const Topbar: React.FC = () => {
    const { openCommandPalette, openAddCustomerModal, openBulkImportModal } = useApp();

    return (
        <header className="h-16 bg-white/80 dark:bg-[var(--color-surface-dark)]/80 backdrop-blur-md border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
            <div className="flex items-center flex-1">
                <button
                    onClick={openCommandPalette}
                    className="w-full max-w-md flex items-center text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                    <i className="fas fa-search mr-3 opacity-60"></i>
                    <span>Search clients, tasks, or actions...</span>
                    <kbd className="hidden sm:inline-block ml-auto bg-white dark:bg-black/20 px-2 py-0.5 rounded text-xs border border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]">Ctrl+K</kbd>
                </button>
            </div>
            <div className="flex items-center gap-3 ml-4">
                <button onClick={openAddCustomerModal} className="btn-primary flex items-center text-sm">
                    <i className="fas fa-plus mr-2"></i>
                    <span className="hidden sm:inline">Add Client</span>
                </button>
                <button onClick={openBulkImportModal} className="btn-secondary flex items-center text-sm">
                    <i className="fas fa-upload mr-2"></i>
                    <span className="hidden sm:inline">Import</span>
                </button>
            </div>
        </header>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { openCommandPalette } = useApp();

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openCommandPalette();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openCommandPalette]);

    return (
        <div className="flex min-h-screen bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] transition-colors duration-300 font-sans text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
