import React from 'react';
import { MapPin, Cloud, TrendingUp } from 'lucide-react';

export const TerritoryInsights: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100 border border-slate-200 text-slate-800 shadow-md rounded-xl h-96 flex flex-col p-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-50/20 to-transparent pointer-events-none" />

            <div className="flex flex-col h-full relative z-10">
                <div className="flex items-center gap-3 mb-5">
                    <div className="bg-blue-200 p-2 rounded-lg border border-blue-300 hover:bg-blue-300 transition-colors">
                        <MapPin className="w-5 h-5 text-blue-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Bihar Territory Insights</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-lg p-4 border border-sky-200 hover:from-sky-100 hover:to-blue-150 transition-all shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Cloud className="w-4 h-4 text-sky-600" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Weather</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 mb-0.5">19.6°C</div>
                        <div className="text-xs text-slate-500">Partly Cloudy</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-lg p-4 border border-emerald-200 hover:from-emerald-100 hover:to-teal-150 transition-all shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Growth</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 mb-0.5">+24%</div>
                        <div className="text-xs text-slate-500">This quarter</div>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Local Updates</div>
                    <div className="space-y-3">
                        <div className="pb-3 border-b border-slate-200">
                            <p className="text-sm font-medium text-slate-700 leading-snug mb-1">
                                New Pharma Distribution Hub planned near Bihar
                            </p>
                            <p className="text-xs text-slate-500">2 hours ago</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 leading-snug mb-1">
                                Seasonal flu cases rising in district
                            </p>
                            <p className="text-xs text-slate-500">5 hours ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
