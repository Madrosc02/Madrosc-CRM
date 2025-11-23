import React, { useState } from 'react';
import { Customer } from '../../types';
import { generateEmailDraft } from '../../services/geminiService';
import { useToast } from '../../contexts/ToastContext';
import Spinner from '../ui/Spinner';
import Drawer from '../ui/Drawer';

interface EmailDrafterProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer;
}

const EmailDrafter: React.FC<EmailDrafterProps> = ({ isOpen, onClose, customer }) => {
    const { addToast } = useToast();
    const [context, setContext] = useState('');
    const [promotedProducts, setPromotedProducts] = useState('');
    const [samplesGiven, setSamplesGiven] = useState('');
    const [tone, setTone] = useState<'Formal' | 'Friendly' | 'Urgent'>('Friendly');
    const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!context.trim()) {
            addToast('Please provide some context for the email.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const result = await generateEmailDraft(customer, context, tone, promotedProducts, samplesGiven);
            if (result) {
                setDraft(result);
            } else {
                addToast('Failed to generate draft.', 'error');
            }
        } catch (e) {
            addToast('Error generating email.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addToast('Copied to clipboard!', 'success');
    };

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title={`Draft Email for ${customer.name}`} width="max-w-xl">
            <div className="space-y-6 h-full flex flex-col">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)]">Context / Purpose</label>
                        <textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="e.g., Follow up on last week's meeting..."
                            className="input-base h-24 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)]">Promoted Products</label>
                            <input
                                type="text"
                                value={promotedProducts}
                                onChange={(e) => setPromotedProducts(e.target.value)}
                                placeholder="e.g., Azithromycin 500"
                                className="input-base"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)]">Samples / Gifts Left</label>
                            <input
                                type="text"
                                value={samplesGiven}
                                onChange={(e) => setSamplesGiven(e.target.value)}
                                placeholder="e.g., 2 boxes, Pen stand"
                                className="input-base"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)]">Tone</label>
                        <div className="flex gap-2">
                            {(['Formal', 'Friendly', 'Urgent'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTone(t)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${tone === t
                                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                        : 'bg-white dark:bg-[var(--color-surface-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !context.trim()}
                        className="btn-primary w-full flex justify-center items-center"
                    >
                        {isLoading ? <><Spinner size="sm" className="mr-2" /> Generating...</> : <><i className="fas fa-magic mr-2"></i> Generate Draft</>}
                    </button>
                </div>

                {draft && (
                    <div className="flex-1 flex flex-col space-y-4 animate-fade-in border-t border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] pt-6">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)]">Subject</label>
                                <button onClick={() => copyToClipboard(draft.subject)} className="text-xs text-[var(--color-primary)] hover:underline">Copy</button>
                            </div>
                            <input
                                type="text"
                                value={draft.subject}
                                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                                className="input-base font-medium"
                            />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)]">Body</label>
                                <button onClick={() => copyToClipboard(draft.body)} className="text-xs text-[var(--color-primary)] hover:underline">Copy</button>
                            </div>
                            <textarea
                                value={draft.body}
                                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                                className="input-base flex-1 resize-none p-4 font-mono text-sm leading-relaxed"
                            />
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={`mailto:${customer.contact}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}
                                className="btn-primary flex-1 text-center"
                            >
                                <i className="fas fa-envelope mr-2"></i> Open in Mail App
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </Drawer>
    );
};

export default EmailDrafter;
