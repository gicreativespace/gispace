// ==========================================
// 0. AUTO CACHE CLEARING SYSTEM
// ==========================================
(async function autoClearCache() {
    try {
        // Fetch the version file (with a timestamp to prevent it from being cached)
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        
        const currentVersion = localStorage.getItem('gi_app_version');
        
        if (currentVersion !== data.version) {
            console.log(`Updating app from ${currentVersion} to ${data.version}...`);
            
            // Save new version
            localStorage.setItem('gi_app_version', data.version);
            
            // Unregister all Service Workers
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (let reg of regs) await reg.unregister();
            }
            
            // Delete all browser caches
            if ('caches' in window) {
                const keys = await caches.keys();
                for (let key of keys) await caches.delete(key);
            }
            
            // Force a hard reload from the server
            window.location.reload(true);
        }
    } catch (err) {
        console.log('Version check skipped:', err);
    }
})();
// ==========================================
// 1. PWA SERVICE WORKER REGISTRATION
// ==========================================
// ... your existing Service Worker code continues below ...

// ==========================================
// 1. PWA SERVICE WORKER (Isolated so it never breaks the site)
// ==========================================
const SW_VERSION = 'v5'; // Must match sw.js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let reg of registrations) {
                const currentSW = reg.active || reg.waiting || reg.installing;
                if (currentSW && !currentSW.scriptURL.includes(SW_VERSION)) {
                    await reg.unregister();
                }
            }
            await navigator.serviceWorker.register(`./sw.js?${SW_VERSION}`, { updateViaCache: 'none' });
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) await reg.update();
            
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) { refreshing = true; window.location.reload(); }
            });
        } catch (err) {
            console.error('SW setup failed:', err);
        }
    });
}

// ==========================================
// 2. LANGUAGE TOGGLE & UI LOGIC (Runs smoothly)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- A. LANGUAGE TOGGLE ---
    const langToggleBtns = document.querySelectorAll('.lang-toggle');
    const body = document.body;

    // Check saved preference
    const savedLang = localStorage.getItem('gi-lang');
    if (savedLang === 'en') {
        body.classList.add('english-mode');
        updateToggleUI(true);
    } else {
        updateToggleUI(false);
    }

    // Add click listener to toggle buttons
    langToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            body.classList.toggle('english-mode');
            const isEnglish = body.classList.contains('english-mode');
            localStorage.setItem('gi-lang', isEnglish ? 'en' : 'te');
            updateToggleUI(isEnglish);
        });
    });

    function updateToggleUI(isEnglish) {
        const teOptions = document.querySelectorAll('.te-option');
        const enOptions = document.querySelectorAll('.en-option');
        if (teOptions.length === 0) return;

        if (isEnglish) {
            teOptions.forEach(el => el.classList.remove('active'));
            enOptions.forEach(el => el.classList.add('active'));
        } else {
            enOptions.forEach(el => el.classList.remove('active'));
            teOptions.forEach(el => el.classList.add('active'));
        }
    }

    // --- B. HEADER SCROLL EFFECT ---
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
    }

    // --- C. MOBILE MENU ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-open');
            if (mainNav.classList.contains('mobile-open')) {
                mobileMenuBtn.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--river-blue)" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
            } else {
                mobileMenuBtn.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--river-blue)" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>`;
            }
        });
        
        // Mobile dropdown toggle
        const dropbtn = document.querySelector('.dropbtn');
        const dropdown = document.querySelector('.dropdown');
        if (dropbtn && dropdown) {
            dropbtn.addEventListener('click', (e) => {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    }

    // --- D. RIGHT SOCIAL RIBBON ---
    const socialSidebar = document.getElementById('social-sidebar');
    const socialToggleBtn = document.getElementById('social-toggle-btn');
    if (socialToggleBtn && socialSidebar) {
        socialToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            socialSidebar.classList.toggle('is-open');
        });
        document.addEventListener('click', (e) => {
            if (!socialSidebar.contains(e.target) && !socialToggleBtn.contains(e.target)) {
                socialSidebar.classList.remove('is-open');
            }
        });
    }
});
