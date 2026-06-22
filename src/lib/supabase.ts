import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ set' : '❌ MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ set' : '❌ MISSING');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Use localStorage for session persistence
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'madrosc-crm-auth',
      // Ensure cookies are not used (avoids issues with Cloudflare Pages)
      flowType: 'pkce',
    },
    global: {
      headers: {
        'x-app-version': '2.0.0', // Cache-bust header
      },
    },
    // Add request timeout
    db: {
      schema: 'public',
    },
  }
);

// Debug helper: log session state on load
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase session error on init:', error.message);
    } else if (data.session) {
      console.log('✅ Supabase session active for:', data.session.user.email);
    } else {
      console.log('ℹ️ No active Supabase session (user not logged in)');
    }
  });
}
