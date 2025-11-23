import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import GlassCard from './common/GlassCard';
import { Customer, Remark } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CustomerRemarks } from './customer/CustomerRemarks';

const CallMode: React.FC = () => {
    const { customers, remarks, addRemark, openAddTaskModal, openDetailModal } = useApp();
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

    const handleViewAllHistory = () => {
        if (currentCustomer) {
            openDetailModal(currentCustomer);
        }
    };

    // Callback when a remark is added via the child component
    // In a real app with SWR/React Query, this might trigger a re-fetch.
    // Here, context updates automatically, so we might just log or show a toast if needed.
    const onRemarkAdded = () => {
        // Context updates automatically, so the list will refresh.
        console.log("Remark added in Call Mode");
    };

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

                {/* Summary Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'All Clients', value: metrics.all, icon: 'fa-users', color: 'blue', colorHex: '#4C6FFF' },
                        { label: 'Pending Orders', value: metrics.pendingOrders, icon: 'fa-clock', color: 'amber', colorHex: '#F59E0B' },
                        { label: 'Low Performers', value: metrics.lowPerformers, icon: 'fa-chart-line-down', color: 'red', colorHex: '#EF4444' },
                        { label: 'Silent Accounts', value: metrics.silentAccounts, icon: 'fa-user-slash', color: 'slate', colorHex: '#6B7280' },
                    ].map((m, i) => (
                        <GlassCard key={i} className="p-3 flex items-center justify-between border-l-4" style={{ borderLeftColor: m.colorHex }}>
                            <div>
                                <p className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">{m.label}</p>
                                <p className="text-xl font-bold mt-0.5 text-[#111827]">{m.value}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${m.colorHex}20`, color: m.colorHex }}>
                                <i className={`fas ${m.icon} text-sm`}></i>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Customer Header */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#E1E7F0] pb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-bold text-[#111827] font-serif tracking-tight">
                                {currentCustomer.name}
                            </h2>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${currentCustomer.tier === 'Platinum' ? 'bg-purple-100 text-purple-700' :
                                    currentCustomer.tier === 'Gold' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-700'
                                }`}>
                                {currentCustomer.tier}
                            </span>
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[600px]">

                    {/* LEFT COLUMN (3/12): KPIs & Contact */}
                    <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-1 custom-scrollbar">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-t-4 border-[#00B894]">
                                <p className="text-[10px] text-[#6B7280] uppercase font-bold">Outstanding</p>
                                <p className="text-lg font-bold mt-1 text-[#00B894]">₹{currentCustomer.outstandingBalance?.toLocaleString() || '0'}</p>
                            </GlassCard>
                            <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-t-4 border-[#4C6FFF]">
                                <p className="text-[10px] text-[#6B7280] uppercase font-bold">YTD Sales</p>
                                <p className="text-lg font-bold mt-1 text-[#4C6FFF]">₹{currentCustomer.totalSales?.toLocaleString() || '0'}</p>
                            </GlassCard>
                            <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-t-4 border-[#6B7280]">
                                <p className="text-[10px] text-[#6B7280] uppercase font-bold">Last Order</p>
                                <p className="text-lg font-bold mt-1 text-[#6B7280]">{currentCustomer.lastOrderDate || 'N/A'}</p>
                            </GlassCard>
                            <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-t-4 border-[#EF4444]">
                                <p className="text-[10px] text-[#6B7280] uppercase font-bold">Risk Score</p>
                                <p className="text-lg font-bold mt-1 text-[#EF4444]">Low</p>
                            </GlassCard>
                        </div>

                        {/* Contact Card */}
                        <GlassCard className="p-5 flex-1">
                            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-[#6B7280] border-b border-[#E1E7F0] pb-2">Contact Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 group cursor-pointer" onClick={handleCallNow}>
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#00B894] group-hover:bg-[#00B894] group-hover:text-white transition-colors">
                                        <i className="fas fa-phone text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#6B7280] uppercase font-bold">Mobile</p>
                                        <p className="font-medium text-sm text-[#111827]">{currentCustomer.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 group cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#00B894] group-hover:bg-[#00B894] group-hover:text-white transition-colors">
                                        <i className="fas fa-envelope text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#6B7280] uppercase font-bold">Email</p>
                                        <p className="font-medium text-sm text-[#111827] truncate max-w-[150px]">{currentCustomer.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 group cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#00B894] group-hover:bg-[#00B894] group-hover:text-white transition-colors">
                                        <i className="fas fa-user-tie text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#6B7280] uppercase font-bold">Contact Person</p>
                                        <p className="font-medium text-sm text-[#111827]">{currentCustomer.personName || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* CENTER COLUMN (5/12): AI & Timeline */}
                    <div className="lg:col-span-5 flex flex-col gap-6 h-full">

                        {/* AI Call Prep */}
                        <GlassCard className="p-5 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border-indigo-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <i className="fas fa-robot text-6xl text-[#4C6FFF]"></i>
                            </div>
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <div className="w-6 h-6 rounded-md bg-[#4C6FFF] flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                                    <i className="fas fa-sparkles text-xs"></i>
                                </div>
                                <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wide">AI Call Prep</h3>
                            </div>
                            <div className="space-y-3 relative z-10">
                                <div className="flex gap-3 items-start p-3 bg-white/60 rounded-xl border border-indigo-100">
                                    <i className="fas fa-lightbulb text-[#F59E0B] mt-1"></i>
                                    <div>
                                        <p className="text-xs font-bold text-[#111827]">Talking Point</p>
                                        <p className="text-sm text-[#6B7280] leading-snug">Sales dropped 15% vs last year. Ask about <strong>Amoxyclav</strong> stock.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start p-3 bg-white/60 rounded-xl border border-indigo-100">
                                    <i className="fas fa-rocket text-[#EF4444] mt-1"></i>
                                    <div>
                                        <p className="text-xs font-bold text-[#111827]">Opportunity</p>
                                        <p className="text-sm text-[#6B7280] leading-snug">Pitch new <strong>Cardio</strong> range. Good candidate for sampling.</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Interaction History (Reusing CustomerRemarks) */}
                        <GlassCard className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-[#E1E7F0] flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[#6B7280]">Interaction History</h3>
                                <button onClick={handleViewAllHistory} className="text-xs text-[#00B894] font-semibold hover:underline">View All</button>
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

                    {/* RIGHT COLUMN (4/12): Charts */}
                    <div className="lg:col-span-4 flex flex-col gap-6 h-full">

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
