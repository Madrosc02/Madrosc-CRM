import React from 'react';
import { Package, TrendingDown, Sparkles } from 'lucide-react';

export const InsightsGrid: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            <div className="rounded-xl border bg-blue-50 border-blue-200 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-200 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">Top 10 Products</h3>
                        <p className="text-sm text-slate-600">High-potential products not being ordered</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">10</div>
                        <div className="text-xs text-slate-500">Opportunities</div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-red-50 border-red-200 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-200 flex items-center justify-center shrink-0">
                        <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">Declining Products</h3>
                        <p className="text-sm text-slate-600">Products with decreasing order volume</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">4</div>
                        <div className="text-xs text-red-600 font-medium">Needs Action</div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-purple-50 border-purple-200 p-6 shadow-sm h-full flex flex-col justify-center">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-200 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">AI Suggested Schemes</h3>
                            <span className="bg-purple-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">AI</span>
                        </div>
                        <p className="text-sm text-slate-600">Personalized offers based on behavior</p>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                        <div className="text-2xl font-bold text-slate-900">3</div>
                        <div className="text-xs text-purple-600 font-medium">Perfect Match</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
