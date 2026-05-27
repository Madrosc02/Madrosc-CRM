import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Cloud, TrendingUp, TrendingDown, Sun, CloudRain, Snowflake, AlertCircle, Truck, HeartPulse } from 'lucide-react';
import { Customer } from '../../types';
import { fetchWeatherForDistrict, WeatherData } from '../../services/WeatherService';
import { fetchLocalNews, NewsItem } from '../../services/NewsService';

interface TerritoryInsightsProps {
    customer: Customer;
}

export const TerritoryInsights: React.FC<TerritoryInsightsProps> = ({ customer }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const locationName = customer.district ? `${customer.district}, ${customer.state}` : customer.state;

    useEffect(() => {
        let isMounted = true;
        
        const loadInsights = async () => {
            setIsLoading(true);
            
            // Default reset
            setWeather(null);
            setNews([]);

            try {
                const [weatherData, newsData] = await Promise.all([
                    fetchWeatherForDistrict(customer.district || customer.state),
                    fetchLocalNews(customer.district || customer.state, customer.state)
                ]);

                if (isMounted) {
                    setWeather(weatherData);
                    setNews(newsData);
                }
            } catch (error) {
                console.error("Error loading territory insights:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        if (customer) {
            loadInsights();
        }

        return () => {
            isMounted = false;
        };
    }, [customer]);

    // Calculate Growth
    const growthData = useMemo(() => {
        const avg = customer.avg6MoSales || 0;
        const current = customer.salesThisMonth || 0;
        
        if (avg === 0) return { percentage: 0, isPositive: true };
        
        const diff = current - avg;
        const percentage = Math.round((diff / avg) * 100);
        
        return {
            percentage: Math.abs(percentage),
            isPositive: percentage >= 0,
            formatted: percentage >= 0 ? `+${percentage}%` : `${percentage}%`
        };
    }, [customer]);

    // Helper to render weather icon
    const renderWeatherIcon = (code?: number) => {
        if (code === undefined) return <Cloud className="w-4 h-4 text-sky-600" />;
        if (code === 0) return <Sun className="w-4 h-4 text-amber-500" />;
        if (code >= 61 && code <= 65) return <CloudRain className="w-4 h-4 text-blue-500" />;
        if (code >= 71 && code <= 77) return <Snowflake className="w-4 h-4 text-sky-300" />;
        return <Cloud className="w-4 h-4 text-sky-600" />;
    };

    // Helper to render news icon
    const renderNewsIcon = (type: string) => {
        if (type === 'health') return <HeartPulse className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />;
        if (type === 'logistics') return <Truck className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />;
        return <AlertCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />;
    };

    return (
        <div className="bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100 border border-slate-200 text-slate-800 shadow-md rounded-xl h-96 flex flex-col p-8 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-50/20 to-transparent pointer-events-none" />

            <div className="flex flex-col h-full relative z-10">
                <div className="flex items-center gap-3 mb-5">
                    <div className="bg-blue-200 p-2 rounded-lg border border-blue-300 hover:bg-blue-300 transition-colors shrink-0">
                        <MapPin className="w-5 h-5 text-blue-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 truncate" title={`${locationName} Insights`}>
                        {locationName} Insights
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Weather Card */}
                    <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-lg p-4 border border-sky-200 hover:from-sky-100 hover:to-blue-150 transition-all shadow-sm flex flex-col justify-center min-h-[90px]">
                        {isLoading ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-3 w-16 bg-sky-200 rounded"></div>
                                <div className="h-6 w-12 bg-sky-200 rounded"></div>
                            </div>
                        ) : weather ? (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    {renderWeatherIcon(weather.iconCode)}
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">Weather</span>
                                </div>
                                <div className="text-xl lg:text-2xl font-bold text-slate-800 mb-0.5">{weather.temperature}°C</div>
                                <div className="text-xs text-slate-500 truncate" title={weather.description}>{weather.description}</div>
                            </>
                        ) : (
                            <div className="text-xs text-slate-500 text-center">Weather unavailable</div>
                        )}
                    </div>

                    {/* Growth Card */}
                    <div className={`bg-gradient-to-br rounded-lg p-4 border transition-all shadow-sm flex flex-col justify-center min-h-[90px] ${
                        growthData.isPositive 
                            ? 'from-emerald-50 to-teal-100 border-emerald-200 hover:from-emerald-100 hover:to-teal-150' 
                            : 'from-rose-50 to-red-100 border-rose-200 hover:from-rose-100 hover:to-red-150'
                    }`}>
                        <div className="flex items-center gap-2 mb-2">
                            {growthData.isPositive ? (
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-rose-600" />
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">Growth</span>
                        </div>
                        <div className="text-xl lg:text-2xl font-bold text-slate-800 mb-0.5">{growthData.formatted}</div>
                        <div className="text-xs text-slate-500">vs Avg 6Mo</div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 shrink-0">Local Updates</div>
                    <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                        {isLoading ? (
                            <div className="space-y-4 animate-pulse">
                                <div>
                                    <div className="h-4 w-full bg-slate-200 rounded mb-1"></div>
                                    <div className="h-4 w-2/3 bg-slate-200 rounded mb-2"></div>
                                    <div className="h-2 w-16 bg-slate-200 rounded"></div>
                                </div>
                                <div>
                                    <div className="h-4 w-full bg-slate-200 rounded mb-1"></div>
                                    <div className="h-4 w-1/2 bg-slate-200 rounded mb-2"></div>
                                    <div className="h-2 w-16 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        ) : news.length > 0 ? (
                            news.map((item) => (
                                <div key={item.id} className="pb-3 border-b border-slate-200 last:border-0 last:pb-0">
                                    <div className="flex items-start gap-2 mb-1">
                                        {renderNewsIcon(item.type)}
                                        <p className="text-sm font-medium text-slate-700 leading-snug">
                                            {item.headline}
                                        </p>
                                    </div>
                                    <p className="text-xs text-slate-500 ml-5.5 pl-1">{item.timeAgo}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-slate-500 text-center mt-4">No local updates available for {customer.district}</div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Minimal styles for scrollbar inside the card if needed */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(148, 163, 184, 0.3);
                    border-radius: 10px;
                }
            `}} />
        </div>
    );
};
