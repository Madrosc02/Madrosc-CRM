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

    const query = city || state;

    useEffect(() => {
        const fetchData = async () => {
            if (!query) return;

            setLoading(true);
            try {
                // 1. Get Coordinates & Weather
                const coords = await locationService.getCoordinates(query);
                if (coords) {
                    const weatherData = await locationService.getWeather(coords.lat, coords.lon);
                    setWeather(weatherData);
                }

                // 2. Get News
                const newsData = await locationService.getNews(query);
                setNews(newsData);
            } catch (error) {
                console.error("Failed to load location insights", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [query]);

    // Helper to get Weather Icon
    const getWeatherIcon = (condition: string, isDay: boolean) => {
        const lowerCond = condition.toLowerCase();
        if (lowerCond.includes('clear')) return isDay ? <Sun className="w-8 h-8 text-amber-500" /> : <Sun className="w-8 h-8 text-indigo-300" />;
        if (lowerCond.includes('rain') || lowerCond.includes('drizzle')) return <CloudRain className="w-8 h-8 text-blue-400" />;
        if (lowerCond.includes('thunder')) return <CloudLightning className="w-8 h-8 text-purple-500" />;
        if (lowerCond.includes('snow')) return <CloudSnow className="w-8 h-8 text-cyan-200" />;
        return <Cloud className="w-8 h-8 text-slate-400" />;
    };

    if (!query) {
        return (
            <GlassCard className="p-4 flex items-center justify-center h-32 bg-slate-50/50">
                <div className="text-center text-slate-400">
                    <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium">Location data unavailable</p>
                </div>
            </GlassCard>
        );
    }

    return (
        <div className="bg-[#00C48C] rounded-3xl p-6 text-white shadow-xl h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">
                    {query} Territory Insights
                </h3>
            </div>

            <div className="flex flex-col gap-4 flex-1">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Weather Box */}
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-2 mb-2 text-white/80">
                            <Cloud className="w-4 h-4" />
                            <span className="text-xs font-medium">Weather</span>
                        </div>
                        {loading ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-6 w-16 bg-white/20 rounded"></div>
                                <div className="h-3 w-12 bg-white/20 rounded"></div>
                            </div>
                        ) : weather ? (
                            <div>
                                <p className="text-2xl font-bold mb-0.5">{weather.temperature}°C</p>
                                <p className="text-xs text-white/80">{weather.condition}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-white/60">N/A</p>
                        )}
                    </div>

                    {/* Growth Box */}
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                        <div className="flex items-center gap-2 mb-2 text-white/80">
                            <div className="w-4 h-4 flex items-center justify-center">
                                <i className="fas fa-chart-line text-xs"></i>
                            </div>
                            <span className="text-xs font-medium">Growth</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold mb-0.5">+24%</p>
                            <p className="text-xs text-white/80">This quarter</p>
                        </div>
                    </div>
                </div>

                {/* News Section */}
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 flex-1">
                    <div className="flex items-center gap-2 mb-3 text-white/80">
                        <Newspaper className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Local Updates</span>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            <div className="h-10 w-full bg-white/10 rounded-lg animate-pulse"></div>
                            <div className="h-10 w-full bg-white/10 rounded-lg animate-pulse"></div>
                        </div>
                    ) : news.length > 0 ? (
                        <div className="space-y-3">
                            {news.slice(0, 2).map((item) => (
                                <a
                                    key={item.id}
                                    href={item.url}
                                    onClick={(e) => e.preventDefault()}
                                    className="block group cursor-pointer"
                                >
                                    <p className="text-sm font-semibold text-white leading-snug mb-1 group-hover:text-white/90 transition-colors line-clamp-2">
                                        {item.title}
                                    </p>
                                    <div className="flex items-center justify-between text-white/60 text-[10px]">
                                        <span>{item.source}</span>
                                        <span>{item.time}</span>
                                    </div>
                                    <div className="h-px w-full bg-white/10 mt-3 group-last:hidden"></div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-xs text-white/60 py-2">No recent news</div>
                    )}
                </div>
            </div>
        </div>
    );
};
