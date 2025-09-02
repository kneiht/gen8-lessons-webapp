/**
 * Matching Game - Clean Implementation
 * Match English words with their Vietnamese meanings
 */

class MatchingGame extends GameBase {
    constructor() {
        super('Matching Game', 6);
        this.selectedCards = [];
        this.matchedPairs = [];
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
        this.categoryName = categoryName;
        this.words = GameUtils.selectRandomWords(categoryWords, this.maxWords);
        this.gameData = this.createGameData(this.words);
        
        // Create the slide HTML
        const slide = document.createElement('div');
        slide.className = 'slide content-box px-2 py-2 rounded-2xl w-full h-full';
        
        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-md md:text-xl font-bold text-indigo-700 text-center">
                    Matching Game - ${categoryName}
                </h2>
                
                ${UIComponents.createGameControls(this.gameId, this.words.length)}

                <!-- Game Area -->
                <div class="flex-1 flex items-center justify-center">
                    <div id="game-container-${this.gameId}" class="max-w-4xl w-full">
                        ${this.renderWelcomeScreen()}
                    </div>
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupEventListeners(slide);
        
        return slide;
    }

    renderWelcomeScreen() {
        return `
            <div class="text-center bg-white rounded-xl shadow-lg p-8">
                <div class="text-6xl mb-4">${this.getGameInfo().icon}</div>
                <h3 class="text-2xl font-bold text-indigo-700 mb-4">Matching Game</h3>
                <p class="text-gray-600 mb-6">
                    Bạn sẽ ghép ${this.words.length} cặp. Bấm Start để bắt đầu.
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
        return GameUtils.shuffleArray(cards);
    }

    renderGameCards() {
        return this.gameData.map((card, index) => 
            UIComponents.createGameCard(index, card, {
                disabled: true,
                text: '?'
            })
        ).join('');
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
        this.resetTimer();

        // Update UI
        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        const timerDiv = slide.querySelector(`#timer-${this.gameId}`);
        const scoreDiv = slide.querySelector(`#score-${this.gameId}`);
        const gameContainer = slide.querySelector(`#game-container-${this.gameId}`);

        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        timerDiv.style.display = 'inline-block';
        scoreDiv.style.display = 'inline-block';

        // Render and enable cards
        gameContainer.innerHTML = `
            <div id="game-grid-${this.gameId}" class="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 w-full">
                ${this.renderGameCards()}
            </div>
        `;
        const cards = slide.querySelectorAll('.game-card');
        cards.forEach((card, index) => {
            GameUtils.removeClassesWithTransition(card, ['opacity-50', 'pointer-events-none']);
            card.classList.add('hover:bg-blue-50');
            const cardText = card.querySelector('.card-text');
            cardText.textContent = this.gameData[index].text;
            cardText.className = 'card-text text-xs md:text-lg font-semibold text-gray-800';
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
        this.words = GameUtils.selectRandomWords(this.categoryWords, this.maxWords);
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

        // Show welcome screen again
        const gameContainer = slide.querySelector(`#game-container-${this.gameId}`);
        gameContainer.innerHTML = this.renderWelcomeScreen();
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
        }, 600);
    }

    handleGameWin(slide) {
        this.isGameOver = true;
        this.stopTimer();

        // Celebration effect
        setTimeout(() => this.showCelebration(
            'Excellent Work!',
            `You matched all ${this.words.length} pairs!`
        ), 500);
    }
}