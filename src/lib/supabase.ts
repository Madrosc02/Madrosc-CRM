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
      // Use ALL defaults — do NOT change storageKey or flowType!
      // Changing storageKey causes session loss on refresh.
      // Changing flowType breaks token refresh for existing sessions.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
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
      console.log('   Token expires at:', new Date(data.session.expires_at! * 1000).toLocaleString());
    } else {
      console.log('ℹ️ No active Supabase session (user not logged in)');
    }
  });
}
