import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import GlassCard from './common/GlassCard';
import { Customer } from '../types';

const CallMode: React.FC = () => {
    const { customers, getAllSales } = useApp();
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string>('All');

    // Metrics Calculations
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

    // Filter customers based on selected tier
    const filteredCustomers = useMemo(() => {
        if (selectedTier === 'All') return customers;
        return customers.filter(c => c.tier === selectedTier);
    }, [customers, selectedTier]);

    const currentCustomer = filteredCustomers[currentIndex];

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
        setCurrentIndex(0); // Reset to first customer of new filter
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
        <div className="min-h-screen bg-[var(--bg-background)] text-[var(--text-primary)] pb-24 relative overflow-hidden">
            {/* Top Navigation Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[var(--border-color)] px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={handleExit} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <i className="fas fa-arrow-left text-xl text-[var(--text-secondary)]"></i>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold font-serif">Focus Mode</h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Customer {currentIndex + 1} of {filteredCustomers.length}
                        </p>
                    </div>
                </div>

                {/* Smart Filter Dropdown */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <select
                            value={selectedTier}
                            onChange={handleTierChange}
                            className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[var(--text-primary)] py-2 pl-4 pr-10 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                        >
                            <option value="All">All Tiers</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Bronze">Bronze</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                            <i className="fas fa-filter text-xs"></i>
                        </div>
                    </div>

                    <div className="h-2 w-32 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                        <div
                            className="h-full bg-[var(--color-primary)] transition-all duration-500"
                            style={{ width: `${((currentIndex + 1) / filteredCustomers.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`container mx-auto px-4 pt-24 transition-opacity duration-300 ${isAnimating ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <GlassCard className="p-4 flex items-center justify-between border-l-4 border-blue-500">
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] uppercase font-bold">All Clients</p>
                            <p className="text-2xl font-bold mt-1">{metrics.all}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <i className="fas fa-users"></i>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-4 flex items-center justify-between border-l-4 border-amber-500">
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] uppercase font-bold">Pending Orders</p>
                            <p className="text-2xl font-bold mt-1">{metrics.pendingOrders}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <i className="fas fa-clock"></i>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-4 flex items-center justify-between border-l-4 border-red-500">
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] uppercase font-bold">Low Performers</p>
                            <p className="text-2xl font-bold mt-1">{metrics.lowPerformers}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                            <i className="fas fa-chart-line-down"></i>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-4 flex items-center justify-between border-l-4 border-slate-500">
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] uppercase font-bold">Silent Accounts</p>
                            <p className="text-2xl font-bold mt-1">{metrics.silentAccounts}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                            <i className="fas fa-user-slash"></i>
                        </div>
                    </GlassCard>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-bold font-serif text-[var(--color-primary)]">
                                {currentCustomer.name}
                            </h2>
                            <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-full uppercase tracking-wider">
                                {currentCustomer.segment || 'Active'}
                            </span>
                        </div>
                        <p className="text-[var(--text-secondary)] flex items-center gap-2">
                            <i className="fas fa-map-marker-alt"></i> {currentCustomer.town}, {currentCustomer.state}
                            <span className="mx-2">•</span>
                            <i className="fas fa-building"></i> {currentCustomer.firmName || 'No Firm Name'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-secondary flex items-center gap-2">
                            <i className="fab fa-whatsapp text-green-500 text-lg"></i> WhatsApp
                        </button>
                        <button className="btn-primary flex items-center gap-2 shadow-lg shadow-teal-500/30">
                            <i className="fas fa-phone-alt"></i> Call Now
                        </button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Stats & Details */}
                    <div className="space-y-6">
                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <GlassCard className="p-4 border-l-4 border-teal-500">
                                <p className="text-xs text-[var(--text-secondary)] uppercase font-bold">Outstanding</p>
                                <p className="text-xl font-bold mt-1">₹{currentCustomer.outstandingBalance?.toLocaleString() || '0'}</p>
                            </GlassCard>
                            <GlassCard className="p-4 border-l-4 border-blue-500">
                                <p className="text-xs text-[var(--text-secondary)] uppercase font-bold">YTD Sales</p>
                                <p className="text-xl font-bold mt-1">₹{currentCustomer.totalSales?.toLocaleString() || '0'}</p>
                            </GlassCard>
                            <GlassCard className="p-4 border-l-4 border-purple-500">
                                <p className="text-xs text-[var(--text-secondary)] uppercase font-bold">Last Order</p>
                                <p className="text-lg font-bold mt-1">{currentCustomer.lastOrderDate || 'N/A'}</p>
                            </GlassCard>
                            <GlassCard className="p-4 border-l-4 border-orange-500">
                                <p className="text-xs text-[var(--text-secondary)] uppercase font-bold">Risk Score</p>
                                <p className="text-lg font-bold mt-1 text-orange-600">Low</p>
                            </GlassCard>
                        </div>

                        {/* Contact Details */}
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-bold mb-4 border-b border-[var(--border-color)] pb-2">Contact Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[var(--color-primary)]">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)]">Email</p>
                                        <p className="font-medium">{currentCustomer.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[var(--color-primary)]">
                                        <i className="fas fa-phone"></i>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)]">Phone</p>
                                        <p className="font-medium">{currentCustomer.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Middle Column: AI & Remarks */}
                    <div className="space-y-6">
                        {/* AI Analysis */}
                        <GlassCard className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/50 border-indigo-100 dark:border-indigo-900/30">
                            <div className="flex items-center gap-2 mb-4">
                                <i className="fas fa-robot text-indigo-500 text-xl"></i>
                                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">AI Call Prep</h3>
                            </div>
                            <div className="prose prose-sm dark:prose-invert">
                                <p className="text-sm leading-relaxed">
                                    <strong>Talking Point:</strong> Sales have dropped 15% this month compared to last year. Ask about stock levels of <em>Amoxyclav</em>.
                                </p>
                                <p className="text-sm leading-relaxed mt-2">
                                    <strong>Opportunity:</strong> They haven't ordered the new <em>Cardio</em> range yet. Good candidate for a sample drop.
                                </p>
                            </div>
                        </GlassCard>

                        {/* Past Remarks Timeline */}
                        <GlassCard className="p-6 flex-1">
                            <h3 className="text-lg font-bold mb-4">Recent Interactions</h3>
                            <div className="space-y-6 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                                {/* Mock Data for now - needs real remarks integration */}
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900"></div>
                                    <p className="text-xs text-[var(--text-secondary)]">2 days ago</p>
                                    <p className="font-medium mt-1">Visited clinic. Doctor was busy. Left samples.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-400 border-2 border-white dark:border-slate-900"></div>
                                    <p className="text-xs text-[var(--text-secondary)]">1 week ago</p>
                                    <p className="font-medium mt-1">Phone call. Discussed payment delay. Promised to clear by Friday.</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Column: Graphs */}
                    <div className="space-y-6">
                        <GlassCard className="p-6 h-[300px]">
                            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-[var(--text-secondary)]">Performance Trend</h3>
                            {/* Placeholder for specific customer chart - reusing main chart for demo layout */}
                            <div className="h-full w-full flex items-center justify-center text-[var(--text-secondary)] bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <span className="text-sm">Chart Component Here</span>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-[var(--text-secondary)]">Product Mix</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Antibiotics</span>
                                        <span className="font-bold">45%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-teal-500 w-[45%]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Cardio</span>
                                        <span className="font-bold">30%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[30%]"></div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>

            {/* Bottom Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-[var(--border-color)] z-50">
                <div className="container mx-auto flex justify-between items-center max-w-4xl">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="px-6 py-3 rounded-xl font-semibold text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-all"
                    >
                        <i className="fas fa-chevron-left mr-2"></i> Previous
                    </button>

                    <div className="flex gap-4">
                        <button className="px-6 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                            <i className="fas fa-pen mr-2"></i> Log Remarks
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentIndex === filteredCustomers.length - 1}
                            className="px-8 py-3 rounded-xl font-bold bg-[var(--color-primary)] text-white shadow-lg shadow-teal-500/30 hover:scale-105 hover:shadow-teal-500/50 transition-all flex items-center"
                        >
                            Next Customer <i className="fas fa-chevron-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallMode;
