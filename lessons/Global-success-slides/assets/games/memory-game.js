/**
 * Memory Game - Lật thẻ tìm cặp từ tiếng Anh - tiếng Việt
 */

class MemoryGame extends GameBase {
    constructor() {
        super('Memory Game', 6);
        this.selectedCards = [];
        this.matchedPairs = [];
        this.gameData = [];
        this.moves = 0;
    }

    getGameInfo() {
        return {
            name: 'Memory Game',
            description: 'Lật thẻ tìm cặp từ tiếng Anh - tiếng Việt',
            icon: '🧠'
        };
    }

    createSlide(categoryWords, categoryName) {
        // Prepare data
        this.categoryWords = categoryWords;
        this.categoryName = categoryName;
        this.words = GameUtils.selectRandomWords(categoryWords, this.maxWords);
        this.gameData = this.createGameData(this.words);

        // Create slide container
        const slide = document.createElement('div');
        slide.className = 'slide content-box px-2 py-2 rounded-2xl w-full h-full';

        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-md md:text-xl font-bold text-indigo-700 text-center">
                    Memory Game - ${categoryName}
                </h2>

                ${UIComponents.createGameControls(this.gameId, this.words.length, { showMoves: true })}

                <div class="flex-1 flex items-center justify-center">
                    <div id="game-container-${this.gameId}" class="max-w-4xl w-full">
                        ${this.renderWelcomeScreen()}
                    </div>
                </div>
            </div>
        `;

        // Add flip styles
        const style = document.createElement('style');
        style.textContent = `
            .memory-card { perspective: 1000px; position: relative; }
            .memory-card .card-back, .memory-card .card-front { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
            .memory-card .card-back { transform: rotateY(0deg); }
            .memory-card .card-front { transform: rotateY(180deg); opacity: 0; }
            .memory-card.card-flipped .card-back { transform: rotateY(180deg); opacity: 0; transition: transform 0.5s, opacity 0.5s; }
            .memory-card.card-flipped .card-front { transform: rotateY(0deg); opacity: 1; transition: transform 0.5s, opacity 0.5s; }
            .memory-card.card-matched { opacity: 0.95; pointer-events: none; }
            .memory-card.card-matched .card-front { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.25); }
            .memory-card.flipping-back .card-back { transform: rotateY(0deg); opacity: 1; transition: transform 0.5s, opacity 0.5s; }
            .memory-card.flipping-back .card-front { transform: rotateY(180deg); opacity: 0; transition: transform 0.5s, opacity 0.5s; }
        `;
        slide.appendChild(style);

        // Setup listeners
        this.setupEventListeners(slide);

        return slide;
    }

    renderWelcomeScreen() {
        return `
            <div class="text-center bg-white rounded-xl shadow-lg p-8">
                <div class="text-6xl mb-4">${this.getGameInfo().icon}</div>
                <h3 class="text-2xl font-bold text-indigo-700 mb-4">Memory Game</h3>
                <p class="text-gray-600 mb-6">
                    Lật thẻ và tìm ${this.words.length} cặp trùng nhau. Bấm Start để bắt đầu.
                </p>
                <div class="text-sm text-gray-500">
                    Click "▶️ Start Game" để bắt đầu!
                </div>
            </div>
        `;
    }

    createGameData(words) {
        const cards = [];
        words.forEach((word, index) => {
            cards.push({ id: index, type: 'english', text: word.english_word, matched: false });
            const imagePath = typeof getImagePath === 'function' ? getImagePath(word.image) : word.image;
            cards.push({ id: index, type: 'vietnamese', text: word.vietnamese_meaning, matched: false, image: imagePath });
        });
        return GameUtils.shuffleArray(cards);
    }
    
    renderGameCards() {
        return this.gameData.map((card, index) => `
            <div class="memory-card bg-transparent rounded-lg shadow-md border-2 border-gray-200 min-h-[100px] h-24 sm:h-28 cursor-pointer transition-all duration-300 hover:scale-105"
                 data-card-index="${index}" data-card-id="${card.id}" data-card-type="${card.type}">
                <div class="card-back absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span class="text-white text-4xl">🎴</span>
                </div>
                <div class="card-front absolute inset-0 ${card.type === 'vietnamese' && card.image ? 'bg-cover bg-center bg-no-repeat' : 'bg-white'} rounded-lg border-2 border-gray-200 flex items-center justify-center p-3"
                    ${card.type === 'vietnamese' && card.image ? `style="background-image: url('${card.image}')"` : ''}>
                    <span class="text-xxs md:text:sm font-semibold text-center ${card.type === 'english' ? 'text-blue-600' : 'text-green-700'} ${card.type === 'vietnamese' && card.image ? 'bg-white bg-opacity-90 px-1 py-1 rounded shadow-sm' : ''}">
                        ${card.text}
                    </span>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners(slide) {
        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        const resetBtn = slide.querySelector(`#reset-btn-${this.gameId}`);

        startBtn.addEventListener('click', () => this.startGame(slide));
        restartBtn.addEventListener('click', () => this.restartGame(slide));
        if (resetBtn) resetBtn.addEventListener('click', () => this.restartGame(slide));

        slide.addEventListener('click', (e) => {
            const cardEl = e.target.closest('.memory-card');
            if (cardEl) {
                this.handleCardClick(cardEl, slide);
            }
        });
    }

    startGame(slide) {
        this.isGameStarted = true;
        this.isGameOver = false;
        this.selectedCards = [];
        this.matchedPairs = [];
        this.moves = 0;
        this.resetTimer();

        // Update UI controls
        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        const timerDiv = slide.querySelector(`#timer-${this.gameId}`);
        const scoreDiv = slide.querySelector(`#score-${this.gameId}`);
        const movesContainer = slide.querySelector(`#moves-${this.gameId}__container`);
        const resetBtn = slide.querySelector(`#reset-btn-${this.gameId}`);
        const movesSpan = slide.querySelector(`#moves-${this.gameId}`);
        const gameContainer = slide.querySelector(`#game-container-${this.gameId}`);

        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        timerDiv.style.display = 'inline-block';
        scoreDiv.style.display = 'inline-block';
        if (movesContainer) movesContainer.style.display = 'inline-block';
        if (resetBtn) resetBtn.style.display = 'inline-block';
        if (movesSpan) movesSpan.textContent = '0';

        // Render grid into container
        gameContainer.innerHTML = `
            <div id="game-grid-${this.gameId}" class="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 max-w-4xl w-full">
                ${this.renderGameCards()}
            </div>
        `;

        // Start timer
        this.startTimer(slide);
    }

    restartGame(slide) {
        this.stopTimer();
        this.isGameStarted = false;
        this.isGameOver = false;

        // Recreate data
        this.words = GameUtils.selectRandomWords(this.categoryWords, this.maxWords);
        this.gameData = this.createGameData(this.words);

        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        const timerDiv = slide.querySelector(`#timer-${this.gameId}`);
        const scoreDiv = slide.querySelector(`#score-${this.gameId}`);
        const scoreValueSpan = slide.querySelector(`#score-value-${this.gameId}`);
        const movesContainer = slide.querySelector(`#moves-${this.gameId}__container`);
        const movesSpan = slide.querySelector(`#moves-${this.gameId}`);
        const resetBtn = slide.querySelector(`#reset-btn-${this.gameId}`);

        startBtn.style.display = 'inline-block';
        restartBtn.style.display = 'none';
        timerDiv.style.display = 'none';
        scoreDiv.style.display = 'none';
        if (movesContainer) movesContainer.style.display = 'none';
        if (resetBtn) resetBtn.style.display = 'none';
        scoreValueSpan.textContent = `${this.matchedPairs.length}/${this.words.length}`;
        if (movesSpan) movesSpan.textContent = '0';

        const gameContainer = slide.querySelector(`#game-container-${this.gameId}`);
        gameContainer.innerHTML = this.renderWelcomeScreen();
    }

    handleCardClick(cardElement, slide) {
        if (!this.isGameStarted || this.isGameOver) return;
        if (cardElement.classList.contains('card-matched') || cardElement.classList.contains('card-flipped')) return;
        if (this.selectedCards.length >= 2) return;

        cardElement.classList.add('card-flipped');
        this.selectedCards.push(cardElement);

        if (this.selectedCards.length === 2) {
            this.moves++;
            const movesSpan = slide.querySelector(`#moves-${this.gameId}`);
            if (movesSpan) movesSpan.textContent = String(this.moves);
            setTimeout(() => this.checkMatch(slide), 700);
        }
    }

    checkMatch(slide) {
        const [card1, card2] = this.selectedCards;
        const idx1 = parseInt(card1.dataset.cardIndex);
        const idx2 = parseInt(card2.dataset.cardIndex);
        const data1 = this.gameData[idx1];
        const data2 = this.gameData[idx2];

        const scoreValueSpan = slide.querySelector(`#score-value-${this.gameId}`);

        if (data1.id === data2.id && data1.type !== data2.type) {
            // Correct
            this.handleCorrectMatch(card1, card2);
            this.matchedPairs.push(data1.id);
            scoreValueSpan.textContent = `${this.matchedPairs.length}/${this.words.length}`;

            if (this.matchedPairs.length === this.words.length) {
                this.handleGameWin(slide);
            }
        } else {
            // Wrong -> hide again
            this.handleWrongMatch(card1, card2);
        }

        this.selectedCards = [];
    }

    handleCorrectMatch(card1, card2) {
        card1.classList.add('card-matched');
        card2.classList.add('card-matched');
    }

    handleWrongMatch(card1, card2) {
        // Add flipping-back class for smooth animation
        card1.classList.add('flipping-back');
        card2.classList.add('flipping-back');
        
        setTimeout(() => {
            card1.classList.remove('card-flipped', 'flipping-back');
            card2.classList.remove('card-flipped', 'flipping-back');
        }, 500);
    }

    handleGameWin(slide) {
        this.isGameOver = true;
        this.stopTimer();
        setTimeout(() => this.showCelebration(
            'Excellent Memory!',
            `You matched all ${this.words.length} pairs!`
        ), 500);
    }
}

// Export to window for manager usage if needed
window.MemoryGame = MemoryGame;
