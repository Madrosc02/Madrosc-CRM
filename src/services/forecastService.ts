import { Sale } from '../types';

export interface ForecastData {
    next30Days: { predicted: number; confidence: number; range: [number, number] };
    next60Days: { predicted: number; confidence: number; range: [number, number] };
    next90Days: { predicted: number; confidence: number; range: [number, number] };
    trend: 'up' | 'down' | 'stable';
    growthRate: number;
}

/**
 * Calculate simple linear regression
 */
function linearRegression(y: number[]) {
    const x = y.map((_, i) => i);
    const n = y.length;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumXX = x.reduce((a, b) => a + b * b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

/**
 * Generate sales forecast based on historical data
 */
export async function generateSalesForecast(sales: Sale[]): Promise<ForecastData> {
    // 1. Group sales by month for the last 12 months
    const now = new Date();
    const monthlySales: number[] = [];

    for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

        const total = sales
            .filter(s => {
                const d = new Date(s.date);
                return d >= monthStart && d <= monthEnd;
            })
            .reduce((sum, s) => sum + s.amount, 0);

        monthlySales.push(total);
    }

    // 2. Calculate trend using linear regression
    const { slope, intercept } = linearRegression(monthlySales);

    // 3. Predict next 3 months
    // Current month index is 11, so next months are 12, 13, 14
    const predict = (x: number) => Math.max(0, slope * x + intercept);

    const nextMonth = predict(12);
    const month2 = predict(13);
    const month3 = predict(14);

    // 4. Calculate confidence based on variance from the trend line
    const variance = monthlySales.reduce((sum, y, x) => {
        const predicted = slope * x + intercept;
        return sum + Math.pow(y - predicted, 2);
    }, 0) / monthlySales.length;

    const stdDev = Math.sqrt(variance);

    // Confidence decreases as we project further
    const calculateRange = (val: number, monthsOut: number): [number, number] => {
        const margin = stdDev * (1 + (monthsOut * 0.1)); // widen range for further months
        return [Math.max(0, val - margin), val + margin];
    };

    const totalLast3Months = monthlySales.slice(-3).reduce((a, b) => a + b, 0);
    const totalPredicted3Months = nextMonth + month2 + month3;
    const growthRate = totalLast3Months > 0
        ? ((totalPredicted3Months - totalLast3Months) / totalLast3Months) * 100
        : 0;

    return {
        next30Days: {
            predicted: nextMonth,
            confidence: 0.85,
            range: calculateRange(nextMonth, 1)
        },
        next60Days: {
            predicted: nextMonth + month2,
            confidence: 0.75,
            range: calculateRange(nextMonth + month2, 2)
        },
        next90Days: {
            predicted: nextMonth + month2 + month3,
            confidence: 0.65,
            range: calculateRange(nextMonth + month2 + month3, 3)
        },
        trend: slope > 0 ? 'up' : slope < 0 ? 'down' : 'stable',
        growthRate
    };
}
