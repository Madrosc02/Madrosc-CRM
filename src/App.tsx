import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/Login';
import CustomerDetailDrawer from './components/CustomerDetailDrawer';
import AddCustomerModal from './components/AddCustomerModal';
import BulkImportModal from './components/BulkImportModal';
import AddTaskModal from './components/AddTaskModal';
import CommandPalette from './components/command/CommandPalette';
import { useApp } from './contexts/AppContext';
import Spinner from './components/ui/Spinner';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const AnalyticsPage = React.lazy(() => import('./components/analytics/AnalyticsPage'));


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

const AuthenticatedApp: React.FC = () => {
    const {
        isDetailModalOpen,
        isAddCustomerModalOpen,
        isBulkImportModalOpen,
        isAddTaskModalOpen,
        openCommandPalette
    } = useApp();

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openCommandPalette();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openCommandPalette]);

    return (
        <Layout>
            <Suspense fallback={<div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>

            {/* Modals & Overlays */}
            {isDetailModalOpen && <CustomerDetailDrawer />}
            {isAddCustomerModalOpen && <AddCustomerModal />}
            {isBulkImportModalOpen && <BulkImportModal />}
            {isAddTaskModalOpen && <AddTaskModal />}
            <CommandPalette />
        </Layout>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <AuthenticatedApp />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;