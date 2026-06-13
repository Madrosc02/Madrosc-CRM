import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    userRole: string | null;
    userStatus: string | null;
    authError: string | null;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userStatus, setUserStatus] = useState<string | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    const fetchUserRole = async (userId: string, retries = 3) => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role, status')
                .eq('user_id', userId)
                .single();
            
            if (error) {
                // PGRST116 = no rows found. If no role record, treat as approved regular user.
                if (error.code === 'PGRST116') {
                    setUserRole('user');
                    setUserStatus('approved');
                    setAuthError(null);
                    return;
                }
                throw error;
            }
            
            if (data) {
                setUserRole(data.role);
                setUserStatus(data.status || 'approved');
                setAuthError(null);
            }
        } catch (e: any) {
            console.error(`Error fetching user role (${retries} retries left):`, e);
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
                await fetchUserRole(userId, retries - 1);
            } else {
                console.warn('Failed to fetch user role after all retries. Defaulting to pending.');
                // Default to pending so the user doesn't get unearned access
                setUserRole(null);
                setUserStatus('pending');
                setAuthError(e.message || JSON.stringify(e));
            }
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        // Safety fallback: if Supabase takes longer than 5 seconds, force load to finish
        // to prevent an infinite "Loading..." screen.
        const timer = setTimeout(() => {
            if (isMounted) {
                console.warn("Supabase auth check timed out. Forcing load to finish.");
                setLoading(false);
            }
        }, 5000);

        // Check active sessions and sets the user
        supabase.auth.getSession()
            .then(async ({ data: { session } }) => {
                if (!isMounted) return;
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchUserRole(session.user.id);
                }
                clearTimeout(timer);
                if (isMounted) setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to get session:", err);
                clearTimeout(timer);
                if (isMounted) setLoading(false);
            });

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'INITIAL_SESSION') return; // Handled by getSession
            
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchUserRole(session.user.id);
            } else {
                setUserRole(null);
                setUserStatus(null);
            }
            setLoading(false);
        });

        return () => {
            isMounted = false;
            clearTimeout(timer);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            // Force state reset locally to avoid cached data issues
            setUser(null);
            setSession(null);
            setUserRole(null);
            setUserStatus(null);
            
            // Clear all local storage in case of stale cache
            localStorage.clear();
            sessionStorage.clear();
            
            // Hard redirect to login to completely reset the React app state
            window.location.href = '/login';
        }
    };

    const value = {
        user,
        session,
        loading,
        userRole,
        userStatus,
        authError,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
