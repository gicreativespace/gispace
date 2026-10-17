document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. PWA SERVICE WORKER REGISTRATION
    // ==========================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed:', error));
        });
    }

    // ==========================================
    // 2. ENTRANCE LOGIC (Only runs on index.html)
    // ==========================================
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
            
            if (visitorName) {
                namePrompt.classList.add('hidden');
                welcomeMessage.textContent = `రండి ${visitorName} గారు.`;
                personalWelcome.classList.remove('hidden');
                
                setTimeout(() => { personalWelcome.classList.add('show'); }, 50);

                setTimeout(() => {
                    spaceEntrance.classList.add('entrance-exit');
                    setTimeout(() => { window.location.href = 'home.html'; }, 800);
                }, 2500);
            }
        });
    }

    // ==========================================
    // 3. LANGUAGE TOGGLE LOGIC (Runs everywhere)
    // ==========================================
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

    // ==========================================
    // 4. MOBILE MENU LOGIC
    // ==========================================
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

        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!link.classList.contains('dropbtn')) {
                    mainNav.classList.remove('mobile-open');
                    mobileMenuBtn.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--river-blue)" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>`;
                }
            });
        });
    }

    // ==========================================
    // 5. SCROLL & HEADER LOCK LOGIC
    // ==========================================
    const header = document.getElementById('main-header');
    const socialToggleBtn = document.getElementById('social-toggle-btn');
    const socialRibbon = document.getElementById('social-ribbon');

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Close social ribbon on scroll
            if (socialRibbon) socialRibbon.classList.remove('open');
        });
    }

    if (socialToggleBtn && socialRibbon) {
        socialToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            socialRibbon.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!socialRibbon.contains(e.target) && !socialToggleBtn.contains(e.target)) {
                socialRibbon.classList.remove('open');
            }
        });
    }
});
