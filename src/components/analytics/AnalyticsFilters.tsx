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
        <div className="flex items-center gap-2 whitespace-nowrap">
            {/* From Date */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:ring-2 ring-indigo-100 transition-shadow">
                <i className="far fa-calendar text-indigo-400 mr-1.5 text-[12px]"></i>
                <label htmlFor="start" className="text-[12px] font-medium text-slate-500 mr-1.5">From:</label>
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
                    className="text-[12px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer flex-1"
                />
            </div>

            {/* To Date */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:ring-2 ring-indigo-100 transition-shadow">
                <i className="far fa-calendar text-indigo-400 mr-1.5 text-[12px]"></i>
                <label htmlFor="end" className="text-[12px] font-medium text-slate-500 mr-1.5">To:</label>
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
                    className="text-[12px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer flex-1"
                />
            </div>

            {/* Client Select */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:ring-2 ring-indigo-100 transition-shadow">
                <label htmlFor="customer" className="text-[12px] font-medium text-slate-500 mr-1.5">Client:</label>
                <select
                    id="customer"
                    name="customer"
                    value={analyticsFilters.selectedCustomer}
                    onChange={handleCustomerChange}
                    className="text-[12px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer appearance-none pr-4 relative z-10"
                >
                    <option value="all">All Customers</option>
                    {customers.sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <i className="fas fa-chevron-down text-[10px] text-slate-400 -ml-3 z-0"></i>
            </div>
        </div>
    );
};

export default AnalyticsFilters;