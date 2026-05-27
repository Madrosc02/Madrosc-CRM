import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

// New Componentized Imports
import { CallModeHeader } from './call-mode/CallModeHeader';
import { ClientCard } from './call-mode/ClientCard';
import { CustomerHealth } from './call-mode/CustomerHealth';
import { InsightsGrid } from './call-mode/InsightsGrid';
import { TerritoryInsights } from './call-mode/TerritoryInsights';
import { SalesTrend } from './call-mode/SalesTrend';
import { ChatPanel } from './call-mode/ChatPanel';
import { DealPipeline } from './call-mode/DealPipeline';
import { RightSidebar } from './call-mode/RightSidebar';
import { CustomerNavigator } from './call-mode/CustomerNavigator';

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
                dueDate: new Date().toISOString().slice(0, 16)
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
        <div className="fixed top-0 left-[260px] right-0 bottom-0 z-[60] bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
            
            <CallModeHeader 
                currentIndex={currentIndex}
                totalCustomers={filteredCustomers.length}
                currentCustomer={currentCustomer}
                selectedTier={selectedTier}
                handleExit={handleExit}
                handleTierChange={handleTierChange}
                handleCreateTask={handleCreateTask}
                handleWhatsApp={handleWhatsApp}
                handleCallNow={handleCallNow}
            />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Background Mesh Gradient Effect */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-200/30 rounded-full blur-[120px]"></div>
                </div>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative z-10 pb-32">
                    <div className={`p-6 space-y-6 transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
                        {/* Section 1: Client Card */}
                        <ClientCard 
                            currentCustomer={currentCustomer}
                            customerRemarks={customerRemarks}
                            handleCallNow={handleCallNow}
                        />

                        {/* Section 2: Customer Health + Territory Insights */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto">
                            <div className="h-full">
                                <CustomerHealth customer={currentCustomer} remarks={customerRemarks} />
                            </div>
                            <div className="h-full">
                                <TerritoryInsights customer={currentCustomer} />
                            </div>
                        </div>

                        {/* Section 3: Sales Trend */}
                        <SalesTrend customer={currentCustomer} />

                        {/* Section 4: Deal Pipeline */}
                        <DealPipeline />

                        {/* Section 5: Chat Panel (replaces ActivityTimeline) */}
                        <ChatPanel 
                            customerRemarks={customerRemarks}
                            setShowAICallPrep={setShowAICallPrep}
                        />

                        {/* Section 6: Additional Insights */}
                        <InsightsGrid />
                    </div>
                </main>

                {/* Right Sidebar */}
                <RightSidebar 
                    openGoals={openGoals}
                    openSalesHistory={openSalesHistory}
                    openTasks={openTasks}
                    openQuickActions={openQuickActions}
                    setShowAICallPrep={setShowAICallPrep}
                />
            </div>

            <CustomerNavigator 
                currentIndex={currentIndex}
                totalCustomers={filteredCustomers.length}
                handlePrevious={handlePrevious}
                handleNext={handleNext}
            />

            {/* AI Call Prep Modal */}
            {showAICallPrep && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4" onClick={() => setShowAICallPrep(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                        <i className="fas fa-sparkles text-xl"></i>
                                    </div>
                                    <h2 className="text-2xl font-bold">AI Call Prep</h2>
                                </div>
                                <button onClick={() => setShowAICallPrep(false)} className="w-8 h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center">
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
            )}
        </div>
    );
};

export default CallMode;
