export interface NewsItem {
    id: string;
    headline: string;
    timeAgo: string;
    type: 'health' | 'logistics' | 'business';
}

// In a real application, this would fetch from an API like NewsAPI or SerpAPI (Google News)
// For now, we dynamically generate hyper-local, industry-relevant insights based on the district.
export const fetchLocalNews = async (district: string, state: string): Promise<NewsItem[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const insights: NewsItem[] = [];

    // Simulate varying news based on string hash to keep it consistent but seemingly random
    const hash = district.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Insight 1: Health/Disease Outbreak (Critical for Pharma)
    const diseases = ['Seasonal flu', 'Dengue', 'Viral fever', 'Respiratory infections', 'Water-borne diseases'];
    const disease = diseases[hash % diseases.length];
    
    if (hash % 2 === 0) {
        insights.push({
            id: 'n1',
            headline: `Spike in ${disease.toLowerCase()} cases reported in ${district} hospitals`,
            timeAgo: '2 hours ago',
            type: 'health'
        });
    } else {
        insights.push({
            id: 'n1',
            headline: `Local health officials in ${district} issue ${disease.toLowerCase()} advisory`,
            timeAgo: '5 hours ago',
            type: 'health'
        });
    }

    // Insight 2: Logistics/Business (Important for CRM reps)
    const businessNews = [
        `New major pharmacy chain opening branch in ${district}`,
        `Highway construction causing delivery delays near ${district}`,
        `Local chemist association in ${state} announces new procurement guidelines`,
        `Upcoming local festival in ${district} expected to impact wholesale operations`
    ];
    
    insights.push({
        id: 'n2',
        headline: businessNews[hash % businessNews.length],
        timeAgo: '1 day ago',
        type: hash % 2 === 0 ? 'business' : 'logistics'
    });

    return insights;
};
