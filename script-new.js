// Damodarāṣṭakam JS with improved translation system
// Font size controls
let currentFontScale = 1;
const btnMinus = document.getElementById('font-minus');
const btnDefault = document.getElementById('font-default');
const btnPlus = document.getElementById('font-plus');

// Language settings
let currentLanguage = localStorage.getItem('damodarashtakam-language') || 'en';
let translations = {};
const availableLanguages = ['en', 'ru', 'it'];

// View preference settings
let currentView = localStorage.getItem('damodarashtakam-view') || 'detailed';

// Apply saved view preference on page load
if (currentView === 'simple') {
    document.body.classList.add('simple-view');
}

// Apply language class to body for styling
document.body.classList.add(`lang-${currentLanguage}`);

// Load translations from JSON file
async function loadTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to load ${lang} translations`);
        translations = await response.json();
        return translations;
    } catch (error) {
        console.error(`Error loading translations for ${lang}:`, error);
        // Fallback to English
        if (lang !== 'en') {
            return loadTranslations('en');
        }
        return {};
    }
}

// Helper function to get nested translation value
function getTranslation(key) {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key; // Return key if translation not found
        }
    }
    return value || key;
}

// Apply translations to DOM elements
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.innerHTML = getTranslation(key);
    });
}

// Function to load verses based on current language
function loadVerses() {
    const versesContainer = document.getElementById('verses');
    if (!versesContainer) return;

    const versesFiles = {
        'en': 'verses.html',
        'ru': 'verses-ru.html',
        'it': 'verses-it.html'
    };
    
    const versesFile = versesFiles[currentLanguage] || 'verses.html';

    fetch(versesFile)
        .then(response => response.text())
        .then(html => {
            versesContainer.innerHTML = html;
            // Add IDs to verse sections for navigation
            const verseSections = versesContainer.querySelectorAll('.verse-section');
            verseSections.forEach((section, index) => {
                section.id = `verse-${index + 1}`;
            });
        })
        .catch(error => {
            console.error('Error loading verses:', error);
            // Fallback to English if loading fails
            if (currentLanguage !== 'en') {
                currentLanguage = 'en';
                localStorage.setItem('damodarashtakam-language', 'en');
                loadVerses();
            }
        });
}

// Function to switch language
async function switchLanguage(newLang) {
    if (!availableLanguages.includes(newLang)) {
        console.error(`Language ${newLang} not available`);
        return;
    }

    // Remove current language class
    document.body.classList.remove(`lang-${currentLanguage}`);

    currentLanguage = newLang;

    // Add new language class
    document.body.classList.add(`lang-${currentLanguage}`);

    localStorage.setItem('damodarashtakam-language', currentLanguage);

    // Load translations and apply them
    await loadTranslations(currentLanguage);
    applyTranslations();

    // Reload verses with new language
    loadVerses();

    // Close menu and force recreate on next open
    if (menuPopup) {
        menuPopup.classList.remove('show');
    }
    menuPopup = null;
}

function updateFontSize() {
    document.documentElement.style.setProperty('--font-scale', currentFontScale);
    btnMinus.classList.remove('active');
    btnDefault.classList.remove('active');
    btnPlus.classList.remove('active');
    if (currentFontScale < 1) {
        btnMinus.classList.add('active');
    } else if (currentFontScale > 1) {
        btnPlus.classList.add('active');
    } else {
        btnDefault.classList.add('active');
    }
}

btnPlus.addEventListener('click', function() {
    currentFontScale = Math.min(currentFontScale + 0.1, 2);
    updateFontSize();
});
btnMinus.addEventListener('click', function() {
    currentFontScale = Math.max(currentFontScale - 0.1, 0.5);
    updateFontSize();
});
btnDefault.addEventListener('click', function() {
    currentFontScale = 1;
    updateFontSize();
});

// Initialize
updateFontSize();

// Toggle simple/detailed view
function toggleViewHandler() {
    const body = document.body;
    const isSimple = body.classList.contains('simple-view');
    if (isSimple) {
        body.classList.remove('simple-view');
        currentView = 'detailed';
        this.textContent = getTranslation('menu.switchToSimple');
    } else {
        body.classList.add('simple-view');
        currentView = 'simple';
        this.textContent = getTranslation('menu.switchToDetailed');
    }

    // Save view preference
    localStorage.setItem('damodarashtakam-view', currentView);

    // Close the menu if open
    if (menuPopup) {
        menuPopup.classList.remove('show');
    }
    // Force recreate menu popup on next open to update explanatory text
    menuPopup = null;
}

const toggleViewBtn = document.getElementById('toggleView');
if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', toggleViewHandler);
}

// --- Damodara Slider ---
const slides = document.querySelectorAll('.damodara-slide');
let currentSlide = 0;
let sliderTimer = null;
function showSlide(idx) {
    slides.forEach((img, i) => {
        img.classList.toggle('active', i === idx);
    });
}
function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}
function startSlider() {
    if (sliderTimer) clearInterval(sliderTimer);
    sliderTimer = setInterval(nextSlide, 10000);
}
if (slides.length > 0) {
    showSlide(currentSlide);
    startSlider();
    document.querySelector('.damodara-slider').addEventListener('click', function() {
        nextSlide();
        startSlider();
    });
}

// --- Damodara Audio Player ---
function isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

const playBtn = document.getElementById('play-audio');
const audioBlock = document.getElementById('damodara-audio');
const audioElement = audioBlock.querySelector('audio');
if (playBtn && audioBlock) {
    playBtn.addEventListener('click', function() {
        playBtn.style.display = 'none';
        audioBlock.style.display = 'block';
        if (isMobile()) {
            audioElement.play();
        } else {
            // Embed SoundCloud for desktop
            audioBlock.innerHTML = '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https://soundcloud.com/user-787531012/aindra-prabhu-damodarashtakam&auto_play=true&color=%23ff5500&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>';
        }
    });
}

// --- Register Service Worker for PWA ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// --- Hamburger Menu for Verse Navigation ---
const hamburgerMenu = document.getElementById('hamburger-menu');
let menuPopup = null;

function createMenuPopup() {
    menuPopup = document.createElement('div');
    menuPopup.className = 'menu-popup';
    
    // Build language switcher buttons
    const languageButtons = availableLanguages
        .filter(lang => lang !== currentLanguage)
        .map(lang => {
            const langNames = {
                'en': 'English',
                'ru': 'Русский',
                'it': 'Italiano'
            };
            return `<button class="language-switch-btn" data-lang="${lang}" style="width: 100%; padding: 10px 16px; margin-top: 12px; background: #28a745; color: white; border: none; border-radius: 12px; font-size: 14px; cursor: pointer; transition: background 0.2s ease;">
                Switch to ${langNames[lang]}
            </button>`;
        }).join('');
    
    menuPopup.innerHTML = `
        <div class="menu-content">
            <span class="close-menu">&times;</span>
            
            <div class="navigation-section">
                <ul id="menu-list">
                    <li><a href="#verse-1">${getTranslation('menu.verse')} 1</a></li>
                    <li><a href="#verse-2">${getTranslation('menu.verse')} 2</a></li>
                    <li><a href="#verse-3">${getTranslation('menu.verse')} 3</a></li>
                    <li><a href="#verse-4">${getTranslation('menu.verse')} 4</a></li>
                    <li><a href="#verse-5">${getTranslation('menu.verse')} 5</a></li>
                    <li><a href="#verse-6">${getTranslation('menu.verse')} 6</a></li>
                    <li><a href="#verse-7">${getTranslation('menu.verse')} 7</a></li>
                    <li><a href="#verse-8">${getTranslation('menu.verse')} 8</a></li>
                </ul>
            </div>
            <div class="toggle-section">
                <button id="toggleView" style="width: 100%; padding: 12px 16px; background: #007aff; color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer; transition: background 0.2s ease;">
                    ${document.body.classList.contains('simple-view')
                        ? getTranslation('menu.switchToDetailed')
                        : getTranslation('menu.switchToSimple')}
                </button>
                ${document.body.classList.contains('simple-view')
                    ? `<small style="display: block; margin-top: 6px; font-size: 12px; color: #8e8e93; text-align: center; line-height: 1.3;">${getTranslation('menu.detailedExplanation')}</small>`
                    : `<small style="display: block; margin-top: 6px; font-size: 12px; color: #8e8e93; text-align: center; line-height: 1.3;">${getTranslation('menu.simpleExplanation')}</small>`}
                ${languageButtons}
            </div>
        </div>
    `;
    document.body.appendChild(menuPopup);

    // Get references to the elements
    const toggleViewBtn = menuPopup.querySelector('#toggleView');
    const languageSwitchBtns = menuPopup.querySelectorAll('.language-switch-btn');

    // Attach the event listeners
    toggleViewBtn.addEventListener('click', toggleViewHandler);
    
    languageSwitchBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const newLang = this.getAttribute('data-lang');
            switchLanguage(newLang);
        });
    });

    // Event listeners
    menuPopup.addEventListener('click', (e) => {
        if (e.target === menuPopup || e.target.classList.contains('close-menu')) {
            menuPopup.classList.remove('show');
        }
    });

    const links = menuPopup.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
            menuPopup.classList.remove('show');
        });
    });
}

if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', () => {
        console.log('Hamburger menu clicked');
        if (!menuPopup) {
            createMenuPopup();
        }
        menuPopup.classList.add('show');
    });
}

// Initialize the app
async function init() {
    await loadTranslations(currentLanguage);
    applyTranslations();
    loadVerses();
}

init();
