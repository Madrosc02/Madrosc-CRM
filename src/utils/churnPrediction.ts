import { Customer, Sale, Remark } from '../types';

export interface ChurnRiskData {
    customerId: string;
    customerName: string;
    riskScore: number; // 0-100
    riskLevel: 'High' | 'Medium' | 'Low';
    factors: string[];
    lastOrderDate: string;
    daysSinceLastOrder: number;
    outstandingBalance: number;
}

/**
 * Calculate churn risk for a single customer
 */
export function calculateCustomerChurnRisk(
    customer: Customer,
    sales: Sale[],
    remarks: Remark[]
): ChurnRiskData {
    let score = 0;
    const factors: string[] = [];
    const daysSinceLastOrder = customer.daysSinceLastOrder;

    // 1. Recency Risk (Max 40 points)
    if (daysSinceLastOrder > 90) {
        score += 40;
        factors.push(`Inactive for ${daysSinceLastOrder} days`);
    } else if (daysSinceLastOrder > 60) {
        score += 30;
        factors.push(`No orders in last 2 months`);
    } else if (daysSinceLastOrder > 30) {
        score += 15;
        factors.push(`No orders in last 30 days`);
    }

    // 2. Sales Trend Risk (Max 30 points)
    // Compare last 3 months vs previous 3 months
    // Simplified: Compare salesThisMonth vs avg6MoSales
    if (customer.avg6MoSales > 0) {
        const drop = (customer.avg6MoSales - customer.salesThisMonth) / customer.avg6MoSales;
        if (drop > 0.7) { // 70% drop
            score += 30;
            factors.push('Significant drop in sales volume');
        } else if (drop > 0.4) { // 40% drop
            score += 15;
            factors.push('Declining sales trend');
        }
    }

    // 3. Outstanding Balance Risk (Max 20 points)
    // If outstanding is high relative to average sales
    if (customer.avg6MoSales > 0) {
        const ratio = customer.outstandingBalance / customer.avg6MoSales;
        if (ratio > 2) {
            score += 20;
            factors.push('High outstanding balance ratio');
        } else if (ratio > 1) {
            score += 10;
        }
    }

    // 4. Engagement Risk (Max 10 points)
    // Check for negative sentiment in recent remarks (if available)
    // This is a placeholder as we'd need to process remarks sentiment
    const customerRemarks = (remarks || []).filter(r => r.customerId === customer.id);
    if (customerRemarks.length === 0 && daysSinceLastOrder > 30) {
        score += 10;
        factors.push('No recent interactions');
    }

    // Determine Risk Level
    let riskLevel: 'High' | 'Medium' | 'Low' = 'Low';
    if (score >= 70) riskLevel = 'High';
    else if (score >= 40) riskLevel = 'Medium';

    return {
        customerId: customer.id,
        customerName: customer.firmName || customer.name,
        riskScore: Math.min(100, score),
        riskLevel,
        factors,
        lastOrderDate: new Date(Date.now() - daysSinceLastOrder * 24 * 60 * 60 * 1000).toISOString(),
        daysSinceLastOrder,
        outstandingBalance: customer.outstandingBalance
    };
}

/**
 * Analyze all customers for churn risk
 */
export function analyzeChurnRisks(
    customers: Customer[],
    sales: Sale[],
    remarks: Remark[]
): ChurnRiskData[] {
    return customers
        .map(c => calculateCustomerChurnRisk(c, sales, remarks))
        .sort((a, b) => b.riskScore - a.riskScore); // Sort by highest risk
}
