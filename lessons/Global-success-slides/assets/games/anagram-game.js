/**
 * Anagram Game - Xáo trộn chữ cái (gợi ý tiếng Việt), gõ từ tiếng Anh đúng
 */

class AnagramGame extends GameBase {
    constructor() {
        super('Anagram', 10);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.gameQuestions = [];
        this.isAnswering = false;
        this.boundKeyHandler = null;
    }

    getGameInfo() {
        return {
            name: 'Anagram',
            description: 'Xáo trộn chữ cái. Gợi ý tiếng Việt, gõ từ tiếng Anh đúng',
            icon: '🔤'
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
                    Anagram - ${categoryName}
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
            .anagram-letter { display:inline-flex; align-items:center; justify-content:center; width:42px; height:42px; border-radius:8px; border:2px solid #e5e7eb; background:#f9fafb; font-weight:700; color:#111827; cursor:pointer; }
            .anagram-letter.used { opacity: 0.4; pointer-events: none; }
            .answer-area { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
            .answer-slot { width:42px; height:42px; border-radius:8px; border:2px dashed #c7d2fe; background:#eef2ff; display:flex; align-items:center; justify-content:center; font-weight:700; color:#1f2937; cursor:pointer; }
            .answer-slot.filled { border-style: solid; }
            .question-card { animation: slideInFromRight 0.5s ease; }
            @keyframes slideInFromRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            .disabled-area { pointer-events:none; opacity:0.8; }
        `;
        slide.appendChild(style);

        // Setup listeners
        this.setupEventListeners(slide);

        return slide;
    }

    createGameQuestions(words) {
        const questions = [];
        words.forEach(word => {
            const correct = (word.english_word || '').toString();
            const scrambled = this.scrambleWord(correct);
            questions.push({
                vietnamese: word.vietnamese_meaning,
                correct,
                scrambled
            });
        });
        return GameUtils.shuffleArray(questions);
    }

    scrambleWord(word) {
        const letters = word.split('');
        // Keep scrambling until different from original (if possible)
        let scrambled = letters;
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        scrambled = letters.join('');
        if (scrambled.toLowerCase() === word.toLowerCase()) {
            // swap first two letters if same
            if (letters.length > 1) {
                [letters[0], letters[1]] = [letters[1], letters[0]];
                scrambled = letters.join('');
            }
        }
        return scrambled;
    }

    renderWelcomeScreen() {
        return `
            <div class="text-center bg-white rounded-xl shadow-lg p-8">
                <div class="text-6xl mb-4">${this.getGameInfo().icon}</div>
                <h3 class="text-2xl font-bold text-indigo-700 mb-4">Anagram Game</h3>
                <p class="text-gray-600 mb-6">
                    Bạn sẽ có ${this.words.length} câu hỏi.<br>
                    Xem gợi ý tiếng Việt và sắp xếp chữ cái để gõ từ tiếng Anh đúng.
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

                <div class="flex flex-col items-center gap-4 mb-3" id="anagram-area-${this.gameId}">
                    <div class="text-lg text-gray-700">
                        <span class="inline-block bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full">${question.vietnamese}</span>
                    </div>
                    <div class="answer-area" id="answer-area-${this.gameId}">
                        ${question.correct.split('').map((_, idx) => `<div class=\"answer-slot\" data-slot-idx=\"${idx}\"></div>`).join('')}
                    </div>
                    <div class="flex flex-wrap gap-2 justify-center" id="letters-bank-${this.gameId}">
                        ${question.scrambled.split('').map((ch, idx) => `<span class=\"anagram-letter\" data-letter-idx=\"${idx}\" data-letter=\"${ch}\">${ch.toUpperCase()}</span>`).join('')}
                    </div>
                    <div class="flex gap-2 w-full max-w-md justify-center">
                        <button id="clear-answer-btn-${this.gameId}" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg">Clear</button>
                        <button id="submit-answer-btn-${this.gameId}" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg">Submit</button>
                    </div>
                    <div id="feedback-${this.gameId}" class="text-sm"></div>
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
            // Letter bank -> fill next empty slot
            const letterEl = e.target.closest('.anagram-letter');
            if (letterEl && !letterEl.classList.contains('used') && !this.isAnswering) {
                const slots = Array.from(slide.querySelectorAll(`#answer-area-${this.gameId} .answer-slot`));
                const emptySlot = slots.find(s => !s.classList.contains('filled'));
                if (emptySlot) {
                    emptySlot.textContent = letterEl.dataset.letter.toUpperCase();
                    emptySlot.classList.add('filled');
                    emptySlot.setAttribute('data-source-idx', letterEl.dataset.letterIdx);
                    letterEl.classList.add('used');
                }
                return;
            }

            // Click on filled slot -> return letter back to bank
            const slotEl = e.target.closest('.answer-slot.filled');
            if (slotEl && !this.isAnswering) {
                const sourceIdx = slotEl.getAttribute('data-source-idx');
                const bankLetter = slide.querySelector(`#letters-bank-${this.gameId} .anagram-letter[data-letter-idx="${sourceIdx}"]`);
                if (bankLetter) bankLetter.classList.remove('used');
                slotEl.textContent = '';
                slotEl.classList.remove('filled');
                slotEl.removeAttribute('data-source-idx');
                return;
            }

            const submitBtn = e.target.closest(`[id="submit-answer-btn-${this.gameId}"]`);
            if (submitBtn && !this.isAnswering) {
                this.submitAnswer(slide);
            }

            const clearBtn = e.target.closest(`[id="clear-answer-btn-${this.gameId}"]`);
            if (clearBtn && !this.isAnswering) {
                this.clearCurrentAnswer(slide);
            }

            const nextBtn = e.target.closest(`[id="next-question-btn-${this.gameId}"]`);
            if (nextBtn) {
                this.nextQuestion(slide);
            }
        });

        // Global Enter handler
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
        }
        this.boundKeyHandler = (e) => {
            if (e.key !== 'Enter' || !this.isGameStarted) return;
            if (!this.isAnswering) {
                e.preventDefault();
                this.submitAnswer(slide);
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
        // focus is not needed for click-based assembly
    }

    submitAnswer(slide) {
        if (this.isAnswering) return;
        this.isAnswering = true;
        const feedback = slide.querySelector(`[id="feedback-${this.gameId}"]`);
        const question = this.gameQuestions[this.currentQuestionIndex];
        const slots = Array.from(slide.querySelectorAll(`#answer-area-${this.gameId} .answer-slot`));
        const userAnswer = slots.map(s => (s.textContent || '').trim()).join('');
        const isCorrect = this.normalize(userAnswer) === this.normalize(question.correct);

        if (isCorrect) {
            this.score++;
            slots.forEach(s => { s.classList.add('correct'); });
            feedback.innerHTML = `<span class="text-green-600 font-semibold">✅ Chính xác!</span>`;
        } else {
            slots.forEach(s => { s.classList.add('wrong'); });
            feedback.innerHTML = `<span class="text-red-600 font-semibold">❌ Sai. Đáp án đúng: <span class="underline">${question.correct}</span></span>`;
        }

        const scoreValueSpan = slide.querySelector(`[id="score-value-${this.gameId}"]`);
        scoreValueSpan.textContent = `${this.score}/${this.words.length}`;

        setTimeout(() => {
            const nextBtn = slide.querySelector(`[id="next-question-btn-${this.gameId}"]`);
            nextBtn.style.display = 'inline-block';
            const area = slide.querySelector(`#anagram-area-${this.gameId}`);
            if (area) area.classList.add('disabled-area');
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

    clearCurrentAnswer(slide) {
        const slots = Array.from(slide.querySelectorAll(`#answer-area-${this.gameId} .answer-slot.filled`));
        slots.forEach(slot => {
            const sourceIdx = slot.getAttribute('data-source-idx');
            const bankLetter = slide.querySelector(`#letters-bank-${this.gameId} .anagram-letter[data-letter-idx="${sourceIdx}"]`);
            if (bankLetter) bankLetter.classList.remove('used');
            slot.textContent = '';
            slot.classList.remove('filled');
            slot.removeAttribute('data-source-idx');
        });
        const feedback = slide.querySelector(`[id="feedback-${this.gameId}"]`);
        if (feedback) feedback.textContent = '';
    }
}

// Export
window.AnagramGame = AnagramGame;


