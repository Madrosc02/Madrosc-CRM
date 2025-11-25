import React from 'react';

const ReportsPage: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Reports</h1>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <i className="fas fa-chart-bar text-2xl"></i>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Reports Module</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">This page is currently under construction.</p>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
