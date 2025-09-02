/**
 * Matching Game - Clean Implementation
 * Match English words with their Vietnamese meanings
 */

class MatchingGame {
    constructor() {
        this.categoryWords = [];
        this.gameId = 'matching-game-' + Date.now();
        this.maxWords = 2; // Maximum pairs to keep manageable
        this.isGameStarted = false;
        this.isGameOver = false;
        this.selectedCards = [];
        this.matchedPairs = [];
        this.timer = 0;
        this.timerInterval = null;
        this.words = [];
        this.gameData = [];
    }

    getGameInfo() {
        return {
            name: 'Matching Game',
            description: 'Ghép đôi từ tiếng Anh với nghĩa tiếng Việt',
            icon: '🃏'
        };
    }

    createSlide(categoryWords, categoryName) {
        // Store words and prepare game data
        this.categoryWords = categoryWords;
        this.words = this.selectRandomWords(categoryWords, this.maxWords);
        this.gameData = this.createGameData(this.words);
        
        // Create the slide HTML
        const slide = document.createElement('div');
        slide.className = 'slide content-box px-5 py-2 rounded-2xl w-full h-full';
        
        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-xl font-bold text-indigo-700 text-center">
                    🎮 Matching Game - ${categoryName}
                </h2>
                <!-- Game Controls & Stats -->
                <div class="grid grid-cols-3 gap-2 my-2 sm:flex sm:justify-center sm:gap-4">
                    <div id="timer-${this.gameId}" 
                        class="bg-yellow-100 text-yellow-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm w-full sm:w-28"
                        style="display: none;">
                        ⏱️ <span id="timer-value-${this.gameId}">00:00</span>
                    </div>
                    <div id="score-${this.gameId}" 
                        class="bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm w-full sm:w-28"
                        style="display: none;">
                        🎯 <span id="score-value-${this.gameId}">0/${this.words.length}</span>
                    </div>
                    <button id="start-btn-${this.gameId}" 
                        class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-1.5 rounded-full shadow-lg transition-all duration-200 text-sm w-full sm:w-auto">
                        ▶️ Start Game
                    </button>
                    <button id="restart-btn-${this.gameId}" 
                        class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-1.5 rounded-full shadow-lg transition-all duration-200 text-sm w-full sm:w-auto"
                        style="display: none;">
                        🔄 Restart
                    </button>
                </div>



                <!-- Game Area -->
                <div class="flex-1 flex items-center justify-center">
                    <div id="game-grid-${this.gameId}" class="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl w-full">
                        ${this.renderGameCards()}
                    </div>
                </div>


            </div>
        `;

        // Setup event listeners
        this.setupEventListeners(slide);
        
        // Show instruction popup when game loads
        setTimeout(() => this.showInstructionPopup(), 500);
        
        return slide;
    }

    selectRandomWords(words, maxCount) {
        const shuffled = [...words].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(maxCount, words.length));
    }

    createGameData(words) {
        const cards = [];
        words.forEach((word, index) => {
            // English card
            cards.push({
                id: index,
                type: 'english',
                text: word.english_word,
                matched: false
            });
            // Vietnamese card
            cards.push({
                id: index,
                type: 'vietnamese', 
                text: word.vietnamese_meaning,
                matched: false
            });
        });
        return this.shuffleArray(cards);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    renderGameCards() {
        return this.gameData.map((card, index) => `
            <div class="game-card bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-300 hover:scale-105 border-2 border-gray-200 min-h-[100px] flex items-center justify-center text-center opacity-50 pointer-events-none"
                 data-card-index="${index}"
                 data-card-id="${card.id}"
                 data-card-type="${card.type}">
                <span class="card-text text-lg font-semibold text-gray-400">?</span>
            </div>
        `).join('');
    }

    setupEventListeners(slide) {
        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        
        startBtn.addEventListener('click', () => this.startGame(slide));
        restartBtn.addEventListener('click', () => this.restartGame(slide));
        
        // Add click listeners to cards
        slide.addEventListener('click', (e) => {
            if (e.target.closest('.game-card')) {
                this.handleCardClick(e.target.closest('.game-card'), slide);
            }
        });
    }

    startGame(slide) {
        this.isGameStarted = true;
        this.isGameOver = false;
        this.selectedCards = [];
        this.matchedPairs = [];
        this.timer = 0;

        // Update UI
        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        const timerDiv = slide.querySelector(`#timer-${this.gameId}`);
        const scoreDiv = slide.querySelector(`#score-${this.gameId}`);
        const cards = slide.querySelectorAll('.game-card');

        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        timerDiv.style.display = 'inline-block';
        scoreDiv.style.display = 'inline-block';

        // Enable and reveal cards
        cards.forEach((card, index) => {
            card.classList.remove('opacity-50', 'pointer-events-none');
            card.classList.add('hover:bg-blue-50');
            
            const cardText = card.querySelector('.card-text');
            cardText.textContent = this.gameData[index].text;
            cardText.className = 'card-text text-lg font-semibold text-gray-800';
        });

        // Start timer
        this.startTimer(slide);
    }

    restartGame(slide) {
        // Stop current game
        this.stopTimer();
        this.isGameStarted = false;
        this.isGameOver = false;

        // Load new random words from vocab.json and create new game data
        this.words = this.selectRandomWords(this.categoryWords, this.maxWords);
        this.gameData = this.createGameData(this.words);

        // Reset UI
        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        const timerDiv = slide.querySelector(`#timer-${this.gameId}`);
        const scoreDiv = slide.querySelector(`#score-${this.gameId}`);
        const scoreValueSpan = slide.querySelector(`#score-value-${this.gameId}`);

        startBtn.style.display = 'inline-block';
        restartBtn.style.display = 'none';
        timerDiv.style.display = 'none';
        scoreDiv.style.display = 'none';
        scoreValueSpan.textContent = `0/${this.words.length}`;

        // Re-render cards with new words
        const gameGrid = slide.querySelector(`#game-grid-${this.gameId}`);
        gameGrid.innerHTML = this.renderGameCards();
    }

    handleCardClick(cardElement, slide) {
        if (!this.isGameStarted || this.isGameOver) return;
        if (cardElement.classList.contains('matched') || cardElement.classList.contains('selected')) return;
        if (this.selectedCards.length >= 2) return;

        // Select card
        this.selectCard(cardElement);

        // Check for match if 2 cards selected
        if (this.selectedCards.length === 2) {
            setTimeout(() => this.checkMatch(slide), 200);
        }
    }

    selectCard(cardElement) {
        cardElement.classList.add('selected');
        cardElement.style.backgroundColor = '#dbeafe';
        cardElement.style.borderColor = '#3b82f6';
        cardElement.style.transform = 'scale(1.05)';
        this.selectedCards.push(cardElement);
    }

    checkMatch(slide) {
        const [card1, card2] = this.selectedCards;
        const card1Index = parseInt(card1.dataset.cardIndex);
        const card2Index = parseInt(card2.dataset.cardIndex);
        const card1Data = this.gameData[card1Index];
        const card2Data = this.gameData[card2Index];

        const scoreValueSpan = slide.querySelector(`#score-value-${this.gameId}`);

        if (card1Data.id === card2Data.id && card1Data.type !== card2Data.type) {
            // Correct match!
            this.handleCorrectMatch(card1, card2);
            this.matchedPairs.push(card1Data.id);
            
            // Update score
            scoreValueSpan.textContent = `${this.matchedPairs.length}/${this.words.length}`;
            
            // Check win condition
            if (this.matchedPairs.length === this.words.length) {
                this.handleGameWin(slide);
            }
        } else {
            // Wrong match
            this.handleWrongMatch(card1, card2);
        }

        // Reset selection
        this.selectedCards = [];
    }

    handleCorrectMatch(card1, card2) {
        // Mark as matched
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.classList.remove('selected');
        card2.classList.remove('selected');
        
        // Visual feedback
        card1.style.backgroundColor = '#dcfce7';
        card2.style.backgroundColor = '#dcfce7';
        card1.style.borderColor = '#16a34a';
        card2.style.borderColor = '#16a34a';
        card1.style.transform = 'scale(1)';
        card2.style.transform = 'scale(1)';
    }

    handleWrongMatch(card1, card2) {
        // Visual feedback for wrong match
        card1.style.backgroundColor = '#fee2e2';
        card2.style.backgroundColor = '#fee2e2';
        card1.style.borderColor = '#dc2626';
        card2.style.borderColor = '#dc2626';

        // Reset after delay
        setTimeout(() => {
            card1.classList.remove('selected');
            card2.classList.remove('selected');
            card1.style.backgroundColor = 'white';
            card2.style.backgroundColor = 'white';
            card1.style.borderColor = '#d1d5db';
            card2.style.borderColor = '#d1d5db';
            card1.style.transform = 'scale(1)';
            card2.style.transform = 'scale(1)';
        }, 1000);
    }

    handleGameWin(slide) {
        this.isGameOver = true;
        this.stopTimer();

        // Celebration effect
        setTimeout(() => this.showCelebration(slide), 500);
    }

    showCelebration(slide) {
        const celebration = document.createElement('div');
        celebration.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30';
        celebration.innerHTML = `
            <div class="bg-white rounded-xl p-8 shadow-2xl text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h3 class="text-2xl font-bold text-green-600 mb-2">Excellent Work!</h3>
                <p class="text-gray-600">You matched all ${this.words.length} pairs!</p>
                <p class="text-indigo-700 font-bold mt-2">⏱️ Time: ${this.timer} seconds</p>
                <button class="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200">
                    Close
                </button>
            </div>
        `;

        // Add click event to close the celebration popup
        const closeBtn = celebration.querySelector('button');
        closeBtn.addEventListener('click', () => celebration.remove());

        // Also close on background click
        celebration.addEventListener('click', (e) => {
            if (e.target === celebration) {
                celebration.remove();
            }
        });

        document.body.appendChild(celebration);
    }

    showInstructionPopup() {
        const popup = document.createElement('div');
        popup.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30';
        popup.innerHTML = `
            <div class="bg-white rounded-xl p-6 shadow-2xl text-center max-w-md mx-4">
                <h3 class="text-xl font-bold text-indigo-700 mb-3">How to Play</h3>
                <p class="text-gray-700 text-lg leading-relaxed">
                    Match English words with their Vietnamese meanings
                </p>

                <button class="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200">
                    Got it!
                </button>
            </div>
        `;

        // Add click event to close popup
        const closeBtn = popup.querySelector('button');
        closeBtn.addEventListener('click', () => popup.remove());

        // Also close on background click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });

        document.body.appendChild(popup);
    }

    startTimer(slide) {
        const timerDiv = slide.querySelector(`#timer-${this.gameId}`);
        this.timerInterval = setInterval(() => {
            if (!this.isGameOver) {
                this.timer++;
                timerDiv.textContent = `⏱️ Time: ${this.timer}s`;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
}