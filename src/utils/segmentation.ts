import { Customer, Sale } from '../types';

export interface CustomerSegment {
    id: string;
    name: string;
    description: string;
    customers: Customer[];
    totalRevenue: number;
    icon: string;
    color: string;
    priority: number;
}

interface RFMScores {
    recency: number;
    frequency: number;
    monetary: number;
}

/**
 * Calculate RFM (Recency, Frequency, Monetary) scores for a customer
 * Returns scores from 1-5 (5 being best)
 */
export function calculateRFMScores(customer: Customer, sales: Sale[]): RFMScores {
    const customerSales = sales.filter(s => s.customerId === customer.id);

    // Recency: Days since last order (lower is better)
    const recencyDays = customer.daysSinceLastOrder;
    let recencyScore = 5;
    if (recencyDays > 180) recencyScore = 1;
    else if (recencyDays > 120) recencyScore = 2;
    else if (recencyDays > 60) recencyScore = 3;
    else if (recencyDays > 30) recencyScore = 4;

    // Frequency: Number of orders
    const frequency = customerSales.length;
    let frequencyScore = 1;
    if (frequency >= 20) frequencyScore = 5;
    else if (frequency >= 10) frequencyScore = 4;
    else if (frequency >= 5) frequencyScore = 3;
    else if (frequency >= 2) frequencyScore = 2;

    // Monetary: Total revenue
    const monetary = customerSales.reduce((sum, s) => sum + s.amount, 0);
    let monetaryScore = 1;
    if (monetary >= 500000) monetaryScore = 5;
    else if (monetary >= 200000) monetaryScore = 4;
    else if (monetary >= 100000) monetaryScore = 3;
    else if (monetary >= 50000) monetaryScore = 2;

    return {
        recency: recencyScore,
        frequency: frequencyScore,
        monetary: monetaryScore
    };
}

/**
 * Segment customers based on RFM analysis
 */
export function segmentCustomers(customers: Customer[], sales: Sale[]): CustomerSegment[] {
    const segments: { [key: string]: Customer[] } = {
        champions: [],
        loyal: [],
        potentialLoyalist: [],
        atRisk: [],
        needsAttention: [],
        aboutToSleep: [],
        hibernating: [],
        lost: []
    };

    customers.forEach(customer => {
        const rfm = calculateRFMScores(customer, sales);
        const { recency: R, frequency: F, monetary: M } = rfm;

        // Segmentation logic based on RFM scores
        if (R >= 4 && F >= 4 && M >= 4) {
            segments.champions.push(customer);
        } else if (R >= 3 && F >= 3 && M >= 3) {
            segments.loyal.push(customer);
        } else if (R >= 4 && F <= 2 && M >= 3) {
            segments.potentialLoyalist.push(customer);
        } else if (R === 2 && F >= 3 && M >= 3) {
            segments.atRisk.push(customer);
        } else if (R === 2 && F === 2 && M >= 2) {
            segments.needsAttention.push(customer);
        } else if (R === 2 && F <= 2 && M <= 2) {
            segments.aboutToSleep.push(customer);
        } else if (R === 1 && F >= 2) {
            segments.hibernating.push(customer);
        } else {
            segments.lost.push(customer);
        }
    });

    const calculateRevenue = (custs: Customer[]) =>
        custs.reduce((sum, c) => sum + c.salesThisMonth, 0);

    return [
        {
            id: 'champions',
            name: 'Champions',
            description: 'Best customers - High value, frequent buyers',
            customers: segments.champions,
            totalRevenue: calculateRevenue(segments.champions),
            icon: 'fa-trophy',
            color: 'from-purple-500 to-indigo-600',
            priority: 1
        },
        {
            id: 'loyal',
            name: 'Loyal Customers',
            description: 'Regular, consistent buyers',
            customers: segments.loyal,
            totalRevenue: calculateRevenue(segments.loyal),
            icon: 'fa-star',
            color: 'from-blue-500 to-cyan-600',
            priority: 2
        },
        {
            id: 'potentialLoyalist',
            name: 'Potential Loyalists',
            description: 'Recent customers with potential',
            customers: segments.potentialLoyalist,
            totalRevenue: calculateRevenue(segments.potentialLoyalist),
            icon: 'fa-seedling',
            color: 'from-green-500 to-emerald-600',
            priority: 3
        },
        {
            id: 'atRisk',
            name: 'At Risk',
            description: 'Declining engagement - Need attention',
            customers: segments.atRisk,
            totalRevenue: calculateRevenue(segments.atRisk),
            icon: 'fa-exclamation-triangle',
            color: 'from-amber-500 to-orange-600',
            priority: 4
        },
        {
            id: 'needsAttention',
            name: 'Needs Attention',
            description: 'Below average - Require nurturing',
            customers: segments.needsAttention,
            totalRevenue: calculateRevenue(segments.needsAttention),
            icon: 'fa-bell',
            color: 'from-yellow-500 to-amber-600',
            priority: 5
        },
        {
            id: 'aboutToSleep',
            name: 'About to Sleep',
            description: 'Losing interest - Act now',
            customers: segments.aboutToSleep,
            totalRevenue: calculateRevenue(segments.aboutToSleep),
            icon: 'fa-bed',
            color: 'from-orange-500 to-red-600',
            priority: 6
        },
        {
            id: 'hibernating',
            name: 'Hibernating',
            description: 'Inactive - Need reactivation',
            customers: segments.hibernating,
            totalRevenue: calculateRevenue(segments.hibernating),
            icon: 'fa-moon',
            color: 'from-gray-500 to-slate-600',
            priority: 7
        },
        {
            id: 'lost',
            name: 'Lost',
            description: 'Require win-back strategy',
            customers: segments.lost,
            totalRevenue: calculateRevenue(segments.lost),
            icon: 'fa-times-circle',
            color: 'from-red-500 to-rose-600',
            priority: 8
        }
    ].filter(seg => seg.customers.length > 0); // Only return non-empty segments
}
