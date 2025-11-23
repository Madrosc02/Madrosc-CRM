import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import GlassCard from './common/GlassCard';
import { Customer } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CallMode: React.FC = () => {
    const { customers } = useApp();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string>('All');
    const [newRemark, setNewRemark] = useState('');

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

    // Mock Data for Interaction History
    const interactions = [
        { id: 1, type: 'visit', date: '2 days ago', content: 'Visited clinic. Doctor was busy. Left samples of Cardio range.', author: 'You' },
        { id: 2, type: 'call', date: '1 week ago', content: 'Phone call. Discussed payment delay. Promised to clear by Friday.', author: 'You' },
        { id: 3, type: 'order', date: '2 weeks ago', content: 'Placed order for ₹12,500. Focus on Antibiotics.', author: 'System' },
    ];

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

    const handleAddRemark = () => {
        if (!newRemark.trim()) return;
        // Logic to add remark would go here
        console.log("Adding remark:", newRemark);
        setNewRemark('');
    };

    if (!currentCustomer && filteredCustomers.length > 0) return <div>Loading...</div>;
    if (filteredCustomers.length === 0) return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-background)] text-[var(--text-primary)]">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">No Customers Found</h2>
                <p className="text-[var(--text-secondary)] mb-4">No customers match the selected filter: {selectedTier}</p>
                <button onClick={() => setSelectedTier('All')} className="btn-primary">Reset Filter</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-background)] text-[var(--text-primary)] pb-24 relative overflow-hidden font-sans">

            {/* --- Top Navigation Bar --- */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-[var(--border-color)] px-6 py-3 flex justify-between items-center shadow-sm transition-all duration-300">
                <div className="flex items-center gap-6">
                    <button onClick={handleExit} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--color-primary)]">
                        <i className="fas fa-arrow-left text-xl"></i>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            <i className="fas fa-headset text-[var(--color-primary)]"></i> Call Mode
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <span>{currentIndex + 1} / {filteredCustomers.length}</span>
                            <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-out"
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
                            className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[var(--text-primary)] py-2 pl-4 pr-10 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer transition-all hover:border-[var(--color-primary)]"
                        >
                            <option value="All">All Tiers</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Bronze">Bronze</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)] group-hover:text-[var(--color-primary)] transition-colors">
                            <i className="fas fa-filter text-xs"></i>
                        </div>
                    </div>
                </div>

                {/* Top Actions */}
                <div className="flex items-center gap-3">
                    <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-200 dark:border-indigo-800">
                        <i className="fas fa-check-circle"></i> Create Task
                    </button>
                    <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 transition-all border border-green-200 dark:border-green-800">
                        <i className="fab fa-whatsapp text-lg"></i> WhatsApp
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[var(--color-primary)] to-teal-500 text-white rounded-lg font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-105 transition-all">
                        <i className="fas fa-phone-alt"></i> <span className="hidden sm:inline">Call Now</span>
                    </button>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <div className={`container mx-auto px-4 pt-24 pb-8 transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>

                {/* Summary Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'All Clients', value: metrics.all, icon: 'fa-users', color: 'blue' },
                        { label: 'Pending Orders', value: metrics.pendingOrders, icon: 'fa-clock', color: 'amber' },
                        { label: 'Low Performers', value: metrics.lowPerformers, icon: 'fa-chart-line-down', color: 'red' },
                        { label: 'Silent Accounts', value: metrics.silentAccounts, icon: 'fa-user-slash', color: 'slate' },
                    ].map((m, i) => (
                        <GlassCard key={i} className={`p-3 flex items-center justify-between border-l-4 border-${m.color}-500`}>
                            <div>
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">{m.label}</p>
                                <p className="text-xl font-bold mt-0.5">{m.value}</p>
                            </div>
                            <div className={`w-8 h-8 rounded-full bg-${m.color}-100 dark:bg-${m.color}-900/30 flex items-center justify-center text-${m.color}-600 dark:text-${m.color}-400`}>
                                <i className={`fas ${m.icon} text-sm`}></i>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Customer Header */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[var(--border-color)] pb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-bold text-[var(--text-primary)] font-serif tracking-tight">
                                {currentCustomer.name}
                            </h2>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${currentCustomer.tier === 'Platinum' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                    currentCustomer.tier === 'Gold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}>
                                {currentCustomer.tier}
                            </span>
                        </div>
                        <p className="text-[var(--text-secondary)] flex items-center gap-2 text-sm">
                            <i className="fas fa-map-marker-alt text-[var(--color-primary)]"></i> {currentCustomer.town}, {currentCustomer.state}
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <i className="fas fa-building text-[var(--text-secondary)]"></i> {currentCustomer.firmName || 'No Firm Name'}
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-[var(--text-secondary)] uppercase font-bold">Last Interaction</p>
                        <p className="font-medium text-[var(--text-primary)]">2 days ago via Visit</p>
                    </div>
                </div>

                {/* --- 3-Column Grid Layout --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)] min-h-[600px]">

                    {/* LEFT COLUMN (3/12): KPIs & Contact */}
                    <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-1 custom-scrollbar">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-t-4 border-teal-500">
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Outstanding</p>
                                <p className="text-lg font-bold mt-1 text-teal-600 dark:text-teal-400">₹{currentCustomer.outstandingBalance?.toLocaleString() || '0'}</p>
                            </GlassCard>
                            <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-t-4 border-blue-500">
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">YTD Sales</p>
                                <p className="text-lg font-bold mt-1 text-blue-600 dark:text-blue-400">₹{currentCustomer.totalSales?.toLocaleString() || '0'}</p>
                            </GlassCard>
                            <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-t-4 border-purple-500">
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Last Order</p>
                                <p className="text-lg font-bold mt-1 text-purple-600 dark:text-purple-400">{currentCustomer.lastOrderDate || 'N/A'}</p>
                            </GlassCard>
                            <GlassCard className="p-4 flex flex-col justify-center items-center text-center border-t-4 border-orange-500">
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Risk Score</p>
                                <p className="text-lg font-bold mt-1 text-orange-600 dark:text-orange-400">Low</p>
                            </GlassCard>
                        </div>

                        {/* Contact Card */}
                        <GlassCard className="p-5 flex-1">
                            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2">Contact Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 group cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                        <i className="fas fa-phone text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Mobile</p>
                                        <p className="font-medium text-sm">{currentCustomer.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 group cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                        <i className="fas fa-envelope text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Email</p>
                                        <p className="font-medium text-sm truncate max-w-[150px]">{currentCustomer.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 group cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                                        <i className="fas fa-user-tie text-xs"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Contact Person</p>
                                        <p className="font-medium text-sm">{currentCustomer.personName || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* CENTER COLUMN (5/12): AI & Timeline */}
                    <div className="lg:col-span-5 flex flex-col gap-6 h-full">

                        {/* AI Call Prep */}
                        <GlassCard className="p-5 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <i className="fas fa-robot text-6xl text-indigo-500"></i>
                            </div>
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                                    <i className="fas fa-sparkles text-xs"></i>
                                </div>
                                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wide">AI Call Prep</h3>
                            </div>
                            <div className="space-y-3 relative z-10">
                                <div className="flex gap-3 items-start p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                    <i className="fas fa-lightbulb text-amber-500 mt-1"></i>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Talking Point</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">Sales dropped 15% vs last year. Ask about <strong>Amoxyclav</strong> stock.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                    <i className="fas fa-rocket text-rose-500 mt-1"></i>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Opportunity</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">Pitch new <strong>Cardio</strong> range. Good candidate for sampling.</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Interaction History Timeline */}
                        <GlassCard className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Interaction History</h3>
                                <button className="text-xs text-[var(--color-primary)] font-semibold hover:underline">View All</button>
                            </div>

                            {/* Scrollable Timeline */}
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <div className="space-y-6 relative pl-2">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

                                    {interactions.map((interaction) => (
                                        <div key={interaction.id} className="relative pl-8 group">
                                            {/* Dot */}
                                            <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center
                                                ${interaction.type === 'visit' ? 'bg-teal-500' : interaction.type === 'call' ? 'bg-blue-500' : 'bg-purple-500'}
                                            `}>
                                                <i className={`fas ${interaction.type === 'visit' ? 'fa-walking' : interaction.type === 'call' ? 'fa-phone' : 'fa-shopping-cart'} text-[8px] text-white`}></i>
                                            </div>

                                            {/* Content */}
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-[var(--color-primary)] transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md 
                                                        ${interaction.type === 'visit' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' :
                                                            interaction.type === 'call' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                                'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}
                                                    `}>{interaction.type}</span>
                                                    <span className="text-[10px] text-[var(--text-secondary)]">{interaction.date}</span>
                                                </div>
                                                <p className="text-sm text-[var(--text-primary)] leading-relaxed">{interaction.content}</p>
                                                <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">By: {interaction.author}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add Remark Input */}
                            <div className="p-3 border-t border-[var(--border-color)] bg-white dark:bg-slate-900">
                                <div className="relative flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newRemark}
                                        onChange={(e) => setNewRemark(e.target.value)}
                                        placeholder="Add a new remark..."
                                        className="w-full pl-4 pr-12 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddRemark()}
                                    />
                                    <button
                                        onClick={handleAddRemark}
                                        className="absolute right-1.5 p-1.5 bg-[var(--color-primary)] text-white rounded-md hover:bg-teal-700 transition-colors shadow-sm"
                                    >
                                        <i className="fas fa-paper-plane text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* RIGHT COLUMN (4/12): Charts */}
                    <div className="lg:col-span-4 flex flex-col gap-6 h-full">

                        {/* 6-Month Sales Chart */}
                        <GlassCard className="p-5 h-[320px] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">6-Month Sales</h3>
                                <span className="text-xs font-bold text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md">+12% vs last period</span>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            contentStyle={{
                                                backgroundColor: 'var(--bg-surface)',
                                                borderColor: 'var(--border-color)',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                fontSize: '12px'
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
                            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-[var(--text-secondary)]">Product Mix</h3>
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                                        <span>Antibiotics</span>
                                        <span className="text-[var(--text-primary)]">45%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-teal-500 w-[45%] rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                                        <span>Cardio</span>
                                        <span className="text-[var(--text-primary)]">30%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[30%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                                        <span>Pain Mgmt</span>
                                        <span className="text-[var(--text-primary)]">15%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 w-[15%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                                        <span>Supplements</span>
                                        <span className="text-[var(--text-primary)]">10%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 w-[10%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]"></div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>

            {/* --- Bottom Floating Action Bar --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-[#0F172A]/95 backdrop-blur-xl border-t border-[var(--border-color)] z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <div className="container mx-auto flex justify-between items-center max-w-6xl">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="px-6 py-3 rounded-xl font-semibold text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all flex items-center gap-2"
                    >
                        <i className="fas fa-chevron-left"></i> Previous
                    </button>

                    <div className="flex gap-4">
                        <button className="hidden sm:flex px-6 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all items-center gap-2">
                            <i className="fas fa-pen"></i> Log Remarks
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentIndex === filteredCustomers.length - 1}
                            className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-teal-500 text-white shadow-lg shadow-teal-500/30 hover:scale-105 hover:shadow-teal-500/50 transition-all flex items-center gap-2"
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
