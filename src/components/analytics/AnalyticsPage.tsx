// components/analytics/AnalyticsPage.tsx
import React, { useMemo } from 'react';
import KPIRow from './KPIRow';
import SalesByStateChart from './SalesByStateChart';
import TierDistributionChart from './TierDistributionChart';
import OverallSalesTrendChart from './OverallSalesTrendChart';
import AIAnalyticsInsight from './AIAnalyticsInsight';
import SalesLeaderboard from '../gamification/SalesLeaderboard';
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
                    {/* Executive Summary - Full Width */}
                    <FadeIn>
                        <ExecutiveSummary />
                    </FadeIn>

                    {/* Risk & Forecast Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <FadeIn>
                            <ChurnRiskDashboard />
                        </FadeIn>
                        <FadeIn>
                            <SalesForecast />
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <FadeIn className="card-base p-4">
                            <SalesLeaderboard />
                        </FadeIn>
                        <FadeIn className="card-base p-4">
                            <AIAnalyticsInsight />
                        </FadeIn>
                        <FadeIn className="card-base p-4">
                            <SalesForecast />
                        </FadeIn>
                    </div>
                </>
            )}
        </div >
    );
};

export default AnalyticsPage;