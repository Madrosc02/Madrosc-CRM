import React from 'react';
import { ArrowRight } from 'lucide-react';

export const CustomerHealth: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-slate-100 border border-blue-200 rounded-xl shadow-md h-96 flex flex-col p-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-50/30 to-transparent pointer-events-none" />

            <div className="space-y-4 flex-1 flex flex-col overflow-hidden relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-700">Customer Health</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Overall engagement score</p>
                    </div>
                    <span className="bg-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-300">
                        Improving
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
                                stroke="#0284c7"
                                strokeWidth="10"
                                strokeDasharray={`${(68 / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold text-slate-700">68</div>
                            <div className="text-xs font-medium text-slate-500">Score</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 flex flex-col items-center space-y-1 hover:bg-blue-100 transition-colors">
                        <div className="text-xs font-semibold text-slate-700">Engagement</div>
                        <div className="w-full h-1.5 bg-blue-100/50 rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-blue-500 rounded-full" />
                        </div>
                        <div className="text-xs font-medium text-slate-600">High</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 flex flex-col items-center space-y-1 hover:bg-purple-100 transition-colors">
                        <div className="text-xs font-semibold text-slate-700">Payment</div>
                        <div className="w-full h-1.5 bg-purple-100/50 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-purple-500 rounded-full" />
                        </div>
                        <div className="text-xs font-medium text-slate-600">Good</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-emerald-100 rounded-lg p-3 border border-teal-200 flex flex-col items-center space-y-1 hover:bg-teal-100 transition-colors">
                        <div className="text-xs font-semibold text-slate-700">Order Freq.</div>
                        <div className="w-full h-1.5 bg-teal-100/50 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-teal-500 rounded-full" />
                        </div>
                        <div className="text-xs font-medium text-slate-600">Low</div>
                    </div>
                </div>

                <div className="mt-auto pt-2">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 group hover:bg-amber-100 transition-colors cursor-pointer">
                        <div className="text-amber-600 flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700">No orders in last 30 days</p>
                            <p className="text-xs text-slate-500 mt-0.5">Consider reaching out</p>
                        </div>
                        <button className="flex-shrink-0 text-amber-600 hover:text-amber-700 transition-colors">
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
