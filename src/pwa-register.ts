import { registerSW } from 'virtual:pwa-register'

// ONE-TIME cache clear: only clear stale caches once per session to avoid
// a reload loop where clearing triggers re-precache → onNeedRefresh → reload → repeat.
if ('caches' in window && !sessionStorage.getItem('caches-cleared-v2')) {
    caches.keys().then(names => {
        names.forEach(name => {
            caches.delete(name);
            console.log('🗑️ Cleared stale cache:', name);
        });
        sessionStorage.setItem('caches-cleared-v2', 'true');
    });
}

// Force immediate update without prompting — critical for bug fix deployments
registerSW({
    onNeedRefresh() {
        // Auto-reload immediately without asking the user
        console.log('🔄 New version available, reloading...');
        window.location.reload()
    },
    onOfflineReady() {
        console.log('✅ App ready to work offline')
    },
})
