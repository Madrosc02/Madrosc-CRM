import React from 'react';
import CustomerTable from './CustomerTable';
import UpcomingTasks from './UpcomingTasks';
import KPIRow from './analytics/KPIRow';
import SalesTrendChart from './analytics/SalesTrendChart';
import RevenueGoalWidget from './analytics/RevenueGoalWidget';
import GeographicHeatmap from './analytics/GeographicHeatmap';
import ActivityFeed from './analytics/ActivityFeed';
import FadeIn from './ui/FadeIn';

const Dashboard: React.FC = () => {
    // Skeletons are handled inside child components
    return (
        <div className="space-y-6 glass-panel p-6 rounded-2xl">
            <FadeIn>
                <KPIRow />
            </FadeIn>

            {/* Heatmap & Activity Feed Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <FadeIn className="lg:col-span-2">
                    <GeographicHeatmap />
                </FadeIn>
                <FadeIn className="lg:col-span-1">
                    <ActivityFeed />
                </FadeIn>
            </div>

            {/* Sales Chart, Revenue Goal & Tasks Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <FadeIn className="xl:col-span-2">
                    <SalesTrendChart />
                </FadeIn>
                <FadeIn className="xl:col-span-1">
                    <RevenueGoalWidget />
                </FadeIn>
                <FadeIn className="xl:col-span-1">
                    <UpcomingTasks />
                </FadeIn>
            </div>

            {/* Customer Table - Full Width */}
            <FadeIn>
                <CustomerTable />
            </FadeIn>
        </div>
    );
};

export default Dashboard;