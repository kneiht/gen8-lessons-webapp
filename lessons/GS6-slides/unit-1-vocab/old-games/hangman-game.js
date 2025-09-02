/**
 * Hangman Game - Đoán từ từng chữ cái
 */

class HangmanGame {
    constructor() {
        this.gameId = 'hangman-game-' + Date.now();
        this.maxWords = 1; // One word at a time
        this.currentWordIndex = 0;
        this.wrongGuesses = 0;
        this.maxWrongGuesses = 6;
        this.guessedLetters = [];
    }

    getGameInfo() {
        return {
            name: 'Hangman Game',
            description: 'Đoán từ theo từng chữ cái',
            icon: '🎪'
        };
    }

    createSlide(categoryWords, categoryName) {
        const words = this.selectRandomWords(categoryWords, this.maxWords);

        const slide = document.createElement('div');
        slide.className = 'slide content-box px-5 py-2 rounded-2xl w-full h-full';
        
        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-xl font-bold text-indigo-700 mb-2 text-center">
                    🎪 Game: Hangman
                </h2>
                <p class="text-lg text-center mb-6 text-gray-600">
                    Đoán từ tiếng Anh bằng cách chọn từng chữ cái
                </p>
                
                <div class="flex-1 flex gap-8 max-w-5xl mx-auto w-full">
                    <!-- Hangman Drawing -->
                    <div class="flex-1 flex flex-col items-center justify-center">
                        <div id="hangman-drawing-${this.gameId}" class="text-8xl mb-4">
                            ${this.getHangmanDrawing(0)}
                        </div>
                        
                        <div class="text-center">
                            <div class="text-lg font-semibold text-purple-600 mb-2">Gợi ý:</div>
                            <div class="text-xl text-purple-800 bg-purple-50 px-4 py-2 rounded-lg">
                                ${words[0].vietnamese_meaning}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Game Area -->
                    <div class="flex-1">
                        <!-- Word Display -->
                        <div class="mb-8">
                            <div class="text-lg font-semibold text-center mb-4">Từ cần đoán:</div>
                            <div id="word-display-${this.gameId}" class="text-3xl font-mono font-bold text-center tracking-wider">
                                ${this.createWordDisplay(words[0].english_word)}
                            </div>
                        </div>
                        
                        <!-- Alphabet -->
                        <div class="mb-6">
                            <div class="text-lg font-semibold text-center mb-4">Chọn chữ cái:</div>
                            <div id="alphabet-${this.gameId}" class="grid grid-cols-6 gap-2">
                                ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `
                                    <button class="alphabet-btn w-10 h-10 bg-gray-200 border border-gray-300 rounded font-bold hover:bg-gray-300 transition-all"
                                            onclick="window.hangmanGame_${this.gameId.replace(/-/g, '_')}.guessLetter('${letter}')">
                                        ${letter}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Game Status -->
                        <div class="text-center">
                            <div id="status-${this.gameId}" class="text-lg mb-4 h-8"></div>
                            
                            <div class="flex justify-center gap-4 text-sm">
                                <div class="text-red-600">Sai: <span id="wrong-count-${this.gameId}">0</span>/${this.maxWrongGuesses}</div>
                                <div class="text-blue-600">Đã đoán: <span id="guessed-letters-${this.gameId}">-</span></div>
                            </div>
                            
                            <button onclick="window.hangmanGame_${this.gameId.replace(/-/g, '_')}.newGame()"
                                    class="mt-4 bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                                🎮 Từ mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        window[`hangmanGame_${this.gameId.replace(/-/g, '_')}`] = {
            words: categoryWords, // Keep all words for new games
            currentWord: words[0],
            wrongGuesses: 0,
            guessedLetters: [],
            gameOver: false,
            guessLetter: (letter) => this.guessLetter(letter),
            newGame: () => this.newGame()
        };

        return slide;
    }

    selectRandomWords(words, maxCount) {
        return [...words].sort(() => Math.random() - 0.5).slice(0, maxCount);
    }

    createWordDisplay(word, guessedLetters = []) {
        return word.split('').map(letter => 
            guessedLetters.includes(letter.toUpperCase()) ? letter.toUpperCase() : '_'
        ).join(' ');
    }

    getHangmanDrawing(wrongCount) {
        const drawings = ['😊', '😐', '😟', '😰', '😵', '💀', '☠️'];
        return drawings[Math.min(wrongCount, drawings.length - 1)];
    }

    guessLetter(letter) {
        const gameInstance = window[`hangmanGame_${this.gameId.replace(/-/g, '_')}`];
        
        if (gameInstance.gameOver || gameInstance.guessedLetters.includes(letter)) {
            return;
        }
        
        gameInstance.guessedLetters.push(letter);
        
        // Disable the button
        const button = document.querySelector(`#alphabet-${this.gameId} button:contains('${letter}')`);
        const buttons = document.querySelectorAll(`#alphabet-${this.gameId} .alphabet-btn`);
        buttons.forEach(btn => {
            if (btn.textContent === letter) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            }
        });
        
        const word = gameInstance.currentWord.english_word.toUpperCase();
        const status = document.getElementById(`status-${this.gameId}`);
        
        if (word.includes(letter)) {
            // Correct guess
            status.textContent = '✅ Đúng rồi!';
            status.className = 'text-lg mb-4 h-8 text-green-600';
            
            // Update word display
            document.getElementById(`word-display-${this.gameId}`).textContent = 
                this.createWordDisplay(gameInstance.currentWord.english_word, gameInstance.guessedLetters);
            
            // Check if word is complete
            if (word.split('').every(char => gameInstance.guessedLetters.includes(char))) {
                this.winGame();
            }
        } else {
            // Wrong guess
            gameInstance.wrongGuesses++;
            status.textContent = '❌ Không có chữ cái này!';
            status.className = 'text-lg mb-4 h-8 text-red-600';
            
            // Update hangman drawing
            document.getElementById(`hangman-drawing-${this.gameId}`).textContent = 
                this.getHangmanDrawing(gameInstance.wrongGuesses);
            
            // Update wrong count
            document.getElementById(`wrong-count-${this.gameId}`).textContent = gameInstance.wrongGuesses;
            
            // Check if game lost
            if (gameInstance.wrongGuesses >= this.maxWrongGuesses) {
                this.loseGame();
            }
        }
        
        // Update guessed letters display
        document.getElementById(`guessed-letters-${this.gameId}`).textContent = 
            gameInstance.guessedLetters.join(', ') || '-';
        
        // Clear status after 2 seconds
        setTimeout(() => {
            if (!gameInstance.gameOver) {
                status.textContent = '';
                status.className = 'text-lg mb-4 h-8';
            }
        }, 2000);
    }

    winGame() {
        const gameInstance = window[`hangmanGame_${this.gameId.replace(/-/g, '_')}`];
        gameInstance.gameOver = true;
        
        const status = document.getElementById(`status-${this.gameId}`);
        status.innerHTML = '<div class="text-green-600 text-xl">🎉 <strong>Chúc mừng! Bạn đã thắng!</strong></div>';
        
        // Disable all alphabet buttons
        const buttons = document.querySelectorAll(`#alphabet-${this.gameId} .alphabet-btn`);
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
    }

    loseGame() {
        const gameInstance = window[`hangmanGame_${this.gameId.replace(/-/g, '_')}`];
        gameInstance.gameOver = true;
        
        const status = document.getElementById(`status-${this.gameId}`);
        status.innerHTML = `<div class="text-red-600 text-xl">💀 <strong>Thua rồi! Từ đúng: ${gameInstance.currentWord.english_word.toUpperCase()}</strong></div>`;
        
        // Show complete word
        document.getElementById(`word-display-${this.gameId}`).textContent = 
            gameInstance.currentWord.english_word.toUpperCase().split('').join(' ');
        
        // Disable all alphabet buttons
        const buttons = document.querySelectorAll(`#alphabet-${this.gameId} .alphabet-btn`);
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
    }

    newGame() {
        const gameInstance = window[`hangmanGame_${this.gameId.replace(/-/g, '_')}`];
        
        // Select new random word
        const randomIndex = Math.floor(Math.random() * gameInstance.words.length);
        gameInstance.currentWord = gameInstance.words[randomIndex];
        gameInstance.wrongGuesses = 0;
        gameInstance.guessedLetters = [];
        gameInstance.gameOver = false;
        
        // Reset displays
        document.getElementById(`word-display-${this.gameId}`).textContent = 
            this.createWordDisplay(gameInstance.currentWord.english_word);
        document.getElementById(`hangman-drawing-${this.gameId}`).textContent = this.getHangmanDrawing(0);
        document.getElementById(`status-${this.gameId}`).textContent = '';
        document.getElementById(`wrong-count-${this.gameId}`).textContent = '0';
        document.getElementById(`guessed-letters-${this.gameId}`).textContent = '-';
        
        // Update hint
        const hintElement = document.querySelector(`#hangman-drawing-${this.gameId}`).parentElement.querySelector('.text-purple-800');
        hintElement.textContent = gameInstance.currentWord.vietnamese_meaning;
        
        // Reset alphabet buttons
        const buttons = document.querySelectorAll(`#alphabet-${this.gameId} .alphabet-btn`);
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
        
        // Reset message
        const messageDiv = document.getElementById(`message-${this.gameId}`);
        messageDiv.textContent = 'Click letters to guess the word!';
        messageDiv.className = 'text-lg text-gray-500 mt-4';
    }

    showCelebration(gameInstance) {
        const celebration = document.createElement('div');
        celebration.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30';
        celebration.innerHTML = `
            <div class="bg-white rounded-xl p-8 shadow-2xl text-center animate-pulse">
                <div class="text-6xl mb-4">🎪</div>
                <h3 class="text-2xl font-bold text-green-600 mb-2">Excellent Work!</h3>
                <p class="text-gray-600">You guessed the word: <strong>${gameInstance.currentWord.english_word.toUpperCase()}</strong></p>
                <p class="text-indigo-700 font-bold mt-2">Wrong guesses: ${gameInstance.wrongGuesses}/${this.maxWrongGuesses}</p>
            </div>
        `;

        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 3000);
    }
}