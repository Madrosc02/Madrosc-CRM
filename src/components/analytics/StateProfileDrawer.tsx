import React, { useMemo } from 'react';
import { Customer } from '../../types';

interface StateProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    stateName: string | null;
    customers: Customer[];
}

const StateProfileDrawer: React.FC<StateProfileDrawerProps> = ({ isOpen, onClose, stateName, customers }) => {
    
    const metrics = useMemo(() => {
        let revenue = 0;
        let prevRevenue = 0;
        customers.forEach(c => {
            revenue += c.salesThisMonth || 0;
            prevRevenue += c.avg6MoSales || 0;
        });
        const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
        const aov = customers.length > 0 ? revenue / customers.length : 0;
        return { revenue, growth, aov, count: customers.length };
    }, [customers]);

    const topCustomers = useMemo(() => {
        return [...customers].sort((a, b) => (b.salesThisMonth || 0) - (a.salesThisMonth || 0)).slice(0, 10);
    }, [customers]);

    if (!isOpen || !stateName) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
                <div className="w-full h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300">
                    
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-900/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <i className="fas fa-map-marked-alt text-lg"></i>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{stateName}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">State Profile</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
                                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                        ₹{(metrics.revenue / 1000).toFixed(1)}k
                                    </div>
                                    <div className={`text-xs mt-1 font-medium ${metrics.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {metrics.growth > 0 ? '+' : ''}{metrics.growth.toFixed(1)}% vs Avg
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Customers</p>
                                    <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                        {metrics.count}
                                    </div>
                                    <div className="text-xs mt-1 text-slate-500 font-medium">
                                        Active this month
                                    </div>
                                </div>
                                <div className="col-span-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Avg Order Value</p>
                                        <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                            ₹{Math.round(metrics.aov).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <i className="fas fa-shopping-cart text-indigo-500"></i>
                                    </div>
                                </div>
                            </div>

                            {/* Top Customers */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider">Top Customers</h3>
                                <div className="space-y-2 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                                    {topCustomers.map((c, i) => (
                                        <div key={c.id} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">
                                                    {i + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{c.firmName}</p>
                                                    <p className="text-xs text-slate-500 truncate">{c.district}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-2">
                                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                    ₹{((c.salesThisMonth || 0) / 1000).toFixed(1)}k
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {topCustomers.length === 0 && (
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            No customer data available.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StateProfileDrawer;
