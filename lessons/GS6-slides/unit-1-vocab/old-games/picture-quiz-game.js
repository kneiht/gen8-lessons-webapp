/**
 * Picture Quiz Game - Đoán từ tiếng Anh qua hình ảnh
 */

class PictureQuizGame {
    constructor() {
        this.gameId = 'picture-quiz-' + Date.now();
        this.maxWords = 6;
        this.currentWordIndex = 0;
        this.score = 0;
    }

    getGameInfo() {
        return {
            name: 'Picture Quiz',
            description: 'Đoán từ qua hình ảnh',
            icon: '🖼️'
        };
    }

    createSlide(categoryWords, categoryName) {
        const words = this.selectWordsWithImages(categoryWords, this.maxWords);
        if (words.length === 0) {
            // Fallback if no images available
            return this.createNoImageSlide();
        }

        const slide = document.createElement('div');
        slide.className = 'slide content-box px-5 py-2 rounded-2xl w-full h-full';
        
        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-xl font-bold text-indigo-700 mb-2 text-center">
                    🖼️ Game: Đoán từ qua hình ảnh
                </h2>
                <p class="text-lg text-center mb-6 text-gray-600">
                    Nhìn hình ảnh và chọn từ tiếng Anh đúng
                </p>
                
                <div class="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
                    <div class="mb-6">
                        <img id="quiz-image-${this.gameId}" 
                             src="${this.getImagePath(words[0].image)}"
                             alt="Quiz image" 
                             class="w-80 h-60 object-cover rounded-xl shadow-lg border-4 border-gray-200"
                             onerror="this.src='https://via.placeholder.com/320x240/f3f4f6/9ca3af?text=No+Image'">
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold text-center mb-4">Từ nào mô tả hình ảnh này?</h3>
                        <div id="options-${this.gameId}" class="grid grid-cols-2 gap-4">
                            ${this.createOptions(words[0], words).map((option, index) => `
                                <button class="picture-option bg-white border-2 border-gray-300 rounded-lg px-6 py-4 text-lg font-semibold hover:border-indigo-400 transition-all"
                                        data-correct="${option === words[0].english_word}"
                                        onclick="window.pictureQuizGame_${this.gameId.replace(/-/g, '_')}.selectOption(this)">
                                    ${option}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div id="result-${this.gameId}" class="text-center mb-4 h-8"></div>
                    
                    <div class="flex justify-center gap-8 text-lg font-semibold">
                        <div class="text-green-600">Điểm: <span id="score-${this.gameId}">0</span></div>
                        <div class="text-blue-600">Hình: <span id="progress-${this.gameId}">1/${words.length}</span></div>
                    </div>
                </div>
            </div>
        `;

        window[`pictureQuizGame_${this.gameId.replace(/-/g, '_')}`] = {
            words: words,
            currentWordIndex: 0,
            score: 0,
            selectOption: (button) => this.selectOption(button)
        };

        return slide;
    }

    selectWordsWithImages(words, maxCount) {
        return words.filter(word => word.image && word.image.trim() !== '').slice(0, maxCount);
    }

    createNoImageSlide() {
        const slide = document.createElement('div');
        slide.className = 'slide content-box px-5 py-2 rounded-2xl w-full h-full';
        slide.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center">
                <h2 class="text-2xl font-bold text-gray-500 mb-4">🖼️ Game: Đoán từ qua hình ảnh</h2>
                <p class="text-lg text-gray-400 text-center">
                    Không có hình ảnh cho các từ vựng trong danh mục này.
                </p>
            </div>
        `;
        return slide;
    }

    getImagePath(originalImagePath) {
        if (!originalImagePath) return 'https://via.placeholder.com/320x240/f3f4f6/9ca3af?text=No+Image';
        const filename = originalImagePath.split('/').pop();
        return `./images/${filename}`;
    }

    createOptions(correctWord, allWords) {
        const options = [correctWord.english_word];
        const otherWords = allWords.filter(w => w.english_word !== correctWord.english_word);
        
        // Add 3 wrong options
        while (options.length < 4 && otherWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherWords.length);
            options.push(otherWords[randomIndex].english_word);
            otherWords.splice(randomIndex, 1);
        }
        
        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    }

    selectOption(button) {
        const gameInstance = window[`pictureQuizGame_${this.gameId.replace(/-/g, '_')}`];
        const options = document.querySelectorAll(`#options-${this.gameId} .picture-option`);
        const result = document.getElementById(`result-${this.gameId}`);
        const isCorrect = button.dataset.correct === 'true';
        
        // Disable all options
        options.forEach(opt => opt.disabled = true);
        
        if (isCorrect) {
            button.style.backgroundColor = '#dcfce7';
            button.style.borderColor = '#22c55e';
            result.innerHTML = '<div class="text-green-600 text-xl">🎉 Chính xác!</div>';
            gameInstance.score++;
        } else {
            button.style.backgroundColor = '#fef2f2';
            button.style.borderColor = '#ef4444';
            
            // Highlight correct answer
            options.forEach(opt => {
                if (opt.dataset.correct === 'true') {
                    opt.style.backgroundColor = '#dcfce7';
                    opt.style.borderColor = '#22c55e';
                }
            });
            
            result.innerHTML = '<div class="text-red-600 text-xl">❌ Sai rồi!</div>';
        }
        
        document.getElementById(`score-${this.gameId}`).textContent = gameInstance.score;
        
        setTimeout(() => {
            if (gameInstance.currentWordIndex < gameInstance.words.length - 1) {
                this.nextQuestion();
            } else {
                this.endGame();
            }
        }, 2500);
    }

    nextQuestion() {
        const gameInstance = window[`pictureQuizGame_${this.gameId.replace(/-/g, '_')}`];
        gameInstance.currentWordIndex++;
        
        const nextWord = gameInstance.words[gameInstance.currentWordIndex];
        document.getElementById(`quiz-image-${this.gameId}`).src = this.getImagePath(nextWord.image);
        document.getElementById(`progress-${this.gameId}`).textContent = `${gameInstance.currentWordIndex + 1}/${gameInstance.words.length}`;
        document.getElementById(`result-${this.gameId}`).innerHTML = '';
        
        // Update options
        const newOptions = this.createOptions(nextWord, gameInstance.words);
        document.getElementById(`options-${this.gameId}`).innerHTML = 
            newOptions.map((option, index) => `
                <button class="picture-option bg-white border-2 border-gray-300 rounded-lg px-6 py-4 text-lg font-semibold hover:border-indigo-400 transition-all"
                        data-correct="${option === nextWord.english_word}"
                        onclick="window.pictureQuizGame_${this.gameId.replace(/-/g, '_')}.selectOption(this)">
                    ${option}
                </button>
            `).join('');
    }

    endGame() {
        const gameInstance = window[`pictureQuizGame_${this.gameId.replace(/-/g, '_')}`];
        const result = document.getElementById(`result-${this.gameId}`);
        const accuracy = Math.round((gameInstance.score / gameInstance.words.length) * 100);
        
        result.innerHTML = `
            <div class="text-center">
                <div class="text-2xl mb-2">🏆 Hoàn thành!</div>
                <div class="text-lg">Chính xác: ${accuracy}%</div>
            </div>
        `;
    }
}