import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    userRole: string | null;
    userStatus: string | null;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userStatus, setUserStatus] = useState<string | null>(null);

    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('role, status')
                .eq('user_id', userId)
                .single();
            
            if (data && !error) {
                setUserRole(data.role);
                setUserStatus(data.status);
            } else {
                setUserRole(null);
                setUserStatus(null);
            }
        } catch (e) {
            console.error('Error fetching user role:', e);
            setUserRole(null);
            setUserStatus(null);
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
        await supabase.auth.signOut();
    };

    const value = {
        user,
        session,
        loading,
        userRole,
        userStatus,
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
