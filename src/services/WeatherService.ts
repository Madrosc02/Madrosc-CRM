export interface WeatherData {
    temperature: number;
    description: string;
    iconCode: number;
}

// Basic WMO weather interpretation codes
const getWeatherDescription = (code: number): string => {
    if (code === 0) return 'Clear sky';
    if (code === 1 || code === 2 || code === 3) return 'Partly cloudy';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Cloudy';
};

export const fetchWeatherForDistrict = async (district: string): Promise<WeatherData | null> => {
    try {
        // 1. Get Lat/Lon for the district using Open-Meteo Geocoding API
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(district)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            return null; // Could not find coordinates
        }
        
        const { latitude, longitude } = geoData.results[0];

        // 2. Fetch current weather using coordinates
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`);
        const weatherData = await weatherResponse.json();

        if (weatherData && weatherData.current) {
            return {
                temperature: weatherData.current.temperature_2m,
                description: getWeatherDescription(weatherData.current.weather_code),
                iconCode: weatherData.current.weather_code
            };
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        return null;
    }
};
