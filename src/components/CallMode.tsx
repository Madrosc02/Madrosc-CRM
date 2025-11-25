import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import GlassCard from './common/GlassCard';

import { ClientProfile } from './ClientProfile';
import { CustomerRemarks } from './customer/CustomerRemarks';


const CallMode: React.FC = () => {
    const { customers, remarks, addRemark, openAddTaskModal, openDetailModal, updateCustomerFlag } = useApp();
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

    // Mock Data for 6-Month Sales Chart (since backend doesn't provide history yet)
    const salesData = useMemo(() => {
        if (!currentCustomer) return [];
        const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
        return months.map((month) => ({
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

        let remarkText = '';
        if (flag === 'Red' && currentCustomer.flag !== 'Red') {
            const reason = window.prompt("Please provide a reason for raising a Red Flag:");
            if (reason === null) return; // Cancelled
            if (reason.trim() === '') {
                alert("A reason is required to raise a Red Flag.");
                return;
            }
            remarkText = `🚩 RED FLAG RAISED: ${reason}`;
        } else if (flag === 'Green' && currentCustomer.flag === 'Red') {
            remarkText = `✅ Flag cleared (marked as Green).`;
        }

        try {
            const newFlag = currentCustomer.flag === flag ? null : flag; // Toggle off if same
            await updateCustomerFlag(currentCustomer.id, newFlag);

            if (remarkText) {
                await addRemark(currentCustomer.id, remarkText);
            }
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 pb-32 relative overflow-hidden font-sans selection:bg-teal-100 selection:text-teal-900">

            {/* Background Mesh Gradient Effect */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-200/30 rounded-full blur-[120px]"></div>
            </div>

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
            <div className={`container mx-auto px-4 pt-16 pb-24 transition-all duration-500 ease-in-out relative z-10 max-w-7xl ${isAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>

                {/* Top Section: Client Profile (Replaces Header, KPIs, Sales Chart) */}
                <div className="mb-6">
                    <ClientProfile
                        customer={currentCustomer}
                        lastInteractionDate={customerRemarks.length > 0 ? customerRemarks[0].timestamp : undefined}
                        salesData={salesData}
                        onCall={handleCallNow}
                        onWhatsApp={handleWhatsApp}
                        onTask={handleCreateTask}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN (7/12): Interaction History */}
                    <div className="lg:col-span-7 flex flex-col gap-4 h-[600px]">
                        <GlassCard className="flex-1 flex flex-col overflow-hidden relative">
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
