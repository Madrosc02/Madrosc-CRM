import React, { useMemo } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle, TrendingDown, Clock } from 'lucide-react';
import { Customer, Remark } from '../../types';

interface CustomerHealthProps {
    customer: Customer;
    remarks: Remark[];
}

export const CustomerHealth: React.FC<CustomerHealthProps> = ({ customer, remarks }) => {
    // Calculate metrics
    const healthData = useMemo(() => {
        // 1. Engagement (30%)
        let engagementScore = 20;
        let engagementLabel = 'Low';
        let engagementPercentage = 20;

        if (remarks && remarks.length > 0) {
            const lastRemark = new Date(remarks[0].timestamp);
            const daysSinceInteraction = (new Date().getTime() - lastRemark.getTime()) / (1000 * 3600 * 24);
            
            if (daysSinceInteraction <= 30) {
                engagementScore = 100;
                engagementLabel = 'High';
                engagementPercentage = 80;
            } else if (daysSinceInteraction <= 90) {
                engagementScore = 60;
                engagementLabel = 'Medium';
                engagementPercentage = 50;
            }
        }

        // 2. Payment (40%)
        let paymentScore = 20;
        let paymentLabel = 'Poor';
        let paymentPercentage = 20;
        
        const balance = customer.outstandingBalance || 0;
        const avgSales = customer.avg6MoSales || 1; // avoid div by 0
        
        if (balance <= 0) {
            paymentScore = 100;
            paymentLabel = 'Good';
            paymentPercentage = 80;
        } else if (balance <= avgSales) {
            paymentScore = 60;
            paymentLabel = 'Fair';
            paymentPercentage = 50;
        }

        // 3. Order Frequency (30%)
        let orderScore = 20;
        let orderLabel = 'Low';
        let orderPercentage = 20;
        
        const daysSinceOrder = customer.daysSinceLastOrder || 999;
        
        if (daysSinceOrder <= 30) {
            orderScore = 100;
            orderLabel = 'High';
            orderPercentage = 80;
        } else if (daysSinceOrder <= 60) {
            orderScore = 60;
            orderLabel = 'Medium';
            orderPercentage = 50;
        }

        // Overall Score
        const totalScore = Math.round((engagementScore * 0.3) + (paymentScore * 0.4) + (orderScore * 0.3));
        
        let status = 'At Risk';
        let statusColor = 'text-red-700 bg-red-200 border-red-300';
        if (totalScore >= 80) {
            status = 'Excellent';
            statusColor = 'text-emerald-700 bg-emerald-200 border-emerald-300';
        } else if (totalScore >= 60) {
            status = 'Stable';
            statusColor = 'text-blue-700 bg-blue-200 border-blue-300';
        }

        // Smart Insight
        let insightTitle = 'Doing Great';
        let insightDesc = 'Customer is perfectly healthy.';
        let insightIcon = <CheckCircle className="w-4 h-4" />;
        let insightColor = 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100';

        if (paymentScore === 20) {
            insightTitle = 'High Outstanding Balance';
            insightDesc = 'Consider following up on payments.';
            insightIcon = <AlertTriangle className="w-4 h-4" />;
            insightColor = 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100';
        } else if (orderScore === 20) {
            insightTitle = `No orders in ${daysSinceOrder} days`;
            insightDesc = 'Needs urgent attention to prevent churn.';
            insightIcon = <TrendingDown className="w-4 h-4" />;
            insightColor = 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100';
        } else if (engagementScore === 20) {
            insightTitle = 'No recent interactions';
            insightDesc = 'Reach out to reconnect with the customer.';
            insightIcon = <Clock className="w-4 h-4" />;
            insightColor = 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100';
        }

        return {
            totalScore,
            status,
            statusColor,
            engagementLabel,
            engagementPercentage,
            paymentLabel,
            paymentPercentage,
            orderLabel,
            orderPercentage,
            insightTitle,
            insightDesc,
            insightIcon,
            insightColor
        };
    }, [customer, remarks]);

    const circumference = 2 * Math.PI * 52;
    const strokeDasharray = `${(healthData.totalScore / 100) * circumference} ${circumference}`;

    // Color logic for the circle based on score
    const circleColor = healthData.totalScore >= 80 ? '#10b981' : healthData.totalScore >= 60 ? '#3b82f6' : '#ef4444';

    return (
        <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-slate-100 border border-blue-200 rounded-xl shadow-md h-96 flex flex-col p-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-50/30 to-transparent pointer-events-none" />

            <div className="space-y-4 flex-1 flex flex-col overflow-hidden relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-700">Customer Health</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Overall engagement score</p>
                    </div>
                    <span className={`${healthData.statusColor} text-xs font-semibold px-3 py-1 rounded-full border`}>
                        {healthData.status}
                    </span>
                </div>

                <div className="flex flex-col items-center py-2">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="#e0f2fe" strokeWidth="10" />
                            <circle
                                cx="60"
                                cy="60"
                                r="52"
                                fill="none"
                                stroke={circleColor}
                                strokeWidth="10"
                                strokeDasharray={strokeDasharray}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-slate-700">{healthData.totalScore}</div>
                            <div className="text-xs font-medium text-slate-500">Score</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 flex flex-col items-center space-y-1 hover:bg-blue-100 transition-colors">
                        <div className="text-xs font-semibold text-slate-700">Engagement</div>
                        <div className="w-full h-1.5 bg-blue-100/50 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${healthData.engagementPercentage}%` }} />
                        </div>
                        <div className="text-xs font-medium text-slate-600">{healthData.engagementLabel}</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 flex flex-col items-center space-y-1 hover:bg-purple-100 transition-colors">
                        <div className="text-xs font-semibold text-slate-700">Payment</div>
                        <div className="w-full h-1.5 bg-purple-100/50 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${healthData.paymentPercentage}%` }} />
                        </div>
                        <div className="text-xs font-medium text-slate-600">{healthData.paymentLabel}</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-emerald-100 rounded-lg p-3 border border-teal-200 flex flex-col items-center space-y-1 hover:bg-teal-100 transition-colors">
                        <div className="text-xs font-semibold text-slate-700">Order Freq.</div>
                        <div className="w-full h-1.5 bg-teal-100/50 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: `${healthData.orderPercentage}%` }} />
                        </div>
                        <div className="text-xs font-medium text-slate-600">{healthData.orderLabel}</div>
                    </div>
                </div>

                <div className="mt-auto pt-2">
                    <div className={`${healthData.insightColor} rounded-lg p-3 flex items-start gap-2 group transition-colors cursor-pointer border`}>
                        <div className="flex-shrink-0 mt-0.5">
                            {healthData.insightIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">{healthData.insightTitle}</p>
                            <p className="text-xs opacity-80 mt-0.5">{healthData.insightDesc}</p>
                        </div>
                        <button className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
