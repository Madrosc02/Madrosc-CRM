import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';

const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { openAddCustomerModal, openBulkImportModal, openCommandPalette, currentView, setCurrentView } = useApp();

    const getButtonClass = (view: 'dashboard' | 'analytics') => {
        return currentView === view
            ? 'bg-primary-light dark:bg-primary-dark text-white shadow-sm'
            : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-black/5 dark:hover:bg-white/10';
    };

    const btnSecondaryClass = "flex items-center px-4 py-2 font-medium border border-border-light dark:border-border-dark rounded-md bg-card-bg-light dark:bg-card-bg-dark text-text-primary-light dark:text-text-primary-dark transition-colors hover:bg-gray-50 dark:hover:bg-white/10";

    return (
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-border-light dark:border-border-dark p-3 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <i className="fas fa-headset text-2xl text-primary-light dark:text-primary-dark"></i>
                    <h1 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark hidden sm:block">ClientConnect</h1>
                </div>

                {/* View Switcher */}
                <div className="flex items-center bg-gray-100 dark:bg-black/20 p-1 rounded-lg">
                    <button onClick={() => setCurrentView('dashboard')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 ${getButtonClass('dashboard')}`}>
                        <i className="fas fa-tachometer-alt mr-2 opacity-80"></i>Dashboard
                    </button>
                    <button onClick={() => setCurrentView('analytics')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 ${getButtonClass('analytics')}`}>
                        <i className="fas fa-chart-pie mr-2 opacity-80"></i>Analytics
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={openCommandPalette}
                    className="w-40 sm:w-56 text-left text-text-secondary-light dark:text-text-secondary-dark bg-gray-100 dark:bg-black/20 px-3 py-1.5 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-black/30 transition-colors"
                >
                    <i className="fas fa-search mr-2 opacity-60"></i>
                    Search...
                    <kbd className="hidden sm:inline-block float-right bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded text-xs">Ctrl+K</kbd>
                </button>

                <button onClick={openAddCustomerModal} className={`${btnSecondaryClass} hidden md:flex`}>
                    <i className="fas fa-plus mr-2"></i>Add Client
                </button>

                <button onClick={openBulkImportModal} className={`${btnSecondaryClass} hidden md:flex`}>
                    <i className="fas fa-upload mr-2"></i>Bulk Import
                </button>

                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark bg-gray-100 dark:bg-black/20 rounded-full hover:bg-gray-200 dark:hover:bg-black/30"
                    aria-label="Toggle theme"
                >
                    <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                </button>
            </div>
        </header>
    );
};

export default Header;