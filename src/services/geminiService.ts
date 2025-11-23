// services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import { Customer, Sale, Remark, Task } from '../types';

// Per instructions, API key must be from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIPerformanceReview = async (
    customer: Customer,
    sales: Sale[],
    remarks: Remark[]
): Promise<string> => {
    try {
        const salesSummary = sales.length > 0
            ? `Recent sales: ${sales.slice(0, 5).map(s => `₹${s.amount.toLocaleString('en-IN')} on ${new Date(s.date).toLocaleDateString()}`).join(', ')}.`
            : 'No recent sales.';

        const remarksSummary = remarks.length > 0
            ? `Recent remarks: ${remarks.slice(0, 3).map(r => `"${r.remark}" on ${new Date(r.timestamp).toLocaleDateString()}`).join('; ')}.`
            : 'No recent remarks.';

        const prompt = `
            Analyze the following customer for a B2B sales representative and provide a concise performance review in markdown format.
            The review should be brief (2-3 short paragraphs), insightful, and suggest a next action.
            
            **Customer Data:**
            - Name: ${customer.name}
            - Tier: ${customer.tier}
            - Location: ${customer.district}, ${customer.state}
            - Sales This Month: ₹${customer.salesThisMonth.toLocaleString('en-IN')}
            - Average 6-Month Sales: ₹${customer.avg6MoSales.toLocaleString('en-IN')}
            - Outstanding Balance: ₹${customer.outstandingBalance.toLocaleString('en-IN')}
            - Days Since Last Order: ${customer.daysSinceLastOrder}

            **Sales History:**
            ${salesSummary}

            **Interaction Remarks:**
            ${remarksSummary}

            **Analysis Guidelines:**
            - Start with a bold summary heading (e.g., **Gold Tier Star** or **Potential Churn Risk**).
            - Evaluate their current performance against their average.
            - Mention any risks (e.g., high outstanding balance, long time since last order).
            - Conclude with a clear, actionable recommendation for the sales rep (e.g., "Next Action: Follow up on the outstanding balance.").
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating AI review:", error);
        return "### Analysis Error\nCould not generate an AI-powered review at this time. Please check your API configuration and try again.";
    }
};

export const generateAIAnalyticsSummary = async (
    customers: Customer[],
    tasks: Task[]
): Promise<string> => {
    try {
        const totalCustomers = customers.length;
        const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
        const totalSalesThisMonth = customers.reduce((sum, c) => sum + c.salesThisMonth, 0);
        const activeCustomers = customers.filter(c => c.salesThisMonth > 0).length;
        const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && !t.completed).length;

        const tierDistribution = customers.reduce((acc, c) => {
            acc[c.tier] = (acc[c.tier] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const prompt = `
            Analyze the following overall CRM data and provide a concise summary for a sales manager in markdown format.
            The summary should highlight key trends, potential issues, and strategic recommendations. Format it with sections for "Key Highlights", "Areas for Attention", and "Recommendations".
            
            **Overall CRM Data:**
            - Total Customers: ${totalCustomers}
            - Active Customers (This Month): ${activeCustomers}
            - Total Sales This Month: ₹${totalSalesThisMonth.toLocaleString('en-IN')}
            - Total Outstanding Balance: ₹${totalOutstanding.toLocaleString('en-IN')}
            - Overdue Tasks: ${overdueTasks}
            - Tier Distribution: ${JSON.stringify(tierDistribution)}

            **Analysis Guidelines:**
            1.  **Key Highlights:** Mention positive trends like sales figures or customer activity.
            2.  **Areas for Attention:** Point out risks like high outstanding balances, a large number of inactive customers, or overdue tasks.
            3.  **Recommendations:** Provide 2-3 actionable suggestions for the manager (e.g., "Launch a re-engagement campaign for 'Dead' tier customers." or "Focus the team on clearing overdue tasks to improve customer relations.").
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating AI analytics summary:", error);
        return "### Analysis Error\nCould not generate AI-powered analytics insights. Please check your API configuration and try again.";
    }
}

export const generateSalesForecast = async (sales: Sale[]): Promise<string> => {
    try {
        const salesSummary = sales
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 50) // Use recent transactions
            .map(s => `₹${s.amount.toLocaleString('en-IN')} on ${new Date(s.date).toLocaleDateString()}`)
            .join('\n');

        const prompt = `
            You are a sales analyst AI. Analyze the following historical sales data and provide a concise sales forecast for the next business quarter.
            The data contains sale amounts and dates. Today's date is ${new Date().toLocaleDateString()}.
            Present your forecast in markdown format.
            Include a "Key Trends" section identifying patterns (e.g., seasonality, growth/decline).
            Include a "Next Quarter Forecast" section with a projected sales range (e.g., ₹X to ₹Y) and your reasoning.
            Conclude with "Recommendations" suggesting 1-2 actions to improve sales.

            **Historical Sales Data (last 50 transactions):**
            ${salesSummary}

            **Your Response (Markdown):**
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating sales forecast:", error);
        return "### Forecast Error\nCould not generate sales forecast. Please check API configuration.";
    }
};

export const interpretNaturalLanguageSearch = async (query: string, customers: Customer[]): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                You are an intelligent search API for a CRM. Your task is to interpret a natural language query and find matching customers from a provided JSON list.
                Respond ONLY with a JSON array of strings, where each string is the 'id' of a matching customer. Do not provide any explanation or other text.
                If no customers match, return an empty array [].

                **Customer Data Schema:**
                - id: string
                - name: string
                - contact: string
                - alternateContact?: string
                - tier: 'Gold' | 'Silver' | 'Bronze' | 'Dead'
                - state: string
                - district: string
                - salesThisMonth: number
                - avg6MoSales: number
                - outstandingBalance: number
                - daysSinceLastOrder: number

                **User Query:**
                "${query}"

                **Customer List (JSON):**
                ${JSON.stringify(customers.map(({ id, ...rest }) => ({ id, ...rest })))}

                **Your Response (JSON array of IDs only):**
            `,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    }
                }
            }
        });

        // The response text is a JSON string, so we need to parse it.
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error interpreting natural language search:", error);
        return [];
    }
};

export const generateTaskFromRemark = async (remarkText: string): Promise<{ task: string; dueDate: string } | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                You are an intelligent assistant that detects actionable tasks from text. Analyze the following remark from a CRM.
                If you detect a clear task with an implied or explicit due date, respond with a JSON object containing 'task' and 'dueDate'. The dueDate must be a full ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ).
                Use today's date, ${new Date().toISOString()}, as a reference for relative dates like "next week" or "tomorrow".
                If no actionable task is found, respond with an empty JSON object {}.

                **Remark:**
                "${remarkText}"

                **Your Response (JSON):**
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        task: { type: Type.STRING },
                        dueDate: { type: Type.STRING },
                    },
                },
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && result.task && result.dueDate) {
            return result;
        }
        return null;
    } catch (error) {
        console.error("Error generating task from remark:", error);
        return null;
    }
}

export const generateSummaryFromNotes = async (notes: string): Promise<{ summary: string; actionItems: { task: string; dueDate: string }[] } | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                You are an intelligent assistant for a CRM. Analyze the following meeting or call notes.
                1.  Provide a concise summary of the conversation in markdown format.
                2.  Extract any clear, actionable tasks for the sales representative.
                3.  For each task, suggest a due date. Use today's date, ${new Date().toISOString()}, as a reference for relative dates.

                Respond with a JSON object.

                **Notes:**
                "${notes}"

                **Your Response (JSON):**
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: "A concise summary of the notes in markdown format."
                        },
                        actionItems: {
                            type: Type.ARRAY,
                            description: "A list of actionable tasks found in the notes.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    task: {
                                        type: Type.STRING,
                                        description: "The description of the task."
                                    },
                                    dueDate: {
                                        type: Type.STRING,
                                        description: "The suggested due date in ISO 8601 format."
                                    }
                                },
                                required: ["task", "dueDate"]
                            }
                        }
                    },
                    required: ["summary", "actionItems"]
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && result.summary && result.actionItems) {
            return result;
        }
        return null;
    } catch (error) {
        console.error("Error generating summary from notes:", error);
        throw error;
    }
};

export const analyzeRemarkSentiment = async (remarkText: string): Promise<{ sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed' } | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                Analyze the sentiment of the following CRM remark.
                Classify it as 'Positive', 'Neutral', 'Negative', or 'Mixed'.
                Respond ONLY with a JSON object containing the "sentiment" key.

                **Remark:**
                "${remarkText}"

                **Your Response (JSON):**
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentiment: {
                            type: Type.STRING,
                            enum: ['Positive', 'Neutral', 'Negative', 'Mixed']
                        },
                    },
                    required: ["sentiment"]
                },
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && result.sentiment) {
            return result;
        }
        return null;
    } catch (error) {
        console.error("Error analyzing remark sentiment:", error);
        return null;
    }
};

export const suggestBestContactTime = async (remarks: Remark[]): Promise<{ suggestion: string; reasoning: string } | null> => {
    if (remarks.length < 3) { // Not enough data for a meaningful suggestion
        return Promise.resolve({
            suggestion: "Anytime",
            reasoning: "Not enough interaction data to provide a specific suggestion."
        });
    }

    try {
        const interactionHistory = remarks
            .map(r => `- Remark left on ${new Date(r.timestamp).toLocaleString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: true })}`)
            .join('\n');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                You are a CRM assistant AI. Analyze the following customer interaction timestamps to identify a pattern for the best time to contact them.
                Today's date is ${new Date().toLocaleDateString()}.
                Based on the pattern, provide a concise suggestion (e.g., "Weekday Mornings", "Friday Afternoons") and a brief reasoning.
                Respond with a JSON object containing "suggestion" and "reasoning".

                **Interaction History:**
                ${interactionHistory}

                **Your Response (JSON):**
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestion: {
                            type: Type.STRING,
                            description: "A concise suggestion for the best time to contact."
                        },
                        reasoning: {
                            type: Type.STRING,
                            description: "A brief explanation for the suggestion."
                        }
                    },
                    required: ["suggestion", "reasoning"]
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && result.suggestion && result.reasoning) {
            return result;
        }
        return null;
    } catch (error) {
        console.error("Error suggesting best contact time:", error);
        return null;
    }
};

export interface AIGoalSuggestion {
    title: string;
    targetAmount: number;
    deadline: string; // ISO string
    milestones: {
        description: string;
        targetDate: string; // ISO string
    }[];
}

export const suggestGoalsAndMilestones = async (customer: Customer, sales: Sale[]): Promise<AIGoalSuggestion[]> => {
    try {
        const salesSummary = sales.length > 0
            ? `Recent sales: ${sales.slice(0, 10).map(s => `₹${s.amount.toLocaleString('en-IN')} on ${new Date(s.date).toLocaleDateString()}`).join(', ')}.`
            : 'No recent sales.';

        const prompt = `
            You are an expert sales strategist AI. Analyze the customer profile and their recent sales history to suggest 1-2 ambitious but achievable sales goals for the next quarter.
            For each goal, also provide 2-3 actionable milestones a sales representative should take to achieve it.
            Use today's date, ${new Date().toISOString()}, as a reference for setting deadlines. Deadlines for goals should be about 3 months from now. Milestone dates should be spread out logically before the goal deadline.
            
            **Customer Profile:**
            - Name: ${customer.name}
            - Tier: ${customer.tier}
            - Average 6-Month Sales: ₹${customer.avg6MoSales.toLocaleString('en-IN')}
            - Sales This Month: ₹${customer.salesThisMonth.toLocaleString('en-IN')}
            - Days Since Last Order: ${customer.daysSinceLastOrder}

            **Recent Sales History:**
            ${salesSummary}

            **Your Task:**
            Generate a JSON array of goal objects. Each object must contain:
            - "title": A clear, concise goal title (e.g., "Increase Quarterly Sales by 20%").
            - "targetAmount": A numeric sales target. This should be a reasonable increase over their historical average.
            - "deadline": A goal deadline in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
            - "milestones": An array of milestone objects, each with:
                - "description": A short, actionable task.
                - "targetDate": A suggested due date for the milestone in ISO 8601 format.

            **Your Response (JSON array only):**
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            targetAmount: { type: Type.NUMBER },
                            deadline: { type: Type.STRING },
                            milestones: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        description: { type: Type.STRING },
                                        targetDate: { type: Type.STRING },
                                    },
                                    required: ["description", "targetDate"]
                                }
                            }
                        },
                        required: ["title", "targetAmount", "deadline", "milestones"]
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error suggesting goals and milestones:", error);
        throw error;
    }
};

export const generateEmailDraft = async (
    customer: Customer,
    context: string,
    tone: 'Formal' | 'Friendly' | 'Urgent',
    promotedProducts?: string,
    samplesGiven?: string
): Promise<{ subject: string; body: string } | null> => {
    try {
        const prompt = `
            You are an expert Pharma sales assistant. Draft a professional follow-up email for a doctor/chemist based on the following details.
            
            **Customer Profile:**
            - Name: ${customer.name}
            - Location: ${customer.district}, ${customer.state}
            - Tier: ${customer.tier}
            
            **Visit Details:**
            - Context/Purpose: ${context}
            - Promoted Products: ${promotedProducts || 'General Portfolio'}
            - Samples/Gifts Left: ${samplesGiven || 'None'}
            
            **Tone:**
            ${tone}
            
            **Requirements:**
            - The email should be personalized, professional, and concise.
            - Explicitly mention the promoted products and samples left (if any) to reinforce recall.
            - Use placeholders like [Your Name] for the sender's details.
            - Return a JSON object with "subject" and "body" fields.
            - The body should be in plain text (not markdown), ready to copy-paste.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING },
                    },
                    required: ["subject", "body"]
                }
            }
        });

        const jsonText = (response.text || '{}').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating email draft:", error);
        return null;
    }
};

export const calculateWinProbability = async (
    customer: Customer,
    sales: Sale[],
    remarks: Remark[]
): Promise<{ score: number; reasoning: string; churnRisk: boolean } | null> => {
    try {
        const salesSummary = sales.length > 0
            ? `Recent sales: ${sales.slice(0, 5).map(s => `₹${s.amount} on ${new Date(s.date).toLocaleDateString()}`).join(', ')}`
            : 'No recent sales';

        const remarksSummary = remarks.length > 0
            ? `Recent remarks: ${remarks.slice(0, 3).map(r => `"${r.remark}" (${r.sentiment})`).join('; ')}`
            : 'No recent remarks';

        const prompt = `
            You are a Lead Scoring AI. Calculate a "Win Probability Score" (0-100) for this customer based on their profile and activity.
            Also determine if they are at risk of churning (High Churn Risk).
            
            **Customer Profile:**
            - Name: ${customer.name}
            - Tier: ${customer.tier}
            - Sales This Month: ₹${customer.salesThisMonth}
            - Avg 6-Mo Sales: ₹${customer.avg6MoSales}
            - Days Since Last Order: ${customer.daysSinceLastOrder}
            - Outstanding Balance: ₹${customer.outstandingBalance}
            
            **Activity:**
            ${salesSummary}
            ${remarksSummary}
            
            **Scoring Logic:**
            - High Score (>80): Frequent buyer, low outstanding, positive sentiment, recent activity.
            - Low Score (<40): Inactive (>30 days), high outstanding, negative sentiment, "Dead" tier.
            - Churn Risk: True if score < 30 or days since last order > 60.
            
            **Response Format (JSON):**
            {
                "score": number,
                "reasoning": "Short explanation of the score",
                "churnRisk": boolean
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING },
                        churnRisk: { type: Type.BOOLEAN },
                    },
                    required: ["score", "reasoning", "churnRisk"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calculating win probability:", error);
        return null;
    }
};

export const chatWithAI = async (
    query: string,
    customers: Customer[],
    sales: Sale[],
    tasks: Task[]
): Promise<string> => {
    try {
        // Prepare context data (summarized to fit context window)
        const customerSummary = customers.map(c => `${c.name} (${c.tier}): ₹${c.salesThisMonth} sales, ₹${c.outstandingBalance} due`).join('\n');
        const recentSales = sales.slice(0, 20).map(s => `₹${s.amount} on ${s.date}`).join(', ');
        const pendingTasks = tasks.filter(t => !t.completed).map(t => `${t.task} (Due: ${t.dueDate})`).join('\n');

        const prompt = `
            You are a helpful CRM Assistant. Answer the user's question based on the following data.
            
            **Context Data:**
            Customers:\n${customerSummary}
            
            Recent Sales:\n${recentSales}
            
            Pending Tasks:\n${pendingTasks}
            
            **User Question:**
            "${query}"
            
            **Guidelines:**
            - Be concise and helpful.
            - If the user asks for a list, format it nicely.
            - If the answer isn't in the data, say so politely.
            - You can perform simple calculations (e.g., "Total sales for Gold customers").
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "I couldn't generate a response.";
    } catch (error) {
        console.error("Error in chatWithAI:", error);
        return "Sorry, I'm having trouble connecting to the AI right now.";
    }
};
