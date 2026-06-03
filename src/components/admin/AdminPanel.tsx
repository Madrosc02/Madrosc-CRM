import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';

interface UserRoleData {
    id: string;
    user_id: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
}

const AdminPanel: React.FC = () => {
    const { userRole } = useAuth();
    const [users, setUsers] = useState<UserRoleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setUsers(data || []);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userRole === 'admin') {
            fetchUsers();
        }
    }, [userRole]);

    const updateUser = async (userId: string, updates: { role?: string; status?: string }) => {
        setActionLoading(userId);
        try {
            const { error } = await supabase
                .from('user_roles')
                .update(updates)
                .eq('id', userId);
            
            if (error) throw error;
            
            setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
        } catch (err: any) {
            console.error(err);
            alert('Failed to update user: ' + (err.message || 'Unknown error'));
        } finally {
            setActionLoading(null);
        }
    };

    if (userRole !== 'admin') {
        return <div className="p-6 text-center text-red-500">Access Denied. You must be an administrator to view this page.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Control Panel</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage user access and roles for the CRM.</p>
                </div>
                <button 
                    onClick={fetchUsers}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Refresh"
                >
                    <i className="fas fa-sync-alt text-slate-600 dark:text-slate-300"></i>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-[#0d1117] border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">User Email</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Role</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">Joined Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        <Spinner className="w-6 h-6 mx-auto mb-2" />
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                                            {user.email || 'No email'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                user.status === 'approved' 
                                                    ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                                                    : user.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                                    : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                            }`}>
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                user.role === 'admin' 
                                                    ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' 
                                                    : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                            }`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {actionLoading === user.id ? (
                                                <Spinner className="w-5 h-5 inline-block" />
                                            ) : (
                                                <>
                                                    {user.status === 'pending' && (
                                                        <>
                                                            <button 
                                                                onClick={() => updateUser(user.id, { status: 'approved' })}
                                                                className="text-xs font-medium px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => updateUser(user.id, { status: 'rejected' })}
                                                                className="text-xs font-medium px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    
                                                    {user.status === 'approved' && user.role === 'user' && (
                                                        <button 
                                                            onClick={() => updateUser(user.id, { role: 'admin' })}
                                                            className="text-xs font-medium px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                                                        >
                                                            Make Admin
                                                        </button>
                                                    )}
                                                    
                                                    {user.status === 'approved' && user.role === 'admin' && (
                                                        <button 
                                                            onClick={() => updateUser(user.id, { role: 'user' })}
                                                            className="text-xs font-medium px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-md transition-colors"
                                                        >
                                                            Remove Admin
                                                        </button>
                                                    )}

                                                    {user.status === 'approved' && (
                                                        <button 
                                                            onClick={() => updateUser(user.id, { status: 'rejected' })}
                                                            className="text-xs font-medium px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-md transition-colors ml-2"
                                                        >
                                                            Revoke
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
