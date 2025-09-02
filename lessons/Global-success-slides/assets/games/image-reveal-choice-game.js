/**
 * Image Reveal Choice Game - Ảnh bị che bởi lưới, mở ô sẽ trừ điểm, chọn từ tiếng Anh đúng
 */

class ImageRevealChoiceGame extends GameBase {
    constructor() {
        super('Image Reveal Choice', 8);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.gameQuestions = [];
        this.gridSize = 4; // 4x4 tiles
        this.revealedCount = 0;
    }

    getGameInfo() {
        return {
            name: 'Image Reveal Choice',
            description: 'Mở ô xem ảnh (mất điểm) và chọn từ tiếng Anh đúng',
            icon: '🖼️'
        };
    }

    createSlide(categoryWords, categoryName) {
        this.categoryWords = categoryWords;
        this.categoryName = categoryName;
        this.words = GameUtils.selectRandomWords(categoryWords, this.maxWords);
        this.gameQuestions = this.createGameQuestions(this.words);

        const slide = document.createElement('div');
        slide.className = 'slide content-box px-2 py-2 rounded-2xl w-full h-full flex flex-col';

        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-md md:text-xl font-bold text-indigo-700 text-center">Image Reveal - ${categoryName}</h2>
                ${UIComponents.createGameControls(this.gameId, this.words.length)}
                <div class="flex-1 flex items-center justify-center">
                    <div id="game-container-${this.gameId}" class="max-w-3xl w-full">
                        ${this.renderWelcomeScreen()}
                    </div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .question-card { animation: slideInFromRight 0.5s ease; }
            @keyframes slideInFromRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            .tile { background:#9ca3af; opacity:1; cursor:pointer; transition:opacity 0.2s ease; }
            .tile.revealed { opacity:0; pointer-events:none; }
            .choice { border:2px solid #e5e7eb; background:#f9fafb; border-radius:8px; padding:10px; cursor:pointer; text-align:center; }
            .choice.correct { border-color:#16a34a; background:#dcfce7; }
            .choice.wrong { border-color:#dc2626; background:#fee2e2; }
        `;
        slide.appendChild(style);

        this.setupEventListeners(slide);
        return slide;
    }

    createGameQuestions(words) {
        return GameUtils.shuffleArray(words.map(w => {
            const wrongs = GameUtils.shuffleArray(words.filter(x => x.english_word !== w.english_word)).slice(0, 3).map(x => x.english_word);
            const options = GameUtils.shuffleArray([w.english_word, ...wrongs]);
            return { image: w.image, correct: w.english_word, options };
        }));
    }

    renderWelcomeScreen() {
        return `
            <div class="text-center bg-white rounded-xl shadow-lg p-8">
                <div class="text-6xl mb-4">${this.getGameInfo().icon}</div>
                <h3 class="text-2xl font-bold text-indigo-700 mb-4">Image Reveal Choice</h3>
                <p class="text-gray-600 mb-6">Mỗi lần mở 1 ô sẽ trừ 1 điểm. Chọn từ đúng để ghi điểm tối đa.</p>
                <div class="text-sm text-gray-500">Click "▶️ Start Game" để bắt đầu!</div>
            </div>
        `;
    }

    renderQuestion() {
        const q = this.gameQuestions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex + 1) / this.gameQuestions.length) * 100;
        const imagePath = typeof getImagePath === 'function' ? getImagePath(q.image) : q.image;
        const grid = this.renderGrid();
        return `
            <div class="question-card bg-white rounded-xl shadow-lg p-3 ">
                <div class="mb-6">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span class="bg-green-500 text-white font-semibold px-3 py-1 rounded-lg">Question ${this.currentQuestionIndex + 1} of ${this.gameQuestions.length}</span>
                        <div>
                            <button id="next-question-btn-${this.gameId}" class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-3 py-1 rounded-lg" style="display:none;">${this.currentQuestionIndex < this.gameQuestions.length - 1 ? 'Next →' : 'Finish 🏁'}</button>
                        </div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" style="width:${progress}%"></div>
                    </div>
                </div>

                <div class="flex flex-col items-center gap-4 flex flex-col sm:flex-row">
                    <div class="px-2 relative w-[340px] h-[240px] rounded-xl overflow-hidden border border-blue-200" style="background-image:url('${imagePath}'); background-size:cover; background-position:center;">
                        ${grid}
                    </div>
                    <div class="grid grid-cols-2 gap-3 w-full max-w-md">
                        ${q.options.map(op => `<div class=\"choice\" data-option=\"${op}\">${op}</div>`).join('')}
                    </div>
                    <div id="feedback-${this.gameId}" class="text-sm"></div>
                </div>
            </div>
        `;
    }

    renderGrid() {
        const rows = this.gridSize;
        const cols = this.gridSize;
        const tileW = 100 / cols;
        const tileH = 100 / rows;
        let tiles = '';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                tiles += `<div class=\"tile absolute\" style=\"top:${r * tileH}%; left:${c * tileW}%; width:${tileW}%; height:${tileH}%;\" data-tile=\"${r}-${c}\"></div>`;
            }
        }
        return `<div class=\"absolute inset-0\">${tiles}</div>`;
    }

    setupEventListeners(slide) {
        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        startBtn.addEventListener('click', () => this.startGame(slide));
        restartBtn.addEventListener('click', () => this.restartGame(slide));

        slide.addEventListener('click', (e) => {
            const tile = e.target.closest('.tile');
            if (tile && !tile.classList.contains('revealed') && !this.isAnswering && this.isGameStarted) {
                tile.classList.add('revealed');
                this.revealedCount++;
            }
            const choice = e.target.closest('.choice');
            if (choice && this.isGameStarted && !this.isAnswering) {
                this.checkChoice(choice, slide);
            }
            const next = e.target.closest(`#next-question-btn-${this.gameId}`);
            if (next) this.nextQuestion(slide);
        });
    }

    startGame(slide) {
        this.isGameStarted = true;
        this.isGameOver = false;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.revealedCount = 0;
        this.resetTimer();

        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        const timerDiv = slide.querySelector(`#timer-${this.gameId}`);
        const scoreDiv = slide.querySelector(`#score-${this.gameId}`);
        const gameContainer = slide.querySelector(`#game-container-${this.gameId}`);

        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        timerDiv.style.display = 'inline-block';
        scoreDiv.style.display = 'inline-block';

        this.startTimer(slide);
        gameContainer.innerHTML = this.renderQuestion();
        this.updateScoreDisplay(slide);
    }

    restartGame(slide) {
        this.stopTimer();
        this.isGameStarted = false;
        this.isGameOver = false;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.revealedCount = 0;
        this.words = GameUtils.selectRandomWords(this.categoryWords, this.maxWords);
        this.gameQuestions = this.createGameQuestions(this.words);

        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        const timerDiv = slide.querySelector(`#timer-${this.gameId}`);
        const scoreDiv = slide.querySelector(`#score-${this.gameId}`);
        const scoreValueSpan = slide.querySelector(`#score-value-${this.gameId}`);
        const gameContainer = slide.querySelector(`#game-container-${this.gameId}`);

        startBtn.style.display = 'inline-block';
        restartBtn.style.display = 'none';
        timerDiv.style.display = 'none';
        scoreDiv.style.display = 'none';
        scoreValueSpan.textContent = `0/${this.words.length}`;
        gameContainer.innerHTML = this.renderWelcomeScreen();
    }

    updateScoreDisplay(slide) {
        const scoreValueSpan = slide.querySelector(`#score-value-${this.gameId}`);
        scoreValueSpan.textContent = `${this.score}/${this.words.length}`;
    }

    checkChoice(choiceEl, slide) {
        this.isAnswering = true;
        const q = this.gameQuestions[this.currentQuestionIndex];
        const selected = choiceEl.dataset.option;
        const feedback = slide.querySelector(`#feedback-${this.gameId}`);

        // Base points per question equals tiles count; subtract revealed tiles
        const maxPoints = this.gridSize * this.gridSize;
        const gained = Math.max(0, maxPoints - this.revealedCount);

        if (selected === q.correct) {
            this.score++;
            choiceEl.classList.add('correct');
            feedback.innerHTML = `<span class="text-green-600 font-semibold">✅ Chính xác! +${gained} điểm phụ</span>`;
        } else {
            choiceEl.classList.add('wrong');
            // Highlight correct
            const allChoices = slide.querySelectorAll('.choice');
            allChoices.forEach(c => { if (c.dataset.option === q.correct) c.classList.add('correct'); });
            feedback.innerHTML = `<span class="text-red-600 font-semibold">❌ Sai. Đáp án: <span class="underline">${q.correct}</span></span>`;
        }

        // Update display of base score (questions correct)
        this.updateScoreDisplay(slide);
        setTimeout(() => {
            const nextBtn = slide.querySelector(`#next-question-btn-${this.gameId}`);
            nextBtn.style.display = 'inline-block';
        }, 600);
    }

    nextQuestion(slide) {
        this.currentQuestionIndex++;
        this.revealedCount = 0;
        if (this.currentQuestionIndex < this.gameQuestions.length) {
            const gameContainer = slide.querySelector(`#game-container-${this.gameId}`);
            gameContainer.innerHTML = this.renderQuestion();
            this.isAnswering = false;
        } else {
            this.handleGameEnd(slide);
        }
    }

    handleGameEnd(slide) {
        this.isGameOver = true;
        this.stopTimer();
        const percentage = Math.round((this.score / this.words.length) * 100);
        let title = 'Game Complete!';
        if (percentage >= 90) title = 'Excellent! 🌟'; else if (percentage >= 70) title = 'Great Job! 👏'; else if (percentage >= 50) title = 'Good Try! 👍'; else title = 'Keep Practicing! 💪';
        setTimeout(() => this.showCelebration(title, `You answered ${this.score}/${this.words.length} correctly`), 500);
    }
}

window.ImageRevealChoiceGame = ImageRevealChoiceGame;


