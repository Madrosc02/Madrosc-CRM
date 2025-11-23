import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Customer, Sale } from '../../types';

interface HealthMetrics {
    score: number;
    grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
    color: string;
    wins: string[];
    concerns: string[];
    recommendations: string[];
}

const ExecutiveSummary: React.FC = () => {
    const { customers, getAllSales } = useApp();
    const [sales, setSales] = React.useState<Sale[]>([]);

    React.useEffect(() => {
        const fetchSales = async () => {
            const data = await getAllSales();
            setSales(data);
        };
        fetchSales();
    }, [getAllSales]);

    const healthMetrics = useMemo((): HealthMetrics => {
        // Calculate various health indicators
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Sales this month
        const thisMonthSales = sales.filter(s => new Date(s.date) >= thisMonthStart)
            .reduce((sum, s) => sum + s.amount, 0);

        // Last month sales
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const lastMonthSales = sales.filter(s => {
            const d = new Date(s.date);
            return d >= lastMonthStart && d <= lastMonthEnd;
        }).reduce((sum, s) => sum + s.amount, 0);

        const revenueGrowth = lastMonthSales > 0 ? ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100 : 0;

        // Customer metrics
        const activeCustomers = customers.filter(c => c.salesThisMonth > 0).length;
        const retentionRate = customers.length > 0 ? (activeCustomers / customers.length) * 100 : 0;

        // Outstanding ratio
        const totalSales = customers.reduce((sum, c) => sum + c.salesThisMonth, 0);
        const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
        const outstandingRatio = totalSales > 0 ? (totalOutstanding / totalSales) : 0;

        // At-risk customers
        const atRiskCustomers = customers.filter(c => c.daysSinceLastOrder > 60).length;

        // Gold tier customers
        const goldCustomers = customers.filter(c => c.tier === 'Gold').length;

        // Calculate overall health score (0-100)
        let score = 0;

        // Revenue growth (25 points)
        if (revenueGrowth > 20) score += 25;
        else if (revenueGrowth > 10) score += 20;
        else if (revenueGrowth > 0) score += 15;
        else if (revenueGrowth > -10) score += 10;
        else score += 5;

        // Customer retention (25 points)
        if (retentionRate > 80) score += 25;
        else if (retentionRate > 60) score += 20;
        else if (retentionRate > 40) score += 15;
        else score += 10;

        // Outstanding ratio (20 points) - lower is better
        if (outstandingRatio < 0.1) score += 20;
        else if (outstandingRatio < 0.2) score += 15;
        else if (outstandingRatio < 0.3) score += 10;
        else score += 5;

        // Active customers (15 points)
        if (activeCustomers > 100) score += 15;
        else if (activeCustomers > 50) score += 12;
        else if (activeCustomers > 20) score += 8;
        else score += 5;

        // Growth indicators (15 points)
        if (goldCustomers > 20) score += 15;
        else if (goldCustomers > 10) score += 10;
        else score += 5;

        // Determine grade and color
        let grade: HealthMetrics['grade'];
        let color: string;

        if (score >= 80) {
            grade = 'Excellent';
            color = 'from-green-500 to-emerald-600';
        } else if (score >= 60) {
            grade = 'Good';
            color = 'from-blue-500 to-indigo-600';
        } else if (score >= 40) {
            grade = 'Fair';
            color = 'from-yellow-500 to-orange-600';
        } else {
            grade = 'Needs Attention';
            color = 'from-red-500 to-rose-600';
        }

        // Generate wins
        const wins: string[] = [];
        if (revenueGrowth > 10) wins.push(`Revenue up ${revenueGrowth.toFixed(1)}%`);
        if (goldCustomers > 0) wins.push(`${goldCustomers} Gold tier customers`);
        if (retentionRate > 70) wins.push(`${retentionRate.toFixed(0)}% customer retention`);

        // Generate concerns
        const concerns: string[] = [];
        if (atRiskCustomers > 5) concerns.push(`${atRiskCustomers} customers at churn risk`);
        if (outstandingRatio > 0.25) concerns.push(`High outstanding ratio (${(outstandingRatio * 100).toFixed(0)}%)`);
        if (revenueGrowth < 0) concerns.push(`Revenue declined ${Math.abs(revenueGrowth).toFixed(1)}%`);

        // Generate recommendations
        const recommendations: string[] = [];
        if (atRiskCustomers > 0) recommendations.push('Contact at-risk customers immediately');
        if (outstandingRatio > 0.2) recommendations.push('Focus on collecting outstanding payments');
        if (goldCustomers < 10) recommendations.push('Identify customers for tier upgrade');

        return {
            score: Math.round(score),
            grade,
            color,
            wins: wins.length > 0 ? wins : ['Steady performance maintained'],
            concerns: concerns.length > 0 ? concerns : ['No major concerns'],
            recommendations: recommendations.length > 0 ? recommendations : ['Continue current strategy']
        };
    }, [customers, sales]);

    return (
        <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                    Executive Summary
                </h3>
                <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${healthMetrics.color} text-white font-bold text-lg`}>
                    {healthMetrics.score}/100
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                        {healthMetrics.grade}
                    </span>
                    <span className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                        Business Health
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full bg-gradient-to-r ${healthMetrics.color} transition-all duration-500`}
                        style={{ width: `${healthMetrics.score}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Wins */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-trophy text-green-600 dark:text-green-400"></i>
                        <h4 className="font-semibold text-green-900 dark:text-green-100">This Week's Wins</h4>
                    </div>
                    <ul className="space-y-1">
                        {healthMetrics.wins.map((win, i) => (
                            <li key={i} className="text-sm text-green-800 dark:text-green-200 flex items-start">
                                <span className="mr-2">✅</span>
                                <span>{win}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Concerns */}
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-exclamation-triangle text-amber-600 dark:text-amber-400"></i>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100">Concerns</h4>
                    </div>
                    <ul className="space-y-1">
                        {healthMetrics.concerns.map((concern, i) => (
                            <li key={i} className="text-sm text-amber-800 dark:text-amber-200 flex items-start">
                                <span className="mr-2">⚠️</span>
                                <span>{concern}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-lightbulb text-blue-600 dark:text-blue-400"></i>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Recommended Actions</h4>
                    </div>
                    <ul className="space-y-1">
                        {healthMetrics.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                                <span className="mr-2">💡</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveSummary;
