// Outline Modal functions
function toggleOutline() {
    const modal = document.getElementById('outlineModal');
    modal.classList.toggle('hidden');
}

function goToSlide(slideNumber) {
    showSlide(slideNumber);
    toggleOutline(); // Đóng modal sau khi chuyển slide
}

// Close modal when clicking outside
document.getElementById('outlineModal').addEventListener('click', function(e) {
    if (e.target === this) {
        toggleOutline();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !document.getElementById('outlineModal').classList.contains('hidden')) {
        toggleOutline();
    }
});

// Slide management
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const slideCounter = document.getElementById('slide-counter');

// Update URL with current slide
function updateURL(slideNumber) {
    const url = new URL(window.location.href);
    url.searchParams.set('slide', slideNumber + 1);
    window.history.pushState({}, '', url);
}

// Get initial slide from URL if present
function getInitialSlide() {
    const url = new URL(window.location.href);
    const slideParam = url.searchParams.get('slide');
    if (slideParam) {
        const slideNumber = parseInt(slideParam) - 1;
        if (slideNumber >= 0 && slideNumber < totalSlides) {
            return slideNumber;
        }
    }
    return 0;
}

// Update the counter display with total slides
function updateSlideCounter() {
    slideCounter.textContent = `${currentSlide + 1}/${totalSlides}`;
}

function showSlide(n) {
    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Calculate new slide index
    currentSlide = (n + totalSlides) % totalSlides;

    // Show new slide
    slides[currentSlide].classList.add('active');

    // Update slide counter
    updateSlideCounter();

    // Update URL
    updateURL(currentSlide);
}

// Initialize with slide from URL if present
currentSlide = getInitialSlide();
showSlide(currentSlide);

// Touch swipe detection
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, {passive: true});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, {passive: true});

function handleSwipe() {
    const threshold = 50;
    const diff = touchStartX - touchEndX;
    if (diff > threshold) {
        showSlide(currentSlide + 1);
    } else if (diff < -threshold) {
        showSlide(currentSlide - 1);
    }
}

// Keyboard navigation
document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        showSlide(currentSlide + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        showSlide(currentSlide - 1);
    }
});