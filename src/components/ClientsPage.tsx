import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import CustomerTable from './CustomerTable';
import FadeIn from './ui/FadeIn';
import StatCard from './analytics/StatCard';

const ClientsPage: React.FC = () => {
    const { customers, openAddCustomerModal, openBulkImportModal, deleteAllCustomers } = useApp();

    const kpis = useMemo(() => {
        const active = customers.filter(c => c.salesThisMonth > 0).length;
        const highRisk = customers.filter(c => c.outstandingBalance > 0 && c.salesThisMonth === 0).length;
        const platinum = customers.filter(c => c.tier === 'Platinum').length;

        return {
            total: customers.length,
            active,
            highRisk,
            platinum
        };
    }, [customers]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Client Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        View and manage your entire customer database
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            if(window.confirm('Are you sure you want to delete ALL clients? This action cannot be undone.')) {
                                deleteAllCustomers();
                            }
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 border border-red-200 dark:border-red-900/50 shadow-sm text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        <i className="fas fa-trash-alt mr-2"></i>
                        Delete All
                    </button>
                    <button 
                        onClick={openBulkImportModal}
                        className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors"
                    >
                        <i className="fas fa-file-import mr-2 text-slate-400"></i>
                        Bulk Import
                    </button>
                    <button 
                        onClick={openAddCustomerModal}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                        <i className="fas fa-user-plus mr-2"></i>
                        Add Customer
                    </button>
                </div>
            </div>

            {/* KPI Summary Strip */}
            <FadeIn>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon="fa-users"
                        label="Total Clients"
                        value={kpis.total}
                        gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                    <StatCard
                        icon="fa-bolt"
                        label="Active This Month"
                        value={kpis.active}
                        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                    />
                    <StatCard
                        icon="fa-exclamation-triangle"
                        label="High Risk Clients"
                        value={kpis.highRisk}
                        gradient="bg-gradient-to-br from-rose-500 to-pink-600"
                    />
                    <StatCard
                        icon="fa-star"
                        label="Platinum Clients"
                        value={kpis.platinum}
                        gradient="bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800"
                    />
                </div>
            </FadeIn>

            {/* Data Grid */}
            <FadeIn>
                <CustomerTable />
            </FadeIn>
        </div>
    );
};

export default ClientsPage;
