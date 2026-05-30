/**
 * Sales & Revenue Analytics Dashboard Components
 * 
 * This file exports all dashboard components for clean modular imports
 * 
 * @module components/sales-revenue
 * @version 1.0.0
 */

// Main Layout
export { default as SalesRevenueLayout } from './SalesRevenueLayout';
export type { SalesRevenueLayoutProps } from './SalesRevenueLayout';

// Header
export { default as SalesRevenueHeader } from './SalesRevenueHeader';
export type { SalesRevenueHeaderProps } from './SalesRevenueHeader';

// KPI Cards
export { default as KPICards } from './KPICards';
export type { KPICardsProps } from './KPICards';

// Charts - Distribution
export { default as ZoneDistribution } from './ZoneDistribution';
export { default as CategoryMix } from './CategoryMix';

// Charts - Rankings
export { default as TopProductsByRevenue } from './TopProductsByRevenue';
export { default as TopStatesByRevenue } from './TopStatesByRevenue';

// Charts - Metrics
export { default as CollectionSummary } from './CollectionSummary';
export { default as ReceivablesAging } from './ReceivablesAging';

// Charts - Tables
export { default as SalesRepLeaderboard } from './SalesRepLeaderboard';

// Charts - Forecast & Progress
export { default as RevenueVsTarget } from './RevenueVsTarget';
export { default as MayTargetProgress } from './MayTargetProgress';
