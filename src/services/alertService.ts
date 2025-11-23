import { Customer, Sale, Task } from '../types';

export interface SmartAlert {
    id: string;
    type: 'critical' | 'warning' | 'opportunity' | 'info';
    title: string;
    message: string;
    action: string;
    actionLink?: string; // Could be a route or modal ID
    priority: number; // 1 (Highest) to 5 (Lowest)
    timestamp: string;
}

/**
 * Generate smart alerts based on CRM data
 */
export function generateSmartAlerts(
    customers: Customer[],
    sales: Sale[],
    tasks: Task[]
): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const now = new Date();

    // 1. Critical: High Churn Risk (Inactive > 75 days)
    const inactiveCustomers = customers.filter(c => c.daysSinceLastOrder > 75);
    if (inactiveCustomers.length > 0) {
        alerts.push({
            id: 'churn-risk-critical',
            type: 'critical',
            title: 'High Churn Risk',
            message: `${inactiveCustomers.length} customers haven't ordered in 75+ days.`,
            action: 'View List',
            priority: 1,
            timestamp: now.toISOString()
        });
    }

    // 2. Critical: Overdue Tasks
    const overdueTasks = tasks.filter(t => new Date(t.dueDate) < now && !t.completed);
    if (overdueTasks.length > 0) {
        alerts.push({
            id: 'overdue-tasks',
            type: 'critical',
            title: 'Overdue Tasks',
            message: `You have ${overdueTasks.length} overdue tasks requiring attention.`,
            action: 'View Tasks',
            priority: 1,
            timestamp: now.toISOString()
        });
    }

    // 3. Opportunity: Upsell Potential (Gold Tier Candidates)
    // Customers with high sales but not Gold tier
    const upgradeCandidates = customers.filter(c =>
        c.tier !== 'Gold' && c.avg6MoSales > 100000
    );
    if (upgradeCandidates.length > 0) {
        alerts.push({
            id: 'upsell-opportunity',
            type: 'opportunity',
            title: 'Tier Upgrade Opportunity',
            message: `${upgradeCandidates.length} customers qualify for Gold Tier upgrade.`,
            action: 'Review',
            priority: 2,
            timestamp: now.toISOString()
        });
    }

    // 4. Warning: High Outstanding Balance
    const highOutstandingCustomers = customers.filter(c =>
        c.outstandingBalance > 50000 && c.daysSinceLastOrder > 45
    );
    if (highOutstandingCustomers.length > 0) {
        alerts.push({
            id: 'high-outstanding',
            type: 'warning',
            title: 'Payment Collection',
            message: `${highOutstandingCustomers.length} customers have high outstanding & low activity.`,
            action: 'Collect',
            priority: 2,
            timestamp: now.toISOString()
        });
    }

    // 5. Info: New Customers
    // Customers added in last 7 days (simulated by checking if no sales yet but exists)
    // In a real app, we'd check created_at
    const newCustomers = customers.filter(c => c.salesThisMonth === 0 && c.avg6MoSales === 0);
    if (newCustomers.length > 0) {
        alerts.push({
            id: 'new-customers',
            type: 'info',
            title: 'New Customers',
            message: `${newCustomers.length} new customers added recently.`,
            action: 'Onboard',
            priority: 3,
            timestamp: now.toISOString()
        });
    }

    // Sort by priority
    return alerts.sort((a, b) => a.priority - b.priority);
}
