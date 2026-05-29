import React, { useMemo, useState } from 'react';
import KPIRow from './KPIRow';
import SalesByStateChart from './SalesByStateChart';
import TierDistributionChart from './TierDistributionChart';
import OverallSalesTrendChart from './OverallSalesTrendChart';
import TopClients from './TopClients';
import { useApp } from '../../contexts/AppContext';
import DashboardSkeleton from '../skeletons/DashboardSkeleton';
import AnalyticsFilters from './AnalyticsFilters';
import CustomerPerformanceDetail from './CustomerPerformanceDetail';
import ActionableInsights from './ActionableInsights';
import OverallPerformanceTable from './OverallPerformanceTable';
import FadeIn from '../ui/FadeIn';
import SalesForecast from './SalesForecast';
import ExecutiveSummary from './ExecutiveSummary';
import CustomerSegmentation from './CustomerSegmentation';
import ChurnRiskDashboard from './ChurnRiskDashboard';
import SmartAlerts from './SmartAlerts';
import RevenueOpportunityAnalyzer from './RevenueOpportunityAnalyzer';
import TerritoryHeatmap from './TerritoryHeatmap';
import PerformanceLeaderboard from './PerformanceLeaderboard';
import CohortAnalysis from './CohortAnalysis';
import AnalyticsTabs from './AnalyticsTabs';
import PerformanceSnapshot from './PerformanceSnapshot';
import RevenueChart from './RevenueChart';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';

const AnalyticsPage: React.FC = () => {
    const { loading, analyticsFilters, customers } = useApp();
    const analyticsData = useAnalyticsData();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const selectedCustomerData = useMemo(() => {
        if (analyticsFilters.selectedCustomer === 'all') return null;
        return customers.find(c => c.id === analyticsFilters.selectedCustomer);
    }, [analyticsFilters.selectedCustomer, customers]);

    if (loading) {
        return <DashboardSkeleton />;
    }
    return (
        <div className="flex flex-col lg:flex-row gap-6 relative items-start w-full">
            {/* Main Content Area (Left) */}
            <div className="flex-1 w-full space-y-6 overflow-hidden min-w-0 transition-all duration-300">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight whitespace-nowrap">Analytics Hub</h1>
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-sm"
                            title={isSidebarOpen ? "Hide Insights" : "Show Insights"}
                        >
                            <i className={`fas fa-${isSidebarOpen ? 'angle-double-right' : 'lightbulb'} text-xs`}></i>
                        </button>
                    </div>
                    <div className="flex-shrink-0">
                        <AnalyticsFilters />
                    </div>
                </div>

                {selectedCustomerData ? (
                    <FadeIn>
                        <CustomerPerformanceDetail customer={selectedCustomerData} />
                    </FadeIn>
                ) : (
                    <div className="space-y-6">
                        <AnalyticsTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <FadeIn className="space-y-6">
                                <KPIRow />
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <div>
                                        <RevenueChart data={analyticsData.revenueOverview} />
                                    </div>
                                    <div>
                                        <ExecutiveSummary data={analyticsData.healthScore} />
                                    </div>
                                </div>
                                <ActionableInsights data={analyticsData.actionableInsights} />
                            </FadeIn>
                        )}

                        {/* SALES TAB */}
                        {activeTab === 'sales' && (
                            <FadeIn className="space-y-6">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <SalesForecast sales={analyticsData.allSales} />
                                    <RevenueOpportunityAnalyzer />
                                </div>
                                <div className="card-base p-6">
                                    <OverallSalesTrendChart sales={analyticsData.filteredSales} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="card-base p-6">
                                        <SalesByStateChart sales={analyticsData.filteredSales} />
                                    </div>
                                    <div className="card-base p-6 flex items-center justify-center text-slate-500">
                                        <div className="text-center">
                                            <i className="fas fa-chart-pie text-4xl mb-3 opacity-50"></i>
                                            <p className="font-medium">Sales Distribution</p>
                                            <p className="text-xs mt-1 opacity-70">Coming soon</p>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        )}

                        {/* CUSTOMERS TAB */}
                        {activeTab === 'customers' && (
                            <FadeIn className="space-y-6">
                                <div className="card-base p-6">
                                    <CustomerSegmentation sales={analyticsData.filteredSales} />
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <div className="card-base p-6">
                                        <ChurnRiskDashboard sales={analyticsData.filteredSales} />
                                    </div>
                                    <div className="card-base p-6">
                                        <TierDistributionChart />
                                    </div>
                                </div>
                                <div className="card-base p-6">
                                    <CohortAnalysis sales={analyticsData.allSales} />
                                </div>
                            </FadeIn>
                        )}

                        {/* TERRITORY TAB */}
                        {activeTab === 'territory' && (
                            <FadeIn className="space-y-6">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <div className="card-base p-6">
                                        <TerritoryHeatmap />
                                    </div>
                                    <div className="card-base p-6">
                                        <PerformanceLeaderboard />
                                    </div>
                                </div>
                                <div className="card-base p-6">
                                    <OverallPerformanceTable sales={analyticsData.allSales} />
                                </div>
                            </FadeIn>
                        )}
                    </div>
                )}
            </div>

            {/* Collapsible Right Sidebar */}
            {isSidebarOpen ? (
                <div className="hidden lg:block w-[280px] shrink-0 animate-fade-in pl-4">
                    <div className="flex justify-end mb-2">
                        <button 
                            onClick={() => setIsSidebarOpen(false)}
                            className="text-xs flex items-center gap-1 text-slate-400 hover:text-slate-700 font-medium transition-colors"
                            title="Collapse Sidebar"
                        >
                            Collapse <i className="fas fa-angle-double-right"></i>
                        </button>
                    </div>
                    <div className="space-y-6 pb-6 mt-1">
                        <SmartAlerts insights={analyticsData.actionableInsights} />
                        <PerformanceSnapshot customers={customers} healthScore={analyticsData.healthScore} />
                    </div>
                </div>
            ) : (
                <div className="hidden lg:flex shrink-0 sticky top-48 h-[100px] items-center justify-end pl-2">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="w-8 py-6 bg-white border border-slate-200 shadow-sm rounded-l-xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all hover:-translate-x-1"
                        title="Show Insights Sidebar"
                    >
                        <i className="fas fa-angle-double-left mb-2 text-[10px]"></i>
                        <span className="text-[9px] uppercase font-bold tracking-widest rotate-180" style={{ writingMode: 'vertical-rl' }}>Insights</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;