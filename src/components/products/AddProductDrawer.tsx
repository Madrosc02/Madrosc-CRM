import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { determineProductSegment } from '../../utils/productAI';
import { ProductFormData } from '../../types';
import { X, Bot } from 'lucide-react';

const AddProductDrawer: React.FC = () => {
    const { isAddProductModalOpen, closeAddProductModal, addProduct } = useApp();
    const [formData, setFormData] = useState<ProductFormData>({
        brandName: '',
        composition: '',
        mrp: 0,
        purchaseRate: 0,
        packing: '',
        segment: '',
        hsnCode: '',
        gstPercentage: 12,
        manufacturer: '',
        status: 'Active'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI Auto-segmentation
    useEffect(() => {
        if (formData.composition && formData.composition.length > 3) {
            const suggestedSegment = determineProductSegment(formData.composition);
            if (suggestedSegment !== formData.segment) {
                setFormData(prev => ({ ...prev, segment: suggestedSegment }));
            }
        }
    }, [formData.composition]);

    if (!isAddProductModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addProduct(formData);
            closeAddProductModal();
            // Reset form
            setFormData({
                brandName: '',
                composition: '',
                mrp: 0,
                purchaseRate: 0,
                packing: '',
                segment: '',
                hsnCode: '',
                gstPercentage: 12,
                manufacturer: '',
                status: 'Active'
            });
        } catch (error) {
            console.error("Failed to add product", error);
            alert("Failed to add product");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]" onClick={closeAddProductModal} />
            <div className="fixed top-0 right-0 h-full w-[500px] bg-white shadow-2xl z-[101] flex flex-col transform transition-transform duration-300">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
                    <button onClick={closeAddProductModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="add-product-form" onSubmit={handleSubmit} className="space-y-5">
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name *</label>
                            <input 
                                type="text" 
                                required
                                value={formData.brandName}
                                onChange={e => setFormData({...formData, brandName: e.target.value})}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                placeholder="e.g. Dolo 650"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Composition *</label>
                            <textarea 
                                required
                                value={formData.composition}
                                onChange={e => setFormData({...formData, composition: e.target.value})}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                placeholder="e.g. Paracetamol 650mg"
                                rows={2}
                            />
                        </div>

                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-start gap-3">
                            <Bot className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-purple-900 mb-1">AI Segment Allocation</label>
                                <p className="text-xs text-purple-700 mb-2">Based on the composition, AI automatically assigns the medical segment.</p>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.segment}
                                    onChange={e => setFormData({...formData, segment: e.target.value})}
                                    className="w-full p-2 text-sm border border-purple-200 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="e.g. Analgesic"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">MRP (₹) *</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    required
                                    value={formData.mrp || ''}
                                    onChange={e => setFormData({...formData, mrp: parseFloat(e.target.value)})}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Rate (₹) *</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    required
                                    value={formData.purchaseRate || ''}
                                    onChange={e => setFormData({...formData, purchaseRate: parseFloat(e.target.value)})}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Packing *</label>
                            <input 
                                type="text" 
                                required
                                value={formData.packing}
                                onChange={e => setFormData({...formData, packing: e.target.value})}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="e.g. 10x10 Alu Alu"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">HSN/SAC Code</label>
                                <input 
                                    type="text" 
                                    value={formData.hsnCode}
                                    onChange={e => setFormData({...formData, hsnCode: e.target.value})}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">GST %</label>
                                <select 
                                    value={formData.gstPercentage}
                                    onChange={e => setFormData({...formData, gstPercentage: parseInt(e.target.value)})}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                >
                                    <option value={0}>0%</option>
                                    <option value={5}>5%</option>
                                    <option value={12}>12%</option>
                                    <option value={18}>18%</option>
                                    <option value={28}>28%</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer</label>
                            <input 
                                type="text" 
                                value={formData.manufacturer}
                                onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="e.g. Cipla Ltd."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select 
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        
                    </form>
                </div>

                <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-4">
                    <button 
                        type="button" 
                        onClick={closeAddProductModal}
                        className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        form="add-product-form"
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Product'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default AddProductDrawer;
