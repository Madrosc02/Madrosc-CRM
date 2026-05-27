import React, { useState } from 'react';
import { Customer, Remark } from '../../types';
import { MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '../../utils';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';

interface ChatPanelProps {
    customer: Customer | undefined;
    customerRemarks: Remark[];
    setShowAICallPrep: (show: boolean) => void;
    remarkText: string;
    setRemarkText: (text: string) => void;
    callDuration: number;
}

const baseButtonClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";

export const ChatPanel: React.FC<ChatPanelProps> = ({ customer, customerRemarks, setShowAICallPrep, remarkText, setRemarkText, callDuration }) => {
    const { addRemark, addTask } = useApp();
    const { addToast } = useToast();
    const [isRecording, setIsRecording] = useState(false);

    const handleVoiceRecord = () => {
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            addToast('Speech recognition is not supported in this browser.', 'error');
            return;
        }

        if (isRecording) {
            setIsRecording(false);
            return; // Will stop on its own or we can just let it timeout
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setRemarkText((prev) => prev ? `${prev} ${transcript}` : transcript);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        recognition.start();
    };

    const handleQuickFollowUp = async (days: number) => {
        if (!customer) return;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);
        try {
            await addTask({
                customerId: customer.id,
                customerName: customer.firmName || customer.name,
                task: `Follow up with ${customer.firmName || customer.name}`,
                dueDate: dueDate.toISOString(),
            });
            addToast(`Follow up scheduled for ${days === 1 ? 'tomorrow' : 'next week'}!`, 'success');
        } catch (error) {
            addToast('Failed to schedule follow up', 'error');
        }
    };

    // Format duration helper
    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="space-y-4">
            {/* Call Script */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-slate-900">Call Script</h3>
                </div>
                <p className="text-sm text-slate-500">Key talking points</p>
            </div>

            {/* Interaction History */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Interaction History</h3>
                    <button className="text-purple-600 text-sm font-medium hover:underline">
                        View Details →
                    </button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {customerRemarks.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4 text-center">No interactions yet.</p>
                    ) : (
                        customerRemarks.map((item, i) => {
                            const date = new Date(item.timestamp);
                            return (
                                <div key={item.id || i} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600 shrink-0">
                                        {item.user ? item.user[0].toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-slate-900">{item.remark}</div>
                                        <div className="text-xs text-slate-500">{item.user || 'Sales Team'}</div>
                                        <div className="text-xs text-slate-400">{date.toLocaleString()}</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Add Remark */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Add Remark</h3>
                <textarea
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    placeholder="Add a new remark (or use voice)..."
                    className="w-full h-24 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-white text-slate-900 placeholder-slate-400 resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                        <button className="text-purple-600 hover:bg-purple-50 p-2 rounded transition-colors">
                            <span>✨</span>
                        </button>
                        <button onClick={handleVoiceRecord} className={`p-2 rounded transition-colors ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <span>🎤</span>
                        </button>
                    </div>
                    <button 
                        onClick={async () => {
                            if (!remarkText.trim() || !customer) return;
                            try {
                                const remarkWithDuration = `${remarkText.trim()}\n[Call Duration: ${formatDuration(callDuration)}]`;
                                await addRemark(customer.id, remarkWithDuration);
                                setRemarkText('');
                                addToast('Remark added successfully!', 'success');
                            } catch (err) {
                                addToast('Failed to add remark', 'error');
                            }
                        }}
                        className={cn(baseButtonClasses, "bg-purple-600 text-white hover:bg-purple-700")}
                    >
                        Save Note
                    </button>
                </div>
                
                {/* One-Click Follow-ups */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-500 self-center mr-2">Quick Tasks:</span>
                    <button onClick={() => handleQuickFollowUp(1)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full font-medium transition-colors">
                        Tomorrow
                    </button>
                    <button onClick={() => handleQuickFollowUp(7)} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full font-medium transition-colors">
                        Next Week
                    </button>
                </div>
            </div>

            {/* AI Next Best Action */}
            <div 
                className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setShowAICallPrep(true)}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-slate-900">AI Next Best Action</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">Powered by predictive intelligence</p>
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors">
                        <div className="text-xs font-bold text-red-600 uppercase mb-2 tracking-wider">HIGH PRIORITY</div>
                        <h4 className="font-semibold text-slate-900 mb-2">Follow up on pending order from last week</h4>
                        <p className="text-xs text-slate-600">Customer showed strong interest in Antibiotic range</p>
                        <div className="text-xs text-slate-500 mt-2 font-medium">🕐 Suggested: Today, 2:00 PM</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 hover:bg-amber-100 transition-colors">
                        <div className="text-xs font-bold text-amber-700 uppercase mb-2 tracking-wider">MEDIUM PRIORITY</div>
                        <h4 className="font-semibold text-slate-900 mb-2">Introduce new Cardio product line</h4>
                        <p className="text-xs text-slate-600">Customer has history of ordering similar products</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
