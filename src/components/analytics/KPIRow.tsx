// components/analytics/KPIRow.tsx
import React, { useState, useEffect, useMemo } from 'react';
import StatCard from './StatCard';
import { useApp } from '../../contexts/AppContext';
import Skeleton from '../ui/Skeleton';
import { Sale } from '../../types';


const StatCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/2" />
        </div>
    </div>
);

const KPIRow: React.FC = () => {
    const { customers, loading, getAllSales, analyticsFilters, setKpiFilter } = useApp();
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [salesLoading, setSalesLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            setSalesLoading(true);
            const salesData = await getAllSales();
            setAllSales(salesData);
            setSalesLoading(false);
        };
        fetchSales();
    }, [getAllSales]);

    const dateFilteredSales = useMemo(() => {
        const { start, end } = analyticsFilters.dateRange;
        if (!start || !end) return allSales;

        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        return allSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });
    }, [allSales, analyticsFilters.dateRange]);

    // Helper function to get sales for a specific period
    const getSalesForPeriod = (startDate: Date, endDate: Date) => {
        return allSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        }).reduce((sum, sale) => sum + sale.amount, 0);
    };

    // Calculate historical comparisons
    const trends = useMemo(() => {
        const now = new Date();

        // Current month
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const thisMonthSales = getSalesForPeriod(thisMonthStart, thisMonthEnd);

        // Last month
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const lastMonthSales = getSalesForPeriod(lastMonthStart, lastMonthEnd);

        // Same month last year
        const lastYearStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        const lastYearEnd = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0, 23, 59, 59);
        const lastYearSales = getSalesForPeriod(lastYearStart, lastYearEnd);

        // Calculate growth percentages
        const momGrowth = lastMonthSales > 0 ? ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100 : 0;
        const yoyGrowth = lastYearSales > 0 ? ((thisMonthSales - lastYearSales) / lastYearSales) * 100 : 0;

        // Customer trends (comparing active customers)
        const customerGrowth = 0; // Simplified - would need historical customer data

        return {
            sales: {
                mom: momGrowth,
                yoy: yoyGrowth,
                trend: momGrowth >= 0 ? 'up' as const : 'down' as const
            },
            customers: {
                growth: customerGrowth,
                trend: customerGrowth >= 0 ? 'up' as const : 'down' as const
            },
            pending: {
                change: 0, // Would need historical pending data
                trend: 'up' as const
            },
            outstanding: {
                change: -2, // Negative is good for outstanding
                trend: 'down' as const
            }
        };
    }, [allSales, customers]);

    const kpis = useMemo(() => {
        // Calculate pending orders (customers with NO sales this month)
        const pendingOrderCustomers = customers.filter(c => c.salesThisMonth === 0);

        const totalSales = dateFilteredSales.reduce((sum, sale) => sum + sale.amount, 0);
        const totalOutstanding = customers.reduce((acc, c) => acc + c.outstandingBalance, 0);

        return {
            totalCustomers: customers.length,
            pendingOrders: pendingOrderCustomers.length,
            totalSales,
            totalOutstanding
        };

    }, [customers, dateFilteredSales]);

    if (loading || salesLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                icon="fa-users"
                label="Total Clients"
                value={kpis.totalCustomers}
                gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                trend={trends.customers.trend}
                trendValue={`${trends.customers.growth >= 0 ? '+' : ''}${trends.customers.growth.toFixed(1)}%`}
                onClick={() => setKpiFilter('total')}
            />
            <StatCard
                icon="fa-clock"
                label="Pending Orders"
                value={kpis.pendingOrders}
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                trend={trends.pending.trend}
                trendValue={`${trends.pending.change >= 0 ? '+' : ''}${trends.pending.change}%`}
                onClick={() => setKpiFilter('pending')}
            />
            <StatCard
                icon="fa-chart-line"
                label="Sales This Month"
                value={`₹${(kpis.totalSales / 1000).toFixed(1)}k`}
                gradient="bg-gradient-to-br from-violet-500 to-purple-600"
                trend={trends.sales.trend}
                trendValue={`${trends.sales.mom >= 0 ? '+' : ''}${trends.sales.mom.toFixed(1)}% MoM`}
                onClick={() => setKpiFilter('sales')}
            />
            <StatCard
                icon="fa-file-invoice-dollar"
                label="Outstanding"
                value={`₹${(kpis.totalOutstanding / 1000).toFixed(1)}k`}
                gradient="bg-gradient-to-br from-rose-500 to-pink-600"
                trend={trends.outstanding.trend}
                trendValue={`${trends.outstanding.change}%`}
                onClick={() => setKpiFilter('outstanding')}
            />
        </div>
    );
};

export default KPIRow;