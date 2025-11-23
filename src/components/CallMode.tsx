import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import GlassCard from './common/GlassCard';
import { Customer, Remark } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CustomerRemarks } from './customer/CustomerRemarks';
import { WinProbability } from './customer/CustomerOverview';

const CallMode: React.FC = () => {
    const { customers, remarks, sales, addRemark, openAddTaskModal, openDetailModal, updateCustomerFlag } = useApp();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string>('All');

    // --- Metrics & Data Preparation ---
    const metrics = useMemo(() => {
        const now = new Date();
        const fifteenDaysAgo = new Date(now.setDate(now.getDate() - 15));
        return {
            all: customers.length,
            pendingOrders: customers.filter(c => c.salesThisMonth === 0 && c.tier !== 'Dead').length,
            lowPerformers: customers.filter(c => c.tier === 'Bronze' || c.avg6MoSales < 5000).length,
            silentAccounts: customers.filter(c => {
                const lastOrderDate = c.lastOrderDate ? new Date(c.lastOrderDate) : new Date(0);
                const lastUpdatedDate = c.lastUpdated ? new Date(c.lastUpdated) : new Date(0);
                return lastOrderDate < fifteenDaysAgo && lastUpdatedDate < fifteenDaysAgo;
            }).length
        };
    }, [customers]);

    const filteredCustomers = useMemo(() => {
        if (selectedTier === 'All') return customers;
        return customers.filter(c => c.tier === selectedTier);
    }, [customers, selectedTier]);

    const currentCustomer = filteredCustomers[currentIndex];

    // Mock Data for 6-Month Sales Chart (since backend doesn't provide history yet)
    const salesData = useMemo(() => {
        if (!currentCustomer) return [];
        const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
        return months.map((month, i) => ({
            name: month,
            sales: Math.floor(Math.random() * (currentCustomer.avg6MoSales * 1.5)) + 1000,
        }));
    }, [currentCustomer]);

    // Real Interaction History from Context
    const customerRemarks = useMemo(() => {
        if (!currentCustomer) return [];
        return remarks
            .filter(r => r.customerId === currentCustomer.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [remarks, currentCustomer]);

    // Sales for current customer (needed for WinProbability)
    const customerSales = useMemo(() => {
        if (!currentCustomer) return [];
        return sales.filter(s => s.customerId === currentCustomer.id);
    }, [sales, currentCustomer]);

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

    const handleFlagChange = async (flag: 'Green' | 'Red') => {
        if (!currentCustomer) return;
        try {
            const newFlag = currentCustomer.flag === flag ? null : flag; // Toggle off if same
            await updateCustomerFlag(currentCustomer.id, newFlag);
        } catch (error) {
            console.error("Failed to update flag", error);
        }
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
        <div className="min-h-screen bg-[#F4F7FB] text-[#111827] pb-24 relative overflow-hidden font-sans">

            {/* --- Top Navigation Bar --- */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#E1E7F0] px-6 py-3 flex justify-between items-center shadow-sm transition-all duration-300">
                <div className="flex items-center gap-6">
                    <button onClick={handleExit} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-[#6B7280] hover:text-[#00B894]">
                        <i className="fas fa-arrow-left text-xl"></i>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight flex items-center gap-2 text-[#111827]">
                            <i className="fas fa-headset text-[#00B894]"></i> Call Mode
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                            <span>{currentIndex + 1} / {filteredCustomers.length}</span>
                            <div className="h-1.5 w-24 bg-[#E1E7F0] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#00B894] transition-all duration-500 ease-out"
                                    style={{ width: `${((currentIndex + 1) / filteredCustomers.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Smart Filter */}
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <select
                            value={selectedTier}
                            onChange={handleTierChange}
                            className="appearance-none bg-slate-100 border border-[#E1E7F0] text-[#111827] py-2 pl-4 pr-10 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#00B894] cursor-pointer transition-all hover:border-[#00B894]"
                        >
                            <option value="All">All Tiers</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Bronze">Bronze</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280] group-hover:text-[#00B894] transition-colors">
                            <i className="fas fa-filter text-xs"></i>
                        </div>
                    </div>
                </div>

                {/* Top Actions */}
                <div className="flex items-center gap-3">
                    {/* Flag Toggles */}
                    <div className="flex items-center gap-1 mr-4 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => handleFlagChange('Green')}
                            className={`p-2 rounded-md transition-all ${currentCustomer.flag === 'Green' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-400 hover:text-green-500'}`}
                            title="Mark as Safe/Good"
                        >
                            <i className="fas fa-flag"></i>
                        </button>
                        <button
                            onClick={() => handleFlagChange('Red')}
                            className={`p-2 rounded-md transition-all ${currentCustomer.flag === 'Red' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-red-500'}`}
                            title="Raise Red Flag"
                        >
                            <i className="fas fa-flag"></i>
                        </button>
                    </div>

                    <button
                        onClick={handleCreateTask}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#4C6FFF]/10 text-[#4C6FFF] rounded-lg font-semibold hover:bg-[#4C6FFF]/20 transition-all border border-[#4C6FFF]/20"
                    >
                        <i className="fas fa-check-circle"></i> Create Task
                    </button>
                    <button
                        onClick={handleWhatsApp}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#16A34A]/10 text-[#16A34A] rounded-lg font-semibold hover:bg-[#16A34A]/20 transition-all border border-[#16A34A]/20"
                    >
                        <i className="fab fa-whatsapp text-lg"></i> WhatsApp
                    </button>
                    <button
                        onClick={handleCallNow}
                        className="flex items-center gap-2 px-5 py-2 bg-[#00B894] text-white rounded-lg font-bold shadow-lg shadow-[#00B894]/20 hover:bg-[#008C6E] hover:scale-105 transition-all"
                    >
                        <i className="fas fa-phone-alt"></i> <span className="hidden sm:inline">Call Now</span>
                    </button>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <div className={`container mx-auto px-4 pt-24 pb-8 transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>

                {/* Summary Metrics Row - Smaller & Colorful */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                        { label: 'All Clients', value: metrics.all, icon: 'fa-users', bg: 'bg-blue-500', text: 'text-white' },
                        { label: 'Pending Orders', value: metrics.pendingOrders, icon: 'fa-clock', bg: 'bg-amber-500', text: 'text-white' },
                        { label: 'Low Performers', value: metrics.lowPerformers, icon: 'fa-chart-line-down', bg: 'bg-red-500', text: 'text-white' },
                        { label: 'Silent Accounts', value: metrics.silentAccounts, icon: 'fa-user-slash', bg: 'bg-slate-600', text: 'text-white' },
                    ].map((m, i) => (
                        <div key={i} className={`${m.bg} rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow`}>
                            <div>
                                <p className={`text-[10px] uppercase font-bold tracking-wider opacity-80 ${m.text}`}>{m.label}</p>
                                <p className={`text-lg font-bold mt-0.5 ${m.text}`}>{m.value}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                                <i className={`fas ${m.icon} text-xs`}></i>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Customer Header */}
                <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#E1E7F0] pb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className={`text-3xl font-bold font-serif tracking-tight transition-colors ${currentCustomer.flag === 'Red' ? 'text-red-600' :
                                    currentCustomer.flag === 'Green' ? 'text-green-600' :
                                        'text-[#111827]'
                                }`}>
                                {currentCustomer.name}
                            </h2>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${currentCustomer.tier === 'Platinum' ? 'bg-purple-100 text-purple-700' :
                                    currentCustomer.tier === 'Gold' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-700'
                                }`}>
                                {currentCustomer.tier}
                            </span>
                            {currentCustomer.flag && (
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${currentCustomer.flag === 'Red' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                    {currentCustomer.flag} Flag
                                </span>
                            )}
                        </div>
                        <p className="text-[#6B7280] flex items-center gap-2 text-sm">
                            <i className="fas fa-map-marker-alt text-[#00B894]"></i> {currentCustomer.town}, {currentCustomer.state}
                            <span className="text-[#E1E7F0]">•</span>
                            <i className="fas fa-building text-[#6B7280]"></i> {currentCustomer.firmName || 'No Firm Name'}
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-[#6B7280] uppercase font-bold">Last Interaction</p>
                        <p className="font-medium text-[#111827]">
                            {customerRemarks.length > 0
                                ? new Date(customerRemarks[0].timestamp).toLocaleDateString()
                                : 'No recent interactions'}
                        </p>
                    </div>
                </div>

                {/* --- 3-Column Grid Layout --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-260px)] min-h-[600px]">

                    {/* LEFT COLUMN (3/12): KPIs, Contact, ACTION BUTTONS */}
                    <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto pr-1 custom-scrollbar">
                        {/* KPI Grid - Restored Last Order & Risk Score */}
                        <div className="grid grid-cols-2 gap-2">
                            <GlassCard className="p-3 flex flex-col justify-center items-center text-center border-t-4 border-[#00B894]">
                                <p className="text-[9px] text-[#6B7280] uppercase font-bold">Outstanding</p>
                                <p className="text-base font-bold mt-0.5 text-[#00B894]">₹{currentCustomer.outstandingBalance?.toLocaleString() || '0'}</p>
                            </GlassCard>
                            <GlassCard className="p-3 flex flex-col justify-center items-center text-center border-t-4 border-[#4C6FFF]">
                                <p className="text-[9px] text-[#6B7280] uppercase font-bold">YTD Sales</p>
                                <p className="text-base font-bold mt-0.5 text-[#4C6FFF]">₹{currentCustomer.totalSales?.toLocaleString() || '0'}</p>
                            </GlassCard>
                            <GlassCard className="p-3 flex flex-col justify-center items-center text-center border-t-4 border-amber-500 col-span-2">
                                <p className="text-[9px] text-[#6B7280] uppercase font-bold">Last Order</p>
                                <p className="text-sm font-bold mt-0.5 text-[#111827]">
                                    {currentCustomer.lastOrderDate ? new Date(currentCustomer.lastOrderDate).toLocaleDateString() : 'Never'}
                                </p>
                            </GlassCard>
                        </div>

                        {/* Win Probability (Risk Score) */}
                        <WinProbability customer={currentCustomer} sales={customerSales} remarks={customerRemarks} />

                        {/* Contact Card */}
                        <GlassCard className="p-4">
                            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider text-[#6B7280] border-b border-[#E1E7F0] pb-2">Contact Details</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 group cursor-pointer" onClick={handleCallNow}>
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#00B894] group-hover:bg-[#00B894] group-hover:text-white transition-colors">
                                        <i className="fas fa-phone text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-[#6B7280] uppercase font-bold">Mobile</p>
                                        <p className="font-medium text-sm text-[#111827]">{currentCustomer.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 group cursor-pointer">
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[#00B894] group-hover:bg-[#00B894] group-hover:text-white transition-colors">
                                        <i className="fas fa-envelope text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-[#6B7280] uppercase font-bold">Email</p>
                                        <p className="font-medium text-sm text-[#111827] truncate max-w-[150px]">{currentCustomer.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* NEW ACTION BUTTONS */}
                        <GlassCard className="p-4">
                            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider text-[#6B7280] border-b border-[#E1E7F0] pb-2">Customer Actions</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <button onClick={openGoals} className="flex items-center justify-between w-full p-2.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-100 group">
                                    <span className="font-semibold text-sm flex items-center gap-2"><i className="fas fa-bullseye w-4"></i> Goals</span>
                                    <i className="fas fa-chevron-right text-xs opacity-50 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                                <button onClick={openSalesHistory} className="flex items-center justify-between w-full p-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100 group">
                                    <span className="font-semibold text-sm flex items-center gap-2"><i className="fas fa-chart-area w-4"></i> Sales History</span>
                                    <i className="fas fa-chevron-right text-xs opacity-50 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                                <button onClick={openTasks} className="flex items-center justify-between w-full p-2.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-100 group">
                                    <span className="font-semibold text-sm flex items-center gap-2"><i className="fas fa-tasks w-4"></i> Tasks</span>
                                    <i className="fas fa-chevron-right text-xs opacity-50 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                                <button onClick={openQuickActions} className="flex items-center justify-between w-full p-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100 group">
                                    <span className="font-semibold text-sm flex items-center gap-2"><i className="fas fa-bolt w-4"></i> Quick Actions</span>
                                    <i className="fas fa-chevron-right text-xs opacity-50 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                            </div>
                        </GlassCard>
                    </div>

                    {/* CENTER COLUMN (5/12): AI, Remarks */}
                    <div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pr-1 custom-scrollbar">

                        {/* AI Call Prep - Fixed visibility */}
                        <GlassCard className="p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border-indigo-100 relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                                <i className="fas fa-robot text-6xl text-[#4C6FFF]"></i>
                            </div>
                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                <div className="w-6 h-6 rounded-md bg-[#4C6FFF] flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                                    <i className="fas fa-sparkles text-xs"></i>
                                </div>
                                <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wide">AI Call Prep</h3>
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="flex gap-3 items-start p-3 bg-white/60 rounded-xl border border-indigo-100">
                                    <i className="fas fa-lightbulb text-[#F59E0B] mt-1 shrink-0"></i>
                                    <div>
                                        <p className="text-xs font-bold text-[#111827]">Talking Point</p>
                                        <p className="text-sm text-[#6B7280] leading-snug">Sales dropped 15% vs last year. Ask about <strong>Amoxyclav</strong> stock.</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Interaction History (Reusing CustomerRemarks) */}
                        <GlassCard className="flex-1 flex flex-col overflow-hidden min-h-[500px]">
                            <div className="p-4 border-b border-[#E1E7F0] flex justify-between items-center bg-slate-50/50 shrink-0">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B7280]">Interaction History</h3>
                                <button onClick={handleViewCustomerDetails} className="text-xs text-[#00B894] font-semibold hover:underline">View Customer Details</button>
                            </div>

                            {/* Reused Remarks Component */}
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <CustomerRemarks
                                    customer={currentCustomer}
                                    remarks={customerRemarks}
                                    onRemarkAdded={onRemarkAdded}
                                />
                            </div>
                        </GlassCard>
                    </div>

                    {/* RIGHT COLUMN (4/12): Sales, Mix */}
                    <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-y-auto pr-1 custom-scrollbar">

                        {/* 6-Month Sales Chart */}
                        <GlassCard className="p-5 h-[320px] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B7280]">6-Month Sales</h3>
                                <span className="text-xs font-bold text-[#16A34A] bg-[#16A34A]/10 px-2 py-1 rounded-md">+12% vs last period</span>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00B894" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#00B894" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#6B7280' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#6B7280' }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            contentStyle={{
                                                backgroundColor: '#FFFFFF',
                                                borderColor: '#E1E7F0',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                fontSize: '12px',
                                                color: '#111827'
                                            }}
                                        />
                                        <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                                            {salesData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill="url(#colorSales)" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        {/* Product Mix */}
                        <GlassCard className="p-5 flex-1">
                            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-[#6B7280]">Product Mix</h3>
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                                        <span className="text-[#111827]">Antibiotics</span>
                                        <span className="text-[#111827]">45%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#00B894] w-[45%] rounded-full shadow-[0_0_10px_rgba(0,184,148,0.3)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                                        <span className="text-[#111827]">Cardio</span>
                                        <span className="text-[#111827]">30%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#4C6FFF] w-[30%] rounded-full shadow-[0_0_10px_rgba(76,111,255,0.3)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                                        <span className="text-[#111827]">Pain Mgmt</span>
                                        <span className="text-[#111827]">15%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#EF4444] w-[15%] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                                        <span className="text-[#111827]">Supplements</span>
                                        <span className="text-[#111827]">10%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#F59E0B] w-[10%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]"></div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>

            {/* --- Bottom Floating Action Bar --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-[#E1E7F0] z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <div className="container mx-auto flex justify-between items-center max-w-6xl">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="px-6 py-3 rounded-xl font-semibold text-[#6B7280] hover:bg-slate-100 disabled:opacity-30 transition-all flex items-center gap-2"
                    >
                        <i className="fas fa-chevron-left"></i> Previous
                    </button>

                    <div className="flex gap-4">
                        <button
                            onClick={handleNext}
                            disabled={currentIndex === filteredCustomers.length - 1}
                            className="px-8 py-3 rounded-xl font-bold bg-[#00B894] text-white shadow-lg shadow-[#00B894]/30 hover:bg-[#008C6E] hover:scale-105 transition-all flex items-center gap-2"
                        >
                            Next Customer <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallMode;
