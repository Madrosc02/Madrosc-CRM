import React, { useMemo, useState, lazy, Suspense } from 'react';
import KPIRow from './KPIRow';
import { useApp } from '../../contexts/AppContext';
import DashboardSkeleton from '../skeletons/DashboardSkeleton';
import AnalyticsFilters from './AnalyticsFilters';
import FadeIn from '../ui/FadeIn';
import AnalyticsTabs from './AnalyticsTabs';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import AnalyticsControlBar from './AnalyticsControlBar';
import Skeleton from '../ui/Skeleton';

// Lazy load heavy chart components
const SalesByStateChart = lazy(() => import('./SalesByStateChart'));
const TierDistributionChart = lazy(() => import('./TierDistributionChart'));
const OverallSalesTrendChart = lazy(() => import('./OverallSalesTrendChart'));
const TopClients = lazy(() => import('./TopClients'));
const CustomerPerformanceDetail = lazy(() => import('./CustomerPerformanceDetail'));
const ActionableInsights = lazy(() => import('./ActionableInsights'));
const OverallPerformanceTable = lazy(() => import('./OverallPerformanceTable'));
const SalesForecast = lazy(() => import('./SalesForecast'));
const ExecutiveSummary = lazy(() => import('./ExecutiveSummary'));
const CustomerSegmentation = lazy(() => import('./CustomerSegmentation'));
const ChurnRiskDashboard = lazy(() => import('./ChurnRiskDashboard'));
const SmartAlerts = lazy(() => import('./SmartAlerts'));
const RevenueOpportunityAnalyzer = lazy(() => import('./RevenueOpportunityAnalyzer'));
const TerritoryHeatmap = lazy(() => import('./TerritoryHeatmap'));
const StateLeaderboard = lazy(() => import('./StateLeaderboard'));
const TerritoryMatrix = lazy(() => import('./TerritoryMatrix'));
const TerritoryKPIRow = lazy(() => import('./TerritoryKPIRow'));
const CohortAnalysis = lazy(() => import('./CohortAnalysis'));
const PerformanceSnapshot = lazy(() => import('./PerformanceSnapshot'));
const RevenueChart = lazy(() => import('./RevenueChart'));
const KPICards = lazy(() => import('../sales-revenue/KPICards'));
const ZoneDistribution = lazy(() => import('../sales-revenue/ZoneDistribution'));
const TopProductsByRevenue = lazy(() => import('../sales-revenue/TopProductsByRevenue'));
const TopStatesByRevenue = lazy(() => import('../sales-revenue/TopStatesByRevenue'));
const ReceivablesAging = lazy(() => import('../sales-revenue/ReceivablesAging'));
const CollectionSummary = lazy(() => import('../sales-revenue/CollectionSummary'));
const SalesRepLeaderboard = lazy(() => import('../sales-revenue/SalesRepLeaderboard'));
const RevenueVsTarget = lazy(() => import('../sales-revenue/RevenueVsTarget'));
const MayTargetProgress = lazy(() => import('../sales-revenue/MayTargetProgress'));
const CategoryMix = lazy(() => import('../sales-revenue/CategoryMix'));
const CreditRiskExposure = lazy(() => import('./CreditRiskExposure'));
const CrossSellMatrix = lazy(() => import('./CrossSellMatrix'));
const ProductAffinityMatrix = lazy(() => import('./ProductAffinityMatrix'));
const QuotaPacingChart = lazy(() => import('./QuotaPacingChart'));
const PipelineFunnel = lazy(() => import('./PipelineFunnel'));
const WinLossAnalysis = lazy(() => import('./WinLossAnalysis'));

const ChartFallback = () => <div className="h-64 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></div></div>;

const AnalyticsPage: React.FC = () => {
    const { loading, analyticsFilters, customers, invoices } = useApp();
    const analyticsData = useAnalyticsData();
    const [activeTab, setActiveTab] = useState('overview');
    const [salesSubTab, setSalesSubTab] = useState('performance');
    const [customersSubTab, setCustomersSubTab] = useState('risk');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [globalDateRange, setGlobalDateRange] = useState({ start: '2026-05-01', end: '2026-05-31' });
    const [globalTier, setGlobalTier] = useState('all');
    const [globalState, setGlobalState] = useState('all');

    const availableStates = useMemo(() => {
        if (!customers) return [];
        const states = new Set<string>();
        customers.forEach(c => c.state && states.add(c.state.trim()));
        return Array.from(states).sort();
    }, [customers]);

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
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap">Analytics Hub</h1>
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

                <AnalyticsControlBar
                    dateRange={globalDateRange}
                    setDateRange={setGlobalDateRange}
                    tierFilter={globalTier}
                    setTierFilter={setGlobalTier}
                    stateFilter={globalState}
                    setStateFilter={setGlobalState}
                    availableStates={availableStates}
                />

                {selectedCustomerData ? (
                    <FadeIn>
                        <Suspense fallback={<ChartFallback />}>
                            <CustomerPerformanceDetail customer={selectedCustomerData} />
                        </Suspense>
                    </FadeIn>
                ) : (
                    <div className="space-y-6">
                        <AnalyticsTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />

                        <Suspense fallback={<ChartFallback />}>
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
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit mb-4">
                                        {(['performance', 'receivables', 'products_regions'] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setSalesSubTab(tab)}
                                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${salesSubTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                            >
                                                {tab === 'products_regions' ? 'Products & Regions' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                            </button>
                                        ))}
                                    </div>

                                    {salesSubTab === 'performance' && (
                                        <div className="space-y-6">
                                            <KPICards dateRange={globalDateRange} />
                                            
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                                <div className="h-full">
                                                    <QuotaPacingChart />
                                                </div>
                                                <div className="h-full">
                                                    <PipelineFunnel />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                                <div className="h-full">
                                                    <SalesRepLeaderboard />
                                                </div>
                                                <div className="h-full">
                                                    <WinLossAnalysis />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {salesSubTab === 'receivables' && (
                                        <div className="space-y-6">
                                            <ReceivablesAging />
                                            <CollectionSummary />
                                        </div>
                                    )}

                                    {salesSubTab === 'products_regions' && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <TopProductsByRevenue />
                                                <CategoryMix />
                                            </div>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <TopStatesByRevenue />
                                                <ZoneDistribution />
                                            </div>
                                        </div>
                                    )}
                                </FadeIn>
                            )}

                            {/* CUSTOMERS TAB */}
                            {activeTab === 'customers' && (
                                <FadeIn className="space-y-6">
                                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit mb-4">
                                        {(['risk', 'segmentation'] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setCustomersSubTab(tab)}
                                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${customersSubTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                            >
                                                {tab === 'risk' ? 'Risk & Retention' : 'Segmentation & Cross-Sell'}
                                            </button>
                                        ))}
                                    </div>

                                    {customersSubTab === 'risk' && (
                                        <div className="space-y-6">
                                            <CreditRiskExposure customers={customers} />
                                            <div className="card-base p-6">
                                                <ChurnRiskDashboard sales={analyticsData.filteredSales} />
                                            </div>
                                            <div className="card-base p-6">
                                                <CohortAnalysis sales={analyticsData.allSales} />
                                            </div>
                                        </div>
                                    )}

                                    {customersSubTab === 'segmentation' && (
                                        <div className="space-y-6">
                                            <CrossSellMatrix customers={customers} invoices={invoices} />
                                            <div className="card-base p-6">
                                                <CustomerSegmentation sales={analyticsData.filteredSales} />
                                            </div>
                                            <div className="card-base p-6">
                                                <TierDistributionChart />
                                            </div>
                                        </div>
                                    )}
                                </FadeIn>
                            )}

                            {/* TERRITORY TAB */}
                            {activeTab === 'territory' && (
                                <FadeIn className="space-y-6">
                                    <TerritoryKPIRow customers={customers} />
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        <div className="h-full">
                                            <TerritoryHeatmap />
                                        </div>
                                        <div className="h-full">
                                            <StateLeaderboard customers={customers} />
                                        </div>
                                    </div>
                                    <ProductAffinityMatrix />
                                    <div>
                                        <TerritoryMatrix customers={customers} />
                                    </div>
                                </FadeIn>
                            )}
                        </Suspense>
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
                        <Suspense fallback={<ChartFallback />}>
                            <SmartAlerts insights={analyticsData.actionableInsights} />
                            <PerformanceSnapshot customers={customers} healthScore={analyticsData.healthScore} />
                        </Suspense>
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
