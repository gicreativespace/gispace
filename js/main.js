// ==========================================
// 1. PWA SERVICE WORKER — FORCE REFRESH
// ==========================================
const SW_VERSION = 'v3'; // ← Change this when you update files

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // Get all existing registrations
            const registrations = await navigator.serviceWorker.getRegistrations();
            
            for (let reg of registrations) {
                // Check if the SW is stale by looking at its scriptURL version
                const currentSW = reg.active || reg.waiting || reg.installing;
                if (currentSW && !currentSW.scriptURL.includes(SW_VERSION)) {
                    console.log('Stale SW detected, unregistering...');
                    await reg.unregister();
                }
            }

            // Register the new SW with cache bypass
            await navigator.serviceWorker.register(`./sw.js?${SW_VERSION}`, {
                updateViaCache: 'none'
            });

            // Force an update check
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
                await reg.update();
            }

            // Listen for new SW taking over — reload once so user sees fresh content
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                }
            });

        } catch (err) {
            console.error('SW setup failed:', err);
        }
    });
}
