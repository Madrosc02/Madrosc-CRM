import React, { useMemo, useState } from 'react';
import KPIRow from './KPIRow';
import SalesByStateChart from './SalesByStateChart';
import TierDistributionChart from './TierDistributionChart';
import OverallSalesTrendChart from './OverallSalesTrendChart';
import AIAnalyticsInsight from './AIAnalyticsInsight';
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
import Tabs from '../common/Tabs';

const AnalyticsPage: React.FC = () => {
    const { loading, analyticsFilters, customers } = useApp();
    const [activeTab, setActiveTab] = useState('overview');

    const selectedCustomerData = useMemo(() => {
        if (analyticsFilters.selectedCustomer === 'all') return null;
        return customers.find(c => c.id === analyticsFilters.selectedCustomer);
    }, [analyticsFilters.selectedCustomer, customers]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
        { id: 'sales', label: 'Sales & Revenue', icon: 'fa-chart-line' },
        { id: 'customers', label: 'Clients & Risk', icon: 'fa-users' },
        { id: 'territory', label: 'Territory & Performance', icon: 'fa-map-marked-alt' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analytics Hub</h1>
                <div className="w-full md:w-auto">
                    <AnalyticsFilters />
                </div>
            </div>

            {selectedCustomerData ? (
                <FadeIn>
                    <CustomerPerformanceDetail customer={selectedCustomerData} />
                </FadeIn>
            ) : (
                <>
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        className="max-w-4xl mx-auto mb-8"
                    />

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <FadeIn className="space-y-6">
                            <ExecutiveSummary />
                            <KPIRow />
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <ActionableInsights />
                                </div>
                                <div>
                                    <SmartAlerts />
                                </div>
                            </div>
                            <AIAnalyticsInsight />
                        </FadeIn>
                    )}

                    {/* SALES TAB */}
                    {activeTab === 'sales' && (
                        <FadeIn className="space-y-6">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <SalesForecast />
                                <RevenueOpportunityAnalyzer />
                            </div>
                            <OverallSalesTrendChart />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-4">
                                    <SalesByStateChart />
                                </div>
                                <div className="glass-card p-4">
                                    <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Sales Distribution</h3>
                                    {/* Placeholder for future distribution chart or keeping existing layout */}
                                </div>
                            </div>
                        </FadeIn>
                    )}

                    {/* CUSTOMERS TAB */}
                    {activeTab === 'customers' && (
                        <FadeIn className="space-y-6">
                            <CustomerSegmentation />
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <ChurnRiskDashboard />
                                <div className="glass-card p-4">
                                    <TierDistributionChart />
                                </div>
                            </div>
                            <CohortAnalysis />
                        </FadeIn>
                    )}

                    {/* TERRITORY TAB */}
                    {activeTab === 'territory' && (
                        <FadeIn className="space-y-6">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <TerritoryHeatmap />
                                <PerformanceLeaderboard />
                            </div>
                            <OverallPerformanceTable />
                        </FadeIn>
                    )}
                </>
            )}
        </div>
    );
};

export default AnalyticsPage;