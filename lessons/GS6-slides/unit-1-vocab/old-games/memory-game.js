/**
 * Memory Game - Game lật thẻ tìm cặp từ tiếng Anh và nghĩa tiếng Việt
 */

class MemoryGame {
    constructor() {
        this.gameId = 'memory-game-' + Date.now();
        this.maxWords = 6; // 6 cặp = 12 thẻ
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
    }

    getGameInfo() {
        return {
            name: 'Memory Game',
            description: 'Lật thẻ tìm cặp từ tiếng Anh - tiếng Việt',
            icon: '🧠'
        };
    }

    createSlide(categoryWords, categoryName) {
        const words = this.selectRandomWords(categoryWords, this.maxWords);
        const cards = this.createMemoryCards(words);
        const shuffledCards = this.shuffleArray(cards);

        const slide = document.createElement('div');
        slide.className = 'slide content-box px-5 py-2 rounded-2xl w-full h-full';
        
        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-xl font-bold text-indigo-700 text-center">
                    🧠 Memory Game - ${categoryName}
                </h2>
                <p class="text-lg text-center mb-2 text-gray-600">
                    Flip cards to find matching English-Vietnamese pairs
                </p>
                
                <!-- Game Controls & Stats -->
                <div class="grid grid-cols-3 gap-2 mb-2 sm:flex sm:justify-center sm:gap-4">
                    <div class="bg-yellow-100 text-yellow-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm w-full sm:w-28">
                        ⏱️ <span id="timer-${this.gameId}">00:00</span>
                    </div>
                    <div class="bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm w-full sm:w-40">
                        🔄 <span id="moves-${this.gameId}">0</span> moves
                    </div>
                    <div class="bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm w-full sm:w-28">
                        🎯 <span id="pairs-${this.gameId}">0/${words.length}</span>
                    </div>
                    <button onclick="window.memoryGame_${this.gameId.replace(/-/g, '_')}.resetGame()" 
                            class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-1.5 rounded-full shadow-lg transition-all duration-200 text-sm w-full sm:w-auto col-span-3 sm:col-span-1 mt-2 sm:mt-0">
                        🔄 Reset
                    </button>
                </div>
                
                <!-- Game Area -->
                <div class="flex-1 flex items-center justify-center">
                    <div id="memory-grid-${this.gameId}" class="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl w-full">
                        ${shuffledCards.map((card, index) => `
                            <div class="memory-card relative w-full h-24 cursor-pointer hover:scale-105 transition-transform duration-300" 
                                 data-card-id="${card.id}" 
                                 data-card-type="${card.type}"
                                 data-card-index="${index}"
                                 onclick="window.memoryGame_${this.gameId.replace(/-/g, '_')}.flipCard(this)">
                                <!-- Card Back -->
                                <div class="card-back absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg shadow-md flex items-center justify-center transition-all duration-500">
                                    <span class="text-white text-2xl">🎴</span>
                                </div>
                                <!-- Card Front -->
                                <div class="card-front absolute inset-0 ${card.type === 'vietnamese' && card.image ? 'bg-cover bg-center bg-no-repeat' : 'bg-white'} rounded-lg shadow-md border-2 border-gray-200 flex items-center justify-center p-3 transition-all duration-500 opacity-0 transform rotate-y-180"
                                     ${card.type === 'vietnamese' && card.image ? `style="background-image: linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0.2)), url('${card.image}')"` : ''}>
                                    <span class="text-sm font-semibold text-center ${card.type === 'english' ? 'text-blue-600' : 'text-green-600'} ${card.type === 'vietnamese' && card.image ? 'bg-white bg-opacity-90 px-2 py-1 rounded shadow-sm' : ''}">
                                        ${card.text}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Game Status -->
                <div class="text-center mt-2">
                    <div id="message-${this.gameId}" class="text-lg text-gray-500 mb-2">
                        Click on cards to start the game!
                    </div>
              </div>
              </div>
        `;

        // Add custom styles for card flip animation
        const style = document.createElement('style');
        style.textContent = `
            .memory-card {
                perspective: 1000px;
            }
            .rotate-y-180 {
                transform: rotateY(180deg);
            }
            .card-flipped .card-back {
                transform: rotateY(180deg);
                opacity: 0;
            }
            .card-flipped .card-front {
                transform: rotateY(0deg);
                opacity: 1;
            }
            .card-matched .card-front:not([style*="background-image"]) {
                background: linear-gradient(135deg, #dcfce7, #bbf7d0) !important;
                border-color: #16a34a;
            }
            .card-matched .card-front[style*="background-image"] {
                border-color: #16a34a;
                box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
            }
            .card-matched {
                opacity: 0.9;
                pointer-events: none;
            }
        `;
        slide.appendChild(style);

        // Initialize game instance
        window[`memoryGame_${this.gameId.replace(/-/g, '_')}`] = {
            words: words,
            totalPairs: words.length,
            matchedPairs: 0,
            flippedCards: [],
            moves: 0,
            timer: 0,
            timerInterval: null,
            gameStarted: false,
            flipCard: (cardElement) => this.flipCard(cardElement),
            resetGame: () => this.resetGame()
        };

        return slide;
    }

    selectRandomWords(words, maxCount) {
        const shuffled = this.shuffleArray([...words]);
        return shuffled.slice(0, Math.min(maxCount, words.length));
    }

    createMemoryCards(words) {
        const cards = [];
        words.forEach((word, index) => {
            cards.push({
                id: index,
                type: 'english',
                text: word.english_word
            });
            cards.push({
                id: index,
                type: 'vietnamese',
                text: word.vietnamese_meaning,
                image: word.image
            });
        });
        return cards;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    flipCard(cardElement) {
        const gameInstance = window[`memoryGame_${this.gameId.replace(/-/g, '_')}`];
        
        // Start timer on first click
        if (!gameInstance.gameStarted) {
            this.startTimer();
            gameInstance.gameStarted = true;
        }

        // Không cho phép lật thẻ đã matched hoặc đang flipped
        if (cardElement.classList.contains('card-matched') || 
            cardElement.classList.contains('card-flipped') ||
            gameInstance.flippedCards.length >= 2) {
            return;
        }

        // Lật thẻ
        cardElement.classList.add('card-flipped');
        gameInstance.flippedCards.push(cardElement);

        if (gameInstance.flippedCards.length === 2) {
            gameInstance.moves++;
            document.getElementById(`moves-${this.gameId}`).textContent = gameInstance.moves;
            
            setTimeout(() => this.checkMatch(gameInstance), 1000);
        }
    }

    checkMatch(gameInstance) {
        const [card1, card2] = gameInstance.flippedCards;
        const messageElement = document.getElementById(`message-${this.gameId}`);

        if (card1.dataset.cardId === card2.dataset.cardId && 
            card1.dataset.cardType !== card2.dataset.cardType) {
            // Match!
            card1.classList.add('card-matched');
            card2.classList.add('card-matched');
            gameInstance.matchedPairs++;
            
            messageElement.textContent = '🎉 Perfect match!';
            messageElement.className = 'text-lg text-green-600 font-semibold mb-2';
            
            // Update pairs count
            document.getElementById(`pairs-${this.gameId}`).textContent = 
                `${gameInstance.matchedPairs}/${gameInstance.totalPairs}`;
            
            // Check win condition
            if (gameInstance.matchedPairs === gameInstance.totalPairs) {
                this.endGame(gameInstance);
            }
        } else {
            // No match
            setTimeout(() => {
                card1.classList.remove('card-flipped');
                card2.classList.remove('card-flipped');
            }, 500);
            
            messageElement.textContent = '❌ Try again!';
            messageElement.className = 'text-lg text-red-600 mb-2';
        }

        gameInstance.flippedCards = [];
        
        // Reset message
        setTimeout(() => {
            if (!messageElement.textContent.includes('Congratulations')) {
                messageElement.textContent = 'Continue flipping cards to find pairs!';
                messageElement.className = 'text-lg text-blue-600 mb-2';
            }
        }, 2000);
    }

    startTimer() {
        const gameInstance = window[`memoryGame_${this.gameId.replace(/-/g, '_')}`];
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
        
        messageElement.innerHTML = `🏆 <strong>Congratulations!</strong><br>Completed in ${timeStr}!`;
        messageElement.className = 'text-lg text-green-600 font-bold mb-2';
        
        // Show final stats
        setTimeout(() => {
            this.showCelebration(gameInstance);
        }, 500);
    }

    resetGame() {
        const gameInstance = window[`memoryGame_${this.gameId.replace(/-/g, '_')}`];
        
        // Stop timer
        clearInterval(gameInstance.timerInterval);
        
        // Reset stats
        gameInstance.matchedPairs = 0;
        gameInstance.flippedCards = [];
        gameInstance.moves = 0;
        gameInstance.timer = 0;
        gameInstance.gameStarted = false;
        
        // Reset display
        document.getElementById(`timer-${this.gameId}`).textContent = '00:00';
        document.getElementById(`moves-${this.gameId}`).textContent = '0';
        document.getElementById(`pairs-${this.gameId}`).textContent = `0/${gameInstance.totalPairs}`;
        
        const messageElement = document.getElementById(`message-${this.gameId}`);
        messageElement.textContent = 'Click on cards to start the game!';
        messageElement.className = 'text-lg text-gray-500 mb-2';
        
        // Reset all cards
        const cards = document.querySelectorAll(`#memory-grid-${this.gameId} .memory-card`);
        cards.forEach(card => {
            card.classList.remove('card-flipped', 'card-matched');
        });
    }

    showCelebration(gameInstance) {
        const celebration = document.createElement('div');
        celebration.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30';
        
        const minutes = Math.floor(gameInstance.timer / 60);
        const seconds = gameInstance.timer % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const score = Math.max(1000 - gameInstance.moves * 10 - gameInstance.timer, 100);
        
        celebration.innerHTML = `
            <div class="bg-white rounded-xl p-8 shadow-2xl text-center animate-pulse">
                <div class="text-6xl mb-4">🧠</div>
                <h3 class="text-2xl font-bold text-indigo-600 mb-2">Excellent Memory!</h3>
                <p class="text-gray-600">You matched all ${gameInstance.totalPairs} pairs!</p>
                <div class="text-gray-600 space-y-1 mt-4">
                    <p class="text-indigo-700 font-bold">⏱️ Time: ${timeStr}</p>
                    <p class="text-green-700 font-bold">🔄 Moves: ${gameInstance.moves}</p>
                    <p class="text-purple-700 font-bold">🏆 Score: ${score}</p>
                </div>
            </div>
        `;

        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 3000);
    }
}