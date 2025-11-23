import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Sale } from '../../types';

interface ActivityItem {
    id: string;
    type: 'sale' | 'customer' | 'task';
    title: string;
    description: string;
    timestamp: Date;
    icon: string;
    color: string;
}

const RecentActivityFeed: React.FC = () => {
    const { filteredCustomers, tasks, getAllSales } = useApp();
    const [sales, setSales] = React.useState<Sale[]>([]);

    React.useEffect(() => {
        const fetchSales = async () => {
            const data = await getAllSales();
            setSales(data);
        };
        fetchSales();
    }, [getAllSales]);

    const activities = useMemo(() => {
        const items: ActivityItem[] = [];

        // Add recent sales
        sales.forEach(sale => {
            const customer = filteredCustomers.find(c => c.id === sale.customerId);
            items.push({
                id: `sale-${sale.id}`,
                type: 'sale',
                title: 'New Sale Recorded',
                description: `₹${sale.amount.toLocaleString('en-IN')} to ${customer?.name || 'Unknown Customer'}`,
                timestamp: new Date(sale.date),
                icon: 'fa-chart-line',
                color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            });
        });

        // Add recent customers (simulated based on lastUpdated for now as we don't have createdAt)
        filteredCustomers.forEach(customer => {
            items.push({
                id: `cust-${customer.id}`,
                type: 'customer',
                title: 'New Customer Added',
                description: `${customer.name} (${customer.tier} Tier)`,
                timestamp: new Date(customer.lastUpdated || new Date()), // Fallback to now if missing
                icon: 'fa-user-plus',
                color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            });
        });

        // Add completed tasks
        tasks.filter(t => t.completed).forEach(task => {
            items.push({
                id: `task-${task.id}`,
                type: 'task',
                title: 'Task Completed',
                description: task.task,
                timestamp: new Date(task.dueDate), // Using due date as proxy for completion time
                icon: 'fa-check-circle',
                color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
            });
        });

        // Sort by timestamp descending and take top 5
        return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
    }, [sales, filteredCustomers, tasks]);

    return (
        <div className="card-base p-6 h-full">
            <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-6">Recent Activity</h3>
            <div className="space-y-6">
                {activities.length > 0 ? (
                    activities.map((activity, index) => (
                        <div key={activity.id} className="flex gap-4 relative">
                            {/* Connector Line */}
                            {index !== activities.length - 1 && (
                                <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                            )}

                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${activity.color} z-10`}>
                                <i className={`fas ${activity.icon}`}></i>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">{activity.title}</p>
                                <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mt-0.5">{activity.description}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{activity.timestamp.toLocaleDateString()} • {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <p>No recent activity.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivityFeed;
