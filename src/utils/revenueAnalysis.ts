import { Customer } from '../types';

export interface RevenueOpportunity {
    id: string;
    type: 'tier-upgrade' | 'reactivation' | 'consistency';
    title: string;
    description: string;
    potentialRevenue: number;
    difficulty: 'Low' | 'Medium' | 'High';
    action: string;
    customerName: string;
    customerId: string;
}

export function analyzeRevenueOpportunities(customers: Customer[]): RevenueOpportunity[] {
    const opportunities: RevenueOpportunity[] = [];

    customers.forEach(customer => {
        // 1. Tier Upgrade Opportunities
        // Thresholds: Silver (50k), Gold (100k), Platinum (200k) - Example values
        // We look for customers within 20% of the next threshold
        const avgSales = customer.avg6MoSales;

        if (customer.tier !== 'Platinum') {
            let nextTier = '';
            let threshold = 0;

            if (customer.tier === 'Dead' || customer.tier === 'Bronze') {
                nextTier = 'Silver';
                threshold = 50000;
            } else if (customer.tier === 'Silver') {
                nextTier = 'Gold';
                threshold = 100000;
            } else if (customer.tier === 'Gold') {
                nextTier = 'Platinum';
                threshold = 200000;
            }

            if (threshold > 0 && avgSales < threshold && avgSales > threshold * 0.8) {
                const gap = threshold - avgSales;
                opportunities.push({
                    id: `upgrade-${customer.id}`,
                    type: 'tier-upgrade',
                    title: `Upgrade to ${nextTier}`,
                    description: `${customer.name} is only ₹${(gap / 1000).toFixed(1)}k away from ${nextTier} tier.`,
                    potentialRevenue: gap,
                    difficulty: 'Low',
                    action: 'Pitch Volume Discount',
                    customerName: customer.name,
                    customerId: customer.id
                });
            }
        }

        // 2. Reactivation (High Value Lost Customers)
        // High historic average but no sales recently (but not yet "Dead" in system or just manually marked)
        if (customer.avg6MoSales > 50000 && customer.salesThisMonth === 0 && customer.daysSinceLastOrder > 45 && customer.daysSinceLastOrder < 90) {
            opportunities.push({
                id: `reactivate-${customer.id}`,
                type: 'reactivation',
                title: 'Win-Back High Value',
                description: `Reactivate ${customer.name} to restore ₹${(customer.avg6MoSales / 1000).toFixed(1)}k monthly revenue.`,
                potentialRevenue: customer.avg6MoSales,
                difficulty: 'Medium',
                action: 'Schedule Visit',
                customerName: customer.name,
                customerId: customer.id
            });
        }

        // 3. Consistency (Erratic Ordering)
        // If sales this month is much lower than average (but not zero)
        if (customer.salesThisMonth > 0 && customer.salesThisMonth < customer.avg6MoSales * 0.5) {
            opportunities.push({
                id: `consistency-${customer.id}`,
                type: 'consistency',
                title: 'Boost Order Volume',
                description: `${customer.name} is ordering 50% below their average this month.`,
                potentialRevenue: customer.avg6MoSales - customer.salesThisMonth,
                difficulty: 'Low',
                action: 'Check Stock',
                customerName: customer.name,
                customerId: customer.id
            });
        }
    });

    return opportunities.sort((a, b) => b.potentialRevenue - a.potentialRevenue);
}
