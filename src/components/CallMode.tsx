import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import GlassCard from './common/GlassCard';

import { LocationInsights } from './LocationInsights';
import { CustomerRemarks } from './customer/CustomerRemarks';


const CallMode: React.FC = () => {
    const { customers, remarks, openAddTaskModal, openDetailModal } = useApp();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string>('All');
    const [showAICallPrep, setShowAICallPrep] = useState(false);



    const filteredCustomers = useMemo(() => {
        if (selectedTier === 'All') return customers;
        return customers.filter(c => c.tier === selectedTier);
    }, [customers, selectedTier]);

    const currentCustomer = filteredCustomers[currentIndex];



    // Real Interaction History from Context
    const customerRemarks = useMemo(() => {
        if (!currentCustomer) return [];
        return remarks
            .filter(r => r.customerId === currentCustomer.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [remarks, currentCustomer]);

    // Sales for current customer (needed for WinProbability)


    // --- Handlers ---
    const handleNext = () => {
        if (currentIndex < filteredCustomers.length - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setIsAnimating(false);
            }, 300);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex(prev => prev - 1);
                setIsAnimating(false);
            }, 300);
        }
    };

    const handleExit = () => {
        navigate('/');
    };

    const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTier(e.target.value);
        setCurrentIndex(0);
    };

    const handleCreateTask = () => {
        if (currentCustomer) {
            openAddTaskModal({
                customerId: currentCustomer.id,
                task: '',
                dueDate: new Date().toISOString().slice(0, 16) // Current time for datetime-local
            });
        }
    };

    const handleWhatsApp = () => {
        if (currentCustomer?.phone) {
            const cleanPhone = currentCustomer.phone.replace(/\D/g, '');
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        }
    };

    const handleCallNow = () => {
        if (currentCustomer?.phone) {
            window.location.href = `tel:${currentCustomer.phone}`;
        }
    };

    const handleViewCustomerDetails = () => {
        if (currentCustomer) {
            openDetailModal(currentCustomer, 'overview');
        }
    };

    const onRemarkAdded = () => {
        // Context updates automatically
        console.log("Remark added in Call Mode");
    };

    // --- Action Button Handlers ---
    const openGoals = () => currentCustomer && openDetailModal(currentCustomer, 'goals');
    const openSalesHistory = () => currentCustomer && openDetailModal(currentCustomer, 'sales');
    const openTasks = () => currentCustomer && openDetailModal(currentCustomer, 'tasks');
    const openQuickActions = () => currentCustomer && openDetailModal(currentCustomer, 'actions');


    if (!currentCustomer && filteredCustomers.length > 0) return <div>Loading...</div>;
    if (filteredCustomers.length === 0) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F7FB] text-[#111827]">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">No Customers Found</h2>
                <p className="text-[#6B7280] mb-4">No customers match the selected filter: {selectedTier}</p>
                <button onClick={() => setSelectedTier('All')} className="px-6 py-2 bg-[#00B894] text-white rounded-lg hover:bg-[#008C6E] transition-colors">Reset Filter</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 pb-32 relative overflow-hidden font-sans selection:bg-teal-100 selection:text-teal-900">

            {/* Background Mesh Gradient Effect */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-200/30 rounded-full blur-[120px]"></div>
            </div>

            {/* --- Top Navigation Bar --- */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-md">
                {/* LEFT SECTION */}
                <div className="flex items-center">
                    {/* Back Arrow */}
                    <button onClick={handleExit} className="text-slate-500 hover:text-slate-700 transition-colors mr-4">
                        <i className="fas fa-arrow-left text-lg"></i>
                    </button>

                    {/* Purple Call Icon */}
                    <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white shadow-sm mr-4">
                        <i className="fas fa-phone-alt text-sm"></i>
                    </div>

                    {/* Title Block */}
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">
                            Call Mode
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">
                            Client {currentIndex + 1} of {filteredCustomers.length} • {currentCustomer?.state || 'Bihar'} Territory
                        </p>
                    </div>
                </div>

                {/* CENTER SECTION (Absolutely Centered) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6">
                    <div className="relative group">
                        <i className="fas fa-search text-slate-400 text-lg group-hover:text-slate-600 cursor-pointer transition-colors"></i>
                    </div>
                    <div className="relative group">
                        <i className="fas fa-bell text-slate-400 text-lg group-hover:text-slate-600 cursor-pointer transition-colors"></i>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                    </div>
                    <div className="relative group">
                        <i className="fas fa-filter text-slate-400 text-lg group-hover:text-slate-600 cursor-pointer transition-colors"></i>
                    </div>
                </div>

                {/* RIGHT SECTION */}
                <div className="flex items-center gap-3">
                    {/* All Tiers Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedTier}
                            onChange={handleTierChange}
                            className="appearance-none bg-white border border-slate-200 text-slate-600 py-2 pl-4 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:border-purple-500 cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <option value="All">All Tiers</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Bronze">Bronze</option>
                        </select>
                        <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none"></i>
                    </div>

                    {/* Create Task Button */}
                    <button
                        onClick={handleCreateTask}
                        className="px-4 py-2 border border-purple-200 text-purple-600 bg-white rounded-lg text-sm font-semibold hover:bg-purple-50 transition-all flex items-center gap-2"
                    >
                        <i className="fas fa-plus text-xs"></i> Create Task
                    </button>

                    {/* WhatsApp Button */}
                    <button
                        onClick={handleWhatsApp}
                        className="px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-semibold hover:bg-[#128C7E] transition-all flex items-center gap-2"
                    >
                        <i className="fab fa-whatsapp text-lg"></i> WhatsApp
                    </button>

                    {/* Call Now Button */}
                    <button
                        onClick={handleCallNow}
                        className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
                    >
                        <i className="fas fa-phone-alt"></i> Call Now
                    </button>
                </div>
            </div>


            {/* --- Main Content Area --- */}
            <div className={`container mx-auto px-4 pt-28 pb-24 transition-all duration-500 ease-in-out relative z-10 max-w-7xl ${isAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>

                {/* Top Section: Client Profile (Replaces Header, KPIs, Sales Chart) */}
                {/* Customer Section */}
                <div className="mb-8 w-full rounded-3xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                            <h2 className="text-4xl font-bold mb-3 tracking-tight">{currentCustomer?.name}</h2>
                            <div className="flex items-center gap-4 text-white/90 text-sm font-medium">
                                <div className="flex items-center gap-1.5">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{currentCustomer?.town}, {currentCustomer?.state}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <i className="fas fa-user"></i>
                                    <span>{currentCustomer?.personName || 'No Contact Person'}</span>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-xs font-bold uppercase tracking-wider">
                                    {currentCustomer?.tier}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <p className="text-white/80 text-sm font-medium">
                                Last Interaction: {customerRemarks.length > 0 ? new Date(customerRemarks[0].timestamp).toLocaleDateString() : 'Never'}
                            </p>
                            <div className="flex items-center gap-2">
                                <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm transition-all">
                                    <i className="fas fa-sync-alt text-white"></i>
                                </button>
                                <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm transition-all">
                                    <i className="fas fa-copy text-white"></i>
                                </button>
                                <button onClick={handleCallNow} className="w-10 h-10 rounded-full bg-white text-purple-600 hover:bg-slate-100 flex items-center justify-center shadow-lg transition-all">
                                    <i className="fas fa-phone text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN (7/12): Metrics, Trends & History */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                        {/* 1. Metric Cards Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Outstanding */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-xs">
                                        <i className="fas fa-file-invoice-dollar"></i>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Outstanding</span>
                                </div>
                                <span className="text-xl font-bold text-slate-800">₹{currentCustomer?.outstandingBalance?.toLocaleString() || '0'}</span>
                            </div>

                            {/* YTD Sales */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xs">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider">YTD Sales</span>
                                </div>
                                <span className="text-xl font-bold text-slate-800">₹{currentCustomer?.totalSales?.toLocaleString() || '0'}</span>
                            </div>

                            {/* Last Order */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xs">
                                        <i className="fas fa-history"></i>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Last Order</span>
                                </div>
                                <span className="text-lg font-bold text-slate-800 truncate">{currentCustomer?.lastOrderDate ? new Date(currentCustomer.lastOrderDate).toLocaleDateString() : 'Never'}</span>
                            </div>

                            {/* AI Prediction */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 text-xs">
                                        <i className="fas fa-brain"></i>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider">AI Prediction</span>
                                </div>
                                <span className="text-lg font-bold text-purple-600">VRW</span>
                            </div>
                        </div>

                        {/* 2. Sales Trend Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Sales Trend</h3>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-black text-slate-800">₹127,000</span>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                                            <i className="fas fa-arrow-up text-[10px]"></i> 13% vs last period
                                        </span>
                                    </div>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['1M', '3M', '6M', '1Y'].map((period) => (
                                        <button
                                            key={period}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${period === '6M' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Chart Placeholder */}
                            <div className="h-48 w-full bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-100 relative overflow-hidden flex items-end justify-between px-4 pb-0 group">
                                {/* Fake Chart Bars/Line */}
                                {[30, 45, 35, 60, 50, 75, 65, 80, 70, 90, 85, 100].map((h, i) => (
                                    <div key={i} className="w-[6%] bg-indigo-500/10 rounded-t-md relative group-hover:bg-indigo-500/20 transition-colors" style={{ height: `${h}%` }}>
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 rounded-full"></div>
                                    </div>
                                ))}
                                {/* Overlay Line (SVG) */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" preserveAspectRatio="none">
                                    <path
                                        d="M0,100 C20,80 40,90 60,50 S100,20 120,30 S160,10 200,40 S240,0 280,20 S320,10 360,5"
                                        fill="none"
                                        stroke="#6366F1"
                                        strokeWidth="3"
                                        vectorEffect="non-scaling-stroke"
                                        className="drop-shadow-lg"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* 3. Interaction History (Existing) */}
                        <GlassCard className="h-[400px] flex flex-col overflow-hidden relative">
                            <div className="px-4 py-3 border-b border-teal-200/50 flex justify-between items-center bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 shrink-0 rounded-t-xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
                                        <i className="fas fa-comments text-white text-sm"></i>
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">Interaction History</h3>
                                </div>
                                <button onClick={handleViewCustomerDetails} className="text-xs text-teal-600 font-bold hover:text-teal-700 hover:underline bg-white/60 px-3 py-1.5 rounded-lg transition-all hover:shadow-sm">View Details</button>
                            </div>

                            {/* Reused Remarks Component */}
                            <div className="flex-1 overflow-hidden p-4 custom-scrollbar flex flex-col">
                                <CustomerRemarks
                                    customer={currentCustomer}
                                    remarks={customerRemarks}
                                    onRemarkAdded={onRemarkAdded}
                                    variant="chat"
                                />
                            </div>
                        </GlassCard>
                    </div>

                    {/* RIGHT COLUMN (5/12): Product Mix & Actions */}
                    <div className="lg:col-span-5 flex flex-col gap-4">

                        {/* Customer Actions Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={openGoals} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group text-left">
                                <i className="fas fa-bullseye text-indigo-500 mb-2 text-xl group-hover:scale-110 transition-transform"></i>
                                <p className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">Goals</p>
                            </button>
                            <button onClick={openSalesHistory} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group text-left">
                                <i className="fas fa-history text-emerald-500 mb-2 text-xl group-hover:scale-110 transition-transform"></i>
                                <p className="text-xs font-bold text-slate-600 group-hover:text-emerald-600">Sales History</p>
                            </button>
                            <button onClick={openTasks} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group text-left">
                                <i className="fas fa-tasks text-amber-500 mb-2 text-xl group-hover:scale-110 transition-transform"></i>
                                <p className="text-xs font-bold text-slate-600 group-hover:text-amber-600">Tasks</p>
                            </button>
                            <button onClick={openQuickActions} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group text-left">
                                <i className="fas fa-bolt text-blue-500 mb-2 text-xl group-hover:scale-110 transition-transform"></i>
                                <p className="text-xs font-bold text-slate-600 group-hover:text-blue-600">Quick Actions</p>
                            </button>
                        </div>

                        {/* Location Insights (Weather & News) */}
                        <div className="h-auto">
                            <LocationInsights city={currentCustomer.town || ''} state={currentCustomer.state} />
                        </div>

                        {/* Product Mix - Enhanced Progress Bars */}
                        <GlassCard className="p-5 flex flex-col gap-4 border border-white/60 shadow-xl shadow-slate-200/50">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Product Mix</h3>

                            <div className="space-y-4">
                                {[
                                    { label: 'Antibiotics', value: 45, color: 'from-teal-400 to-teal-600' },
                                    { label: 'Cardio', value: 30, color: 'from-blue-400 to-blue-600' },
                                    { label: 'Pain Mgmt', value: 15, color: 'from-red-400 to-red-600' },
                                    { label: 'Supplements', value: 10, color: 'from-amber-400 to-amber-600' }
                                ].map((item) => (
                                    <div key={item.label} className="group">
                                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                                            <span className="group-hover:text-slate-900 transition-colors">{item.label}</span>
                                            <span className="font-mono">{item.value}%</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${item.color} shadow-sm transition-all duration-1000 ease-out group-hover:brightness-110`}
                                                style={{ width: `${item.value}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        {/* AI Call Prep Trigger (Small Card) */}
                        <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all group cursor-pointer hover:scale-[1.02] border border-purple-200/50" onClick={() => setShowAICallPrep(true)}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                    <i className="fas fa-robot text-xl text-white"></i>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase tracking-wider text-purple-600 font-black mb-1 block">AI Assistant</span>
                                    <span className="text-sm font-bold text-purple-900">View Call Prep & Insights</span>
                                </div>
                                <div className="ml-auto">
                                    <span className="text-xs font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full">OPEN</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- Bottom Floating Dock Navigation --- */}
                <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
                    <div className="bg-[#111827]/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-full px-2 py-2 flex items-center gap-4 pointer-events-auto transform transition-all hover:scale-[1.02] duration-300 max-w-[90vw]">

                        {/* Previous Button */}
                        <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all group"
                            title="Previous Customer"
                        >
                            <i className="fas fa-arrow-left text-lg group-hover:-translate-x-1 transition-transform"></i>
                        </button>

                        {/* Progress Indicator */}
                        <div className="flex flex-col items-center px-4 border-x border-white/10 min-w-[140px]">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Customer</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-white font-mono">{currentIndex + 1}</span>
                                <span className="text-xs text-slate-500 font-medium">/ {filteredCustomers.length}</span>
                            </div>
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={handleNext}
                            disabled={currentIndex === filteredCustomers.length - 1}
                            className="h-12 px-6 rounded-full bg-gradient-to-r from-[#00B894] to-[#00D4AA] text-white font-bold shadow-lg shadow-[#00B894]/20 hover:shadow-[#00B894]/40 hover:brightness-110 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-2 group relative overflow-hidden"
                        >
                            <span className="relative z-10">Next</span>
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform relative z-10">
                                <i className="fas fa-chevron-right text-xs"></i>
                            </div>

                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                        </button>
                    </div>
                </div>

                {/* Spacer to prevent content overlap */}
                <div className="h-32 w-full"></div>

                {/* AI Call Prep Modal */}
                {
                    showAICallPrep && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAICallPrep(false)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                                <i className="fas fa-sparkles text-xl"></i>
                                            </div>
                                            <h2 className="text-2xl font-bold">AI Call Prep</h2>
                                        </div>
                                        <button
                                            onClick={() => setShowAICallPrep(false)}
                                            className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
                                        >
                                            <i className="fas fa-times text-xl"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Talking Point */}
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0">
                                                <i className="fas fa-lightbulb text-lg"></i>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-amber-900 mb-2">Talking Point</h3>
                                                <p className="text-amber-800 leading-relaxed">
                                                    Sales dropped 15% vs last year. Ask about <strong>Amoxyclav</strong> stock.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Opportunity */}
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
                                                <i className="fas fa-chart-line text-lg"></i>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-emerald-900 mb-2">Opportunity</h3>
                                                <p className="text-emerald-800 leading-relaxed">
                                                    Customer has high potential for upselling in the Cardio segment based on previous purchase patterns.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <i className="fas fa-trophy text-blue-600"></i>
                                                <p className="text-xs font-bold text-blue-900 uppercase">Win Probability</p>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-700">78%</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <i className="fas fa-clock text-purple-600"></i>
                                                <p className="text-xs font-bold text-purple-900 uppercase">Best Time</p>
                                            </div>
                                            <p className="text-2xl font-bold text-purple-700">10-11 AM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default CallMode;
