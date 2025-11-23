import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { generateSmartAlerts } from '../../services/alertService';

const SmartAlerts: React.FC = () => {
    const { customers, getAllSales, tasks } = useApp();
    const [sales, setSales] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            const s = await getAllSales();
            setSales(s);
        };
        fetchData();
    }, [getAllSales]);

    const alerts = useMemo(() => {
        return generateSmartAlerts(customers, sales, tasks);
    }, [customers, sales, tasks]);

    if (alerts.length === 0) {
        return null; // Don't show if no alerts
    }

    return (
        <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] flex items-center gap-2">
                    <i className="fas fa-bell text-blue-500"></i>
                    Smart Alerts
                </h3>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full">
                    {alerts.length} New
                </span>
            </div>

            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`p-3 rounded-lg border flex items-start gap-3 ${alert.type === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' :
                                alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' :
                                    alert.type === 'opportunity' ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' :
                                        'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                            }`}
                    >
                        <div className={`mt-1 ${alert.type === 'critical' ? 'text-red-500' :
                                alert.type === 'warning' ? 'text-amber-500' :
                                    alert.type === 'opportunity' ? 'text-green-500' :
                                        'text-blue-500'
                            }`}>
                            <i className={`fas ${alert.type === 'critical' ? 'fa-exclamation-circle' :
                                    alert.type === 'warning' ? 'fa-exclamation-triangle' :
                                        alert.type === 'opportunity' ? 'fa-star' :
                                            'fa-info-circle'
                                }`}></i>
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-sm font-bold ${alert.type === 'critical' ? 'text-red-900 dark:text-red-100' :
                                    alert.type === 'warning' ? 'text-amber-900 dark:text-amber-100' :
                                        alert.type === 'opportunity' ? 'text-green-900 dark:text-green-100' :
                                            'text-blue-900 dark:text-blue-100'
                                }`}>
                                {alert.title}
                            </h4>
                            <p className={`text-xs mt-0.5 ${alert.type === 'critical' ? 'text-red-700 dark:text-red-300' :
                                    alert.type === 'warning' ? 'text-amber-700 dark:text-amber-300' :
                                        alert.type === 'opportunity' ? 'text-green-700 dark:text-green-300' :
                                            'text-blue-700 dark:text-blue-300'
                                }`}>
                                {alert.message}
                            </p>
                        </div>
                        <button className={`text-xs font-medium px-2 py-1 rounded border transition-colors ${alert.type === 'critical' ? 'bg-white dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 hover:bg-red-50' :
                                alert.type === 'warning' ? 'bg-white dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-300 hover:bg-amber-50' :
                                    alert.type === 'opportunity' ? 'bg-white dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-300 hover:bg-green-50' :
                                        'bg-white dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 hover:bg-blue-50'
                            }`}>
                            {alert.action}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SmartAlerts;
