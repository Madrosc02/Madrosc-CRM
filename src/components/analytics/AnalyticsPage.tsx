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

const AnalyticsPage: React.FC = () => {
    const { loading, analyticsFilters, customers } = useApp();
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics Hub</h1>
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title={isSidebarOpen ? "Hide Insights" : "Show Insights"}
                    >
                        <i className={`fas fa-${isSidebarOpen ? 'angle-double-right' : 'lightbulb'}`}></i>
                    </button>
                </div>
                <div className="w-full md:w-auto">
                    <AnalyticsFilters />
                </div>
            </div>

            {selectedCustomerData ? (
                <FadeIn>
                    <CustomerPerformanceDetail customer={selectedCustomerData} />
                </FadeIn>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 relative items-start">
                    {/* Main Content Area */}
                    <div className="flex-1 w-full space-y-6 overflow-hidden min-w-0 transition-all duration-300">
                        <AnalyticsTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <FadeIn className="space-y-6">
                                <ExecutiveSummary />
                                <KPIRow />
                                <PerformanceSnapshot />
                                <ActionableInsights />
                            </FadeIn>
                        )}

                        {/* SALES TAB */}
                        {activeTab === 'sales' && (
                            <FadeIn className="space-y-6">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <SalesForecast />
                                    <RevenueOpportunityAnalyzer />
                                </div>
                                <RevenueChart />
                                <div className="card-base p-6">
                                    <OverallSalesTrendChart />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="card-base p-6">
                                        <SalesByStateChart />
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
                                    <CustomerSegmentation />
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <div className="card-base p-6">
                                        <ChurnRiskDashboard />
                                    </div>
                                    <div className="card-base p-6">
                                        <TierDistributionChart />
                                    </div>
                                </div>
                                <div className="card-base p-6">
                                    <CohortAnalysis />
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
                                    <OverallPerformanceTable />
                                </div>
                            </FadeIn>
                        )}
                    </div>

                    {/* Collapsible Right Sidebar */}
                    {isSidebarOpen && (
                        <div className="hidden lg:block w-[380px] shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar animate-fade-in pl-2">
                            <div className="space-y-6 pb-6">
                                <SmartAlerts />
                                <TopClients />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;