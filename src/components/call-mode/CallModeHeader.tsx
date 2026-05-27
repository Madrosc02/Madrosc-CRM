import React from 'react';
import { Customer } from '../../types';
import { ChevronLeft, Search, Bell, Filter } from 'lucide-react';

interface CallModeHeaderProps {
    currentIndex: number;
    totalCustomers: number;
    currentCustomer: Customer | undefined;
    selectedTier: string;
    callDuration: number;
    handleExit: () => void;
    handleTierChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleCreateTask: () => void;
    handleWhatsApp: () => void;
    handleCallNow: () => void;
}

const baseButtonClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";

export const CallModeHeader: React.FC<CallModeHeaderProps> = ({
    currentIndex,
    totalCustomers,
    currentCustomer,
    selectedTier,
    callDuration,
    handleExit,
    handleTierChange,
    handleCreateTask,
    handleWhatsApp,
    handleCallNow
}) => {
    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    return (
        <div className="bg-white border-b border-border px-6 py-4 sticky top-0 z-[100]">
            <div className="flex items-center justify-between gap-6">
                {/* Left: Back button and Call Mode info */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button 
                        onClick={handleExit}
                        className="text-foreground hover:bg-muted p-2 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white font-bold text-lg">☎</span>
                        </div>
                        <div className="min-w-0 flex flex-col">
                            <div className="font-semibold text-foreground">Call Mode</div>
                            <div className="text-xs text-muted-foreground truncate">
                                Client {currentIndex + 1} of {totalCustomers} • {currentCustomer?.state || 'Unknown'} Territory
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle: Timer, Search, notifications, filters */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-sm font-mono font-medium text-slate-700 tracking-wider">
                            {formatDuration(callDuration)}
                        </span>
                    </div>
                    <div className="h-6 w-px bg-slate-200 mx-1"></div>
                    <button className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="relative text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    </button>
                    <button className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Right: Action buttons */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <div className="relative group">
                        <select
                            value={selectedTier}
                            onChange={handleTierChange}
                            className={`${baseButtonClasses} border border-border text-foreground bg-white hover:bg-muted appearance-none cursor-pointer pr-8`}
                        >
                            <option value="All">All Tiers</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Bronze">Bronze</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <button 
                        onClick={handleCreateTask}
                        className={`${baseButtonClasses} bg-white text-primary border border-primary/20 hover:bg-primary/5 gap-1.5`}
                    >
                        <span className="text-lg leading-none">+</span> Create Task
                    </button>
                    
                    <button 
                        onClick={handleWhatsApp}
                        className={`${baseButtonClasses} bg-green-600 hover:bg-green-700 text-white gap-1.5 rounded-lg px-4 shadow-sm`}
                    >
                        <span className="text-base leading-none">💬</span> WhatsApp
                    </button>
                    
                    <button 
                        onClick={handleCallNow}
                        className={`${baseButtonClasses} bg-primary hover:bg-primary/90 text-white gap-1.5 rounded-lg px-4 shadow-sm`}
                    >
                        <span className="text-base leading-none">☎</span> Call Now
                    </button>
                </div>
            </div>
        </div>
    );
};
