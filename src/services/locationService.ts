
export interface WeatherData {
    temperature: number;
    condition: string;
    isDay: boolean;
}

export interface NewsItem {
    id: string;
    title: string;
    source: string;
    time: string;
    url: string;
}

// Open-Meteo Geocoding API
const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
// Open-Meteo Weather API
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export const locationService = {
    async getCoordinates(city: string): Promise<{ lat: number; lon: number } | null> {
        try {
            const response = await fetch(`${GEO_API_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                return {
                    lat: data.results[0].latitude,
                    lon: data.results[0].longitude
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    },

    async getWeather(lat: number, lon: number): Promise<WeatherData | null> {
        try {
            const response = await fetch(
                `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`
            );
            const data = await response.json();

            if (data.current) {
                return {
                    temperature: data.current.temperature_2m,
                    condition: getWeatherCondition(data.current.weather_code),
                    isDay: data.current.is_day === 1
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching weather:', error);
            return null;
        }
    },

    // Mock News Service (Replace with real API if needed later)
    async getNews(city: string): Promise<NewsItem[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Return mock data relevant to the area/pharma context
        return [
            {
                id: '1',
                title: `New Pharma Distribution Hub planned near ${city}`,
                source: 'Local Business News',
                time: '2 hours ago',
                url: '#'
            },
            {
                id: '2',
                title: 'Seasonal flu cases rising in the district: Health Dept',
                source: 'Health Weekly',
                time: '5 hours ago',
                url: '#'
            }
        ];
    }
};

// Helper to map WMO weather codes to text
function getWeatherCondition(code: number): string {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Unknown';
}
