import React from 'react';
import { Sidebar } from '../analytics/sidebar';
import { Header } from '../analytics/header';
import AIChatAssistant from '../ai/AIChatAssistant';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            <Sidebar />
            
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                <Header />
                
                <main className="flex-1 overflow-y-auto relative scroll-smooth p-6">
                    {children}
                </main>
            </div>

            <AIChatAssistant />
        </div>
    );
};

export default Layout;
