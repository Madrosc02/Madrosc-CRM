import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { cn } from '../../utils';

const baseButtonClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";

export const DealPipeline: React.FC = () => {
    const stages = [
        { name: 'Prospect', status: 'completed' },
        { name: 'Qualified', status: 'completed' },
        { name: 'Proposal', status: 'in-progress' },
        { name: 'Negotiation', status: 'pending' },
        { name: 'Closed', status: 'pending' },
    ];

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 text-lg">💼</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Deal Pipeline</h3>
                        <p className="text-sm text-slate-500">Deal Value: ₹2.5L</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {stages.map((stage, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            {stage.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            ) : stage.status === 'in-progress' ? (
                                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                </div>
                            ) : (
                                <Circle className="w-6 h-6 text-slate-300" />
                            )}
                        </div>
                        <span
                            className={`text-sm font-medium ${
                                stage.status === 'completed'
                                    ? 'text-slate-500'
                                    : stage.status === 'in-progress'
                                    ? 'text-purple-600 font-semibold'
                                    : 'text-slate-400'
                            }`}
                        >
                            {stage.name}
                        </span>
                        {stage.status === 'in-progress' && (
                            <span className="ml-auto text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                In Progress
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <button className={cn(baseButtonClasses, "w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg h-10 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg")}>
                <span>Move to Negotiation</span>
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
};
