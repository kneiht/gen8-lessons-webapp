/**
 * Crossword Game - Ô chữ đơn giản với từ vựng
 */

class CrosswordGame {
    constructor() {
        this.gameId = 'crossword-game-' + Date.now();
        this.maxWords = 4;
    }

    getGameInfo() {
        return {
            name: 'Crossword Game',
            description: 'Ô chữ mini với 4 từ',
            icon: '🧩'
        };
    }

    createSlide(categoryWords, categoryName) {
        const words = this.selectRandomWords(categoryWords, this.maxWords);

        const slide = document.createElement('div');
        slide.className = 'slide content-box px-5 py-2 rounded-2xl w-full h-full';
        
        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-xl font-bold text-indigo-700 mb-2 text-center">
                    🧩 Game: Ô chữ mini
                </h2>
                <p class="text-lg text-center mb-6 text-gray-600">
                    Điền từ vào ô chữ theo gợi ý
                </p>
                
                <div class="flex-1 flex gap-8 max-w-5xl mx-auto w-full">
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-center mb-4">Gợi ý</h3>
                        <div class="space-y-3">
                            ${words.map((word, index) => `
                                <div class="bg-white p-3 rounded-lg shadow">
                                    <div class="font-semibold text-indigo-600">${index + 1}. ${word.vietnamese_meaning}</div>
                                    <div class="text-sm text-gray-500">(${word.english_word.length} chữ cái)</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="flex-1">
                        <h3 class="text-xl font-bold text-center mb-4">Ô chữ</h3>
                        <div class="space-y-4">
                            ${words.map((word, index) => `
                                <div class="flex items-center gap-2">
                                    <span class="text-lg font-bold text-indigo-600 w-6">${index + 1}.</span>
                                    <div class="flex gap-1">
                                        ${word.english_word.split('').map((letter, letterIndex) => `
                                            <input type="text" 
                                                   class="crossword-cell w-10 h-10 text-center border-2 border-gray-300 rounded font-bold uppercase"
                                                   maxlength="1"
                                                   data-word="${index}"
                                                   data-letter="${letterIndex}"
                                                   data-correct="${letter.toLowerCase()}"
                                                   oninput="window.crosswordGame_${this.gameId.replace(/-/g, '_')}.cellInput(this)">
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="mt-6 text-center">
                            <button onclick="window.crosswordGame_${this.gameId.replace(/-/g, '_')}.checkAnswers()"
                                    class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors mr-4">
                                ✅ Kiểm tra
                            </button>
                            <button onclick="window.crosswordGame_${this.gameId.replace(/-/g, '_')}.resetGame()"
                                    class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                                🔄 Làm lại
                            </button>
                        </div>
                        
                        <div id="score-${this.gameId}" class="text-center mt-4 text-lg font-bold text-green-600">
                            Điểm: 0/${words.length}
                        </div>
                    </div>
                </div>
            </div>
        `;

        window[`crosswordGame_${this.gameId.replace(/-/g, '_')}`] = {
            words: words,
            score: 0,
            cellInput: (cell) => this.cellInput(cell),
            checkAnswers: () => this.checkAnswers(),
            resetGame: () => this.resetGame()
        };

        return slide;
    }

    selectRandomWords(words, maxCount) {
        return [...words].sort(() => Math.random() - 0.5).slice(0, Math.min(maxCount, words.length));
    }

    cellInput(cell) {
        const value = cell.value.toLowerCase();
        if (value && /[a-z]/.test(value)) {
            // Move to next cell
            const nextCell = cell.nextElementSibling;
            if (nextCell && nextCell.tagName === 'INPUT') {
                nextCell.focus();
            }
        }
    }

    checkAnswers() {
        const gameInstance = window[`crosswordGame_${this.gameId.replace(/-/g, '_')}`];
        const cells = document.querySelectorAll(`#crossword-game-${this.gameId.split('-')[2]} .crossword-cell`);
        let correctWords = 0;
        
        // Group cells by word
        const wordGroups = {};
        cells.forEach(cell => {
            const wordIndex = cell.dataset.word;
            if (!wordGroups[wordIndex]) wordGroups[wordIndex] = [];
            wordGroups[wordIndex].push(cell);
        });
        
        // Check each word
        Object.keys(wordGroups).forEach(wordIndex => {
            const wordCells = wordGroups[wordIndex];
            let wordCorrect = true;
            
            wordCells.forEach(cell => {
                const userLetter = cell.value.toLowerCase();
                const correctLetter = cell.dataset.correct;
                
                if (userLetter === correctLetter) {
                    cell.style.backgroundColor = '#dcfce7';
                    cell.style.borderColor = '#22c55e';
                } else {
                    cell.style.backgroundColor = '#fef2f2';
                    cell.style.borderColor = '#ef4444';
                    wordCorrect = false;
                }
            });
            
            if (wordCorrect) correctWords++;
        });
        
        gameInstance.score = correctWords;
        document.getElementById(`score-${this.gameId}`).textContent = `Score: ${correctWords}/${gameInstance.words.length}`;
        
        const messageDiv = document.getElementById(`message-${this.gameId}`);
        if (correctWords === gameInstance.words.length) {
            messageDiv.textContent = '🏆 Congratulations! Perfect crossword!';
            messageDiv.className = 'text-lg text-green-600 font-bold';
            setTimeout(() => this.showCelebration(), 500);
        } else if (correctWords > 0) {
            messageDiv.textContent = `🎉 Great! ${correctWords} correct answers!`;
            messageDiv.className = 'text-lg text-green-600';
        } else {
            messageDiv.textContent = '❌ Keep trying!';
            messageDiv.className = 'text-lg text-red-600';
        }
    }

    resetGame() {
        const cells = document.querySelectorAll(`#crossword-game-${this.gameId.split('-')[2]} .crossword-cell`);
        cells.forEach(cell => {
            cell.value = '';
            cell.style.backgroundColor = 'white';
            cell.style.borderColor = '#d1d5db';
        });
        
        const gameInstance = window[`crosswordGame_${this.gameId.replace(/-/g, '_')}`];
        gameInstance.score = 0;
        document.getElementById(`score-${this.gameId}`).textContent = `Điểm: 0/${gameInstance.words.length}`;
    }
}