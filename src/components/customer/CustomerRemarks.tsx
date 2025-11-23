import React, { useState } from 'react';
import { Customer, Remark } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { generateTaskFromRemark, generateSummaryFromNotes, analyzeRemarkSentiment } from '../../services/geminiService';
import Spinner from '../ui/Spinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const inputStyle = "block w-full px-3 py-2 rounded-md bg-card-bg-light dark:bg-card-bg-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark transition-colors shadow-sm focus:outline-none focus:border-primary-light dark:focus:border-primary-dark focus:ring-2 focus:ring-primary-light/30 dark:focus:ring-primary-dark/30";
const btnPrimary = "px-4 py-2 font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md transition-colors hover:bg-primary-hover-light dark:hover:bg-primary-hover-dark disabled:opacity-60 disabled:cursor-not-allowed";
const btnSecondarySm = "px-3 py-1 text-xs font-medium border border-border-light dark:border-border-dark rounded-md bg-card-bg-light dark:bg-card-bg-dark transition-colors hover:bg-gray-50 dark:hover:bg-white/10";

const SentimentIndicator: React.FC<{ sentiment?: Remark['sentiment'] }> = ({ sentiment }) => {
    if (!sentiment) return null;

    const STYLES: { [key in NonNullable<Remark['sentiment']>]: { icon: string, color: string, label: string } } = {
        Positive: { icon: 'fa-smile-beam', color: 'text-green-500', label: 'Positive' },
        Neutral: { icon: 'fa-meh', color: 'text-gray-500 dark:text-gray-400', label: 'Neutral' },
        Negative: { icon: 'fa-frown', color: 'text-red-500', label: 'Negative' },
        Mixed: { icon: 'fa-question-circle', color: 'text-blue-500', label: 'Mixed' }
    };

    const style = STYLES[sentiment];
    if (!style) return null;

    return (
        <div className="flex items-center text-xs" title={style.label}>
            <i className={`fas ${style.icon} ${style.color} mr-1.5`}></i>
            <span className={`${style.color}`}>{style.label}</span>
        </div>
    );
};

export const CustomerRemarks: React.FC<{ customer: Customer, remarks: Remark[], onRemarkAdded: () => void, variant?: 'default' | 'chat' }> = ({ customer, remarks, onRemarkAdded, variant = 'default' }) => {
    const { addRemark, addTask } = useApp();
    const { addToast } = useToast();
    const [newRemark, setNewRemark] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [suggestedTask, setSuggestedTask] = useState<{ task: string; dueDate: string } | null>(null);

    // State for Note Summarizer
    const [showSummarizer, setShowSummarizer] = useState(false);
    const [rawNotes, setRawNotes] = useState('');
    const [summaryResult, setSummaryResult] = useState<{ summary: string; actionItems: { task: string; dueDate: string }[] } | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const handleAddRemark = async () => {
        if (!newRemark.trim()) return;
        setIsSubmitting(true);
        setSuggestedTask(null);
        try {
            await addRemark(customer.id, newRemark);
            addToast('Remark added!', 'success');
            const suggestion = await generateTaskFromRemark(newRemark);
            if (suggestion) {
                setSuggestedTask(suggestion);
            }
            setNewRemark('');
            onRemarkAdded();
        } catch (e) { addToast('Failed to add remark', 'error'); }
        finally { setIsSubmitting(false); }
    }

    const handleAcceptSuggestion = async () => {
        if (!suggestedTask) return;
        try {
            await addTask({
                customerId: customer.id,
                customerName: customer.name,
                task: suggestedTask.task,
                dueDate: new Date(suggestedTask.dueDate).toISOString()
            });
            addToast('Task created from suggestion!', 'success');
            setSuggestedTask(null);
        } catch (e) {
            addToast('Failed to create task.', 'error');
        }
    };

    const handleSummarize = async () => {
        if (!rawNotes.trim()) return;
        setIsSummarizing(true);
        setSummaryResult(null);
        try {
            const result = await generateSummaryFromNotes(rawNotes);
            if (result) {
                setSummaryResult(result);
                // Also add the summary as a remark
                const summaryRemark = `**AI Summary of Notes:**\n${result.summary}`;
                await addRemark(customer.id, summaryRemark);
                onRemarkAdded();
            } else {
                addToast('Could not generate summary.', 'info');
            }
        } catch (e) {
            addToast('Error generating summary.', 'error');
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleCreateTaskFromSummary = async (actionItem: { task: string; dueDate: string }) => {
        try {
            await addTask({
                customerId: customer.id,
                customerName: customer.name,
                task: actionItem.task,
                dueDate: new Date(actionItem.dueDate).toISOString()
            });
            addToast(`Task "${actionItem.task}" created!`, 'success');
        } catch (e) {
            addToast('Failed to create task.', 'error');
        }
    };

    const InputSection = () => (
        <div className={variant === 'chat' ? "pt-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)] bg-white dark:bg-[#1e293b] sticky bottom-0 z-10" : "mb-4"}>
            {/* AI Note Summarizer Button - Opens Modal */}
            <button
                onClick={() => setShowSummarizer(true)}
                className="w-full mb-4 p-3 rounded-xl border-2 border-purple-200 dark:border-purple-900 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/50 dark:hover:to-indigo-900/50 transition-all duration-300 flex items-center justify-between group shadow-sm hover:shadow-md"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <i className="fas fa-wand-magic-sparkles text-sm"></i>
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-sm text-purple-900 dark:text-purple-100">AI Note Summarizer</p>
                        <p className="text-xs text-purple-600 dark:text-purple-300">Transform raw notes into insights</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 text-xs font-bold text-purple-600 dark:text-purple-400 shadow-sm">
                    Open
                </div>
            </button>

            <div className="relative">
                <textarea
                    value={newRemark}
                    onChange={e => setNewRemark(e.target.value)}
                    placeholder="Add a new remark (or use voice)..."
                    className={`${inputStyle} mb-2 pr-10`}
                    rows={variant === 'chat' ? 2 : 3}
                />
                <button
                    onClick={() => {
                        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                            addToast('Voice input not supported in this browser.', 'error');
                            return;
                        }

                        // @ts-ignore
                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                        const recognition = new SpeechRecognition();
                        recognition.lang = 'en-US';
                        recognition.interimResults = false;
                        recognition.maxAlternatives = 1;

                        recognition.start();

                        recognition.onstart = () => {
                            addToast('Listening...', 'info');
                        };

                        recognition.onresult = (event: any) => {
                            const transcript = event.results[0][0].transcript;
                            setNewRemark(prev => prev + (prev ? ' ' : '') + transcript);
                        };

                        recognition.onerror = (event: any) => {
                            addToast('Voice error: ' + event.error, 'error');
                        };
                    }}
                    className="absolute right-2 bottom-4 text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                    title="Dictate Remark"
                >
                    <i className="fas fa-microphone text-xl"></i>
                </button>
            </div>
            <button onClick={handleAddRemark} disabled={isSubmitting} className={`${btnPrimary} w-full`}>
                {isSubmitting ? 'Adding...' : 'Add Remark'}
            </button>
        </div>
    );

    const HistorySection = () => (
        <div className={variant === 'chat' ? "flex-1 overflow-hidden min-h-0 pr-2" : ""}>
            {variant !== 'chat' && <h4 className="font-semibold mb-2 text-lg">History</h4>}
            <ul className={`space-y-3 text-sm ${variant === 'chat' ? 'max-h-[350px] overflow-y-auto custom-scrollbar' : 'max-h-80 overflow-y-auto'}`}>
                {remarks.length > 0 ? remarks.map(remark => (
                    <li key={remark.id} className="p-3 border-l-4 border-blue-400 bg-gray-50 dark:bg-white/5 rounded-r-md">
                        <MarkdownRenderer className="prose-p:italic prose-p:my-0" content={remark.remark} />
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] text-right">- {remark.user} on {new Date(remark.timestamp).toLocaleString()}</p>
                            <SentimentIndicator sentiment={remark.sentiment} />
                        </div>
                    </li>
                )) : <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] italic text-center py-4">No remarks found.</p>}
            </ul>
        </div>
    );

    return (
        <>
            {/* AI Note Summarizer Modal */}
            {showSummarizer && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
                    onClick={() => setShowSummarizer(false)}
                >
                    <div 
                        className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header with Gradient */}
                        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white p-6 rounded-t-2xl shadow-lg z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <i className="fas fa-wand-magic-sparkles text-lg"></i>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">AI Note Summarizer</h2>
                                            <p className="text-purple-100 text-sm">Transform your raw notes into actionable insights</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSummarizer(false)}
                                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Input Section */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    <i className="fas fa-file-alt mr-2 text-purple-500"></i>
                                    Paste Your Raw Notes
                                </label>
                                <textarea
                                    value={rawNotes}
                                    onChange={e => setRawNotes(e.target.value)}
                                    placeholder="Paste your raw meeting or call notes here... AI will extract key insights and action items."
                                    className={`${inputStyle} min-h-[150px]`}
                                    rows={8}
                                />
                                <button 
                                    onClick={handleSummarize} 
                                    disabled={isSummarizing || !rawNotes.trim()} 
                                    className="w-full px-6 py-3 font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                                >
                                    {isSummarizing ? (
                                        <>
                                            <Spinner size="sm" className="mr-2" /> 
                                            <span>AI is Analyzing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-sparkles mr-2"></i>
                                            Generate Summary & Action Items
                                        </>
                                    )}
                                </button>
                            </div>
                            {/* Loading State */}
                            {isSummarizing && (
                                <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center animate-pulse">
                                            <i className="fas fa-brain text-white text-lg"></i>
                                        </div>
                                        <div>
                                            <p className="font-bold text-purple-900 dark:text-purple-100">AI Processing</p>
                                            <p className="text-sm text-purple-600 dark:text-purple-300">Analyzing your notes and extracting insights...</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Results Section */}
                            {summaryResult && (
                                <div className="space-y-6">
                                    {/* Summary Card */}
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                                                <i className="fas fa-file-alt text-sm"></i>
                                            </div>
                                            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Summary</h3>
                                        </div>
                                        <div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-900/50 p-4 rounded-lg">
                                            <MarkdownRenderer content={summaryResult.summary} />
                                        </div>
                                    </div>
                                    {/* Action Items Card */}
                                    {summaryResult.actionItems.length > 0 && (
                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                                                    <i className="fas fa-tasks text-sm"></i>
                                                </div>
                                                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                                                    Action Items ({summaryResult.actionItems.length})
                                                </h3>
                                            </div>
                                            <ul className="space-y-3">
                                                {summaryResult.actionItems.map((item, index) => (
                                                    <li key={index} className="bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-start gap-2 mb-2">
                                                                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                                        {index + 1}
                                                                    </span>
                                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{item.task}</p>
                                                                </div>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 ml-8">
                                                                    <i className="far fa-calendar-alt mr-1"></i>
                                                                    Due: {new Date(item.dueDate).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleCreateTaskFromSummary(item)} 
                                                                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                                                            >
                                                                <i className="fas fa-plus mr-1"></i>
                                                                Create Task
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Main Component Content */}
            {variant === 'chat' ? (
                <div className="flex flex-col h-full">
                    <HistorySection />
                    <InputSection />
                </div>
            ) : (
                <>
                    <InputSection />
                    <HistorySection />
                </>
            )}
        </>
    );
};
