// components/analytics/AnalyticsFilters.tsx
import React from 'react';
import { useApp } from '../../contexts/AppContext';

const AnalyticsFilters: React.FC = () => {
    const { customers, analyticsFilters, setAnalyticsFilters } = useApp();

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAnalyticsFilters(prev => ({
            ...prev,
            dateRange: { ...prev.dateRange, [name]: value }
        }));
    };
    
    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAnalyticsFilters(prev => ({
            ...prev,
            selectedCustomer: e.target.value
        }));
    };

    return (
        <div className="flex items-center gap-3 whitespace-nowrap">
            {/* From Date */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 ring-indigo-100 transition-shadow">
                <i className="far fa-calendar text-indigo-400 mr-2 text-[13px]"></i>
                <label htmlFor="start" className="text-[13px] font-medium text-slate-500 mr-1.5">From:</label>
                <input
                    type="date"
                    id="start"
                    name="start"
                    value={analyticsFilters.dateRange.start}
                    onChange={handleDateChange}
                    onClick={(e) => {
                        try {
                            if ('showPicker' in HTMLInputElement.prototype) {
                                e.currentTarget.showPicker();
                            }
                        } catch (err) {}
                    }}
                    className="text-[13px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer flex-1"
                />
            </div>

            {/* To Date */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 ring-indigo-100 transition-shadow">
                <i className="far fa-calendar text-indigo-400 mr-2 text-[13px]"></i>
                <label htmlFor="end" className="text-[13px] font-medium text-slate-500 mr-1.5">To:</label>
                <input
                    type="date"
                    id="end"
                    name="end"
                    value={analyticsFilters.dateRange.end}
                    onChange={handleDateChange}
                    onClick={(e) => {
                        try {
                            if ('showPicker' in HTMLInputElement.prototype) {
                                e.currentTarget.showPicker();
                            }
                        } catch (err) {}
                    }}
                    className="text-[13px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer flex-1"
                />
            </div>

            {/* Client Select */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 ring-indigo-100 transition-shadow">
                <label htmlFor="customer" className="text-[13px] font-medium text-slate-500 mr-1.5">Client:</label>
                <select
                    id="customer"
                    name="customer"
                    value={analyticsFilters.selectedCustomer}
                    onChange={handleCustomerChange}
                    className="text-[13px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer appearance-none pr-5 relative z-10"
                >
                    <option value="all">All Customers</option>
                    {customers.sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <i className="fas fa-chevron-down text-[10px] text-slate-400 -ml-4 z-0"></i>
            </div>
        </div>
    );
};

export default AnalyticsFilters;