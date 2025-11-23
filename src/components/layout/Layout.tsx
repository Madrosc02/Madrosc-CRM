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
        <div className="h-16 bg-white dark:bg-[var(--color-surface-dark)] border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] flex items-center justify-between px-6 sticky top-0 z-20">
            {/* Search Input with AI Toggle */}
            <div className="flex-1 max-w-xl relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => isAIMode && setShowSuggestions(true)}
                    placeholder={isAIMode ? "Ask AI: e.g., 'clients with declining sales last 3 months'" : "Search customers, deals, or commands..."}
                    className={`w-full pl-11 pr-32 py-2 rounded-lg text-sm transition-all ${isAIMode
                            ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-300 dark:border-purple-600'
                            : 'bg-gray-100 dark:bg-white/5 border-2 border-transparent'
                        } text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]`}
                />

                {/* AI Mode Toggle & Search Button */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isAIMode && (
                        <button
                            onClick={handleAISearch}
                            disabled={isAISearching || !searchQuery.trim()}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                        >
                            {isAISearching ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-magic"></i>
                                    AI Search
                                </>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setIsAIMode(!isAIMode);
                            setShowSuggestions(false);
                            if (isAIMode) {
                                // Clear AI search results when switching back to normal mode
                                sessionStorage.removeItem('aiSearchResults');
                                setKpiFilter(null);
                            }
                        }}
                        className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${isAIMode
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        title={isAIMode ? "Switch to normal search" : "Enable AI search"}
                    >
                        <i className={`fas ${isAIMode ? 'fa-robot' : 'fa-brain'}`}></i>
                    </button>
                </div>

                {/* AI Suggestions Dropdown */}
                {isAIMode && showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        <div className="p-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 font-semibold">Suggested Queries:</p>
                            {suggestedQueries.map((query, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(query)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
                                >
                                    <i className="fas fa-lightbulb text-purple-500 mr-2"></i>
                                    {query}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowSuggestions(false)}
                            className="w-full text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-2 border-t border-gray-200 dark:border-gray-700"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-4">
                <button onClick={openAddCustomerModal} className="btn-primary text-sm flex items-center">
                    <i className="fas fa-plus mr-2"></i> <span className="hidden sm:inline">Add Client</span>
                </button>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                        {user?.email?.substring(0, 2).toUpperCase()}
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
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6 relative">
                    {children}
                </main>
            </div>
            <AIChatAssistant />
        </div>
    );
};

export default Layout;
