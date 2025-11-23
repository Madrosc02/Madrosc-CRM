import React from 'react';
import CustomerTable from './CustomerTable';
import UpcomingTasks from './UpcomingTasks';
import KPIRow from './analytics/KPIRow';
import SalesTrendChart from './analytics/SalesTrendChart';
import ExecutiveSummary from './analytics/ExecutiveSummary';
import FadeIn from './ui/FadeIn';

const Dashboard: React.FC = () => {
    // Skeletons are handled inside child components
    return (
        <div className="space-y-6 glass-panel p-6 rounded-2xl">
            <FadeIn>
                <KPIRow />
            </FadeIn>

            {/* Executive Summary */}
            <FadeIn>
                <ExecutiveSummary />
            </FadeIn>

            {/* Sales Chart & Tasks Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <FadeIn className="xl:col-span-2">
                    <SalesTrendChart />
                </FadeIn>
                <FadeIn>
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