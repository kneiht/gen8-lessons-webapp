/**
 * Game Manager - Quản lý tất cả các games tương tác
 */

class GameManager {
    constructor() {
        this.games = [];
        this.gameInstances = {};
        this.currentGameSlide = null;
        this.isInGame = false;
    }

    /**
     * Khởi tạo tất cả game classes
     */
    initializeGames() {
        this.gameInstances = {
            MatchingGame: new MatchingGame(),
        };
        this.games = Object.keys(this.gameInstances);
    }

    /**
     * Tạo slide chọn game với tất cả games có sẵn
     */
    createGameSelectionSlide(categoryWords, categoryName) {
        const slide = document.createElement('div');
        slide.className = 'slide content-box px-5 py-2 rounded-2xl w-full h-full';
        slide.id = 'game-selection-slide';
        
        const gameButtons = this.games.map(gameName => {
            const gameInstance = this.gameInstances[gameName];
            const gameInfo = gameInstance.getGameInfo ? gameInstance.getGameInfo() : { name: gameName, description: 'Interactive game' };
            
            return `
                <div class="game-option bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                     onclick="gameManager.selectGame('${gameName}', ${JSON.stringify(categoryWords).replace(/"/g, '&quot;')}, '${categoryName}')">
                    <div class="p-6 text-center">
                        <div class="text-4xl mb-3">${gameInfo.icon || '🎮'}</div>
                        <h3 class="text-xl font-bold text-indigo-700 mb-2">${gameInfo.name}</h3>
                        <p class="text-gray-600 text-sm">${gameInfo.description}</p>
                    </div>
                </div>
            `;
        }).join('');

        slide.innerHTML = `
            <div class="flex flex-col items-center justify-start h-full">
                <h2 class="text-2xl font-bold text-indigo-700">
                    🎮 Chọn Game cho "${categoryName}"
                </h2>
                <div class="text-center">
                    <p class="text-gray-600 text-lg mb-2">
                        Có ${categoryWords.length} từ vựng để luyện tập
                    </p>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-4xl">
                    ${gameButtons}
                </div>
                <div style="margin-top: 16px;">.</div>
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
        this.addExitButton(gameSlide);

        // Ẩn slide navigation và hiển thị game
        this.disableSlideNavigation();
        this.showGameSlide(gameSlide);
        
        this.currentGameSlide = gameSlide;
        this.isInGame = true;
    }

    /**
     * Thêm nút thoát game vào slide
     */
    addExitButton(gameSlide) {
        const exitButton = document.createElement('div');
        exitButton.className = 'fixed top-4 right-4 z-50';
        exitButton.innerHTML = `
            <button onclick="gameManager.exitGame()" 
                    class="absolute top-2 right-0 bg-red-500 hover:bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg"
                    style="box-shadow: 0 2px 8px rgba(0,0,0,0.10); border:none; padding:0;"
                    title="Thoát Game">
                <span class="text-2xl font-bold leading-none" style="line-height:1;">×</span>
            </button>
        `;
        
        gameSlide.appendChild(exitButton);
    }

    /**
     * Hiển thị slide game
     */
    showGameSlide(gameSlide) {
        const slidesContainer = document.getElementById('slides-container');
        const currentSlideElement = slidesContainer.querySelector('.slide.active');
        
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
        }
        
        // Ẩn tất cả slides
        const allSlides = slidesContainer.querySelectorAll('.slide');
        allSlides.forEach(slide => {
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
    exitGame() {
        const slidesContainer = document.getElementById('slides-container');
        
        // Ẩn game slide
        if (this.currentGameSlide) {
            this.currentGameSlide.style.display = 'none';
            this.currentGameSlide.classList.remove('active');
        }

        
        // Hiển thị tất cả slides
        const allSlides = slidesContainer.querySelectorAll('.slide');
        allSlides.forEach(slide => {
            slide.style.display = '';
        });
        

        // Hiển thị lại slide chọn game
        const gameSelectionSlide = document.getElementById('game-selection-slide');
        if (gameSelectionSlide) {
            gameSelectionSlide.classList.add('active');
        }

        // Hiển thị lại slide navigation
        this.enableSlideNavigation();
        
        this.currentGameSlide = null;
        this.isInGame = false;
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
        const slideCounter = document.getElementById('slide-counter-countainer');
        
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (outlineBtn) outlineBtn.style.display = 'none';
        if (slideCounter) slideCounter.style.display = 'none';
    }

    /**
     * Kích hoạt lại các nút điều hướng slide
     */
    enableSlideNavigation() {
        const prevBtn = document.getElementById('prev-slide-btn');
        const nextBtn = document.getElementById('next-slide-btn');
        const outlineBtn = document.getElementById('outline-btn');
        const slideCounter = document.getElementById('slide-counter-countainer');
        
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
        if (outlineBtn) outlineBtn.style.display = 'flex';
        if (slideCounter) slideCounter.style.display = 'flex';
    }

    /**
     * Tạo slide game với từ vựng của category (giữ lại để tương thích)
     */
    createGameSlide(categoryWords, categoryName) {
        return this.createGameSelectionSlide(categoryWords, categoryName);
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

// Export để sử dụng trong file khác
window.GameManager = GameManager;