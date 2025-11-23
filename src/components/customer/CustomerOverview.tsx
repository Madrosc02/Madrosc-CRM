import React, { useState, useEffect, useCallback } from 'react';
import { Customer, Sale, Remark, CustomerFormData, CustomerTerritory } from '../../types';
import { generateAIPerformanceReview, suggestBestContactTime, calculateWinProbability } from '../../services/geminiService';
import Spinner from '../ui/Spinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { indianStatesAndDistricts } from '../../data/indianStatesAndDistricts';
import ManageTerritoriesModal from '../ManageTerritoriesModal';
import { useApp } from '../../contexts/AppContext';

const inputStyle = "block w-full px-3 py-2 rounded-md bg-card-bg-light dark:bg-card-bg-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark transition-colors shadow-sm focus:outline-none focus:border-primary-light dark:focus:border-primary-dark focus:ring-2 focus:ring-primary-light/30 dark:focus:ring-primary-dark/30";
const btnPrimary = "px-4 py-2 font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md transition-colors hover:bg-primary-hover-light dark:hover:bg-primary-hover-dark disabled:opacity-60 disabled:cursor-not-allowed";
const btnSecondary = "px-4 py-2 font-medium border border-border-light dark:border-border-dark rounded-md bg-card-bg-light dark:bg-card-bg-dark transition-colors hover:bg-gray-50 dark:hover:bg-white/10";
const btnSecondarySm = "px-3 py-1 text-xs font-medium border border-border-light dark:border-border-dark rounded-md bg-card-bg-light dark:bg-card-bg-dark transition-colors hover:bg-gray-50 dark:hover:bg-white/10";

const DetailCard: React.FC<{ title: string; value: React.ReactNode; className?: string }> = ({ title, value, className = '' }) => (
    <div className={`p-3 bg-gray-50 dark:bg-white/5 rounded-lg ${className}`}>
        <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{title}</p>
        <p className="font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">{value}</p>
    </div>
);

const AIContactSuggestion: React.FC<{ remarks: Remark[] }> = ({ remarks }) => {
    const [suggestion, setSuggestion] = useState<{ suggestion: string; reasoning: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const generateSuggestion = useCallback(async () => {
        setIsLoading(true);
        setSuggestion(null);
        try {
            const result = await suggestBestContactTime(remarks);
            setSuggestion(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [remarks]);

    useEffect(() => {
        generateSuggestion();
    }, [generateSuggestion]);

    return (
        <div className="bg-green-50 dark:bg-green-900/40 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-base flex items-center"><i className="fas fa-clock mr-2 text-green-600 dark:text-green-400"></i> Best Time to Contact</h4>
                <button onClick={generateSuggestion} disabled={isLoading} className="text-xs text-green-600 hover:underline disabled:opacity-50">Regenerate</button>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center h-16"><Spinner size="sm" /></div>
            ) : suggestion ? (
                <div>
                    <p className="font-bold text-lg text-green-800 dark:text-green-200">{suggestion.suggestion}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{suggestion.reasoning}</p>
                </div>
            ) : (
                <p className="text-sm text-center text-green-700 dark:text-green-300">Could not generate suggestion.</p>
            )}
        </div>
    );
};

const WinProbability: React.FC<{ customer: Customer, sales: Sale[], remarks: Remark[] }> = ({ customer, sales, remarks }) => {
    const [data, setData] = useState<{ score: number; reasoning: string; churnRisk: boolean } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const calculate = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await calculateWinProbability(customer, sales, remarks);
            setData(result);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    }, [customer, sales, remarks]);

    useEffect(() => { calculate(); }, [calculate]);

    if (isLoading) return <div className="h-24 bg-gray-50 dark:bg-white/5 rounded-lg animate-pulse"></div>;
    if (!data) return null;

    const getColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/30">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-base flex items-center text-purple-800 dark:text-purple-200">
                    <i className="fas fa-chart-line mr-2"></i> Win Probability
                </h4>
                {data.churnRisk && (
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold rounded-full border border-red-200 dark:border-red-800">
                        ⚠️ Churn Risk
                    </span>
                )}
            </div>
            <div className="flex items-end gap-2 mb-1">
                <span className={`text-3xl font-bold ${getColor(data.score)}`}>{data.score}%</span>
                <span className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-1">probability</span>
            </div>
            <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] leading-snug">{data.reasoning}</p>
        </div>
    );
};

export const CustomerOverview: React.FC<{ customer: Customer, sales: Sale[], remarks: Remark[], onEditMode: () => void }> = ({ customer, sales, remarks, onEditMode }) => {
    const { customers } = useApp();
    const [aiReview, setAiReview] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showTerritoriesModal, setShowTerritoriesModal] = useState(false);
    const [territories, setTerritories] = useState<CustomerTerritory[]>([]);
    const [territoriesLoading, setTerritoriesLoading] = useState(true);

    useEffect(() => {
        const loadTerritories = async () => {
            try {
                const { fetchTerritoriesForCustomer } = await import('../../services/api');
                const data = await fetchTerritoriesForCustomer(customer.id);
                setTerritories(data);
            } catch (error) {
                console.error('Failed to load territories:', error);
            } finally {
                setTerritoriesLoading(false);
            }
        };
        loadTerritories();
    }, [customer.id, showTerritoriesModal]); // Reload when modal closes

    const handleRegenerate = useCallback(async () => {
        setIsLoading(true);
        setAiReview('');
        try {
            const review = await generateAIPerformanceReview(customer, sales, remarks);
            setAiReview(review);
        } catch (e) { setAiReview("Error generating review.") }
        finally { setIsLoading(false); }
    }, [customer, sales, remarks]);

    useEffect(() => {
        handleRegenerate();
    }, [handleRegenerate]);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-lg">Key Metrics</h4>
                            <div className="flex gap-2">
                                <button onClick={() => setShowTerritoriesModal(true)} className={`${btnSecondarySm} text-blue-600`}>
                                    <i className="fas fa-map-marked-alt mr-2"></i>Manage Territories
                                </button>
                                <button onClick={onEditMode} className={btnSecondarySm}>
                                    <i className="fas fa-pencil-alt mr-2"></i>Edit Details
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <DetailCard title="Firm Name" value={customer.firmName} />
                            <DetailCard title="Contact Person" value={customer.personName} />
                            {customer.email && <DetailCard title="Email" value={customer.email} />}
                            <DetailCard title="Contact" value={<>{customer.contact}{customer.alternateContact && <span className="block text-xs mt-1">Alt: {customer.alternateContact}</span>}</>} />
                            <DetailCard title="Location" value={`${customer.district}, ${customer.state}`} />
                            <DetailCard title="Tier" value={customer.tier} />
                            <DetailCard title="Territory Status" value={customer.monopolyStatus} />
                            <DetailCard title="Sales This Month" value={`₹${customer.salesThisMonth.toLocaleString('en-IN')}`} />
                            <DetailCard title="Outstanding" value={`₹${customer.outstandingBalance.toLocaleString('en-IN')}`} className="text-red-600 dark:text-red-400" />
                            <DetailCard title="Last Order" value={`${customer.daysSinceLastOrder} days ago`} />
                        </div>
                    </div>

                    {/* Territories Section */}
                    {!territoriesLoading && territories.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-base flex items-center text-blue-900 dark:text-blue-100">
                                    <i className="fas fa-map-marked-alt mr-2 text-blue-600 dark:text-blue-400"></i>
                                    Working Territories ({territories.length})
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {territories.map((territory) => (
                                    <div key={territory.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border border-blue-100 dark:border-blue-900">
                                        <div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                                                {territory.district}, {territory.state}
                                            </p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${territory.monopolyStatus === 'Monopoly'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                                }`}>
                                                {territory.monopolyStatus}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <WinProbability customer={customer} sales={sales} remarks={remarks} />
                </div>
                <div className="space-y-4">
                    <AIContactSuggestion remarks={remarks} />
                    <div className="bg-blue-50 dark:bg-blue-900/40 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold flex items-center"><i className="fas fa-brain mr-2 text-blue-500"></i> AI Review</h4>
                            <button onClick={handleRegenerate} disabled={isLoading} className="text-xs text-blue-600 hover:underline disabled:opacity-50">Regenerate</button>
                        </div>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-48">
                                <Spinner />
                                <p className="mt-2 text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">Generating insights...</p>
                            </div>
                        ) : (
                            <MarkdownRenderer content={aiReview} />
                        )}
                    </div>
                </div>
            </div>

            <ManageTerritoriesModal
                customer={customer}
                isOpen={showTerritoriesModal}
                onClose={() => setShowTerritoriesModal(false)}
                allCustomers={customers}
            />
        </>
    )
}


export const EditDetailsForm: React.FC<{ customer: Customer, onCancel: () => void, onSave: (data: CustomerFormData) => Promise<void> }> = ({ customer, onCancel, onSave }) => {
    const [formData, setFormData] = useState<CustomerFormData>({
        firmName: customer.firmName,
        personName: customer.personName,
        email: customer.email || '',
        contact: customer.contact,
        alternateContact: customer.alternateContact || '',
        state: customer.state,
        district: customer.district,
        tier: customer.tier,
        monopolyStatus: customer.monopolyStatus,
    });
    const [districts, setDistricts] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (formData.state && indianStatesAndDistricts[formData.state]) {
            setDistricts(indianStatesAndDistricts[formData.state]);
        }
    }, [formData.state]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'state') {
            setFormData(prev => ({ ...prev, district: '' }));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await onSave(formData);
        setIsSubmitting(false);
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                <div>
                    <label className="block text-sm font-medium mb-1">Firm/Business Name *</label>
                    <input type="text" name="firmName" value={formData.firmName} onChange={handleChange} className={inputStyle} required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Contact Person Name *</label>
                    <input type="text" name="personName" value={formData.personName} onChange={handleChange} className={inputStyle} required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyle} placeholder="example@company.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Contact *</label>
                    <input type="tel" name="contact" value={formData.contact} onChange={handleChange} className={inputStyle} maxLength={10} required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Alternate Contact</label>
                    <input type="tel" name="alternateContact" value={formData.alternateContact} onChange={handleChange} className={inputStyle} maxLength={10} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Tier</label>
                    <select name="tier" value={formData.tier} onChange={handleChange} className={inputStyle}>
                        <option value="Bronze">Bronze</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Dead">Dead</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">State *</label>
                    <select name="state" value={formData.state} onChange={handleChange} className={inputStyle} required>
                        {Object.keys(indianStatesAndDistricts).sort().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">District *</label>
                    <select name="district" value={formData.district} onChange={handleChange} className={inputStyle} disabled={!formData.state} required>
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Territory Status *</label>
                    <select name="monopolyStatus" value={formData.monopolyStatus} onChange={handleChange} className={inputStyle} required>
                        <option value="Non-Monopoly">Non-Monopoly</option>
                        <option value="Monopoly">Monopoly</option>
                    </select>
                </div>
            </div>

            {/* Fixed button bar at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3 z-10">
                <button onClick={handleSubmit} disabled={isSubmitting} className={`${btnPrimary} flex items-center`}>
                    {isSubmitting && <Spinner size="sm" className="mr-2" />}
                    Save Changes
                </button>
                <button onClick={onCancel} className={btnSecondary}>Cancel</button>
            </div>
        </div>
    )
}
