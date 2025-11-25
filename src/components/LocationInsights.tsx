import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, CloudSnow, Newspaper, ExternalLink, MapPin } from 'lucide-react';
import GlassCard from './common/GlassCard';
import { locationService, WeatherData, NewsItem } from '../services/locationService';

interface LocationInsightsProps {
    city: string;
    state?: string;
}

export const LocationInsights: React.FC<LocationInsightsProps> = ({ city, state }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get Coordinates & Weather
                const coords = await locationService.getCoordinates(city);
                if (coords) {
                    const weatherData = await locationService.getWeather(coords.lat, coords.lon);
                    setWeather(weatherData);
                }

                // 2. Get News
                const newsData = await locationService.getNews(city);
                setNews(newsData);
            } catch (error) {
                console.error("Failed to load location insights", error);
            } finally {
                setLoading(false);
            }
        };

        if (city) {
            fetchData();
        }
    }, [city]);

    // Helper to get Weather Icon
    const getWeatherIcon = (condition: string, isDay: boolean) => {
        const lowerCond = condition.toLowerCase();
        if (lowerCond.includes('clear')) return isDay ? <Sun className="w-8 h-8 text-amber-500" /> : <Sun className="w-8 h-8 text-indigo-300" />;
        if (lowerCond.includes('rain') || lowerCond.includes('drizzle')) return <CloudRain className="w-8 h-8 text-blue-400" />;
        if (lowerCond.includes('thunder')) return <CloudLightning className="w-8 h-8 text-purple-500" />;
        if (lowerCond.includes('snow')) return <CloudSnow className="w-8 h-8 text-cyan-200" />;
        return <Cloud className="w-8 h-8 text-slate-400" />;
    };

    if (!city) return null;

    return (
        <GlassCard className="p-0 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/20 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        {city} Insights
                    </h3>
                </div>
                {state && <span className="text-xs font-medium text-slate-500 bg-white/50 px-2 py-0.5 rounded-full">{state}</span>}
            </div>

            <div className="p-4 flex flex-col gap-4">
                {/* Weather Section */}
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-100 relative overflow-hidden group">
                    {loading ? (
                        <div className="flex items-center gap-3 animate-pulse">
                            <div className="w-10 h-10 bg-sky-200/50 rounded-full"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-20 bg-sky-200/50 rounded"></div>
                                <div className="h-3 w-16 bg-sky-200/50 rounded"></div>
                            </div>
                        </div>
                    ) : weather ? (
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/60 rounded-full shadow-sm">
                                    {getWeatherIcon(weather.condition, weather.isDay)}
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-800">{weather.temperature}°C</p>
                                    <p className="text-xs font-medium text-slate-500">{weather.condition}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-sky-600 bg-sky-100 px-2 py-1 rounded-full uppercase tracking-wide">Live</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-xs text-slate-400 py-2">Weather unavailable</div>
                    )}

                    {/* Decorative background blur */}
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-sky-400/20 rounded-full blur-xl group-hover:bg-sky-400/30 transition-all"></div>
                </div>

                {/* News Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Newspaper className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Local Updates</span>
                    </div>

                    {loading ? (
                        <div className="space-y-2">
                            <div className="h-12 w-full bg-slate-100 rounded-lg animate-pulse"></div>
                            <div className="h-12 w-full bg-slate-100 rounded-lg animate-pulse"></div>
                        </div>
                    ) : news.length > 0 ? (
                        <div className="space-y-2">
                            {news.map((item) => (
                                <a
                                    key={item.id}
                                    href={item.url}
                                    onClick={(e) => e.preventDefault()} // Prevent nav for mock
                                    className="block p-3 bg-white/50 hover:bg-white rounded-lg border border-slate-100 hover:border-indigo-200 transition-all group cursor-pointer"
                                >
                                    <p className="text-xs font-semibold text-slate-700 line-clamp-2 group-hover:text-indigo-700 transition-colors mb-1">
                                        {item.title}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400">{item.source} • {item.time}</span>
                                        <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-400" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-xs text-slate-400 py-2">No recent news</div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};
