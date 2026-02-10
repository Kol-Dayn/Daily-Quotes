const translations = {
    en: {
        animations: 'animations',
        black: 'black',
        dailyQuote: 'daily quotes',
        about: 'about us',
        archive: 'archive',
        home: 'main page',
        aboutUsTitle: 'about us',
        aboutUsText: "daily quotes is a modest one-page project created without any particular goals. perhaps you will find the very thought that resonates with you today. perhaps you will find the very words you need right now. but in the end, don't look for too much wisdom in other people's words — just live your life.",
        phrases: []
    },
    ru: {
        animations: 'анимации',
        black: 'черный',
        dailyQuote: 'цитаты дня',
        about: 'о нас',
        archive: 'архив',
        home: 'на главную',
        aboutUsTitle: 'о нас',
        aboutUsText: 'daily quotes — это скромный одностраничный проект, созданный без особых целей. возможно, здесь вас ждёт та самая мысль, которая отзовётся сегодня. возможно, здесь есть именно те слова, которые вам сейчас нужны. ну а в конце концов, не ищите слишком много мудрости в чужих словах — просто живите свою жизнь.',
        phrases: []
    }
};

let currentLanguage = 'en';
let currentCharIndex = 0;
let isDeleting = false;
let animationsEnabled = true;
let blackThemeEnabled = true;
let typingTimeoutId = null;
let phraseSwitchTimeoutId = null;
let isMousePressed = false;
let backgroundParticleIntervalId = null;
let isAboutPage = false;
let aboutCharIndex = 0;
let aboutTypingTimeoutId = null;

let shuffledPhrases = [];
let currentPhraseIndex = 0;

const typingText = document.getElementById('typingText');
const aboutText = document.getElementById('aboutText');
const cursor = document.getElementById('cursor');
const aboutCursor = document.getElementById('aboutCursor');
const dateText = document.getElementById('dateText');
const animationsBtn = document.getElementById('animationsBtn');
const blackBtn = document.getElementById('blackBtn');
const languageBtn = document.getElementById('languageBtn');
const dailyQuote = document.getElementById('dailyQuote');
const footer = document.getElementById('footer');

const typingSpeed = 40;
const deletingSpeed = 10;
const aboutTypingSpeed = 20;
const pauseBetweenPhrases = 5000;

async function loadQuotes() {
    try {
        const response = await fetch('./quotes.json');
        if (!response.ok) throw new Error('Failed to load quotes');
        
        const data = await response.json();
        
        if (data.en && Array.isArray(data.en)) {
            translations.en.phrases = data.en;
        }
        if (data.ru && Array.isArray(data.ru)) {
            translations.ru.phrases = data.ru;
        }
        
        console.log('✓ Quotes loaded successfully');
    } catch (error) {
        console.error('✗ Error loading quotes:', error);
    }
    
    initializeApp();
}

function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function initializeShuffledPhrases() {
    const phrases = translations[currentLanguage].phrases;
    shuffledPhrases = phrases && phrases.length > 0 ? shuffleArray(phrases) : [];
    currentPhraseIndex = 0;
}

function initializeApp() {
    const savedAnimations = localStorage.getItem('animationsEnabled');
    const savedTheme = localStorage.getItem('blackThemeEnabled');
    const savedLanguage = localStorage.getItem('language');

    if (savedAnimations !== null) {
        animationsEnabled = JSON.parse(savedAnimations);
    }
    if (savedTheme !== null) {
        blackThemeEnabled = JSON.parse(savedTheme);
    }
    if (savedLanguage !== null) {
        currentLanguage = savedLanguage;
    }

    initializeShuffledPhrases();
    updateAnimationsUI();
    updateThemeUI();
    updateLanguageUI();
    updateAllButtonTexts();
    updateAllText();

    if (animationsEnabled) {
        startBackgroundParticles();
    }
}

function getFormattedDate() {
    const date = new Date();
    const day = date.getDate();
    const months = currentLanguage === 'ru' 
        ? ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
        : ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `[${day} ${month} ${year}]`;
}

function updateAllButtonTexts() {
    const t = translations[currentLanguage];
    animationsBtn.textContent = t.animations;
    blackBtn.textContent = t.black;
    dailyQuote.textContent = t.dailyQuote;
    
    const aboutBtn = document.getElementById('aboutBtn');
    const archiveBtn = document.getElementById('archiveBtn');
    const homeBtn = document.getElementById('homeBtn');
    
    if (aboutBtn) aboutBtn.textContent = t.about;
    if (archiveBtn) archiveBtn.textContent = t.archive;
    if (homeBtn) homeBtn.textContent = t.home;
}

function updateAllText() {
    const t = translations[currentLanguage];
    dateText.textContent = getFormattedDate();

    if (typingTimeoutId) clearTimeout(typingTimeoutId);
    if (phraseSwitchTimeoutId) clearTimeout(phraseSwitchTimeoutId);

    typingText.textContent = '';
    currentCharIndex = 0;
    isDeleting = false;

    if (animationsEnabled) {
        cursor.style.display = 'inline-block';
        type();
    } else {
        cursor.style.display = 'none';
        showInstantPhrase();
    }
}

function type() {
    if (!animationsEnabled || shuffledPhrases.length === 0) return;

    const currentPhrase = shuffledPhrases[currentPhraseIndex];

    if (!isDeleting) {
        if (currentCharIndex < currentPhrase.length) {
            typingText.textContent += currentPhrase[currentCharIndex];
            currentCharIndex++;
            typingTimeoutId = setTimeout(type, typingSpeed);
        } else {
            typingTimeoutId = setTimeout(() => {
                isDeleting = true;
                currentCharIndex = currentPhrase.length;
                type();
            }, pauseBetweenPhrases);
        }
    } else {
        if (currentCharIndex > 0) {
            typingText.textContent = currentPhrase.substring(0, currentCharIndex - 1);
            currentCharIndex--;
            typingTimeoutId = setTimeout(type, deletingSpeed);
        } else {
            currentPhraseIndex++;
            
            if (currentPhraseIndex >= shuffledPhrases.length) {
                shuffledPhrases = shuffleArray(translations[currentLanguage].phrases);
                currentPhraseIndex = 0;
            }
            
            isDeleting = false;
            currentCharIndex = 0;
            typingTimeoutId = setTimeout(type, 500);
        }
    }
}

function showInstantPhrase() {
    if (shuffledPhrases.length === 0) return;
    
    const phrase = shuffledPhrases[currentPhraseIndex];

    textFadeOut(() => {
        typingText.textContent = phrase;
        textFadeIn();

        phraseSwitchTimeoutId = setTimeout(() => {
            currentPhraseIndex++;
            
            if (currentPhraseIndex >= shuffledPhrases.length) {
                shuffledPhrases = shuffleArray(translations[currentLanguage].phrases);
                currentPhraseIndex = 0;
            }
            
            showInstantPhrase();
        }, pauseBetweenPhrases);
    });
}

function textFadeOut(callback) {
    const container = typingText.parentElement;
    container.classList.remove('fade-in');
    container.classList.add('fade-out');
    setTimeout(callback, 300);
}

function textFadeIn() {
    const container = typingText.parentElement;
    container.classList.remove('fade-out');
    container.classList.add('fade-in');
}

function typeAboutText() {
    const fullText = translations[currentLanguage].aboutUsText;

    if (aboutCharIndex < fullText.length) {
        aboutText.textContent += fullText[aboutCharIndex];
        aboutCharIndex++;
        aboutTypingTimeoutId = setTimeout(typeAboutText, aboutTypingSpeed);
    }
}

function updateAnimationsUI() {
    if (!animationsEnabled) {
        animationsBtn.classList.add('strikethrough');
    } else {
        animationsBtn.classList.remove('strikethrough');
    }
}

function updateThemeUI() {
    if (!blackThemeEnabled) {
        blackBtn.classList.add('strikethrough');
        document.body.classList.add('light-theme');
    } else {
        blackBtn.classList.remove('strikethrough');
        document.body.classList.remove('light-theme');
    }
}

function updateLanguageUI() {
    const flagSpan = languageBtn.querySelector('.language-flag');
    if (currentLanguage === 'ru') {
        flagSpan.classList.remove('flag-en');
        flagSpan.classList.add('flag-ru');
    } else {
        flagSpan.classList.remove('flag-ru');
        flagSpan.classList.add('flag-en');
    }
}

function startBackgroundParticles() {
    if (backgroundParticleIntervalId) {
        clearInterval(backgroundParticleIntervalId);
    }

    backgroundParticleIntervalId = setInterval(() => {
        if (animationsEnabled) {
            const count = Math.floor(Math.random() * 3) + 3;
            for (let i = 0; i < count; i++) {
                createBackgroundParticle();
            }
        }
    }, 300);
}

function stopBackgroundParticles() {
    if (backgroundParticleIntervalId) {
        clearInterval(backgroundParticleIntervalId);
        backgroundParticleIntervalId = null;
    }

    const allParticles = document.querySelectorAll('.background-particle');
    allParticles.forEach(particle => particle.remove());
}

function createBackgroundParticle() {
    const particle = document.createElement('div');
    particle.classList.add('background-particle');

    const size = Math.random() * 3 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight;

    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    const drift = (Math.random() - 0.5) * window.innerWidth * 0.3;
    particle.style.setProperty('--drift', drift + 'px');

    const duration = Math.random() * 3 + 4;
    particle.style.animation = `float-up ${duration}s linear forwards`;

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, duration * 1000);
}

function attachFooterEvents() {
    const aboutBtn = document.getElementById('aboutBtn');
    const archiveBtn = document.getElementById('archiveBtn');
    
    if (aboutBtn) {
        aboutBtn.removeEventListener('click', goToAbout);
        aboutBtn.addEventListener('click', goToAbout);
    }
    if (archiveBtn) {
        archiveBtn.removeEventListener('click', reloadPage);
        archiveBtn.addEventListener('click', reloadPage);
    }
}

function reloadPage() {
    location.reload();
}

function goToAbout() {
    isAboutPage = true;
    
    if (typingTimeoutId) clearTimeout(typingTimeoutId);
    if (phraseSwitchTimeoutId) clearTimeout(phraseSwitchTimeoutId);
    if (aboutTypingTimeoutId) clearTimeout(aboutTypingTimeoutId);

    const t = translations[currentLanguage];
    dateText.textContent = `[${t.aboutUsTitle}]`;

    typingText.textContent = '';
    aboutText.textContent = '';
    aboutCharIndex = 0;
    cursor.style.display = 'none';
    aboutCursor.style.display = 'none';

    if (animationsEnabled) {
        aboutCursor.style.display = 'inline-block';
        typeAboutText();
    } else {
        aboutCursor.style.display = 'none';
        aboutText.textContent = translations[currentLanguage].aboutUsText;
    }

    const homeText = translations[currentLanguage].home;
    footer.innerHTML = `<button class="footer-btn" id="homeBtn">${homeText}</button>`;
    
    const homeBtn = document.getElementById('homeBtn');
    homeBtn.addEventListener('click', goToHome);
}

function goToHome() {
    isAboutPage = false;

    if (typingTimeoutId) clearTimeout(typingTimeoutId);
    if (phraseSwitchTimeoutId) clearTimeout(phraseSwitchTimeoutId);
    if (aboutTypingTimeoutId) clearTimeout(aboutTypingTimeoutId);

    dateText.textContent = getFormattedDate();

    typingText.textContent = '';
    aboutText.textContent = '';
    aboutCursor.style.display = 'none';

    currentCharIndex = 0;
    isDeleting = false;
    aboutCharIndex = 0;

    if (animationsEnabled) {
        cursor.style.display = 'inline-block';
        type();
    } else {
        cursor.style.display = 'none';
        showInstantPhrase();
    }

    const t = translations[currentLanguage];
    footer.innerHTML = `
        <button class="footer-btn" id="aboutBtn">${t.about}</button>
        <span class="footer-separator">|</span>
        <button class="footer-btn" id="archiveBtn">${t.archive}</button>
    `;

    attachFooterEvents();
}

dateText.textContent = getFormattedDate();
loadQuotes();
attachFooterEvents();

animationsBtn.addEventListener('click', () => {
    animationsEnabled = !animationsEnabled;
    localStorage.setItem('animationsEnabled', JSON.stringify(animationsEnabled));

    if (!animationsEnabled) {
        animationsBtn.classList.add('strikethrough');
        stopBackgroundParticles();
        if (typingTimeoutId) clearTimeout(typingTimeoutId);
        if (phraseSwitchTimeoutId) clearTimeout(phraseSwitchTimeoutId);
        if (aboutTypingTimeoutId) clearTimeout(aboutTypingTimeoutId);
        typingText.textContent = '';
        cursor.style.display = 'none';
        currentCharIndex = 0;
        isDeleting = false;
        
        if (!isAboutPage) {
            showInstantPhrase();
        } else {
            aboutCursor.style.display = 'none';
            aboutText.textContent = translations[currentLanguage].aboutUsText;
        }
    } else {
        animationsBtn.classList.add('remove');
        setTimeout(() => {
            animationsBtn.classList.remove('strikethrough');
            animationsBtn.classList.remove('remove');
        }, 400);
        startBackgroundParticles();
        if (phraseSwitchTimeoutId) clearTimeout(phraseSwitchTimeoutId);
        if (aboutTypingTimeoutId) clearTimeout(aboutTypingTimeoutId);
        typingText.textContent = '';
        aboutText.textContent = '';
        currentCharIndex = 0;
        isDeleting = false;
        aboutCharIndex = 0;
        
        if (!isAboutPage) {
            cursor.style.display = 'inline-block';
            type();
        } else {
            cursor.style.display = 'none';
            aboutCursor.style.display = 'inline-block';
            typeAboutText();
        }
    }
});

blackBtn.addEventListener('click', () => {
    blackThemeEnabled = !blackThemeEnabled;
    localStorage.setItem('blackThemeEnabled', JSON.stringify(blackThemeEnabled));

    if (!blackThemeEnabled) {
        blackBtn.classList.add('strikethrough');
        document.body.classList.add('light-theme');
    } else {
        blackBtn.classList.add('remove');
        setTimeout(() => {
            blackBtn.classList.remove('strikethrough');
            blackBtn.classList.remove('remove');
        }, 400);
        document.body.classList.remove('light-theme');
    }
});

languageBtn.addEventListener('click', function() {
    currentLanguage = currentLanguage === 'en' ? 'ru' : 'en';
    localStorage.setItem('language', currentLanguage);
    updateLanguageUI();
    updateAllButtonTexts();

    if (isAboutPage) {
        const t = translations[currentLanguage];
        dateText.textContent = `[${t.aboutUsTitle}]`;
        if (aboutTypingTimeoutId) clearTimeout(aboutTypingTimeoutId);
        aboutText.textContent = '';
        aboutCharIndex = 0;

        if (animationsEnabled) {
            typeAboutText();
        } else {
            aboutText.textContent = translations[currentLanguage].aboutUsText;
        }
    } else {
        initializeShuffledPhrases();
        updateAllText();
    }
});

document.addEventListener('mousedown', () => {
    isMousePressed = true;
});

document.addEventListener('mouseup', () => {
    isMousePressed = false;
});

document.addEventListener('click', function(e) {
    if (e.target.closest('.language-button')) return;
    if (e.target.closest('.footer-btn')) return;
    if (e.target.closest('.buttons-container')) return;
    if (e.target.closest('.font-credit')) return;
    createParticles(e);
});

document.addEventListener('touchstart', function(e) {
    if (e.target.closest('.language-button')) return;
    if (e.target.closest('.footer-btn')) return;
    if (e.target.closest('.buttons-container')) return;
    if (e.target.closest('.font-credit')) return;
    createParticles(e);
});

function createParticles(e) {
    if (!animationsEnabled) return;

    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);

    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 4 + 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = Math.random() * 150 + 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        document.body.appendChild(particle);

        particle.classList.add('particle-animate');

        setTimeout(() => {
            particle.remove();
        }, 800);
    }
}

let lastTrailTime = 0;
document.addEventListener('mousemove', createTrail);

function createTrail(e) {
    if (!animationsEnabled) return;

    const now = Date.now();
    if (isMousePressed) {
        if (now - lastTrailTime < 15) return;
    } else {
        if (now - lastTrailTime < 30) return;
    }
    lastTrailTime = now;

    const x = e.clientX;
    const y = e.clientY;

    const trail = document.createElement('div');
    trail.classList.add('trail');

    const size = isMousePressed 
        ? Math.random() * 8 + 6
        : Math.random() * 4 + 2;

    trail.style.width = size + 'px';
    trail.style.height = size + 'px';

    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;

    trail.style.left = (x + offsetX) + 'px';
    trail.style.top = (y + offsetY) + 'px';

    document.body.appendChild(trail);

    trail.classList.add(isMousePressed ? 'trail-thick' : 'trail-animate');

    setTimeout(() => {
        trail.remove();
    }, isMousePressed ? 800 : 600);
}

document.addEventListener('selectstart', (e) => {
    if (e.target.closest('.text-container') || e.target.closest('.buttons-container') || e.target.closest('.footer') || e.target.closest('.logo') || e.target.closest('.date-text') || e.target.closest('.daily-quote') || e.target.closest('.language-button') || e.target.closest('.font-credit')) {
        e.preventDefault();
    }
});

document.addEventListener('copy', (e) => {
    if (e.target.closest('.text-container') || e.target.closest('.buttons-container') || e.target.closest('.footer') || e.target.closest('.logo') || e.target.closest('.date-text') || e.target.closest('.daily-quote') || e.target.closest('.language-button') || e.target.closest('.font-credit') || window.getSelection().toString()) {
        e.preventDefault();
    }
});