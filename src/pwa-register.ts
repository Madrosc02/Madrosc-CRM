import { registerSW } from 'virtual:pwa-register'

// Aggressively clear ALL caches on startup to prevent stale data/UI issues
if ('caches' in window) {
    caches.keys().then(names => {
        names.forEach(name => {
            caches.delete(name);
            console.log('🗑️ Cleared cache:', name);
        });
    });
}

// Unregister any stale service workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
            registration.update(); // Force check for updates
        });
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
