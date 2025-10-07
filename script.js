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
    sliderTimer = setInterval(nextSlide, 4000);
}
if (slides.length > 0) {
    showSlide(currentSlide);
    startSlider();
    document.querySelector('.damodara-slider').addEventListener('click', function() {
        nextSlide();
        startSlider();
    });
}
