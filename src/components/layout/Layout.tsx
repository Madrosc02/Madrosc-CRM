import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import AIChatAssistant from '../ai/AIChatAssistant';
import { interpretNaturalLanguageSearch } from '../../services/geminiService';

const Topbar: React.FC = () => {
    const { user } = useAuth();
    const { searchQuery, setSearchQuery, openAddCustomerModal, customers, setKpiFilter } = useApp();
    const [isAIMode, setIsAIMode] = useState(false);
    const [isAISearching, setIsAISearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestedQueries = [
        "Clients whose performance is diminishing from last 3 months",
        "Gold tier customers with outstanding balance over 50000",
        "Customers who haven't ordered in 30 days",
        "Top 5 customers by sales this month",
        "Silver tier clients in Maharashtra",
    ];

    const handleAISearch = async () => {
        if (!searchQuery.trim() || !isAIMode) return;

        setIsAISearching(true);
        try {
            const matchingIds = await interpretNaturalLanguageSearch(searchQuery, customers);

            // Filter customers based on AI results
            if (matchingIds.length > 0) {
                // Set a special filter mode for AI results
                setKpiFilter('ai-search' as any);
                // Store the AI results in sessionStorage for the CustomerTable to use
                sessionStorage.setItem('aiSearchResults', JSON.stringify(matchingIds));
            } else {
                alert('No customers found matching your query. Try rephrasing or use a different search.');
            }
        } catch (error) {
            console.error('AI Search error:', error);
            alert('AI search failed. Please try again or use regular search.');
        } finally {
            setIsAISearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (isAIMode) {
                handleAISearch();
            }
        }
    };

    const handleSuggestionClick = (query: string) => {
        setSearchQuery(query);
        setShowSuggestions(false);
        setIsAIMode(true);
        // Trigger search after a brief delay
        setTimeout(() => {
            interpretNaturalLanguageSearch(query, customers).then(matchingIds => {
                if (matchingIds.length > 0) {
                    setKpiFilter('ai-search' as any);
                    sessionStorage.setItem('aiSearchResults', JSON.stringify(matchingIds));
                }
            });
        }, 100);
    };

    return (
        <div className="h-20 flex items-center justify-between px-8 py-4 sticky top-0 z-20 backdrop-blur-sm">
            {/* Search Input with AI Toggle */}
            <div className="flex-1 max-w-2xl relative group">
                <div className={`
                    absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100
                    ${isAIMode ? 'bg-purple-500/10 blur-xl' : 'bg-teal-500/10 blur-xl'}
                `}></div>

                <div className="relative flex items-center">
                    <i className={`
                        fas fa-search absolute left-4 text-lg transition-colors duration-300
                        ${isAIMode ? 'text-purple-500' : 'text-slate-400 group-focus-within:text-teal-500'}
                    `}></i>

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => isAIMode && setShowSuggestions(true)}
                        placeholder={isAIMode ? "Ask AI: e.g., 'clients with declining sales last 3 months'" : "Search customers, deals, or commands..."}
                        className={`
                            w-full pl-12 pr-32 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm
                            ${isAIMode
                                ? 'bg-white dark:bg-slate-800 border-2 border-purple-400 dark:border-purple-500/50 text-purple-900 dark:text-purple-100 placeholder-purple-300'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10'
                            }
                        `}
                    />

                    {/* AI Mode Toggle & Search Button */}
                    <div className="absolute right-2 flex items-center gap-2">
                        {isAIMode && (
                            <button
                                onClick={handleAISearch}
                                disabled={isAISearching || !searchQuery.trim()}
                                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
                            >
                                {isAISearching ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-magic"></i>
                                        Ask AI
                                    </>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setIsAIMode(!isAIMode);
                                setShowSuggestions(false);
                                if (isAIMode) {
                                    sessionStorage.removeItem('aiSearchResults');
                                    setKpiFilter(null);
                                }
                            }}
                            className={`
                                p-2 rounded-lg transition-all duration-300
                                ${isAIMode
                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 rotate-180'
                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/20 dark:hover:text-teal-400'
                                }
                            `}
                            title={isAIMode ? "Switch to normal search" : "Enable AI search"}
                        >
                            <i className={`fas ${isAIMode ? 'fa-robot' : 'fa-brain'} text-lg`}></i>
                        </button>
                    </div>
                </div>

                {/* AI Suggestions Dropdown */}
                {isAIMode && showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-purple-200 dark:border-purple-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up">
                        <div className="p-2">
                            <p className="text-xs text-purple-500 dark:text-purple-400 px-3 py-2 font-bold uppercase tracking-wider">Suggested Queries</p>
                            {suggestedQueries.map((query, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(query)}
                                    className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 rounded-xl transition-colors flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs">
                                        <i className="fas fa-lightbulb"></i>
                                    </div>
                                    {query}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 ml-6">
                <button onClick={openAddCustomerModal} className="btn-primary flex items-center gap-2 group">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fas fa-plus text-xs"></i>
                    </div>
                    <span className="hidden sm:inline">Add Client</span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-700">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user?.email?.split('@')[0]}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 p-0.5 shadow-lg shadow-teal-500/20">
                        <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-800 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-[var(--color-bg-light)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)] overflow-hidden font-sans transition-colors duration-200">
            <Sidebar />

            {/* Main Content Area - Adjusted for floating sidebar */}
            <div className="flex-1 flex flex-col overflow-hidden ml-[260px] transition-all duration-500">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
                    {children}
                </main>
            </div>

            <AIChatAssistant />
        </div>
    );
};

export default Layout;
