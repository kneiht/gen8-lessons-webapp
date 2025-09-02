/**
 * Listening Typing EN Game - Nghe từ và gõ lại từ tiếng Anh
 */

class ListeningTypingEnGame extends GameBase {
    constructor() {
        super('Listening Typing - English', 10);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.gameQuestions = [];
        this.isAnswering = false;
        this.boundKeyHandler = null;
    }

    getGameInfo() {
        return {
            name: 'Listening Typing - English',
            description: 'Nghe phát âm và gõ lại từ tiếng Anh',
            icon: '🔊'
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
                <h2 class="text-md md:text-xl font-bold text-indigo-700 text-center">Listening - ${categoryName}</h2>
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
            .answer-input { transition: all 0.2s ease; }
            .answer-input.correct { border-color:#16a34a; background:#ecfdf5; }
            .answer-input.wrong { border-color:#dc2626; background:#fef2f2; }
        `;
        slide.appendChild(style);

        this.setupEventListeners(slide);
        return slide;
    }

    createGameQuestions(words) {
        return GameUtils.shuffleArray(words.map(w => ({
            english: w.english_word,
            pronunciation: w.pronunciation || ''
        })));
    }

    renderWelcomeScreen() {
        return `
            <div class="text-center bg-white rounded-xl shadow-lg p-8">
                <div class="text-6xl mb-4">${this.getGameInfo().icon}</div>
                <h3 class="text-2xl font-bold text-indigo-700 mb-4">Listening & Typing</h3>
                <p class="text-gray-600 mb-6">Nghe phát âm và gõ lại từ tiếng Anh. Có ${this.words.length} câu.</p>
                <div class="text-sm text-gray-500">Click "▶️ Start Game" để bắt đầu!</div>
            </div>
        `;
    }

    renderQuestion() {
        const q = this.gameQuestions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex + 1) / this.gameQuestions.length) * 100;
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

                <div class="flex flex-col items-center gap-4">
                    <div class="flex gap-2">
                        <button id="play-audio-${this.gameId}" class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg">▶️ Nghe</button>
                        <button id="slow-audio-${this.gameId}" class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold px-4 py-2 rounded-lg">🐢 Chậm</button>
                    </div>
                    <div class="flex gap-2">
                        <input id="answer-input-${this.gameId}" type="text" class="answer-input flex-1 border-2 border-gray-200 rounded-lg p-2 md:p-3 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Gõ từ tiếng Anh..." autocomplete="off" />
                        <button id="submit-answer-btn-${this.gameId}" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-base md:text-lg">Submit</button>
                    </div>
                    <div id="feedback-${this.gameId}" class="mt-2 text-center lg:text-left text-sm"></div>
                </div>
            </div>
        `;
    }

    setupEventListeners(slide) {
        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        startBtn.addEventListener('click', () => this.startGame(slide));
        restartBtn.addEventListener('click', () => this.restartGame(slide));

        slide.addEventListener('click', (e) => {
            const play = e.target.closest(`#play-audio-${this.gameId}`);
            const slow = e.target.closest(`#slow-audio-${this.gameId}`);
            const submit = e.target.closest(`#submit-answer-btn-${this.gameId}`);
            const next = e.target.closest(`#next-question-btn-${this.gameId}`);
            if (play) this.playCurrentWord(1.0);
            if (slow) this.playCurrentWord(0.75);
            if (submit && !this.isAnswering) this.submitAnswer(slide);
            if (next) this.nextQuestion(slide);
        });

        if (this.boundKeyHandler) document.removeEventListener('keydown', this.boundKeyHandler);
        this.boundKeyHandler = (e) => {
            if (!this.isGameStarted) return;
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!this.isAnswering) this.submitAnswer(slide); else this.nextQuestion(slide);
            } else if (e.key === ' ') {
                e.preventDefault();
                this.playCurrentWord(1.0);
            }
        };
        document.addEventListener('keydown', this.boundKeyHandler);
    }

    startGame(slide) {
        this.isGameStarted = true;
        this.isGameOver = false;
        this.currentQuestionIndex = 0;
        this.score = 0;
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
        const input = slide.querySelector(`#answer-input-${this.gameId}`);
        setTimeout(() => { if (input) input.focus(); this.playCurrentWord(1.0); }, 150);
    }

    restartGame(slide) {
        this.stopTimer();
        this.isGameStarted = false;
        this.isGameOver = false;
        this.currentQuestionIndex = 0;
        this.score = 0;

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

    showCurrentQuestion(slide) {
        const gameContainer = slide.querySelector(`#game-container-${this.gameId}`);
        gameContainer.innerHTML = this.renderQuestion();
        this.isAnswering = false;
        const input = slide.querySelector(`#answer-input-${this.gameId}`);
        setTimeout(() => { if (input) input.focus(); }, 50);
    }

    submitAnswer(slide) {
        this.isAnswering = true;
        const input = slide.querySelector(`#answer-input-${this.gameId}`);
        const feedback = slide.querySelector(`#feedback-${this.gameId}`);
        const q = this.gameQuestions[this.currentQuestionIndex];
        const ans = (input.value || '').trim();
        const isCorrect = this.normalize(ans) === this.normalize(q.english);
        if (isCorrect) {
            this.score++;
            input.classList.remove('wrong');
            input.classList.add('correct');
            input.disabled = true;
            feedback.innerHTML = `<span class="text-green-600 font-semibold">✅ Chính xác!</span>`;
        } else {
            input.classList.remove('correct');
            input.classList.add('wrong');
            input.disabled = true;
            feedback.innerHTML = `<span class="text-red-600 font-semibold">❌ Sai. Đáp án: <span class="underline">${q.english}</span></span>`;
        }
        const scoreValueSpan = slide.querySelector(`#score-value-${this.gameId}`);
        scoreValueSpan.textContent = `${this.score}/${this.words.length}`;
        setTimeout(() => {
            const nextBtn = slide.querySelector(`#next-question-btn-${this.gameId}`);
            nextBtn.style.display = 'inline-block';
        }, 500);
    }

    nextQuestion(slide) {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.gameQuestions.length) {
            this.showCurrentQuestion(slide);
        } else {
            this.handleGameEnd(slide);
        }
    }

    handleGameEnd(slide) {
        this.isGameOver = true;
        this.stopTimer();
        if (this.boundKeyHandler) { document.removeEventListener('keydown', this.boundKeyHandler); this.boundKeyHandler = null; }
        const percentage = Math.round((this.score / this.words.length) * 100);
        let title = 'Game Complete!';
        if (percentage >= 90) title = 'Excellent! 🌟'; else if (percentage >= 70) title = 'Great Job! 👏'; else if (percentage >= 50) title = 'Good Try! 👍'; else title = 'Keep Practicing! 💪';
        setTimeout(() => this.showCelebration(title, `You scored ${this.score}/${this.words.length} (${percentage}%)`), 500);
    }

    playCurrentWord(rate = 1.0) {
        try {
            const q = this.gameQuestions[this.currentQuestionIndex];
            if (!q) return;
            const text = q.english;
            if (window.speechSynthesis) {
                const utter = new SpeechSynthesisUtterance(text);
                utter.lang = 'en-US';
                utter.rate = rate;
                // Try to reuse chosen voice if set on the page
                const enName = localStorage.getItem('tts_en_voice') || '';
                const voices = window.speechSynthesis.getVoices();
                const pick = voices.find(v => v.name === enName) || voices.find(v => (v.lang || '').toLowerCase().startsWith('en'));
                if (pick) utter.voice = pick;
                window.speechSynthesis.speak(utter);
            }
        } catch(e) { /* ignore */ }
    }

    normalize(text) {
        return (text || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
    }
}

window.ListeningTypingEnGame = ListeningTypingEnGame;


