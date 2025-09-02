/**
 * Word Scramble Game - Trò chơi xếp lại từ tiếng Anh từ các chữ cái bị xáo trộn
 */

class WordScrambleGame {
    constructor() {
        this.gameId = 'word-scramble-' + Date.now();
        this.maxWords = 8; // 8 từ để chơi
        this.currentWordIndex = 0;
        this.correctAnswers = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.score = 0;
        this.hintsUsed = 0;
    }

    getGameInfo() {
        return {
            name: 'Word Scramble',
            description: 'Xếp lại từ tiếng Anh từ các chữ cái bị xáo trộn',
            icon: '🔤'
        };
    }

    createSlide(categoryWords, categoryName) {
        const words = this.selectRandomWords(categoryWords, this.maxWords);
        
        const slide = document.createElement('div');
        slide.className = 'slide content-box px-5 py-2 rounded-2xl w-full h-full';
        
        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-xl font-bold text-indigo-700 text-center">
                    🔤 Word Scramble - ${categoryName}
                </h2>
                <p class="text-lg text-center mb-2 text-gray-600">
                    Unscramble the letters to form the correct English word
                </p>
                
                <!-- Game Controls & Stats -->
                <div class="grid grid-cols-3 gap-2 mb-2 sm:flex sm:justify-center sm:gap-4">
                    <div class="bg-yellow-100 text-yellow-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm w-full sm:w-28">
                        ⏱️ <span id="timer-${this.gameId}">00:00</span>
                    </div>
                    <div class="bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm w-full sm:w-40">
                        🎯 <span id="score-${this.gameId}">0</span> pts
                    </div>
                    <div class="bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm w-full sm:w-28">
                        📊 <span id="progress-${this.gameId}">0/${words.length}</span>
                    </div>
                    <button onclick="window.wordScrambleGame_${this.gameId.replace(/-/g, '_')}.resetGame()" 
                            class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-1.5 rounded-full shadow-lg transition-all duration-200 text-sm w-full sm:w-auto col-span-3 sm:col-span-1 mt-2 sm:mt-0">
                        🔄 Reset
                    </button>
                </div>
                
                <!-- Game Area -->
                <div class="flex-1 flex items-center justify-center">
                    <div class="max-w-2xl w-full">
                        <!-- Current Word Card -->
                        <div id="word-card-${this.gameId}" class="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Word Image (if available) -->
                            <div class="flex flex-col items-center justify-center">
                                <div id="word-image-${this.gameId}" class="sm:w-60 sm:h-44 w-full h-32  mx-auto mb-4 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                                    <span class="text-6xl">📚</span>
                                </div>
                                <button 
                                    id="hint-btn-${this.gameId}" 
                                    onclick="window.wordScrambleGame_${this.gameId.replace(/-/g, '_')}.showHint()"
                                    class="bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold px-2 py-1 rounded-full shadow transition-all duration-200 text-sm mr-2"
                                >
                                    💡 Hint
                                </button>
                                <div 
                                    id="hint-text-${this.gameId}" 
                                    class="text-lg text-green-600 font-semibold mt-2 hidden"
                                >
                                </div>
                            </div>
                            <div>
                                <div class="text-center mb-4">

                                    <button onclick="window.wordScrambleGame_${this.gameId.replace(/-/g, '_')}.checkAnswer()"
                                            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-1.5 rounded-full shadow-lg transition-all duration-200 text-sm mr-2">
                                        ✅ Submit
                                    </button>
                                    <button onclick="window.wordScrambleGame_${this.gameId.replace(/-/g, '_')}.skipWord()"
                                            class="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-1.5 rounded-full shadow-lg transition-all duration-200 text-sm">
                                        ⏭️ Skip
                                    </button>

                                </div>
                                
                                <!-- Scrambled Letters -->
                                <div class="text-center mb-4">
                                    <p class="text-xs text-gray-500 mb-1">Scrambled letters:</p>
                                    <div id="scrambled-letters-${this.gameId}" class="text-2xl font-bold text-indigo-600 tracking-wider bg-indigo-50 py-2 px-3 rounded-lg">
                                    </div>
                                </div>
                                
                                <!-- Input Area -->
                                <div class="text-center">
                                    <input type="text" 
                                        id="word-input-${this.gameId}"
                                        placeholder="Type the correct word here..."
                                        class="w-full max-w-xs px-2 py-1.5 text-base text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                                        onkeydown="if(event.key==='Enter') window.wordScrambleGame_${this.gameId.replace(/-/g, '_')}.checkAnswer()"
                                        autocomplete="off">
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                
                <!-- Game Status -->
                <div class="text-center mt-2">
                    <div id="message-${this.gameId}" class="text-lg text-gray-500 mb-2">
                        Unscramble the letters to form the correct English word!
                    </div>
                </div>
            </div>
        `;

        // Add custom styles for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounce-in {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            @keyframes pulse-green {
                0%, 100% { background-color: rgb(220, 252, 231); }
                50% { background-color: rgb(187, 247, 208); }
            }
            .bounce-in {
                animation: bounce-in 0.6s ease-out;
            }
            .shake {
                animation: shake 0.6s ease-in-out;
            }
            .pulse-green {
                animation: pulse-green 1s ease-in-out 2;
            }
            .letter-spacing-wide {
                letter-spacing: 0.3em;
            }
        `;
        slide.appendChild(style);

        // Initialize game instance
        window[`wordScrambleGame_${this.gameId.replace(/-/g, '_')}`] = {
            words: words,
            totalWords: words.length,
            currentWordIndex: 0,
            correctAnswers: 0,
            timer: 0,
            timerInterval: null,
            gameStarted: false,
            score: 0,
            hintsUsed: 0,
            checkAnswer: () => this.checkAnswer(),
            skipWord: () => this.skipWord(),
            showHint: () => this.showHint(),
            resetGame: () => this.resetGame()
        };

        // Load first word
        setTimeout(() => this.loadWord(), 100);

        return slide;
    }

    selectRandomWords(words, maxCount) {
        const shuffled = this.shuffleArray([...words]);
        return shuffled.slice(0, Math.min(maxCount, words.length));
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    scrambleWord(word) {
        const letters = word.split('');
        return this.shuffleArray(letters).join('');
    }

    loadWord() {
        const gameInstance = window[`wordScrambleGame_${this.gameId.replace(/-/g, '_')}`];
        
        if (gameInstance.currentWordIndex >= gameInstance.words.length) {
            this.endGame(gameInstance);
            return;
        }

        const currentWord = gameInstance.words[gameInstance.currentWordIndex];
        
        // Update scrambled letters
        const scrambledWord = this.scrambleWord(currentWord.english_word.toUpperCase());
        document.getElementById(`scrambled-letters-${this.gameId}`).textContent = scrambledWord;
        
        // Update word image
        const imageElement = document.getElementById(`word-image-${this.gameId}`);
        if (currentWord.image) {
            imageElement.innerHTML = `<img src="${currentWord.image}" alt="${currentWord.english_word}" class="w-full h-full object-cover rounded-lg">`;
        } else {
            imageElement.innerHTML = '<span class="text-4xl">📚</span>';
        }
        
        // Reset input and hint
        document.getElementById(`word-input-${this.gameId}`).value = '';
        document.getElementById(`hint-text-${this.gameId}`).classList.add('hidden');
        document.getElementById(`hint-btn-${this.gameId}`).classList.remove('hidden');
        
        // Focus on input
        setTimeout(() => {
            document.getElementById(`word-input-${this.gameId}`).focus();
        }, 100);
        
        // Start timer on first word
        if (!gameInstance.gameStarted) {
            this.startTimer();
            gameInstance.gameStarted = true;
        }
    }

    checkAnswer() {
        const gameInstance = window[`wordScrambleGame_${this.gameId.replace(/-/g, '_')}`];
        const inputElement = document.getElementById(`word-input-${this.gameId}`);
        const messageElement = document.getElementById(`message-${this.gameId}`);
        const currentWord = gameInstance.words[gameInstance.currentWordIndex];
        
        const userAnswer = inputElement.value.trim().toLowerCase();
        const correctAnswer = currentWord.english_word.toLowerCase();
        
        if (userAnswer === correctAnswer) {
            // Correct answer
            gameInstance.correctAnswers++;
            
            // Calculate score (bonus for speed and not using hint)
            let points = 100;
            if (gameInstance.hintsUsed === 0) points += 50; // No hint bonus
            points += Math.max(0, 50 - gameInstance.timer % 60); // Speed bonus
            
            gameInstance.score += points;
            
            // Update display
            document.getElementById(`score-${this.gameId}`).textContent = gameInstance.score;
            document.getElementById(`progress-${this.gameId}`).textContent = 
                `${gameInstance.correctAnswers}/${gameInstance.totalWords}`;
            
            // Show success feedback
            messageElement.innerHTML = `🎉 Correct! <span class="text-green-600 font-bold">${currentWord.english_word}</span> = <span class="text-blue-600">${currentWord.vietnamese_meaning}</span> (+${points} points)`;
            messageElement.className = 'text-lg text-green-600 font-semibold mb-2';
            
            // Add success animation
            document.getElementById(`word-card-${this.gameId}`).classList.add('pulse-green');
            
            // Move to next word
            gameInstance.currentWordIndex++;
            gameInstance.hintsUsed = 0;
            
            setTimeout(() => {
                document.getElementById(`word-card-${this.gameId}`).classList.remove('pulse-green');
                this.loadWord();
                messageElement.textContent = 'Great! Keep going with the next word!';
                messageElement.className = 'text-lg text-blue-600 mb-2';
            }, 2000);
            
        } else {
            // Wrong answer
            messageElement.textContent = '❌ Not quite right. Try again!';
            messageElement.className = 'text-lg text-red-600 mb-2';
            
            // Add shake animation
            document.getElementById(`word-card-${this.gameId}`).classList.add('shake');
            inputElement.value = '';
            inputElement.focus();
            
            setTimeout(() => {
                document.getElementById(`word-card-${this.gameId}`).classList.remove('shake');
                messageElement.textContent = 'Think carefully about the letter order...';
                messageElement.className = 'text-lg text-gray-600 mb-2';
            }, 2000);
        }
    }

    skipWord() {
        const gameInstance = window[`wordScrambleGame_${this.gameId.replace(/-/g, '_')}`];
        const messageElement = document.getElementById(`message-${this.gameId}`);
        const currentWord = gameInstance.words[gameInstance.currentWordIndex];
        
        messageElement.innerHTML = `⏭️ Skipped! The answer was: <span class="text-blue-600 font-bold">${currentWord.english_word}</span> = <span class="text-green-600">${currentWord.vietnamese_meaning}</span>`;
        messageElement.className = 'text-lg text-orange-600 font-semibold mb-2';
        
        gameInstance.currentWordIndex++;
        gameInstance.hintsUsed = 0;
        
        setTimeout(() => {
            this.loadWord();
            messageElement.textContent = 'Try your best on this next word!';
            messageElement.className = 'text-lg text-blue-600 mb-2';
        }, 2000);
    }

    showHint() {
        const gameInstance = window[`wordScrambleGame_${this.gameId.replace(/-/g, '_')}`];
        const currentWord = gameInstance.words[gameInstance.currentWordIndex];
        
        document.getElementById(`hint-text-${this.gameId}`).textContent = 
            `💡 ${currentWord.vietnamese_meaning}`;
        document.getElementById(`hint-text-${this.gameId}`).classList.remove('hidden');
        document.getElementById(`hint-btn-${this.gameId}`).classList.add('hidden');
        
        gameInstance.hintsUsed++;
    }

    startTimer() {
        const gameInstance = window[`wordScrambleGame_${this.gameId.replace(/-/g, '_')}`];
        gameInstance.timerInterval = setInterval(() => {
            gameInstance.timer++;
            const minutes = Math.floor(gameInstance.timer / 60);
            const seconds = gameInstance.timer % 60;
            document.getElementById(`timer-${this.gameId}`).textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    endGame(gameInstance) {
        clearInterval(gameInstance.timerInterval);
        
        const messageElement = document.getElementById(`message-${this.gameId}`);
        const minutes = Math.floor(gameInstance.timer / 60);
        const seconds = gameInstance.timer % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        messageElement.innerHTML = `🏆 <strong>Game Complete!</strong><br>Score: ${gameInstance.score} points in ${timeStr}!`;
        messageElement.className = 'text-lg text-green-600 font-bold mb-2';
        
        // Hide word card and show final stats
        document.getElementById(`word-card-${this.gameId}`).style.display = 'none';
        
        setTimeout(() => {
            this.showCelebration(gameInstance);
        }, 500);
    }

    resetGame() {
        const gameInstance = window[`wordScrambleGame_${this.gameId.replace(/-/g, '_')}`];
        
        // Stop timer
        clearInterval(gameInstance.timerInterval);
        
        // Reset stats
        gameInstance.currentWordIndex = 0;
        gameInstance.correctAnswers = 0;
        gameInstance.timer = 0;
        gameInstance.gameStarted = false;
        gameInstance.score = 0;
        gameInstance.hintsUsed = 0;
        
        // Reset display
        document.getElementById(`timer-${this.gameId}`).textContent = '00:00';
        document.getElementById(`score-${this.gameId}`).textContent = '0';
        document.getElementById(`progress-${this.gameId}`).textContent = `0/${gameInstance.totalWords}`;
        
        const messageElement = document.getElementById(`message-${this.gameId}`);
        messageElement.textContent = 'Unscramble the letters to form the correct English word!';
        messageElement.className = 'text-lg text-gray-500 mb-2';
        
        // Show word card and load first word
        document.getElementById(`word-card-${this.gameId}`).style.display = 'block';
        this.loadWord();
    }

    showCelebration(gameInstance) {
        const celebration = document.createElement('div');
        celebration.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30';
        
        const minutes = Math.floor(gameInstance.timer / 60);
        const seconds = gameInstance.timer % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const accuracy = Math.round((gameInstance.correctAnswers / gameInstance.totalWords) * 100);
        
        celebration.innerHTML = `
            <div class="bg-white rounded-xl p-8 shadow-2xl text-center animate-pulse max-w-md">
                <div class="text-6xl mb-4">🔤</div>
                <h3 class="text-2xl font-bold text-indigo-600 mb-2">Word Master!</h3>
                <p class="text-gray-600 mb-4">You unscrambled the words successfully!</p>
                <div class="text-gray-600 space-y-2">
                    <p class="text-indigo-700 font-bold">⏱️ Time: ${timeStr}</p>
                    <p class="text-green-700 font-bold">🎯 Score: ${gameInstance.score} points</p>
                    <p class="text-blue-700 font-bold">✅ Correct: ${gameInstance.correctAnswers}/${gameInstance.totalWords} (${accuracy}%)</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove(); window.wordScrambleGame_${this.gameId.replace(/-/g, '_')}.resetGame()" 
                        class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg transition-all duration-200 mt-4">
                    🎮 Play Again
                </button>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Auto close after 10 seconds
        setTimeout(() => {
            if (celebration.parentElement) {
                celebration.remove();
            }
        }, 10000);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordScrambleGame;
}