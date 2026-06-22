import React from 'react';
import CustomerTable from './CustomerTable';
import UpcomingTasks from './UpcomingTasks';
import KPIRow from './analytics/KPIRow';
import SalesTrendChart from './analytics/SalesTrendChart';
import RevenueGoalWidget from './analytics/RevenueGoalWidget';
import GeographicHeatmap from './analytics/GeographicHeatmap';
import ActivityFeed from './analytics/ActivityFeed';
import FadeIn from './ui/FadeIn';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
    const { customers, tasks, sales, historicalSnapshots, loading, isAnalyticsLoading, crmError, retryLoadData } = useApp();
    const { userRole, authError, user } = useAuth();

    // Skeletons are handled inside child components
    return (
        <div className="space-y-6 glass-panel p-6 rounded-2xl">
            {/* Auth Error Debug Banner */}
            {authError && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-6 shadow-md border border-red-700">
                    <h3 className="font-bold text-lg mb-2">Authentication Database Error!</h3>
                    <p className="mb-2">Please take a screenshot of this error and send it to your AI assistant:</p>
                    <code className="block bg-red-900 bg-opacity-50 p-2 rounded text-sm break-all">
                        {authError}
                    </code>
                </div>
            )}
            
            {/* CRM Error Debug Banner with Retry */}
            {crmError && (
                <div className="bg-orange-500 text-white p-4 rounded-lg mb-6 shadow-md border border-orange-700">
                    <h3 className="font-bold text-lg mb-2">Data Fetching Error!</h3>
                    <p className="mb-2">We could not load your data. Please try the button below or take a screenshot of this error:</p>
                    <code className="block bg-orange-900 bg-opacity-50 p-2 rounded text-sm break-all mb-3">
                        {crmError}
                    </code>
                    {retryLoadData && (
                        <button 
                            onClick={retryLoadData}
                            className="bg-white text-orange-700 px-4 py-2 rounded-lg font-semibold hover:bg-orange-100 transition-colors"
                        >
                            🔄 Retry Loading Data
                        </button>
                    )}
                </div>
            )}

            {/* Empty data warning — shown when data loaded but is empty */}
            {!loading && !crmError && customers.length === 0 && (
                <div className="bg-blue-500 text-white p-4 rounded-lg mb-6 shadow-md border border-blue-700">
                    <h3 className="font-bold text-lg mb-2">No Data Found</h3>
                    <p className="mb-2">
                        You're logged in as <strong>{user?.email}</strong> (Role: {userRole || 'loading...'}), 
                        but no customer data was returned. This can happen if:
                    </p>
                    <ul className="list-disc list-inside mb-3 text-sm space-y-1">
                        <li>The database Row Level Security (RLS) policies are blocking your access</li>
                        <li>Your session token has expired — try logging out and back in</li>
                        <li>No customer data has been added yet</li>
                    </ul>
                    <div className="flex gap-3">
                        {retryLoadData && (
                            <button 
                                onClick={retryLoadData}
                                className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors"
                            >
                                🔄 Retry Loading
                            </button>
                        )}
                    </div>
                </div>
            )}

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