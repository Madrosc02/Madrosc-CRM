import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, FileSpreadsheet, Bot } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { ProductFormData } from '../../types';
import { determineProductSegment } from '../../utils/productAI';

const BulkImportProductsModal: React.FC = () => {
    const { isBulkImportProductsModalOpen, closeBulkImportProductsModal, bulkAddProducts } = useApp();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isBulkImportProductsModalOpen) return null;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        setError(null);
        setSuccess(null);
        if (selectedFile.type === "text/csv" || selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
        } else {
            setError("Please upload a valid CSV file.");
        }
    };

    const processCSV = (text: string) => {
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        if (lines.length <= 1) throw new Error("File is empty or contains only headers.");

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const expectedHeaders = ['brand name', 'composition', 'mrp', 'purchase rate', 'packing'];
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
            throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
        }

        const brandNameIdx = headers.indexOf('brand name');
        const compIdx = headers.indexOf('composition');
        const mrpIdx = headers.indexOf('mrp');
        const prIdx = headers.indexOf('purchase rate');
        const packingIdx = headers.indexOf('packing');
        const hsnIdx = headers.indexOf('hsn code');
        const gstIdx = headers.indexOf('gst %');
        const manufacturerIdx = headers.indexOf('manufacturer');

        const newProducts: ProductFormData[] = [];

        for (let i = 1; i < lines.length; i++) {
            // Simple split for now, real CSV parser should handle quotes
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length < expectedHeaders.length) continue;

            const composition = cols[compIdx];
            
            // AI Auto-segmentation
            const segment = determineProductSegment(composition);

            newProducts.push({
                brandName: cols[brandNameIdx],
                composition: composition,
                mrp: parseFloat(cols[mrpIdx]) || 0,
                purchaseRate: parseFloat(cols[prIdx]) || 0,
                packing: cols[packingIdx],
                segment: segment,
                hsnCode: hsnIdx > -1 ? cols[hsnIdx] : '',
                gstPercentage: gstIdx > -1 ? parseInt(cols[gstIdx]) || 12 : 12,
                manufacturer: manufacturerIdx > -1 ? cols[manufacturerIdx] : '',
                status: 'Active'
            });
        }

        return newProducts;
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        setError(null);
        
        try {
            const text = await file.text();
            const products = processCSV(text);
            await bulkAddProducts(products);
            setSuccess(`Successfully imported ${products.length} products with AI assigned segments.`);
            setTimeout(() => {
                closeBulkImportProductsModal();
                setFile(null);
                setSuccess(null);
            }, 2000);
        } catch (err: any) {
            setError(err.message || "An error occurred while processing the file.");
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ["Brand Name", "Composition", "MRP", "Purchase Rate", "Packing", "HSN Code", "GST %", "Manufacturer"];
        const sampleData = ["Dolo 650", "Paracetamol 650mg", "30.00", "15.00", "15x10 Alu Alu", "3004", "12", "Micro Labs"];
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), sampleData.join(",")].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "products_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Bulk Import Products</h2>
                    <button onClick={closeBulkImportProductsModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Template Section */}
                    <div className="mb-6 flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                            <div>
                                <h3 className="font-semibold text-blue-900">Need a template?</h3>
                                <p className="text-sm text-blue-700">Download our CSV template to get started.</p>
                            </div>
                        </div>
                        <button 
                            onClick={downloadTemplate}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline px-3 py-1.5"
                        >
                            Download CSV
                        </button>
                    </div>

                    <div className="mb-6 bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3">
                         <Bot className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
                         <div>
                            <h3 className="font-bold text-purple-900 text-sm mb-1">AI Smart Import</h3>
                            <p className="text-xs text-purple-700 leading-relaxed">
                                You don't need to specify segments in your CSV. Our AI will automatically read the <strong>Composition</strong> of each product and dynamically assign it to the correct medical segment during upload!
                            </p>
                         </div>
                    </div>

                    {/* Upload Area */}
                    <div 
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                            dragActive ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-purple-400 hover:bg-slate-50'
                        }`}
                    >
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".csv"
                            onChange={handleChange}
                            className="hidden" 
                            id="product-file-upload" 
                        />
                        <Upload className={`w-10 h-10 mx-auto mb-4 ${dragActive ? 'text-purple-500' : 'text-slate-400'}`} />
                        <label htmlFor="product-file-upload" className="cursor-pointer">
                            <span className="font-semibold text-purple-600 hover:text-purple-700 underline">Click to upload</span>
                            <span className="text-slate-600"> or drag and drop</span>
                        </label>
                        <p className="text-sm text-slate-500 mt-2">CSV files only</p>

                        {file && (
                            <div className="mt-4 p-3 bg-slate-100 rounded-lg inline-flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">{file.name}</span>
                                <button onClick={(e) => { e.preventDefault(); setFile(null); }} className="p-1 hover:bg-slate-200 rounded-full">
                                    <X className="w-3 h-3 text-slate-500" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Status Messages */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm">{success}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button 
                        onClick={closeBulkImportProductsModal}
                        className="px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="px-6 py-2 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Processing...
                            </>
                        ) : 'Import Products'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkImportProductsModal;
