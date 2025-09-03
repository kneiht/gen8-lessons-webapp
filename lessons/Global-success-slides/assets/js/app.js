async function loadVocabularyData() {
    try {
        const response = await fetch('./vocab.json');
        console.log(response);
        if (!response.ok) {
            throw new Error(`Failed to load vocabulary data: ${response.statusText}`);
        }
        vocabularyData = await response.json();

        generateSlides();
        initializeSlideNavigation();

        // Hide loading and show content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

    } catch (error) {
        console.error('Error loading vocabulary data:', error);
        document.getElementById('loading').innerHTML = `
            <div class="error-message">
                <h2>Lỗi tải dữ liệu</h2>
                <p>Không thể tải file vocab.json. Vui lòng kiểm tra:</p>
                <ul style="text-align: left; display: inline-block;">
                    <li>File vocab.json có tồn tại trong cùng thư mục</li>
                    <li>Đường dẫn file chính xác</li>
                    <li>Cấu trúc JSON hợp lệ</li>
                </ul>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: #6b7280;">
                    Chi tiết lỗi: ${error.message}
                </p>
            </div>
        `;
    }
}

function generateSlides() {
    const slidesContainer = document.getElementById('slides-container');

    // Clear existing slides
    slidesContainer.innerHTML = '';

    // Initialize Game Manager
    gameManager = new GameManager();
    gameManager.initializeGames();

    // Generate title slide
    const titleSlide = createTitleSlide();
    slidesContainer.appendChild(titleSlide);

    // Generate vocabulary slides (3 words per slide, keep categories separate)
    vocabularyData.forEach(group => {
        const words = group.words;

        // Split each category into groups of 4
        for (let i = 0; i < words.length; i += 2) {
            const wordsGroup = words.slice(i, i + 2).map(word => ({
                ...word,
                group: group.group,
                category: group.group // Add category for games
            }));
            const slide = createVocabularySlide(wordsGroup, group.group, i);
            slidesContainer.appendChild(slide);
        }

        // Add a random game slide after each complete category
        try {
            const gameSlide = gameManager.createGameSlide(words, group.group);
            if (gameSlide) {
                slidesContainer.appendChild(gameSlide);
            }
        } catch (error) {
            console.warn('Could not create game slide:', error);
        }
    });

    // Add final comprehensive game slide with all vocabulary
    try {
        const allWords = vocabularyData.flatMap(group => group.words);
        const comprehensiveGameSlide = gameManager.createComprehensiveGameSlide(allWords);
        if (comprehensiveGameSlide) {
            slidesContainer.appendChild(comprehensiveGameSlide);
        }
    } catch (error) {
        console.warn('Could not create comprehensive game slide:', error);
    }

    // Update slides array and counter
    slides = slidesContainer.querySelectorAll('.slide');
    totalSlides = slides.length;
}

function createVocabularySlide(words, groupTitle, partIndex) {
    const slide = document.createElement('div');
    slide.className = 'slide content-box px-1 sm:px-2 md:px-5 py-2 rounded-2xl w-full h-full flex flex-col overflow-hidden';

    // Use the group title directly (no mixing of categories)
    const title = groupTitle;

    // Render exactly the words provided for this slide (already grouped upstream)
    const visibleWords = words;

    slide.innerHTML = ` 
        <h2 class="text-lg md:text-2xl font-bold category-title mb-1 sm:mb-3 text-center">${title}</h2>
        <div class="w-full h-full flex-1 overflow-y-scroll-auto">
            <div class="flex flex-col md:flex-row gap-3 w-full h-full items-start justify-center">
                ${visibleWords.map(word => createVocabularyCard(word)).join('')}
            </div>
        </div>
    `;

    return slide;
}

function createVocabularyCard(word) {
    // Try to get image from local images folder first, fallback to original path
    const imagePath = getImagePath(word.image);
    return `
        <div class="vocab-card bg-white px-4 py-6 rounded-xl shadow-md w-full md:w-1/2 h-full flex flex-col justify-between">
            <div class="relative w-full flex-1 border border-1 border-blue-200" style="background-image: url('${imagePath}'); background-size: cover; background-position: center; border-radius: 0.75rem;">
                <div class="absolute bottom-2 left-0 right-0 flex flex-col items-center">
                    <span class="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-md sm:text-2xl font-bold px-3 py-1 rounded-full mb-1">
                        ${word.english_word}
                        <button class="text-indigo-600 hover:text-indigo-800 text-xl sm:text-xl text-base" title="Nghe từ" onclick='speakWordEn(${JSON.stringify(word.english_word || "")})'>🔊</button>
                    </span>
                </div>
            </div>
            <div class="mt-1 text-xs sm:text-lg flex flex-col items-start">
                <div class="flex flex-col items-center justify-center gap-0 w-full mb-1 ">
                    <p class="pronunciation mb-1">${word.pronunciation}</p>
                    <p class="meaning text-indigo-700 font-semibold">${word.vietnamese_meaning}</p>
                </div>
                <p class="example text-gray-700 mb-1 flex items-center gap-2">
                    <span>"${word.example_sentence_en}"</span>
                    <button class="text-indigo-600 hover:text-indigo-800" title="Nghe câu tiếng Anh" onclick='speakSentenceEn(${JSON.stringify(word.example_sentence_en || "")})'>🔊</button>
                </p>
                <p class="example text-gray-500 flex items-center gap-2">
                    <span>"${word.example_sentence_vi}"</span>
                    <button class="text-indigo-600 hover:text-indigo-800" title="Nghe câu tiếng Việt" onclick='speakSentenceVi(${JSON.stringify(word.example_sentence_vi || "")})'>🔊</button>
                </p>
            </div>
        </div>
    `;
}

function getImagePath(originalImagePath) {
    if (!originalImagePath) return 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image';

    // Extract filename from original path
    const filename = "../" + originalImagePath
    return filename;
}

function initializeSlideNavigation() {
    const slideCounter = document.getElementById('slide-counter');

    // Update the counter display with total slides
    function updateSlideCounter() {
        slideCounter.textContent = `${currentSlide + 1}/${totalSlides}`;
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

    // Update URL with current slide
    function updateURL(slideNumber) {
        const url = new URL(window.location.href);
        url.searchParams.set('slide', slideNumber + 1);
        window.history.pushState({}, '', url);
    }

    // Show slide function
    window.showSlide = function (n) {

        // Check if currently in a game
        if (gameManager && gameManager.isInGame) {
            console.log('Cannot navigate slides while in game. Use "Thoát Game" button to exit.');
            return;
        }

        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
            slide.style.display = 'none';
        });

        // Calculate new slide index
        currentSlide = (n + totalSlides) % totalSlides;

        // Show new slide
        slides[currentSlide].classList.add('active');
        slides[currentSlide].style.display = '';

        // Update slide counter
        updateSlideCounter();

        // Update URL
        updateURL(currentSlide);

        // Update outline if it's open
        if (!document.getElementById('outlineModal').classList.contains('hidden')) {
            generateOutline();
        }
    };

    // Initialize with slide from URL if present
    currentSlide = getInitialSlide();
    showSlide(currentSlide);

    // Touch swipe detection
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        // Check if currently in a game
        if (gameManager && gameManager.isInGame) {
            return;
        }

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
        // Check if currently in a game
        if (gameManager && gameManager.isInGame) {
            // Only allow Escape key for outline modal
            if (e.key === 'Escape' && !document.getElementById('outlineModal').classList.contains('hidden')) {
                toggleOutline();
            }
            return;
        }

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            showSlide(currentSlide + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            showSlide(currentSlide - 1);
        } else if (e.key === 'Escape' && !document.getElementById('outlineModal').classList.contains('hidden')) {
            toggleOutline();
        }
    });
}

// Outline Modal functions
function toggleOutline() {
    // Check if currently in a game
    if (gameManager && gameManager.isInGame) {
        console.log('Cannot open outline while in game. Use "Thoát Game" button to exit.');
        return;
    }

    const modal = document.getElementById('outlineModal');
    const isHidden = modal.classList.contains('hidden');

    if (isHidden) {
        // Generate outline content when opening
        generateOutline();
    }

    modal.classList.toggle('hidden');
}

function generateOutline() {
    const outlineContent = document.getElementById('outlineContent');
    outlineContent.innerHTML = '';
    let outlineHTML = '';

    slides.forEach((slide, index) => {
        const isActive = index === currentSlide;
        const slideClone = slide.cloneNode(true);

        slideClone.classList.remove('active');

        outlineHTML += `
            <div class="outline-item rounded-lg cursor-pointer relative ${isActive ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'bg-white shadow-md'}"
                  onclick="goToSlide(${index})">
                <div class="slide-number text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium mb-2 inline-block absolute bottom-1 right-5 z-10">
                    Slide ${index + 1}
                </div>
                <div class="slide-preview">
                    <div class="slide-wrapper">
                        ${slideClone.outerHTML}
                    </div>
                </div>
            </div>
        `;
    });

    outlineContent.innerHTML = outlineHTML;
}

function goToSlide(slideNumber) {
    // Check if currently in a game
    if (gameManager && gameManager.isInGame) {
        console.log('Cannot navigate slides while in game. Use "Thoát Game" button to exit.');
        return;
    }
    showSlide(slideNumber);
    toggleOutline(); // Đóng modal sau khi chuyển slide
}
