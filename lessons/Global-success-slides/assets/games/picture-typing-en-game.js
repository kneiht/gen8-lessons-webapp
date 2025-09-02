/**
 * Picture Typing Game - Nhìn hình + nghĩa tiếng Việt, gõ từ tiếng Anh
 */

class PictureTypingEnGame extends GameBase {
    constructor() {
        super('Picture Typing - Image + Vietnamese to English', 10);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.gameQuestions = [];
        this.isAnswering = false;
    }

    getGameInfo() {
        return {
            name: 'Picture Typing - Image + Vietnamese to English',
            description: 'Nhìn hình và nghĩa tiếng Việt, gõ từ tiếng Anh đúng',
            icon: '⌨️'
        };
    }

    createSlide(categoryWords, categoryName) {
        // Prepare data
        this.categoryWords = categoryWords;
        this.categoryName = categoryName;
        this.words = GameUtils.selectRandomWords(categoryWords, this.maxWords);
        this.gameQuestions = this.createGameQuestions(this.words);

        // Create slide container
        const slide = document.createElement('div');
        slide.className = 'slide content-box px-2 py-2 rounded-2xl w-full h-full flex flex-col';

        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-md md:text-xl font-bold text-indigo-700 text-center">
                    Picture Typing - ${categoryName}
                </h2>

                ${UIComponents.createGameControls(this.gameId, this.words.length)}

                <div class="flex-1 flex items-center justify-center">
                    <div id="game-container-${this.gameId}" class="max-w-3xl w-full">
                        ${this.renderWelcomeScreen()}
                    </div>
                </div>
            </div>
        `;

        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
            .answer-input { transition: all 0.2s ease; }
            .answer-input.correct { border-color: #16a34a; background-color: #ecfdf5; }
            .answer-input.wrong { border-color: #dc2626; background-color: #fef2f2; }
            .question-card { animation: slideInFromRight 0.5s ease; }
            @keyframes slideInFromRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `;
        slide.appendChild(style);

        // Setup listeners
        this.setupEventListeners(slide);

        return slide;
    }

    createGameQuestions(words) {
        const questions = [];
        words.forEach(word => {
            questions.push({
                image: word.image,
                vietnamese: word.vietnamese_meaning,
                correct: word.english_word
            });
        });
        return GameUtils.shuffleArray(questions);
    }

    renderWelcomeScreen() {
        return `
            <div class="text-center bg-white rounded-xl shadow-lg p-8">
                <div class="text-6xl mb-4">${this.getGameInfo().icon}</div>
                <h3 class="text-2xl font-bold text-indigo-700 mb-4">Picture Typing Game</h3>
                <p class="text-gray-600 mb-6">
                    Bạn sẽ có ${this.words.length} câu hỏi.<br>
                    Nhìn hình và nghĩa tiếng Việt, sau đó gõ từ tiếng Anh đúng.
                </p>
                <div class="text-sm text-gray-500">
                    Click "▶️ Start Game" để bắt đầu!
                </div>
            </div>
        `;
    }

    renderQuestion() {
        const question = this.gameQuestions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex + 1) / this.gameQuestions.length) * 100;

        const imagePath = typeof getImagePath === 'function' ? getImagePath(question.image) : question.image;

        return `
            <div class="question-card bg-white rounded-xl shadow-lg p-3 ">
                <div class="mb-6">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span class="bg-green-500 text-white font-semibold px-3 py-1 rounded-lg">Question ${this.currentQuestionIndex + 1} of ${this.gameQuestions.length}</span>
                        <div class="text-center ">
                            <button id="next-question-btn-${this.gameId}" 
                                    class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-3 py-1 rounded-lg transition-all duration-200"
                                    style="display: none;">
                                ${this.currentQuestionIndex < this.gameQuestions.length - 1 ? 'Next →' : 'Finish 🏁'}
                            </button>
                        </div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="flex flex-col lg:flex-row gap-6 mb-3 items-center justify-center">
                    <div class="text-center mb-0 lg:mb-0 lg:mr-8 flex-shrink-0">
                        <div class="rounded-xl border border-blue-200 overflow-hidden w-[340px] h-[220px] bg-gray-100" style="background-image:url('${imagePath}'); background-size: cover; background-position: center;"></div>
                    </div>
                    <div class="flex flex-col w-full max-w-md">
                        <div class="text-lg text-gray-700 mb-3 text-center lg:text-left">
                            <span class="inline-block bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full">${question.vietnamese}</span>
                        </div>
                        <div class="flex gap-2">
                            <input id="answer-input-${this.gameId}" type="text" class="answer-input flex-1 border-2 border-gray-200 rounded-lg p-2 md:p-3 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Gõ từ tiếng Anh..." autocomplete="off" />
                            <button id="submit-answer-btn-${this.gameId}" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-base md:text-lg">Submit</button>
                        </div>
                        <div id="feedback-${this.gameId}" class="mt-2 text-center lg:text-left text-sm"></div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners(slide) {
        const startBtn = slide.querySelector(`[id="start-btn-${this.gameId}"]`);
        const restartBtn = slide.querySelector(`[id="restart-btn-${this.gameId}"]`);

        startBtn.addEventListener('click', () => this.startGame(slide));
        restartBtn.addEventListener('click', () => this.restartGame(slide));

        slide.addEventListener('click', (e) => {
            const submitBtn = e.target.closest(`[id="submit-answer-btn-${this.gameId}"]`);
            if (submitBtn && !this.isAnswering) {
                this.submitAnswer(slide);
            }

            const nextBtn = e.target.closest(`[id="next-question-btn-${this.gameId}"]`);
            if (nextBtn) {
                this.nextQuestion(slide);
            }
        });

        // Global key handler so Enter works even when input is disabled or focus moves
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
        }
        this.boundKeyHandler = (e) => {
            if (e.key !== 'Enter' || !this.isGameStarted) return;
            const activeInput = slide.querySelector(`[id="answer-input-${this.gameId}"]`);
            if (!this.isAnswering) {
                if (activeInput) {
                    e.preventDefault();
                    this.submitAnswer(slide);
                }
            } else {
                e.preventDefault();
                this.nextQuestion(slide);
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

        const startBtn = slide.querySelector(`[id="start-btn-${this.gameId}"]`);
        const restartBtn = slide.querySelector(`[id="restart-btn-${this.gameId}"]`);
        const timerDiv = slide.querySelector(`[id="timer-${this.gameId}"]`);
        const scoreDiv = slide.querySelector(`[id="score-${this.gameId}"]`);

        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        timerDiv.style.display = 'inline-block';
        scoreDiv.style.display = 'inline-block';

        this.startTimer(slide);
        this.showCurrentQuestion(slide);
    }

    restartGame(slide) {
        this.stopTimer();
        this.isGameStarted = false;
        this.isGameOver = false;
        this.currentQuestionIndex = 0;
        this.score = 0;

        // Cleanup global key handler before reinitializing
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
            this.boundKeyHandler = null;
        }

        this.words = GameUtils.selectRandomWords(this.categoryWords, this.maxWords);
        this.gameQuestions = this.createGameQuestions(this.words);

        const startBtn = slide.querySelector(`[id="start-btn-${this.gameId}"]`);
        const restartBtn = slide.querySelector(`[id="restart-btn-${this.gameId}"]`);
        const timerDiv = slide.querySelector(`[id="timer-${this.gameId}"]`);
        const scoreDiv = slide.querySelector(`[id="score-${this.gameId}"]`);
        const scoreValueSpan = slide.querySelector(`[id="score-value-${this.gameId}"]`);

        startBtn.style.display = 'inline-block';
        restartBtn.style.display = 'none';
        timerDiv.style.display = 'none';
        scoreDiv.style.display = 'none';
        scoreValueSpan.textContent = `0/${this.words.length}`;

        const gameContainer = slide.querySelector(`[id="game-container-${this.gameId}"]`);
        gameContainer.innerHTML = this.renderWelcomeScreen();
    }

    showCurrentQuestion(slide) {
        const gameContainer = slide.querySelector(`[id="game-container-${this.gameId}"]`);
        gameContainer.innerHTML = this.renderQuestion();
        this.isAnswering = false;
        const input = slide.querySelector(`[id="answer-input-${this.gameId}"]`);
        if (input) setTimeout(() => input.focus(), 50);
    }

    submitAnswer(slide) {
        if (this.isAnswering) return;
        this.isAnswering = true;
        const input = slide.querySelector(`[id="answer-input-${this.gameId}"]`);
        const feedback = slide.querySelector(`[id="feedback-${this.gameId}"]`);
        const question = this.gameQuestions[this.currentQuestionIndex];
        const userAnswer = (input.value || '').trim();

        const isCorrect = this.normalize(userAnswer) === this.normalize(question.correct);

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
            feedback.innerHTML = `<span class="text-red-600 font-semibold">❌ Sai. Đáp án đúng: <span class="underline">${question.correct}</span></span>`;
        }

        const scoreValueSpan = slide.querySelector(`[id="score-value-${this.gameId}"]`);
        scoreValueSpan.textContent = `${this.score}/${this.words.length}`;

        setTimeout(() => {
            const nextBtn = slide.querySelector(`[id="next-question-btn-${this.gameId}"]`);
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

        // Cleanup global key handler on game end
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
            this.boundKeyHandler = null;
        }

        const percentage = Math.round((this.score / this.words.length) * 100);
        let message = `You scored ${this.score}/${this.words.length} (${percentage}%)`;
        let title = 'Game Complete!';

        if (percentage >= 90) {
            title = 'Excellent! 🌟';
        } else if (percentage >= 70) {
            title = 'Great Job! 👏';
        } else if (percentage >= 50) {
            title = 'Good Try! 👍';
        } else {
            title = 'Keep Practicing! 💪';
        }

        setTimeout(() => {
            this.showCelebration(title, message);
        }, 500);
    }

    normalize(text) {
        return (text || '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z]/g, '');
    }
}

// Export
window.PictureTypingEnGame = PictureTypingEnGame;


