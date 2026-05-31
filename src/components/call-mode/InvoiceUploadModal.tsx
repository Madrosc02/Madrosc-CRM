import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { extractInvoiceData, ParsedInvoiceData } from '../../utils/PdfParser';
import { useApp } from '../../contexts/AppContext';

interface InvoiceUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
}

export const InvoiceUploadModal: React.FC<InvoiceUploadModalProps> = ({ isOpen, onClose, customerId }) => {
    const { addInvoice } = useApp();
    const [file, setFile] = useState<File | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedInvoiceData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError('Please upload a valid PDF file.');
                return;
            }
            setFile(selectedFile);
            setError(null);
            await scanFile(selectedFile);
        }
    };

    const scanFile = async (fileToScan: File) => {
        setIsScanning(true);
        setParsedData(null);
        setError(null);

        try {
            // Artificial delay to show the scanning animation for better UX
            await new Promise(resolve => setTimeout(resolve, 1500));
            const data = await extractInvoiceData(fileToScan);
            setParsedData(data);
        } catch (err: any) {
            setError(err.message || 'Failed to read PDF. Ensure it is a text-based digital PDF.');
        } finally {
            setIsScanning(false);
        }
    };

    const handleApprove = async () => {
        if (!parsedData || !file) return;
        setIsSaving(true);
        try {
            // Upload the PDF physically to storage first
            const { uploadInvoicePdf } = await import('../../services/api');
            const pdfUrl = await uploadInvoicePdf(file);
            
            await addInvoice({
                ...parsedData,
                customerId,
                pdfUrl
            });
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to save invoice and update balances. Ensure you ran the SQL migration.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Smart GST Billing Scanner</h2>
                        <p className="text-blue-100 text-sm opacity-90 mt-1">Upload PDF invoice to auto-extract products and update balance</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {!file && !isScanning && !parsedData && (
                        <div 
                            className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <UploadCloud className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Click to Upload GST Invoice</h3>
                            <p className="text-sm text-slate-500 max-w-sm">Only digital PDF invoices are supported for automatic text extraction.</p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />
                        </div>
                    )}

                    {isScanning && (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="relative w-20 h-20">
                                <FileText className="w-full h-full text-slate-200" />
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                AI Engine Scanning Invoice...
                            </h3>
                            <p className="text-sm text-slate-500">Extracting totals, dates, and line items...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3 mt-4">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold">Error Scanning File</h4>
                                <p className="text-sm mt-1">{error}</p>
                                <button 
                                    onClick={() => { setFile(null); setError(null); }}
                                    className="mt-3 text-sm font-medium bg-white px-3 py-1.5 rounded border border-red-200 hover:bg-red-50"
                                >
                                    Try Another File
                                </button>
                            </div>
                        </div>
                    )}

                    {parsedData && !isScanning && (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center gap-3 mb-6 bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-200">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-semibold">Invoice Successfully Scanned! Please verify the details below.</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Invoice No</p>
                                    <p className="text-lg font-semibold text-slate-800">{parsedData.invoiceNo}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Date</p>
                                    <p className="text-lg font-semibold text-slate-800">{parsedData.date}</p>
                                </div>
                                <div className="col-span-2 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 uppercase">Grand Total (Added to Outstanding)</p>
                                        <p className="text-3xl font-bold text-blue-900">₹{parsedData.totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center justify-between">
                                Extracted Products 
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{parsedData.items.length} Items</span>
                            </h4>
                            
                            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 bg-slate-50 uppercase sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 border-b">Product Name</th>
                                            <th className="px-4 py-3 border-b">Pack</th>
                                            <th className="px-4 py-3 border-b text-right">Qty</th>
                                            <th className="px-4 py-3 border-b text-right">Rate</th>
                                            <th className="px-4 py-3 border-b text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.items.map((item, idx) => (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-800">{item.productName}</td>
                                                <td className="px-4 py-3 text-slate-600">{item.pack}</td>
                                                <td className="px-4 py-3 text-slate-600 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-slate-600 text-right">₹{item.rate.toFixed(2)}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800 text-right">₹{item.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                                <button 
                                    onClick={() => setParsedData(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleApprove}
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Approve & Save Billing
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
            `}} />
        </div>
    );
};
