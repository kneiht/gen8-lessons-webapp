/**
 * Game Manager - Quản lý tất cả các games tương tác
 */

class GameManager {
    constructor() {
        this.games = [];
        this.gameInstances = {};
        this.currentGameSlide = null;
        this.isInGame = false;
        this.slideId = '';
    }

    /**
     * Khởi tạo tất cả game classes
     */
    initializeGames() {
        this.gameInstances = {
            MatchingGame: new MatchingGame(),
            MemoryGame: new MemoryGame(),
            MultipleChoiceEnViGame: new MultipleChoiceEnViGame(),
            MultipleChoiceViEnGame: new MultipleChoiceViEnGame(),
            PictureChoiceEnGame: new PictureChoiceEnGame(),
            PictureTypingEnGame: new PictureTypingEnGame(),
            AnagramGame: new AnagramGame(),
            UnjumbleGame: new UnjumbleGame(),
            ListeningTypingEnGame: new ListeningTypingEnGame(),
            ImageRevealChoiceGame: new ImageRevealChoiceGame(),
        };
        this.games = Object.keys(this.gameInstances);
    }

    /**
     * Tạo slide chọn game với tất cả games có sẵn
     */
    createGameSelectionSlide(categoryWords, categoryName) { 
        // Generate a unique id for the slide using the current timestamp and a random number
        const slide = document.createElement('div');
        slide.className = 'slide content-box px-2 py-2 rounded-2xl w-full h-full';
        slide.id = `game-selection-slide-${sluggify(categoryName)}`;
        
        const gameButtons = this.games.map(gameName => {
            const gameInstance = this.gameInstances[gameName];
            const gameInfo = gameInstance.getGameInfo ? gameInstance.getGameInfo() : { name: gameName, description: 'Interactive game' };
            
            return `
                <div class="game-option bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                     onclick="gameManager.selectGame('${gameName}', ${JSON.stringify(categoryWords).replace(/"/g, '&quot;')}, '${categoryName}')">
                    <div class="p-6 text-center">
                        <div class="text-4xl mb-3">${gameInfo.icon || '🎮'}</div>
                        <h3 class="text-lg md:text-xl font-bold text-indigo-700 mb-2" style="line-height: 1.3;">${gameInfo.name}</h3>
                        <p class="text-gray-600 text-sm">${gameInfo.description}</p>
                    </div>
                </div>
            `;
        }).join('');

        slide.innerHTML = `
            <div class="flex flex-col items-center justify-start h-full overflow-y-hidden">
                <h2 class="text-md md:text-xl font-bold text-indigo-700 text-center" style="line-height: 1.3;">
                    <span class="hidden sm:inline">Select a game for "${categoryName}"</span>
                    <span class="inline sm:hidden">Select a game<br>for "${categoryName}"</span>
                </h2>
                <div class="text-center text-sm md:text-xl">
                    <p class="text-gray-600 mb-2">
                        Có ${categoryWords.length} từ vựng để luyện tập
                    </p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl overflow-y-auto px-2">
                    ${gameButtons}
                </div>
            </div>
        `;

        return slide;
    }

    /**
     * Chọn và hiển thị game cụ thể
     */
    selectGame(gameName, categoryWords, categoryName) {
        const gameInstance = this.gameInstances[gameName];
        
        if (!gameInstance) {
            console.error(`Game ${gameName} not found`);
            return;
        }

        // Tạo slide game
        const gameSlide = gameInstance.createSlide(categoryWords, categoryName);
        
        if (!gameSlide) {
            console.error(`Could not create slide for ${gameName}`);
            return;
        }

        // Thêm nút "Thoát game" vào slide
        this.addExitButton(gameSlide, categoryName);

        // Ẩn slide navigation và hiển thị game
        this.disableSlideNavigation();
        this.showGameSlide(gameSlide);
        
        this.currentGameSlide = gameSlide;
        this.isInGame = true;
    }

    /**
     * Chọn và hiển thị game tổng hợp
     */
    selectComprehensiveGame(gameName, allWords) {
        const gameInstance = this.gameInstances[gameName];
        
        if (!gameInstance) {
            console.error(`Game ${gameName} not found`);
            return;
        }
        
        // Tạo slide game với toàn bộ từ vựng
        // Sử dụng tối đa 20 từ vựng để tránh quá tải
        const maxWordsForComprehensive = Math.min(allWords.length);
        const selectedWords = GameUtils.selectRandomWords(allWords, maxWordsForComprehensive);
        
        const gameSlide = gameInstance.createSlide(selectedWords, 'Comprehensive Review');
        
        if (!gameSlide) {
            console.error(`Could not create comprehensive slide for ${gameName}`);
            return;
        }

        // Thêm nút "Thoát game" vào slide
        this.addExitButton(gameSlide, 'Comprehensive Review');

        // Ẩn slide navigation và hiển thị game
        this.disableSlideNavigation();
        this.showGameSlide(gameSlide);
        
        this.currentGameSlide = gameSlide;
        this.isInGame = true;
    }

    /**
     * Thêm nút thoát game vào slide
     */
    addExitButton(gameSlide, categoryName) {
        const exitButton = document.createElement('div');
        exitButton.className = 'fixed top-2 right-4 z-50';
        exitButton.innerHTML = `
            <button onclick="gameManager.exitGame('${categoryName}')" 
                    class="absolute top-3.5 md:top-2 -right-1 md:right-0 bg-red-500 hover:bg-red-600 text-white w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded-full shadow-lg"
                    style="box-shadow: 0 2px 8px rgba(0,0,0,0.10); border:none; padding:0;"
                    title="Thoát Game">
                <span class="text-xl md:text-2xl font-bold leading-none" style="line-height:1;">×</span>
            </button>
        `;
        
        gameSlide.appendChild(exitButton);
    }

    /**
     * Hiển thị slide game
     */
    showGameSlide(gameSlide) {
        const slidesContainer = document.getElementById('slides-container');
        
        // Ẩn tất cả slides
        const allSlides = slidesContainer.querySelectorAll('.slide');
        allSlides.forEach(slide => {
            slide.classList.remove('active');
            slide.style.display = 'none';
        });
        
        // Hiển thị game slide
        gameSlide.style.display = 'block';
        gameSlide.classList.add('active');
        
        // Thêm game slide vào container nếu chưa có
        if (!slidesContainer.contains(gameSlide)) {
            slidesContainer.appendChild(gameSlide);
        }
    }

    /**
     * Thoát khỏi game và quay lại slide chọn game
     */
    exitGame(categoryName) {
        const slidesContainer = document.getElementById('slides-container');
        
        // Ẩn game slide
        if (this.currentGameSlide) {
            this.currentGameSlide.style.display = 'none';
            this.currentGameSlide.classList.remove('active');
        }

        this.currentGameSlide = null;
        this.isInGame = false;

        // Get slide
        const url = new URL(window.location.href);
        let slideNumber = parseInt(url.searchParams.get('slide'));
        console.log(slideNumber);
        window.showSlide(slideNumber-1)

        // Hiển thị lại slide navigation
        this.enableSlideNavigation();
    
    }

    /**
     * Ẩn slide navigation
     */
    hideSlideNavigation() {
        const slideNavigation = document.getElementById('slide-navigation');
        if (slideNavigation) {
            slideNavigation.style.display = 'none';
        }
    }

    /**
     * Hiển thị slide navigation
     */
    showSlideNavigation() {
        const slideNavigation = document.getElementById('slide-navigation');
        if (slideNavigation) {
            slideNavigation.style.display = 'flex';
        }
    }

    /**
     * Vô hiệu hóa các nút điều hướng slide
     */
    disableSlideNavigation() {
        const prevBtn = document.getElementById('prev-slide-btn');
        const nextBtn = document.getElementById('next-slide-btn');
        const outlineBtn = document.getElementById('outline-btn');
        const voiceBtn = document.getElementById('settings-btn');
        const slideCounter = document.getElementById('slide-counter-countainer');
        
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (outlineBtn) outlineBtn.style.display = 'none';
        if (voiceBtn) voiceBtn.style.display = 'none';
        if (slideCounter) slideCounter.style.display = 'none';
    }

    /**
     * Kích hoạt lại các nút điều hướng slide
     */
    enableSlideNavigation() {
        const prevBtn = document.getElementById('prev-slide-btn');
        const nextBtn = document.getElementById('next-slide-btn');
        const outlineBtn = document.getElementById('outline-btn');
        const voiceBtn = document.getElementById('settings-btn');
        const slideCounter = document.getElementById('slide-counter-countainer');
        
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
        if (outlineBtn) outlineBtn.style.display = 'flex';
        if (voiceBtn) voiceBtn.style.display = 'flex';
        if (slideCounter) slideCounter.style.display = 'flex';
    }

    /**
     * Tạo slide game với từ vựng của category (giữ lại để tương thích)
     */
    createGameSlide(categoryWords, categoryName) {
        return this.createGameSelectionSlide(categoryWords, categoryName);
    }

    /**
     * Tạo slide game tổng hợp với toàn bộ từ vựng
     */
    createComprehensiveGameSlide(allWords) {
        const slide = document.createElement('div');
        slide.className = 'slide content-box px-2 py-2 rounded-2xl w-full h-full';
        slide.id = 'comprehensive-game-slide';
        
        const gameButtons = this.games.map(gameName => {
            const gameInstance = this.gameInstances[gameName];
            const gameInfo = gameInstance.getGameInfo ? gameInstance.getGameInfo() : { name: gameName, description: 'Interactive game' };
            
            return `
                <div class="game-option bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                     onclick="gameManager.selectComprehensiveGame('${gameName}', ${JSON.stringify(allWords).replace(/"/g, '&quot;')})">
                    <div class="p-6 text-center">
                        <div class="text-4xl mb-3">${gameInfo.icon || '🎮'}</div>
                        <h3 class="text-lg md:text-xl font-bold text-indigo-700 mb-2" style="line-height: 1.3;">${gameInfo.name}</h3>
                        <p class="text-gray-600 text-sm">${gameInfo.description}</p>
                    </div>
                </div>
            `;
        }).join('');

        slide.innerHTML = `
            <div class="flex flex-col items-center justify-start h-full overflow-y-hidden">
                <h2 class="text-md md:text-xl font-bold text-indigo-700 text-center" style="line-height: 1.3;">
                    <span>Final Challenge</span>
                </h2>
                <div class="text-center text-sm md:text-xl">
                    <p class="text-gray-600 mb-2">
                        Luyện tập với ${allWords.length} từ đã học!
                    </p>
                    <p class="text-gray-500 text-xs">
                        Chọn một game để thực hiện thách với tất cả từ vựng
                    </p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl overflow-y-auto px-2">
                    ${gameButtons}
                </div>
            </div>
        `;

        return slide;
    }

    /**
     * Chèn game slides vào danh sách slides chính
     */
    insertGameSlides(slides, vocabularyData) {
        const categories = this.groupByCategory(vocabularyData);
        let insertedCount = 0;

        Object.keys(categories).forEach((category, index) => {
            const categoryWords = categories[category];
            const gameSlide = this.createGameSelectionSlide(categoryWords, category);
            
            if (gameSlide) {
                // Tìm vị trí cuối cùng của category này
                const categoryEndIndex = this.findCategoryEndIndex(slides, category) + insertedCount;
                
                // Chèn game slide sau category
                slides.splice(categoryEndIndex + 1, 0, gameSlide);
                insertedCount++;
            }
        });

        return slides;
    }

    /**
     * Nhóm từ vựng theo category
     */
    groupByCategory(vocabularyData) {
        const categories = {};
        
        vocabularyData.forEach(word => {
            const category = word.category || 'General';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(word);
        });
        
        return categories;
    }

    /**
     * Tìm index cuối cùng của một category trong slides
     */
    findCategoryEndIndex(slides, targetCategory) {
        for (let i = slides.length - 1; i >= 0; i--) {
            const slideContent = slides[i].innerHTML;
            if (slideContent.includes(targetCategory)) {
                return i;
            }
        }
        return -1;
    }
}

function sluggify(name) {
    return name
        .toString()
        .normalize('NFD') // Remove accents
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens
}

// Export để sử dụng trong file khác
window.GameManager = GameManager;