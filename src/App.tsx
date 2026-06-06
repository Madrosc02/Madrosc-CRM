import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/Login';
import { useApp } from './contexts/AppContext';
import Spinner from './components/ui/Spinner';
import PendingApproval from './components/PendingApproval';
import AdminPanel from './components/admin/AdminPanel';

// Lazy load main pages
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const AnalyticsPage = React.lazy(() => import('./components/analytics/AnalyticsPage'));
const ClientsPage = React.lazy(() => import('./components/ClientsPage'));
const ProductsPage = React.lazy(() => import('./components/products/ProductsPage'));
const ReportsPage = React.lazy(() => import('./components/ReportsPage'));
const SettingsPage = React.lazy(() => import('./components/SettingsPage'));

// Lazy load heavy modals
const CustomerDetailDrawer = React.lazy(() => import('./components/CustomerDetailDrawer'));
const AddCustomerModal = React.lazy(() => import('./components/AddCustomerModal'));
const BulkImportModal = React.lazy(() => import('./components/BulkImportModal'));
const AddProductDrawer = React.lazy(() => import('./components/products/AddProductDrawer'));
const BulkImportProductsModal = React.lazy(() => import('./components/products/BulkImportProductsModal'));
const AddTaskModal = React.lazy(() => import('./components/AddTaskModal'));
const CommandPalette = React.lazy(() => import('./components/command/CommandPalette'));
const CallMode = React.lazy(() => import('./components/CallMode'));


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading, userStatus, userRole } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    // Admins always get through regardless of status
    if (userRole === 'admin') return <>{children}</>;
    // Only block non-admins if explicitly pending or rejected
    // null/undefined means role hasn't loaded yet — let them through
    if (userStatus === 'pending') return <PendingApproval />;
    return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userRole } = useAuth();
    if (userRole !== 'admin') return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
};

const AuthenticatedApp: React.FC = () => {
    const {
        isDetailModalOpen,
        isAddCustomerModalOpen,
        isBulkImportModalOpen,
        isAddProductModalOpen,
        isBulkImportProductsModalOpen,
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
            <Suspense fallback={<div className="flex h-full items-center justify-center"><Spinner className="w-8 h-8" /></div>}>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/call-mode" element={<CallMode />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>

            {/* Modals & Overlays - Lazy Loaded */}
            <Suspense fallback={null}>
                {isDetailModalOpen && <CustomerDetailDrawer />}
                {isAddCustomerModalOpen && <AddCustomerModal />}
                {isBulkImportModalOpen && <BulkImportModal />}
                {isAddProductModalOpen && <AddProductDrawer />}
                {isBulkImportProductsModalOpen && <BulkImportProductsModal />}
                {isAddTaskModalOpen && <AddTaskModal />}
                <CommandPalette />
            </Suspense>
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

