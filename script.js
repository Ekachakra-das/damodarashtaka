// Damodarāṣṭakam JS
// Font size controls
let currentFontScale = 1;
const btnMinus = document.getElementById('font-minus');
const btnDefault = document.getElementById('font-default');
const btnPlus = document.getElementById('font-plus');

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
const toggleViewBtn = document.getElementById('toggleView');
toggleViewBtn.addEventListener('click', function() {
    const body = document.body;
    const isSimple = body.classList.contains('simple-view');
    if (isSimple) {
        body.classList.remove('simple-view');
        this.textContent = 'Switch to Simple Edition';
    } else {
        body.classList.add('simple-view');
        this.textContent = 'Switch to Detailed Edition';
    }
});

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

// --- Load verses from verses.html ---
const versesContainer = document.getElementById('verses');
if (versesContainer) {
    fetch('verses.html')
        .then(response => response.text())
        .then(html => {
            versesContainer.innerHTML = html;
            // Add IDs to verse sections for navigation
            const verseSections = versesContainer.querySelectorAll('.verse-section');
            verseSections.forEach((section, index) => {
                section.id = `verse-${index + 1}`;
            });
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
    menuPopup.innerHTML = `
        <div class="menu-content">
            <span class="close-menu">&times;</span>
            <h3>Navigate to Verse</h3>
            <ul>
                <li><a href="#verse-1">Verse 1</a></li>
                <li><a href="#verse-2">Verse 2</a></li>
                <li><a href="#verse-3">Verse 3</a></li>
                <li><a href="#verse-4">Verse 4</a></li>
                <li><a href="#verse-5">Verse 5</a></li>
                <li><a href="#verse-6">Verse 6</a></li>
                <li><a href="#verse-7">Verse 7</a></li>
                <li><a href="#verse-8">Verse 8</a></li>
            </ul>
        </div>
    `;
    document.body.appendChild(menuPopup);

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
        if (!menuPopup) {
            createMenuPopup();
        }
        menuPopup.classList.add('show');
    });
}
