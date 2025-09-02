/**
 * Multiple Choice Game - Trắc nghiệm 4 lựa chọn chọn nghĩa tiếng Việt cho từ tiếng Anh
 */

class MultipleChoiceViEnGame extends GameBase {
    constructor() {
        super('Multiple Choice Game - Vietnamese to English', 10);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.gameQuestions = [];
        this.selectedAnswer = null;
        this.isAnswering = false;
    }

    getGameInfo() {
        return {
            name: 'Multiple Choice Game - Vietnamese to English',
            description: 'Chọn từ tiếng Anh đúng cho nghĩa tiếng Việt',
            icon: '🇻🇳→🇬🇧'
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
                    Multiple Choice - ${categoryName}
                </h2>

                ${UIComponents.createGameControls(this.gameId, this.words.length)}

                <div class="flex-1 flex items-center justify-center">
                    <div id="game-container-${this.gameId}" class="max-w-2xl w-full">
                        ${this.renderWelcomeScreen()}
                    </div>
                </div>
            </div>
        `;

        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
            .choice-option {
                transition: all 0.3s ease;
            }
            .choice-option:hover {
                transform: translateX(8px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .choice-option.selected {
                border-color: #3b82f6;
                background-color: #dbeafe;
                transform: translateX(8px);
            }
            .choice-option.correct {
                border-color: #16a34a;
                background-color: #dcfce7;
                animation: correctPulse 0.6s ease;
            }
            .choice-option.wrong {
                border-color: #dc2626;
                background-color: #fee2e2;
                animation: wrongShake 0.6s ease;
            }
            .choice-option.disabled {
                pointer-events: none;
                opacity: 0.7;
            }
            @keyframes correctPulse {
                0%, 100% { transform: translateX(8px) scale(1); }
                50% { transform: translateX(8px) scale(1.05); }
            }
            @keyframes wrongShake {
                0%, 100% { transform: translateX(8px); }
                25% { transform: translateX(4px); }
                75% { transform: translateX(12px); }
            }
            .question-card {
                animation: slideInFromRight 0.5s ease;
            }
            @keyframes slideInFromRight {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        slide.appendChild(style);

        // Setup listeners
        this.setupEventListeners(slide);

        return slide;
    }

    createGameQuestions(words) {
        const questions = [];
        
        words.forEach(word => {
            // Tạo 3 đáp án sai từ các từ khác (tiếng Anh)
            const wrongAnswers = this.getRandomWrongAnswers(word, words, 3);
            const allOptions = [word.english_word, ...wrongAnswers];
            const shuffledOptions = GameUtils.shuffleArray(allOptions);
            
            questions.push({
                vietnamese: word.vietnamese_meaning,
                correct: word.english_word,
                options: shuffledOptions,
                image: word.image,
                pronunciation: word.pronunciation || ''
            });
        });

        return GameUtils.shuffleArray(questions);
    }

    getRandomWrongAnswers(correctWord, allWords, count) {
        const wrongOptions = allWords
            .filter(w => w.english_word !== correctWord.english_word)
            .map(w => w.english_word);
        
        return GameUtils.selectRandomWords(
            wrongOptions.map(word => ({ english_word: word })), 
            count
        ).map(w => w.english_word);
    }

    renderWelcomeScreen() {
        return `
            <div class="text-center bg-white rounded-xl shadow-lg p-8">
                <div class="text-6xl mb-4">${this.getGameInfo().icon}</div>
                <h3 class="text-2xl font-bold text-indigo-700 mb-4">Multiple Choice Game</h3>
                <p class="text-gray-600 mb-6">
                    Bạn sẽ có ${this.words.length} câu hỏi.<br>
                    Đọc nghĩa tiếng Việt và chọn từ tiếng Anh đúng.
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
                <!-- Progress Bar -->
                <div class="mb-6">
                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span class="bg-green-500 text-white font-semibold px-3 py-1 rounded-lg">Question ${this.currentQuestionIndex + 1} of ${this.gameQuestions.length}</span>
                        <!-- Next Button (hidden initially) -->
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

                <!-- Question -->
                <div class="flex flex-col lg:flex-row gap-3 items-center justify-center">
                    <div class="text-center mb-0 lg:mb-0 lg:mr-8 flex-shrink-0">
                        <h3 class="text-3xl font-bold text-blue-600 mb-2">${question.vietnamese}</h3>
                    </div>
                    <!-- Options -->
                    <div class="flex flex-col space-y-3 w-full max-w-md">
                        ${question.options.map((option, index) => `
                            <div class="choice-option bg-gray-50 border-2 border-gray-200 rounded-lg p-3 md:p-4 cursor-pointer text-center"
                                 data-option="${option}" data-index="${index}">
                                <span class="font-semibold text-gray-800">${option}</span>
                            </div>
                        `).join('')}
                    </div>
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
            const option = e.target.closest('.choice-option');
            if (option && !this.isAnswering) {
                this.handleOptionClick(option, slide);
            }

            const nextBtn = e.target.closest(`#next-question-btn-${this.gameId}`);
            if (nextBtn) {
                this.nextQuestion(slide);
            }
        });
    }

    startGame(slide) {
        this.isGameStarted = true;
        this.isGameOver = false;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.resetTimer();

        // Update UI controls
        const startBtn = slide.querySelector(`#start-btn-${this.gameId}`);
        const restartBtn = slide.querySelector(`#restart-btn-${this.gameId}`);
        const timerDiv = slide.querySelector(`#timer-${this.gameId}`);
        const scoreDiv = slide.querySelector(`#score-${this.gameId}`);

        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        timerDiv.style.display = 'inline-block';
        scoreDiv.style.display = 'inline-block';

        // Start timer
        this.startTimer(slide);

        // Show first question
        this.showCurrentQuestion(slide);
    }

    restartGame(slide) {
        this.stopTimer();
        this.isGameStarted = false;
        this.isGameOver = false;
        this.currentQuestionIndex = 0;
        this.score = 0;

        // Recreate questions
        this.words = GameUtils.selectRandomWords(this.categoryWords, this.maxWords);
        this.gameQuestions = this.createGameQuestions(this.words);

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

        const gameContainer = slide.querySelector(`#game-container-${this.gameId}`);
        gameContainer.innerHTML = this.renderWelcomeScreen();
    }

    showCurrentQuestion(slide) {
        const gameContainer = slide.querySelector(`#game-container-${this.gameId}`);
        gameContainer.innerHTML = this.renderQuestion();
        this.isAnswering = false;
        this.selectedAnswer = null;
    }

    handleOptionClick(optionElement, slide) {
        if (this.isAnswering) return;
        
        this.isAnswering = true;
        const selectedOption = optionElement.dataset.option;
        const question = this.gameQuestions[this.currentQuestionIndex];
        const isCorrect = selectedOption === question.correct;

        // Mark selected option
        optionElement.classList.add('selected');

        // Disable all options
        const allOptions = slide.querySelectorAll('.choice-option');
        allOptions.forEach(opt => opt.classList.add('disabled'));

        setTimeout(() => {
            if (isCorrect) {
                this.handleCorrectAnswer(optionElement, slide);
            } else {
                this.handleWrongAnswer(optionElement, slide, question.correct);
            }
        }, 300);
    }

    handleCorrectAnswer(optionElement, slide) {
        this.score++;
        optionElement.classList.remove('selected');
        optionElement.classList.add('correct');
        
        // Update score display
        const scoreValueSpan = slide.querySelector(`#score-value-${this.gameId}`);
        scoreValueSpan.textContent = `${this.score}/${this.words.length}`;

        // Show next button
        setTimeout(() => {
            const nextBtn = slide.querySelector(`#next-question-btn-${this.gameId}`);
            nextBtn.style.display = 'inline-block';
        }, 800);
    }

    handleWrongAnswer(optionElement, slide, correctAnswer) {
        optionElement.classList.remove('selected');
        optionElement.classList.add('wrong');

        // Highlight correct answer
        const allOptions = slide.querySelectorAll('.choice-option');
        allOptions.forEach(opt => {
            if (opt.dataset.option === correctAnswer) {
                opt.classList.add('correct');
            }
        });

        // Show next button
        setTimeout(() => {
            const nextBtn = slide.querySelector(`#next-question-btn-${this.gameId}`);
            nextBtn.style.display = 'inline-block';
        }, 1200);
    }

    nextQuestion(slide) {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.gameQuestions.length) {
            // Show next question
            this.showCurrentQuestion(slide);
        } else {
            // Game finished
            this.handleGameEnd(slide);
        }
    }

    handleGameEnd(slide) {
        this.isGameOver = true;
        this.stopTimer();

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
}

// Export to window for manager usage
window.MultipleChoiceViEnGame = MultipleChoiceViEnGame;