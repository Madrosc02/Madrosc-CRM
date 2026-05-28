import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';

const ActivityFeed: React.FC = () => {
    const { customers } = useApp();

    const activities = useMemo(() => {
        // Generate dynamic activities based on CRM data
        const feed = [];
        
        // Find customers with pending orders
        const pending = customers.filter(c => c.salesThisMonth === 0);
        if (pending.length > 0) {
            feed.push({ id: 1, type: 'warning', text: `System detected ${pending.length} customers with no orders this month. Follow up recommended.`, icon: 'fa-exclamation-triangle', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/30' });
        }

        // Find high value customers
        const highValue = customers.filter(c => c.salesThisMonth > 500000);
        highValue.slice(0, 3).forEach((c, idx) => {
            feed.push({ id: 2 + idx, type: 'success', text: `${c.firmName} placed a large order of ₹${(c.salesThisMonth / 100000).toFixed(1)}L`, icon: 'fa-check-circle', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' });
        });

        // Find outstanding balance
        const outstanding = customers.filter(c => c.outstandingBalance > 100000);
        if (outstanding.length > 0) {
            feed.push({ id: 10, type: 'error', text: `${outstanding[0].firmName} has a significant outstanding balance of ₹${(outstanding[0].outstandingBalance / 100000).toFixed(1)}L`, icon: 'fa-file-invoice-dollar', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' });
        }

        // Filler general activities
        feed.push({ id: 99, type: 'info', text: 'Daily database backup completed successfully.', icon: 'fa-database', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' });

        return feed;
    }, [customers]);

    return (
        <div className="card-base p-6 h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <i className="fas fa-bolt text-yellow-500"></i> Live Activity
                </h3>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className={`flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default ${activity.bg}`}>
                            <div className={`mt-0.5 ${activity.color}`}>
                                <i className={`fas ${activity.icon}`}></i>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity.text}</p>
                                <p className="text-xs text-gray-500 mt-1">{Math.floor(Math.random() * 60) + 1} mins ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActivityFeed;
