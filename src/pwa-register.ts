import { registerSW } from 'virtual:pwa-register'

// Force immediate update without prompting — critical for bug fix deployments
registerSW({
    onNeedRefresh() {
        // Auto-reload immediately without asking the user
        window.location.reload()
    },
    onOfflineReady() {
        console.log('App ready to work offline')
    },
})
