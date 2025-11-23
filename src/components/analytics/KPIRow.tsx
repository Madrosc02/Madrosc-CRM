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
    const { customers, loading, getAllSales, analyticsFilters } = useApp();
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

    const kpis = useMemo(() => {
        // Calculate pending orders (customers with sales this month but outstanding balance > 0)
        const pendingOrderCustomers = customers.filter(c => {
            const hasSalesThisMonth = c.salesThisMonth > 0;
            const hasOutstanding = c.outstandingBalance > 0;
            return hasSalesThisMonth && hasOutstanding;
        });

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
                trend="up"
                trendValue="+12%"
                onClick={() => alert(`Total Clients: ${kpis.totalCustomers}\n\nAll registered customers in the system.`)}
            />
            <StatCard
                icon="fa-clock"
                label="Pending Orders"
                value={kpis.pendingOrders}
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                trend="up"
                trendValue="+5%"
                onClick={() => alert(`Pending Orders: ${kpis.pendingOrders}\n\nCustomers with sales this month who still have outstanding balances.`)}
            />
            <StatCard
                icon="fa-chart-line"
                label="Sales in Period"
                value={`₹${(kpis.totalSales / 1000).toFixed(1)}k`}
                gradient="bg-gradient-to-br from-violet-500 to-purple-600"
                trend="up"
                trendValue="+8%"
                onClick={() => alert(`Sales in Period: ₹${kpis.totalSales.toLocaleString('en-IN')}\n\nTotal sales within the selected date range.`)}
            />
            <StatCard
                icon="fa-file-invoice-dollar"
                label="Outstanding"
                value={`₹${(kpis.totalOutstanding / 1000).toFixed(1)}k`}
                gradient="bg-gradient-to-br from-rose-500 to-pink-600"
                trend="down"
                trendValue="-2%"
                onClick={() => alert(`Total Outstanding: ₹${kpis.totalOutstanding.toLocaleString('en-IN')}\n\nTotal unpaid balances across all customers.`)}
            />
        </div>
    );
};

export default KPIRow;