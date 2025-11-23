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

const AnalyticsPage: React.FC = () => {
    return (
                    </FadeIn >
                    
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