/**
 * Typing Game - Gõ từ tiếng Anh theo nghĩa tiếng Việt
 */

class TypingGame {
    constructor() {
        this.gameId = 'typing-game-' + Date.now();
        this.maxWords = 10;
        this.currentWordIndex = 0;
        this.score = 0;
    }

    getGameInfo() {
        return {
            name: 'Typing Game',
            description: 'Gõ từ tiếng Anh theo nghĩa tiếng Việt',
            icon: '⌨️'
        };
    }

    createSlide(categoryWords, categoryName) {
        const words = this.selectRandomWords(categoryWords, this.maxWords);

        const slide = document.createElement('div');
        slide.className = 'slide content-box px-5 py-2 rounded-2xl w-full h-full';
        
        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-xl font-bold text-indigo-700 mb-2 text-center">
                    ⌨️ Game: Gõ từ
                </h2>
                <p class="text-lg text-center mb-6 text-gray-600">
                    Gõ từ tiếng Anh tương ứng với nghĩa tiếng Việt
                </p>
                
                <div class="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
                    <div class="mb-8 text-center">
                        <div class="text-sm text-gray-500 mb-2">Nghĩa tiếng Việt:</div>
                        <div id="vietnamese-word-${this.gameId}" class="text-3xl font-bold text-purple-600 bg-purple-50 px-8 py-4 rounded-xl">
                            ${words[0].vietnamese_meaning}
                        </div>
                    </div>
                    
                    <div class="mb-6 w-full max-w-md">
                        <input type="text" 
                               id="typing-input-${this.gameId}"
                               class="w-full p-4 text-2xl text-center border-2 border-gray-300 rounded-xl focus:border-indigo-500 outline-none"
                               placeholder="Gõ từ tiếng Anh..."
                               onkeypress="if(event.key==='Enter') window.typingGame_${this.gameId.replace(/-/g, '_')}.checkWord()">
                    </div>
                    
                    <button onclick="window.typingGame_${this.gameId.replace(/-/g, '_')}.checkWord()"
                            class="mb-6 bg-indigo-500 text-white px-8 py-3 rounded-xl hover:bg-indigo-600 transition-colors font-semibold">
                        ✅ Kiểm tra
                    </button>
                    
                    <div id="result-${this.gameId}" class="text-center mb-4 h-12 flex items-center justify-center"></div>
                    
                    <div class="text-center">
                        <div class="flex justify-center gap-4 mb-4">
                            <button onclick="window.typingGame_${this.gameId.replace(/-/g, '_')}.restartGame()"
                                    class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg transition-all duration-200">
                                🔄 Restart
                            </button>
                        </div>
                        <div id="score-${this.gameId}" class="text-xl font-bold text-indigo-600 mb-2">
                            Score: 0/${words.length}
                        </div>
                        <div id="message-${this.gameId}" class="text-lg text-gray-500">
                            Type the English word for the Vietnamese meaning!
                        </div>
                    </div>
                </div>
            </div>
        `;

        window[`typingGame_${this.gameId.replace(/-/g, '_')}`] = {
            words: words,
            currentWordIndex: 0,
            score: 0,
            checkWord: () => this.checkWord()
        };

        return slide;
    }

    selectRandomWords(words, maxCount) {
        return [...words].sort(() => Math.random() - 0.5).slice(0, Math.min(maxCount, words.length));
    }

    checkWord() {
        const gameInstance = window[`typingGame_${this.gameId.replace(/-/g, '_')}`];
        const input = document.getElementById(`typing-input-${this.gameId}`);
        const result = document.getElementById(`result-${this.gameId}`);
        const currentWord = gameInstance.words[gameInstance.currentWordIndex];
        
        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = currentWord.english_word.toLowerCase();
        
        if (userAnswer === correctAnswer) {
            gameInstance.score++;
            result.innerHTML = '<div class="text-green-600 text-xl">🎉 Chính xác!</div>';
        } else {
            result.innerHTML = `<div class="text-red-600 text-xl">❌ Sai! Đáp án: <strong>${currentWord.english_word}</strong></div>`;
        }
        
        document.getElementById(`score-${this.gameId}`).textContent = `Score: ${gameInstance.score}/${gameInstance.words.length}`;
        
        const messageDiv = document.getElementById(`message-${this.gameId}`);
        if (userAnswer === correctAnswer) {
            messageDiv.textContent = '🎉 Perfect! Continue typing!';
            messageDiv.className = 'text-lg text-green-600';
        } else {
            messageDiv.textContent = '❌ Keep trying!';
            messageDiv.className = 'text-lg text-red-600';
        }
        
        setTimeout(() => {
            if (gameInstance.currentWordIndex < gameInstance.words.length - 1) {
                this.nextWord();
            } else {
                this.endGame();
            }
        }, 2000);
    }

    nextWord() {
        const gameInstance = window[`typingGame_${this.gameId.replace(/-/g, '_')}`];
        gameInstance.currentWordIndex++;
        
        const nextWord = gameInstance.words[gameInstance.currentWordIndex];
        document.getElementById(`vietnamese-word-${this.gameId}`).textContent = nextWord.vietnamese_meaning;
        document.getElementById(`typing-input-${this.gameId}`).value = '';
        document.getElementById(`result-${this.gameId}`).innerHTML = '';
        
        const messageDiv = document.getElementById(`message-${this.gameId}`);
        messageDiv.textContent = 'Type the English word for the Vietnamese meaning!';
        messageDiv.className = 'text-lg text-gray-500';
    }

    endGame() {
        const gameInstance = window[`typingGame_${this.gameId.replace(/-/g, '_')}`];
        const result = document.getElementById(`result-${this.gameId}`);
        const accuracy = Math.round((gameInstance.score / gameInstance.words.length) * 100);
        
        result.innerHTML = `
            <div class="text-center">
                <div class="text-2xl mb-2">🏆 Game Complete!</div>
                <div class="text-lg">Accuracy: ${accuracy}%</div>
            </div>
        `;
        
        const messageDiv = document.getElementById(`message-${this.gameId}`);
        messageDiv.textContent = '🏆 Game finished! Check your results!';
        messageDiv.className = 'text-lg text-green-600 font-bold';
        
        document.getElementById(`typing-input-${this.gameId}`).disabled = true;
        
        if (gameInstance.score === gameInstance.words.length) {
            setTimeout(() => this.showCelebration(gameInstance), 1000);
        }
    }

    restartGame() {
        const gameInstance = window[`typingGame_${this.gameId.replace(/-/g, '_')}`];
        gameInstance.currentWordIndex = 0;
        gameInstance.score = 0;
        
        document.getElementById(`vietnamese-word-${this.gameId}`).textContent = gameInstance.words[0].vietnamese_meaning;
        document.getElementById(`typing-input-${this.gameId}`).value = '';
        document.getElementById(`typing-input-${this.gameId}`).disabled = false;
        document.getElementById(`result-${this.gameId}`).innerHTML = '';
        document.getElementById(`score-${this.gameId}`).textContent = `Score: 0/${gameInstance.words.length}`;
        
        const messageDiv = document.getElementById(`message-${this.gameId}`);
        messageDiv.textContent = 'Type the English word for the Vietnamese meaning!';
        messageDiv.className = 'text-lg text-gray-500';
    }

    showCelebration(gameInstance) {
        const celebration = document.createElement('div');
        celebration.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30';
        celebration.innerHTML = `
            <div class="bg-white rounded-xl p-8 shadow-2xl text-center animate-pulse">
                <div class="text-6xl mb-4">⌨️</div>
                <h3 class="text-2xl font-bold text-green-600 mb-2">Perfect Typing!</h3>
                <p class="text-gray-600">You typed all ${gameInstance.words.length} words correctly!</p>
                <p class="text-indigo-700 font-bold mt-2">Perfect score: ${gameInstance.score}/${gameInstance.words.length}</p>
            </div>
        `;

        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 3000);
    }
}