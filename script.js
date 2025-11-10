// Damodarāṣṭakam JS with improved translation system
// Font size controls
let currentFontScale = 1;
const btnMinus = document.getElementById("font-minus");
const btnDefault = document.getElementById("font-default");
const btnPlus = document.getElementById("font-plus");

// Language settings
let currentLanguage = localStorage.getItem("damodarashtakam-language") || "en";
let translations = {};
const availableLanguages = ["en", "ru", "it"];

// View preference settings
let currentView = localStorage.getItem("damodarashtakam-view") || "detailed";
let versePreviews = [];
let simpleNavTargets = [];
let detailedNavTargets = [];
let navContainer = null;
let prevNavBtn = null;
let nextNavBtn = null;
let navUpdateScheduled = false;

// Theme settings
let currentTheme = localStorage.getItem("damodarashtakam-theme") || "auto";
const availableThemes = ["auto", "light", "dark"];

const NAV_ARROW_SRC =
  "https://img.icons8.com/?size=100&id=zPsDwZeiXsyW&format=png&color=000000";

// Apply saved view preference on page load
if (currentView === "simple") {
  document.body.classList.add("simple-view");
}

// Apply language class to body for styling
document.body.classList.add(`lang-${currentLanguage}`);

// Apply theme class to body
applyTheme(currentTheme);

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
    if (lang !== "en") {
      return loadTranslations("en");
    }
    return {};
  }
}

// Helper function to get nested translation value
function getTranslation(key) {
  const keys = key.split(".");
  let value = translations;
  for (const k of keys) {
    if (value && typeof value === "object") {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  return value || key;
}

function ensureNavControls() {
  if (navContainer || !document.getElementById("verses")) {
    return;
  }
  navContainer = document.createElement("div");
  navContainer.className = "verse-navigation is-hidden";
  navContainer.innerHTML = `
        <button type="button" class="verse-nav-btn verse-nav-prev" aria-label="Previous section">
            <img src="${NAV_ARROW_SRC}" alt="" decoding="async" crossorigin="anonymous">
        </button>
        <button type="button" class="verse-nav-btn verse-nav-next" aria-label="Next section">
            <img src="${NAV_ARROW_SRC}" alt="" decoding="async" crossorigin="anonymous">
        </button>
    `;
  document.body.appendChild(navContainer);
  prevNavBtn = navContainer.querySelector(".verse-nav-prev");
  nextNavBtn = navContainer.querySelector(".verse-nav-next");

  prevNavBtn.addEventListener("click", () => navigate(-1));
  nextNavBtn.addEventListener("click", () => navigate(1));
}

function getActiveTargets() {
  return currentView === "simple"
    ? simpleNavTargets
    : detailedNavTargets.length
    ? detailedNavTargets
    : simpleNavTargets;
}

function getNavRevealElement() {
  if (currentView === "detailed" && detailedNavTargets.length > 1) {
    return detailedNavTargets[1];
  }
  return simpleNavTargets[0] || null;
}

function shouldHideNavAtTop() {
  const tolerance = 8;
  if (currentView === "simple" && simpleNavTargets.length) {
    const firstVerse = simpleNavTargets[0];
    const rect = firstVerse.getBoundingClientRect();
    // Show navigation when verse 1 bottom reaches screen bottom + 200px
    // This means: verse bottom position < window height + 200px
    return rect.bottom > window.innerHeight + 200;
  }
  const revealElement = getNavRevealElement();
  if (!revealElement) return false;
  if (currentView === "detailed") {
    const rect = revealElement.getBoundingClientRect();
    const threshold = Math.max(0, window.innerHeight - 80);
    return rect.top > threshold;
  }
  const revealOffset = getElementPageOffset(revealElement);
  return window.scrollY + tolerance < revealOffset;
}

function getElementPageOffset(element) {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  return rect.top + window.scrollY;
}

function updateNavVisibility() {
  if (!navContainer) return;
  const targets = getActiveTargets();
  if (targets.length) {
    navContainer.classList.remove("is-hidden");
  } else {
    navContainer.classList.add("is-hidden");
  }
  const hideForTop = shouldHideNavAtTop();
  if (hideForTop) {
    navContainer.classList.add("is-hidden-top");
  } else {
    navContainer.classList.remove("is-hidden-top");
  }
}

function updateNavButtonState() {
  if (!navContainer || !prevNavBtn || !nextNavBtn) return;
  const targets = getActiveTargets();
  if (!targets.length) {
    prevNavBtn.disabled = true;
    nextNavBtn.disabled = true;
    return;
  }
  const tolerance = 8;
  const scrollY = window.scrollY;
  const prevExists = targets.some(
    (el) => getElementPageOffset(el) < scrollY - tolerance
  );
  const nextExists = targets.some(
    (el) => getElementPageOffset(el) > scrollY + tolerance
  );
  prevNavBtn.disabled = !prevExists;
  nextNavBtn.disabled = !nextExists;
}

function navigate(direction) {
  const targets = getActiveTargets();
  if (!targets.length) return;
  const tolerance = 8;
  const scrollY = window.scrollY;
  let targetElement = null;

  if (direction > 0) {
    targetElement = targets.find(
      (el) => getElementPageOffset(el) > scrollY + tolerance
    );
  } else {
    for (let i = targets.length - 1; i >= 0; i--) {
      if (getElementPageOffset(targets[i]) < scrollY - tolerance) {
        targetElement = targets[i];
        break;
      }
    }
    if (!targetElement && direction < 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
  }

  if (targetElement) {
    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function scheduleNavStateUpdate() {
  if (navUpdateScheduled) return;
  navUpdateScheduled = true;
  requestAnimationFrame(() => {
    navUpdateScheduled = false;
    updateNavVisibility();
    updateNavButtonState();
  });
}

function prepareNavigationTargets() {
  const versesContainer = document.getElementById("verses");
  if (!versesContainer) return;

  ensureNavControls();

  simpleNavTargets = [];
  detailedNavTargets = [];

  const verseSections = versesContainer.querySelectorAll(".verse-section");
  verseSections.forEach((section, index) => {
    section.id = `verse-${index + 1}`;
    simpleNavTargets.push(section);
    detailedNavTargets.push(section);

    const secondPartSeparator = section.querySelector(
      "tr.separator.secondPart"
    );
    if (secondPartSeparator) {
      let anchorRow = secondPartSeparator.nextElementSibling;
      while (anchorRow && anchorRow.tagName !== "TR") {
        anchorRow = anchorRow.nextElementSibling;
      }
      if (anchorRow) {
        if (!anchorRow.id) {
          anchorRow.id = `verse-${index + 1}-part-2`;
        }
        detailedNavTargets.push(anchorRow);
      }
    }
  });

  updateNavVisibility();
  updateNavButtonState();
}

// Apply translations to DOM elements
function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.innerHTML = getTranslation(key);
  });
}

// Function to load verses based on current language
function loadVerses() {
  const versesContainer = document.getElementById("verses");
  if (!versesContainer) return;

  const versesFiles = {
    en: "verses.html",
    ru: "verses-ru.html",
    it: "verses-it.html",
  };

  const versesFile = versesFiles[currentLanguage] || "verses.html";

  fetch(versesFile)
    .then((response) => response.text())
    .then((html) => {
      versesContainer.innerHTML = html;
      prepareNavigationTargets();

      // Store first Sanskrit lines for menu previews
      versePreviews = Array.from(
        versesContainer.querySelectorAll(".simple-sanskrit")
      ).map((node) => extractFirstSanskritLine(node));

      updateNavButtonState();
    })
    .catch((error) => {
      console.error("Error loading verses:", error);
      // Fallback to English if loading fails
      if (currentLanguage !== "en") {
        currentLanguage = "en";
        localStorage.setItem("damodarashtakam-language", "en");
        loadVerses();
      }
    });
}

// Function to apply theme
function applyTheme(theme) {
  // Remove existing theme classes
  document.body.classList.remove("theme-light", "theme-dark", "theme-auto");

  // Add new theme class
  document.body.classList.add(`theme-${theme}`);

  currentTheme = theme;
  localStorage.setItem("damodarashtakam-theme", currentTheme);
  
  // Update PWA theme colors with a small delay to ensure DOM is updated
  setTimeout(() => {
    if (window.updatePWAThemeColors) {
      window.updatePWAThemeColors();
    }
  }, 10);
}

// Function to switch theme
function switchTheme(newTheme) {
  if (!availableThemes.includes(newTheme)) {
    console.error(`Theme ${newTheme} not available`);
    return;
  }

  applyTheme(newTheme);

  // Update the active state in the current menu without closing it
  if (menuPopup) {
    const themeBtns = menuPopup.querySelectorAll(".theme-btn");
    themeBtns.forEach((btn) => {
      const btnTheme = btn.getAttribute("data-theme");
      if (btnTheme === newTheme) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
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

  localStorage.setItem("damodarashtakam-language", currentLanguage);

  // Load translations and apply them
  await loadTranslations(currentLanguage);
  applyTranslations();

  // Reload verses with new language
  loadVerses();

  // Close menu and force recreate on next open
  if (menuPopup) {
    menuPopup.classList.remove("show");
  }
  menuPopup = null;
}

function updateFontSize() {
  document.documentElement.style.setProperty("--font-scale", currentFontScale);
  btnMinus.classList.remove("active");
  btnDefault.classList.remove("active");
  btnPlus.classList.remove("active");
  if (currentFontScale < 1) {
    btnMinus.classList.add("active");
  } else if (currentFontScale > 1) {
    btnPlus.classList.add("active");
  } else {
    btnDefault.classList.add("active");
  }
}

btnPlus.addEventListener("click", function () {
  currentFontScale = Math.min(currentFontScale + 0.1, 2);
  updateFontSize();
});
btnMinus.addEventListener("click", function () {
  currentFontScale = Math.max(currentFontScale - 0.1, 0.5);
  updateFontSize();
});
btnDefault.addEventListener("click", function () {
  currentFontScale = 1;
  updateFontSize();
});

// Initialize
updateFontSize();

// Toggle simple/detailed view
function toggleViewHandler() {
  const body = document.body;
  const isSimple = body.classList.contains("simple-view");
  if (isSimple) {
    body.classList.remove("simple-view");
    currentView = "detailed";
    this.textContent = getTranslation("menu.switchToSimple");
  } else {
    body.classList.add("simple-view");
    currentView = "simple";
    this.textContent = getTranslation("menu.switchToDetailed");
  }

  // Save view preference
  localStorage.setItem("damodarashtakam-view", currentView);

  // Close the menu if open
  if (menuPopup) {
    menuPopup.classList.remove("show");
  }
  // Force recreate menu popup on next open to update explanatory text
  menuPopup = null;

  updateNavVisibility();
  updateNavButtonState();
}

const toggleViewBtn = document.getElementById("toggleView");
if (toggleViewBtn) {
  toggleViewBtn.addEventListener("click", toggleViewHandler);
}

// --- Damodara Slider ---
const slides = document.querySelectorAll(".damodara-slide");
let currentSlide = 0;
let sliderTimer = null;
function showSlide(idx) {
  slides.forEach((img, i) => {
    img.classList.toggle("active", i === idx);
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
  document
    .querySelector(".damodara-slider")
    .addEventListener("click", function () {
      nextSlide();
      startSlider();
    });
}

// --- Damodara Audio Player ---
function isMobile() {
  return (
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768
  );
}

const playBtn = document.getElementById("play-audio");
const audioBlock = document.getElementById("damodara-audio");
const audioElement = audioBlock.querySelector("audio");
if (playBtn && audioBlock) {
  playBtn.addEventListener("click", function () {
    playBtn.style.display = "none";
    audioBlock.style.display = "block";
    if (isMobile()) {
      audioElement.play();
    } else {
      // Embed SoundCloud for desktop
      audioBlock.innerHTML =
        '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https://soundcloud.com/user-787531012/aindra-prabhu-damodarashtakam&auto_play=true&color=%23ff5500&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>';
    }
  });
}

// --- Register Service Worker for PWA ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((registrationError) => {
      console.log("SW registration failed: ", registrationError);
    });
  });
}

// --- Hamburger Menu for Verse Navigation ---
const hamburgerMenu = document.getElementById("hamburger-menu");
let menuPopup = null;

function extractFirstSanskritLine(node) {
  if (!node) return "";
  let collected = "";
  for (const child of node.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "BR") {
      break;
    }
    if (child.nodeType === Node.TEXT_NODE) {
      collected += child.textContent || "";
    }
  }
  const clean = collected
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
  return clean ? clean.toLowerCase() : "";
}

function createMenuPopup() {
  if (!versePreviews.length) {
    versePreviews = Array.from(
      document.querySelectorAll("#verses .simple-sanskrit")
    ).map((node) => extractFirstSanskritLine(node));
  }

  const escapeHtml = (unsafe = "") =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  menuPopup = document.createElement("div");
  menuPopup.className = "menu-popup";

  // Language configuration with flags (emoji)
  const languageConfig = {
    en: { name: "EN", flag: "🇬🇧" },
    ru: { name: "RU", flag: "🇷🇺" },
    it: { name: "IT", flag: "🇮🇹" },
  };

  // Build language flag buttons for all languages
  const languageFlagButtons = availableLanguages
    .map((lang) => {
      const config = languageConfig[lang];
      const isActive = lang === currentLanguage ? "active" : "";
      return `<div class="language-flag-btn ${isActive}" data-lang="${lang}">
                <div class="flag">${config.flag}</div>
                <div class="lang-name">${config.name}</div>
            </div>`;
    })
    .join("");

  // Build theme buttons
  const themeConfig = {
    auto: { name: getTranslation("menu.themeAuto"), icon: "🌓" },
    light: { name: getTranslation("menu.themeLight"), icon: "☀️" },
    dark: { name: getTranslation("menu.themeDark"), icon: "🌙" },
  };

  const themeButtons = availableThemes
    .map((theme) => {
      const config = themeConfig[theme];
      const isActive = theme === currentTheme ? "active" : "";
      return `<div class="theme-btn ${isActive}" data-theme="${theme}">
                <div class="theme-icon">${config.icon}</div>
                <div class="theme-name">${config.name}</div>
            </div>`;
    })
    .join("");

  const settingsIconUrl =
    "https://img.icons8.com/ios-filled/50/1f2937/settings.png";
  const renderSettingsLabel = (isOpen) => {
    if (isOpen) {
      return `
                <span class="settings-back-icon" aria-hidden="true">←</span>
                <span>${getTranslation("menu.closeSettings")}</span>
            `.trim();
    }
    return `
            <img src="${settingsIconUrl}" alt="" class="settings-icon" loading="lazy" decoding="async">
            <span>${getTranslation("menu.openSettings")}</span>
        `.trim();
  };

  const verseLinksHtml = Array.from({ length: 8 }, (_, idx) => {
    const verseNumber = idx + 1;
    const preview = versePreviews[idx] || "";
    const previewHtml = preview
      ? `<span class="verse-preview">${escapeHtml(preview)}</span>`
      : "";
    return `<li><a href="#verse-${verseNumber}">${getTranslation(
      "menu.verse"
    )} ${verseNumber}${previewHtml}</a></li>`;
  }).join("");

  menuPopup.innerHTML = `
        <div class="menu-content">
            <span class="close-menu">&times;</span>

            <div class="navigation-section" id="menuNavigation">
                <ul id="menu-list">
                    ${verseLinksHtml}
                </ul>
            </div>
            <button id="settingsToggle" class="settings-button" type="button" aria-expanded="false">
                ${renderSettingsLabel(false)}
            </button>
            <div id="settingsPanel" class="toggle-section">
                <button id="toggleView" class="menu-action-btn">
                    ${
                      document.body.classList.contains("simple-view")
                        ? getTranslation("menu.switchToDetailed")
                        : getTranslation("menu.switchToSimple")
                    }
                </button>
                ${
                  document.body.classList.contains("simple-view")
                    ? `<small style="display: block; margin-top: 2px; font-size: 12px; color: #8e8e93; text-align: center; line-height: 1.3;">${getTranslation(
                        "menu.detailedExplanation"
                      )}</small>`
                    : `<small style="display: block; margin-top: 2px; font-size: 12px; color: #8e8e93; text-align: center; line-height: 1.3;">${getTranslation(
                        "menu.simpleExplanation"
                      )}</small>`
                }
                
                <button id="languageSelector" class="language-selector-btn menu-action-btn">
                    ${getTranslation("menu.chooseLanguage")}
                </button>
                
                <div id="languageFlagsContainer" class="language-flags-container">
                    ${languageFlagButtons}
                </div>

                <button id="themeSelector" class="theme-selector-btn menu-action-btn">
                    ${getTranslation("menu.chooseTheme")}
                </button>
                
                <div id="themeButtonsContainer" class="theme-buttons-container">
                    ${themeButtons}
                </div>
            </div>
        </div>
    `;
  document.body.appendChild(menuPopup);

  // Get references to the elements
  const navigationSection = menuPopup.querySelector("#menuNavigation");
  const settingsToggleBtn = menuPopup.querySelector("#settingsToggle");
  const settingsPanel = menuPopup.querySelector("#settingsPanel");
  const toggleViewBtn = menuPopup.querySelector("#toggleView");
  const languageSelectorBtn = menuPopup.querySelector("#languageSelector");
  const languageFlagsContainer = menuPopup.querySelector(
    "#languageFlagsContainer"
  );
  const languageFlagBtns = menuPopup.querySelectorAll(".language-flag-btn");
  const themeSelectorBtn = menuPopup.querySelector("#themeSelector");
  const themeButtonsContainer = menuPopup.querySelector(
    "#themeButtonsContainer"
  );
  const themeBtns = menuPopup.querySelectorAll(".theme-btn");

  function resetMenuState() {
    navigationSection.classList.remove("hidden");
    settingsPanel.classList.remove("show");
    settingsToggleBtn.setAttribute("aria-expanded", "false");
    settingsToggleBtn.innerHTML = renderSettingsLabel(false);
    settingsToggleBtn.classList.remove("is-active");
    settingsToggleBtn.classList.remove("back-mode");
    languageFlagsContainer.classList.remove("show");
    languageSelectorBtn.classList.remove("hidden");
    themeButtonsContainer.classList.remove("show");
    themeSelectorBtn.classList.remove("hidden");
  }

  resetMenuState();
  menuPopup.resetMenuState = resetMenuState;

  settingsToggleBtn.addEventListener("click", () => {
    const shouldShow = !settingsPanel.classList.contains("show");
    if (shouldShow) {
      navigationSection.classList.add("hidden");
      settingsPanel.classList.add("show");
      settingsToggleBtn.setAttribute("aria-expanded", "true");
      settingsToggleBtn.innerHTML = renderSettingsLabel(true);
      settingsToggleBtn.classList.add("is-active");
      settingsToggleBtn.classList.add("back-mode");
    } else {
      resetMenuState();
    }
  });

  // Attach the event listeners
  toggleViewBtn.addEventListener("click", toggleViewHandler);

  // Language selector button - toggle flags display and hide button
  languageSelectorBtn.addEventListener("click", function () {
    const isShowing = languageFlagsContainer.classList.contains("show");
    if (!isShowing) {
      languageFlagsContainer.classList.add("show");
      languageSelectorBtn.classList.add("hidden");
    }
  });

  // Language flag buttons
  languageFlagBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const newLang = this.getAttribute("data-lang");
      if (newLang !== currentLanguage) {
        switchLanguage(newLang);
      }
    });
  });

  // Theme selector button - toggle theme buttons display and hide button
  themeSelectorBtn.addEventListener("click", function () {
    const isShowing = themeButtonsContainer.classList.contains("show");
    if (!isShowing) {
      themeButtonsContainer.classList.add("show");
      themeSelectorBtn.classList.add("hidden");
    }
  });

  // Theme buttons
  themeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const newTheme = this.getAttribute("data-theme");
      if (newTheme !== currentTheme) {
        switchTheme(newTheme);
      }
    });
  });

  // Event listeners
  menuPopup.addEventListener("click", (e) => {
    if (e.target === menuPopup || e.target.classList.contains("close-menu")) {
      resetMenuState();
      menuPopup.classList.remove("show");
    }
  });

  const links = menuPopup.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
      resetMenuState();
      menuPopup.classList.remove("show");
    });
  });
}

if (hamburgerMenu) {
  hamburgerMenu.addEventListener("click", () => {
    console.log("Hamburger menu clicked");
    if (!menuPopup) {
      createMenuPopup();
    }
    if (menuPopup && typeof menuPopup.resetMenuState === "function") {
      menuPopup.resetMenuState();
    }
    menuPopup.classList.add("show");
  });
}

// Initialize the app
async function init() {
  await loadTranslations(currentLanguage);
  applyTranslations();
  loadVerses();
}

init();

window.addEventListener("scroll", scheduleNavStateUpdate, { passive: true });
