import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const PendingApproval: React.FC = () => {
    const { signOut } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1117] px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-[#161b22] rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-clock text-2xl"></i>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    Pending Approval
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Your account has been created successfully, but it requires administrator approval before you can access the CRM. 
                    Please check back later or contact your administrator.
                </p>
                <div className="mt-6">
                    <button
                        onClick={signOut}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0d1117] hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
