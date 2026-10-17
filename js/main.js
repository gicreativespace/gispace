// ==========================================
// 0. AUTO CACHE CLEARING (Fixed for missing version.json)
// ==========================================
(async function autoClearCache() {
    try {
        const res = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
        
        // 🚨 THE FIX: If the file is missing (404), stop here! Don't crash.
        if (!res.ok) {
            console.warn('version.json not found. Skipping auto-cache clear.');
            return; 
        }
        
        const data = await res.json();
        const currentVersion = localStorage.getItem('gi_app_version');
        
        if (currentVersion && currentVersion !== data.version) {
            console.log(`Updating from ${currentVersion} to ${data.version}...`);
            localStorage.setItem('gi_app_version', data.version);
            
            if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (let reg of regs) await reg.unregister();
            }
            if ('caches' in window) {
                const keys = await caches.keys();
                for (let key of keys) await caches.delete(key);
            }
            window.location.reload(true);
        } else if (!currentVersion) {
            localStorage.setItem('gi_app_version', data.version);
        }
    } catch (err) {
        console.log('Version check skipped:', err.message);
    }
})();

// ==========================================
// MAIN LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ENTRANCE FORM (index.html) ---
    const visitorForm = document.getElementById('visitor-form');
    const visitorNameInput = document.getElementById('visitor-name');
    const namePrompt = document.getElementById('name-prompt');
    const personalWelcome = document.getElementById('personal-welcome');
    const welcomeMessage = document.getElementById('welcome-message');
    const spaceEntrance = document.getElementById('space-entrance');

    if (visitorForm) {
        visitorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const visitorName = visitorNameInput.value.trim();
            if (!visitorName) return;
            
            namePrompt.classList.add('hidden');
            welcomeMessage.textContent = `రండి ${visitorName} గారు.`;
            personalWelcome.classList.remove('hidden');
            
            setTimeout(() => { personalWelcome.classList.add('show'); }, 50);

            setTimeout(() => {
                if (spaceEntrance) spaceEntrance.classList.add('entrance-exit');
                setTimeout(() => { window.location.href = 'home.html'; }, 800);
            }, 2500);
        });
    }

    // --- 2. LANGUAGE TOGGLE ---
    const langToggleBtns = document.querySelectorAll('.lang-toggle');
    const body = document.body;

    const savedLang = localStorage.getItem('gi-lang');
    if (savedLang === 'en') {
        body.classList.add('english-mode');
        updateToggleUI(true);
    } else {
        updateToggleUI(false);
    }

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

    // --- 3. HEADER SCROLL EFFECT ---
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
    }

    // --- 4. MOBILE MENU ---
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

    // --- 5. RIGHT SIDE SOCIAL RIBBON ---
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
