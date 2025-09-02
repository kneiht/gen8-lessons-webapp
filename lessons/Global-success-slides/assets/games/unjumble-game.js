/**
 * Unjumble Game - Drag & drop words to rebuild the English sentence
 * Uses example_sentence_en from vocabulary data. Shows Vietnamese hint.
 */

class UnjumbleGame extends GameBase {
    constructor() {
        super('Unjumble - Arrange sentence from words', 8);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.gameQuestions = [];
        this.isAnswering = false;
        this.boundKeyHandler = null;
    }

    getGameInfo() {
        return {
            name: 'Unjumble - Arrange Sentence',
            description: 'Kéo thả các từ để sắp xếp thành câu đúng',
            icon: '🧩'
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
                <h2 class="text-md md:text-xl font-bold text-indigo-700 text-center">
                    Unjumble - ${categoryName}
                </h2>

                ${UIComponents.createGameControls(this.gameId, this.words.length)}

                <div class="flex-1 flex items-center justify-center">
                    <div id="game-container-${this.gameId}" class="max-w-4xl w-full">
                        ${this.renderWelcomeScreen()}
                    </div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .question-card { animation: slideInFromRight 0.5s ease; }
            @keyframes slideInFromRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            .word-chip { display:inline-flex; align-items:center; justify-content:center; padding:8px 12px; border-radius:999px; border:2px solid #e5e7eb; background:#f9fafb; font-weight:700; color:#111827; cursor:grab; user-select:none; }
            .word-chip:active { cursor:grabbing; }
            .bank, .answer { min-height:64px; border:2px dashed #c7d2fe; background:#eef2ff; border-radius:12px; padding:10px; display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:center; }
            .drop-hover { background:#e0e7ff; }
            .disabled-area { pointer-events:none; opacity:0.8; }
        `;
        slide.appendChild(style);

        this.setupEventListeners(slide);

        return slide;
    }

    createGameQuestions(words) {
        const questions = [];
        words.forEach(word => {
            const en = (word.example_sentence_en || '').toString().trim();
            const vi = (word.example_sentence_vi || '').toString().trim();
            if (!en) return; // skip if no example sentence
            const tokens = this.tokenize(en);
            const scrambled = GameUtils.shuffleArray(tokens);
            questions.push({
                vietnamese: vi || word.vietnamese_meaning || '',
                englishTokens: tokens,
                scrambledTokens: scrambled,
            });
        });
        return GameUtils.shuffleArray(questions);
    }

    tokenize(sentence) {
        // Simple tokenization by spaces; keep punctuation attached to tokens as is
        return sentence.split(/\s+/).filter(Boolean);
    }

    renderWelcomeScreen() {
        return `
            <div class="text-center bg-white rounded-xl shadow-lg p-8">
                <div class="text-6xl mb-4">${this.getGameInfo().icon}</div>
                <h3 class="text-2xl font-bold text-indigo-700 mb-4">Unjumble Game</h3>
                <p class="text-gray-600 mb-6">
                    Bạn sẽ có ${this.words.length} câu. Kéo thả từ để tạo câu đúng.
                </p>
                <div class="text-sm text-gray-500">
                    Click "▶️ Start Game" để bắt đầu!
                </div>
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

                <div class="flex flex-col gap-4 items-center">
                    <div class="text-lg text-gray-700">
                        <span class="inline-block bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full">${q.vietnamese}</span>
                    </div>
                    <div id="answer-${this.gameId}" class="answer" data-drop-zone="answer"></div>
                    <div id="bank-${this.gameId}" class="bank" data-drop-zone="bank">
                        ${q.scrambledTokens.map((t, idx) => `
                            <span class="word-chip" draggable="true" data-token-idx="${idx}" data-token="${t}">${t}</span>
                        `).join('')}
                    </div>
                    <div class="flex gap-2">
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

        // Click handlers
        slide.addEventListener('click', (e) => {
            const clearBtn = e.target.closest(`[id="clear-answer-btn-${this.gameId}"]`);
            if (clearBtn && !this.isAnswering) {
                this.clearCurrent(slide);
                return;
            }
            const submitBtn = e.target.closest(`[id="submit-answer-btn-${this.gameId}"]`);
            if (submitBtn && !this.isAnswering) {
                this.submit(slide);
                return;
            }
            const nextBtn = e.target.closest(`[id="next-question-btn-${this.gameId}"]`);
            if (nextBtn) {
                this.nextQuestion(slide);
            }
        });

        // Drag & Drop handlers (event delegation)
        slide.addEventListener('dragstart', (e) => {
            const chip = e.target.closest('.word-chip');
            if (!chip || this.isAnswering) return;
            e.dataTransfer.setData('text/plain', chip.dataset.token || '');
            e.dataTransfer.setData('application/x-source', chip.parentElement.id);
            chip.classList.add('dragging');
        });
        slide.addEventListener('dragend', (e) => {
            const chip = e.target.closest('.word-chip');
            if (chip) chip.classList.remove('dragging');
        });
        slide.addEventListener('dragover', (e) => {
            const zone = e.target.closest(`[id="answer-${this.gameId}"], [id="bank-${this.gameId}"]`);
            if (!zone || this.isAnswering) return;
            e.preventDefault();
            zone.classList.add('drop-hover');
        });
        slide.addEventListener('dragleave', (e) => {
            const zone = e.target.closest(`[id="answer-${this.gameId}"], [id="bank-${this.gameId}"]`);
            if (zone) zone.classList.remove('drop-hover');
        });
        slide.addEventListener('drop', (e) => {
            const zone = e.target.closest(`[id="answer-${this.gameId}"], [id="bank-${this.gameId}"]`);
            if (!zone || this.isAnswering) return;
            e.preventDefault();
            const dragging = slide.querySelector('.word-chip.dragging');
            if (dragging) {
                const insertIndex = this.computeInsertionIndex(zone, e.clientX);
                const children = Array.from(zone.querySelectorAll('.word-chip'));
                if (insertIndex >= 0 && insertIndex < children.length) {
                    zone.insertBefore(dragging, children[insertIndex]);
                } else {
                    zone.appendChild(dragging);
                }
                dragging.classList.remove('dragging');
            }
            zone.classList.remove('drop-hover');
        });

        // Global Enter handler
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
        }
        this.boundKeyHandler = (e) => {
            if (e.key !== 'Enter' || !this.isGameStarted) return;
            if (!this.isAnswering) {
                e.preventDefault();
                this.submit(slide);
            } else {
                e.preventDefault();
                this.nextQuestion(slide);
            }
        };
        document.addEventListener('keydown', this.boundKeyHandler);
    }

    computeInsertionIndex(container, clientX) {
        const chips = Array.from(container.querySelectorAll('.word-chip'));
        if (chips.length === 0) return 0;
        let closestIndex = chips.length;
        let minDistance = Infinity;
        chips.forEach((chip, index) => {
            const rect = chip.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            const distance = Math.abs(clientX - midX);
            if (clientX < midX && distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });
        return closestIndex;
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
    }

    submit(slide) {
        if (this.isAnswering) return;
        this.isAnswering = true;
        const feedback = slide.querySelector(`[id="feedback-${this.gameId}"]`);
        const q = this.gameQuestions[this.currentQuestionIndex];
        const answerZone = slide.querySelector(`[id="answer-${this.gameId}"]`);
        const tokens = Array.from(answerZone.querySelectorAll('.word-chip')).map(el => (el.textContent || '').trim());

        const isCorrect = this.compareTokens(tokens, q.englishTokens);

        if (isCorrect) {
            this.score++;
            feedback.innerHTML = `<span class="text-green-600 font-semibold">✅ Chính xác!</span>`;
        } else {
            feedback.innerHTML = `<span class="text-red-600 font-semibold">❌ Sai.</span>`;
        }

        const scoreValueSpan = slide.querySelector(`[id="score-value-${this.gameId}"]`);
        scoreValueSpan.textContent = `${this.score}/${this.words.length}`;

        setTimeout(() => {
            const nextBtn = slide.querySelector(`[id="next-question-btn-${this.gameId}"]`);
            nextBtn.style.display = 'inline-block';
            const areaAnswer = slide.querySelector(`[id="answer-${this.gameId}"]`);
            const areaBank = slide.querySelector(`[id="bank-${this.gameId}"]`);
            areaAnswer.classList.add('disabled-area');
            areaBank.classList.add('disabled-area');
        }, 400);
    }

    compareTokens(userTokens, correctTokens) {
        if (userTokens.length !== correctTokens.length) return false;
        for (let i = 0; i < userTokens.length; i++) {
            if (this.normalize(userTokens[i]) !== this.normalize(correctTokens[i])) return false;
        }
        return true;
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
            .trim();
    }

    clearCurrent(slide) {
        const answer = slide.querySelector(`[id="answer-${this.gameId}"]`);
        const bank = slide.querySelector(`[id="bank-${this.gameId}"]`);
        Array.from(answer.querySelectorAll('.word-chip')).forEach(chip => bank.appendChild(chip));
        const feedback = slide.querySelector(`[id="feedback-${this.gameId}"]`);
        feedback.textContent = '';
    }
}

// Export
window.UnjumbleGame = UnjumbleGame;


