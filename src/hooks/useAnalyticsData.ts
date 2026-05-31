import { useState, useEffect, useMemo } from 'react';
import { Customer, Sale } from '../types';
import { useApp } from '../contexts/AppContext';

export interface RevenueData {
  month: string;
  actual: number;
  target: number;
}

export interface InsightItem {
  id: string;
  name: string;
  location: string;
  metric: string;
  customer?: Customer;
}

export interface InsightCategoryData {
  category: string;
  iconType: 'TrendingUp' | 'AlertTriangle' | 'Clock' | 'AlertCircle';
  count: number;
  badgeColor?: string;
  items?: InsightItem[];
}

export interface HealthAction {
  label: string;
  type: string;
}

export interface HealthScoreData {
  score: number;
  wins: string[];
  concerns: string[];
  actions: HealthAction[];
}

export const useAnalyticsData = () => {
  const { customers, getAllSales, analyticsFilters } = useApp();
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const salesData = await getAllSales();
        setAllSales(salesData);
      } catch (error) {
        console.error("Failed to fetch sales for analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [getAllSales]);

  // Apply Analytics Date Range Filter
  const filteredSales = useMemo(() => {
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

  // --- REVENUE OVERVIEW (Actual vs Target) ---
  const revenueOverview = useMemo<RevenueData[]>(() => {
    const data: RevenueData[] = [];
    const now = new Date();
    
    let startD = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    let endD = new Date(now.getFullYear(), now.getMonth(), 1);

    if (analyticsFilters.dateRange.start && analyticsFilters.dateRange.end) {
        startD = new Date(analyticsFilters.dateRange.start);
        startD.setDate(1); // Start at beginning of month for grouping
        endD = new Date(analyticsFilters.dateRange.end);
    }

    // Group sales by month-year
    const monthlySales: Record<string, number> = {};
    allSales.forEach(sale => {
      const d = new Date(sale.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlySales[key] = (monthlySales[key] || 0) + sale.amount;
    });

    // Generate month objects between startD and endD
    let currentD = new Date(startD);
    while (currentD <= endD || (currentD.getFullYear() === endD.getFullYear() && currentD.getMonth() === endD.getMonth())) {
      const key = `${currentD.getFullYear()}-${currentD.getMonth()}`;
      const actual = monthlySales[key] || 0;
      
      // Target Logic: 10% more than previous month, or base target if no history
      const prev = new Date(currentD.getFullYear(), currentD.getMonth() - 1, 1);
      const prevMonthActual = monthlySales[`${prev.getFullYear()}-${prev.getMonth()}`] || 0;
      
      const baseTarget = 2000; // Base minimal target
      const target = prevMonthActual > 0 ? Math.round(prevMonthActual * 1.1) : baseTarget;

      data.push({
        month: currentD.toLocaleString('default', { month: 'short' }) + (startD.getFullYear() !== endD.getFullYear() ? ` '${currentD.getFullYear().toString().slice(2)}` : ''),
        actual,
        target: Math.max(target, baseTarget)
      });

      // Move to next month
      currentD = new Date(currentD.getFullYear(), currentD.getMonth() + 1, 1);
    }
    
    return data;
  }, [allSales, analyticsFilters.dateRange]);

  // --- HEALTH SCORE & EXECUTIVE SUMMARY ---
  const healthScore = useMemo<HealthScoreData>(() => {
    let score = 100;
    const wins: string[] = [];
    const concerns: string[] = [];
    const actions: HealthAction[] = [];

    const activeCustomers = customers.filter(c => c.salesThisMonth > 0);
    const activeRatio = customers.length > 0 ? activeCustomers.length / customers.length : 0;
    
    // Check active ratio (deduct up to 30 points)
    if (activeRatio < 0.3) {
      score -= 30;
      concerns.push(`Low active customers ratio (${Math.round(activeRatio * 100)}%)`);
      actions.push({ label: "Launch reactivation campaign", type: "campaign" });
    } else if (activeRatio < 0.6) {
      score -= 15;
      concerns.push("Moderate active customer engagement");
    } else {
      wins.push(`Strong active customer base (${Math.round(activeRatio * 100)}%)`);
    }

    // Check outstanding balances (deduct up to 30 points)
    const highOutstanding = customers.filter(c => c.outstandingBalance > 5000);
    if (highOutstanding.length > customers.length * 0.2) {
      score -= 30;
      concerns.push("High number of clients with large outstanding balances");
      actions.push({ label: "Focus on outstanding payments collection", type: "collection" });
    } else if (highOutstanding.length > 0) {
      score -= 10;
      actions.push({ label: `Collect payments from ${highOutstanding.length} high-balance clients`, type: "collection" });
    } else {
      wins.push("Healthy outstanding balance levels");
    }

    // Check sales growth (deduct up to 40 points)
    // Using simple comparison of this month vs last month from revenueOverview
    const thisMonth = revenueOverview[revenueOverview.length - 1];
    const lastMonth = revenueOverview[revenueOverview.length - 2];
    
    if (thisMonth && lastMonth) {
      if (thisMonth.actual < lastMonth.actual) {
         score -= 40;
         concerns.push("Sales are down compared to last month");
         actions.push({ label: "Identify dropping accounts", type: "churn" });
      } else if (thisMonth.actual > lastMonth.actual) {
         let percentageStr = "N/A";
         if (lastMonth.actual > 0) {
            percentageStr = `+${Math.round((thisMonth.actual - lastMonth.actual)/lastMonth.actual*100)}%`;
         } else {
            percentageStr = "+100%"; // Avoid Infinity%
         }
         wins.push(`Sales growth maintained (${percentageStr})`);
      }
    }

    // Ensure score stays within 0-100
    score = Math.max(0, Math.min(100, score));

    return { score, wins, concerns, actions };
  }, [customers, revenueOverview]);

  // --- ACTIONABLE INSIGHTS ---
  const actionableInsights = useMemo<InsightCategoryData[]>(() => {
    // 1. Engagement Opportunities (High avg sales, no sales this month)
    const engagementOpps = customers.filter(c => c.avg6MoSales > 1000 && c.salesThisMonth === 0);
    
    // 2. No Sales This Month
    const noSales = customers.filter(c => c.salesThisMonth === 0);
    
    // 3. Potential Churn Risk (>60 days since last order)
    const churnRisk = customers.filter(c => c.daysSinceLastOrder > 60);

    return [
      {
        category: 'Engagement Opportunities',
        iconType: 'TrendingUp',
        count: engagementOpps.length,
        badgeColor: 'bg-blue-100 text-blue-700',
        items: engagementOpps.slice(0, 5).map(c => ({
          id: c.id,
          name: c.firmName,
          location: `${c.district}, ${c.state}`,
          metric: `Avg. ₹${c.avg6MoSales.toFixed(0)}`,
          customer: c
        }))
      },
      {
        category: 'No Sales This Month',
        iconType: 'AlertTriangle',
        count: noSales.length,
        badgeColor: 'bg-orange-100 text-orange-700',
        items: noSales.slice(0, 5).map(c => ({
            id: c.id,
            name: c.firmName,
            location: `${c.district}, ${c.state}`,
            metric: `Last Order: ${c.daysSinceLastOrder} days ago`,
            customer: c
        }))
      },
      {
        category: 'Potential Churn Risk',
        iconType: 'AlertCircle',
        count: churnRisk.length,
        badgeColor: 'bg-purple-100 text-purple-700',
        items: churnRisk.slice(0, 5).map(c => ({
            id: c.id,
            name: c.firmName,
            location: `${c.district}, ${c.state}`,
            metric: `Inactive: ${c.daysSinceLastOrder} days`,
            customer: c
        }))
      }
    ];
  }, [customers]);

  return {
    loading,
    allSales,
    filteredSales,
    revenueOverview,
    healthScore,
    actionableInsights
  };
};
