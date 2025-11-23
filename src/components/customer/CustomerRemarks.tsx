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
            {variant !== 'chat' && (
                <div className="border border-[var(--border-light)] dark:border-[var(--border-dark)] rounded-lg mb-4">
                    <button
                        onClick={() => setShowSummarizer(!showSummarizer)}
                        className="w-full p-3 text-left font-semibold flex justify-between items-center"
                    >
                        <span><i className="fas fa-magic-wand-sparkles mr-2 text-purple-500"></i> AI Note Summarizer</span>
                        <i className={`fas fa-chevron-down transition-transform ${showSummarizer ? 'rotate-180' : ''}`}></i>
                    </button>
                    {showSummarizer && (
                        <div className="p-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)] space-y-3">
                            <textarea
                                value={rawNotes}
                                onChange={e => setRawNotes(e.target.value)}
                                placeholder="Paste your raw meeting or call notes here..."
                                className={inputStyle}
                                rows={5}
                            />
                            <button onClick={handleSummarize} disabled={isSummarizing || !rawNotes.trim()} className={btnPrimary}>
                                {isSummarizing ? <><Spinner size="sm" className="mr-2" /> Summarizing...</> : 'Summarize Notes'}
                            </button>
                            {isSummarizing && <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">AI is reading your notes...</p>}
                            {summaryResult && (
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <h5 className="font-bold">Summary:</h5>
                                        <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-md">
                                            <MarkdownRenderer content={summaryResult.summary} />
                                        </div>
                                    </div>
                                    {summaryResult.actionItems.length > 0 && (
                                        <div>
                                            <h5 className="font-bold">Action Items:</h5>
                                            <ul className="space-y-2">
                                                {summaryResult.actionItems.map((item, index) => (
                                                    <li key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/5 rounded-md">
                                                        <div>
                                                            <p className="font-medium text-sm">{item.task}</p>
                                                            <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                                                        </div>
                                                        <button onClick={() => handleCreateTaskFromSummary(item)} className={btnSecondarySm}>Create Task</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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

    if (variant === 'chat') {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                <HistorySection />
                <InputSection />
            </div>
        );
    }

    return (
        <div>
            <InputSection />
            {suggestedTask && (
                <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 mb-4 rounded-r-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold flex items-center"><i className="fas fa-lightbulb mr-2"></i>AI Suggestion</p>
                            <p className="text-sm mt-1">Create task: "{suggestedTask.task}"</p>
                            <p className="text-xs">Due: {new Date(suggestedTask.dueDate).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAcceptSuggestion} className={`${btnPrimary} text-xs !bg-yellow-600`}>Create Task</button>
                            <button onClick={() => setSuggestedTask(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl">&times;</button>
                        </div>
                    </div>
                </div>
            )}
            <HistorySection />
        </div>
    );
}
