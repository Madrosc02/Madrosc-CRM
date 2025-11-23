// components/analytics/AnalyticsPage.tsx
import React, { useMemo } from 'react';
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

const AnalyticsPage: React.FC = () => {
    const { loading, analyticsFilters, customers } = useApp();

    const selectedCustomerData = useMemo(() => {
        if (analyticsFilters.selectedCustomer === 'all') return null;
        return customers.find(c => c.id === analyticsFilters.selectedCustomer);
    }, [analyticsFilters.selectedCustomer, customers]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            <FadeIn>
                <AnalyticsFilters />
            </FadeIn>

            {selectedCustomerData ? (
                <FadeIn>
                    <CustomerPerformanceDetail customer={selectedCustomerData} />
                </FadeIn>
            ) : (
                <>
                    {/* Executive Summary & Alerts */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <FadeIn className="xl:col-span-2">
                            <ExecutiveSummary />
                        </FadeIn>
                        <FadeIn>
                            <SmartAlerts />
                        </FadeIn>
                    </div>

                    {/* Revenue Opportunities - Full Width */}
                    <FadeIn>
                        <RevenueOpportunityAnalyzer />
                    </FadeIn>

                    {/* Territory Map & Forecast */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <FadeIn>
                            <TerritoryHeatmap />
                        </FadeIn>
                        <FadeIn>
                            <SalesForecast />
                        </FadeIn>
                    </div>

                    {/* Risk & Leaderboard */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <FadeIn>
                            <ChurnRiskDashboard />
                        </FadeIn>
                        <FadeIn>
                            <PerformanceLeaderboard />
                        </FadeIn>
                    </div>

                    {/* Customer Segmentation - Full Width */}
                    <FadeIn>
                        <CustomerSegmentation />
                    </FadeIn>

                    <FadeIn>
                        <KPIRow />
                    </FadeIn>
                    <FadeIn>
                        <OverallSalesTrendChart />
                    </FadeIn>
                    <FadeIn>
                        <OverallPerformanceTable />
                    </FadeIn>
                    <FadeIn>
                        <ActionableInsights />
                    </FadeIn>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FadeIn className="card-base p-4">
                            <SalesByStateChart />
                        </FadeIn>
                        <FadeIn className="card-base p-4">
                            <TierDistributionChart />
                        </FadeIn>
                    </div>

                    <FadeIn className="card-base p-4">
                        <AIAnalyticsInsight />
                    </FadeIn>
                </>
            )}
        </div >
    );
};

export default AnalyticsPage;