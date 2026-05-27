import React, { useState, useEffect } from 'react';
import { Customer, Remark, Goal } from '../../types';
import { MapPin, User, Copy, RotateCw, Phone, Target } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ClientCardProps {
    currentCustomer: Customer | undefined;
    customerRemarks: Remark[];
    handleCallNow: () => void;
}
export const ClientCard: React.FC<ClientCardProps> = ({
    currentCustomer,
    customerRemarks,
    handleCallNow
}) => {
    const { getGoalsForCustomer } = useApp();
    const [activeGoal, setActiveGoal] = useState<Goal | null>(null);

    useEffect(() => {
        if (currentCustomer) {
            getGoalsForCustomer(currentCustomer.id).then(goals => {
                const ongoing = goals.find(g => g.status === 'InProgress');
                setActiveGoal(ongoing || null);
            });
        }
    }, [currentCustomer, getGoalsForCustomer]);

    const lastInteractionDate = customerRemarks.length > 0
        ? new Date(customerRemarks[0].timestamp).toLocaleDateString()
        : 'Never';

    return (
        <div className="bg-gradient-to-r from-slate-600 via-slate-500 to-slate-400 rounded-3xl p-8 text-white mb-6 shadow-lg">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h1 className="text-5xl font-bold mb-8 tracking-tight">
                        {currentCustomer?.firmName || currentCustomer?.name || 'Loading...'}
                    </h1>
                    <div className="flex items-center gap-6 flex-wrap">
                        <div className="flex items-center gap-2 text-base">
                            <MapPin className="w-5 h-5 flex-shrink-0" />
                            <span>{currentCustomer?.town ? `${currentCustomer.town}, ` : ''}{currentCustomer?.state || 'Unknown Territory'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-base">
                            <User className="w-5 h-5 flex-shrink-0" />
                            <span>{currentCustomer?.personName || 'No Contact Person'}</span>
                        </div>
                        <div className="bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider">
                            {currentCustomer?.tier || 'No Tier'}
                        </div>
                    </div>

                    {/* Mini Goal Tracker */}
                    {activeGoal && (
                        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 w-full max-w-md">
                            <div className="flex justify-between text-sm font-medium mb-2">
                                <span className="flex items-center gap-1.5"><Target className="w-4 h-4"/> {activeGoal.title}</span>
                                <span>{Math.round((activeGoal.currentAmount / (activeGoal.targetAmount || 1)) * 100)}%</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-2">
                                <div className="bg-green-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (activeGoal.currentAmount / (activeGoal.targetAmount || 1)) * 100)}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="text-sm opacity-95 font-medium">Last Interaction</div>
                    <div className="text-2xl font-bold mt-1">{lastInteractionDate}</div>
                    <div className="flex gap-3 mt-6 justify-end">
                        <button 
                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                            title="Refresh Data"
                        >
                            <RotateCw className="w-4 h-4" />
                        </button>
                        <button 
                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                            title="Copy Details"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={handleCallNow}
                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                            title="Call Now"
                        >
                            <Phone className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
