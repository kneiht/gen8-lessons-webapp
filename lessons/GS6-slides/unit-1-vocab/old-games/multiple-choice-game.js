/**
 * Multiple Choice Game - Chọn nghĩa đúng của từ tiếng Anh
 */

class MultipleChoiceGame {
    constructor() {
        this.gameId = 'choice-game-' + Date.now();
        this.maxWords = 8;
        this.gameMode = 'en-to-vi'; // Default mode: English to Vietnamese
        this.gameModes = {
            'en-to-vi': {
                name: '',
                description: 'Chọn nghĩa tiếng Việt của từ tiếng Anh',
                icon: '🇬🇧→🇻🇳'
            },
            'vi-to-en': {
                name: '',
                description: 'Chọn từ tiếng Anh của nghĩa tiếng Việt',
                icon: '🇻🇳→🇬🇧'
            },
            'img-to-en': {
                name: '',
                description: 'Chọn từ tiếng Anh của hình ảnh',
                icon: '🖼️→🇬🇧'
            }
        };
    }

    getGameInfo() {
        return {
            name: 'Multiple Choice',
            description: '3 chế độ: English→Vietnamese, Vietnamese→English, Image→English',
            icon: '🎯'
        };
    }

    createSlide(categoryWords, categoryName) {
        const words = this.selectRandomWords(categoryWords, this.maxWords);

        const slide = document.createElement('div');
        slide.className = 'slide content-box px-5 py-2 rounded-2xl w-full h-full';
        
        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-xl font-bold text-indigo-700 text-center">
                    🎯 Multiple Choice - ${categoryName}
                </h2>

                
                <!-- Game Controls & Stats -->
                <!-- Container for game controls and info -->
                <div class="flex flex-col gap-3 sm:flex-row items-center justify-center mb-2">
                    <!-- Info row - full width on mobile, left side on desktop -->
                    <div class="grid grid-cols-2 gap-2 sm:gap-4 justify-center w-full sm:w-fit">
                        <div class="bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm">
                            🎯 <span id="current-question-${this.gameId}">1</span>/${words.length}
                        </div>
                        <div class="bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm">
                            ✅ <span id="score-display-${this.gameId}">0</span> đúng
                        </div>
                    </div>
                    
                    <!-- Controls row - full width on mobile, right side on desktop -->
                    <div class="grid grid-cols-2 gap-2 sm:gap-4 justify-center w-full sm:w-fit">
                        <select 
                            id="mode-select-${this.gameId}" 
                            class="mode-select px-4 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 shadow focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
                            onchange="window.choiceGame_${this.gameId.replace(/-/g, '_')}.changeMode(this.value)">
                            ${Object.entries(this.gameModes).map(([mode, info]) => `
                                <option value="${mode}" ${mode === this.gameMode ? 'selected' : ''}>
                                    ${info.icon} ${info.name}
                                </option>
                            `).join('')}
                        </select>
                        <button onclick="window.choiceGame_${this.gameId.replace(/-/g, '_')}.resetGame()" 
                                class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-1.5 rounded-full shadow-lg transition-all duration-200 text-sm">
                            🔄
                        </button>
                    </div>
                </div>
                
                <div id="question-card-${this.gameId}" class="flex-1 max-w-4xl mx-auto w-full">
                    ${this.generateCurrentQuestionHTML(words[0], categoryWords, 0)}
                </div>
                </div>
            </div>
        `;

        // Add custom styles for better animations
        const style = document.createElement('style');
        style.textContent = `
            .choice-option.selected {
                border-color: #4f46e5 !important;
                background: linear-gradient(135deg, #e0e7ff, #c7d2fe) !important;
                transform: scale(1.02);
                box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
            }
            .choice-option.correct {
                border-color: #16a34a !important;
                background: linear-gradient(135deg, #dcfce7, #bbf7d0) !important;
                color: #15803d !important;
            }
            .choice-option.incorrect {
                border-color: #dc2626 !important;
                background: linear-gradient(135deg, #fecaca, #fca5a5) !important;
                color: #dc2626 !important;
            }
            .choice-option:disabled {
                cursor: not-allowed;
                opacity: 0.7;
            }
            .mode-btn.active {
                background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
            }
            @keyframes hintReveal {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .hint-revealed {
                animation: hintReveal 0.3s ease-out;
            }
            .image-question img {
                transition: all 0.3s ease;
            }
            .image-question img:hover {
                transform: scale(1.05);
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }
            .nav-button:disabled {
                cursor: not-allowed !important;
                opacity: 0.5 !important;
                transform: none !important;
            }
            .nav-button:disabled:hover {
                transform: none !important;
            }
        `;
        slide.appendChild(style);

        window[`choiceGame_${this.gameId.replace(/-/g, '_')}`] = {
            words: words,
            categoryWords: categoryWords,
            score: 0,
            currentQuestion: 0, // 0-based index
            totalAnswered: 0,
            answers: new Array(words.length).fill(null), // Store answers for each question
            selectOption: (button, questionIndex) => this.selectOption(button, questionIndex),
            checkCurrentAnswer: () => this.checkCurrentAnswer(),
            nextQuestion: () => this.nextQuestion(),
            previousQuestion: () => this.previousQuestion(),
            resetGame: () => this.resetGame(),
            changeMode: (mode) => this.changeMode(mode),
            toggleHint: (questionIndex) => this.toggleHint(questionIndex),
            showSummary: () => this.showSummary()
        };

        return slide;
    }

    selectRandomWords(words, maxCount) {
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(maxCount, words.length));
    }

    generateCurrentQuestionHTML(word, categoryWords, index) {
        const options = this.createOptions(word, categoryWords);
        return this.generateQuestionHTML(word, options, index);
    }

    generateQuestionHTML(word, options, index) {
        const questionContent = this.getQuestionContent(word);
        const correctAnswer = this.getCorrectAnswer(word);
        
        return `
            <div class="choice-item bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300">
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full shadow-sm">
                            Câu ${index + 1}
                        </span>
                        <button onclick="window.choiceGame_${this.gameId.replace(/-/g, '_')}.checkCurrentAnswer()"
                                id="check-btn-${this.gameId}"
                                class="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-lg hover:from-green-600 hover:to-green-700 hover:scale-105 transition-all duration-300 text-sm">
                            ✅
                        </button>
                        <div class="flex gap-2">
                            <button onclick="window.choiceGame_${this.gameId.replace(/-/g, '_')}.previousQuestion()" 
                                    id="prev-btn-${this.gameId}"
                                    class="nav-button bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold px-3 py-1.5 rounded-full shadow-lg transition-all duration-300 cursor-not-allowed opacity-50 text-sm"
                                    disabled>
                                ←
                            </button>
                            
                            <button onclick="window.choiceGame_${this.gameId.replace(/-/g, '_')}.nextQuestion()" 
                                    id="next-btn-${this.gameId}"
                                    class="nav-button bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-lg transition-all duration-300 opacity-50 cursor-not-allowed text-sm"
                                    disabled>
                                →
                            </button>
                        </div>
                    </div>
                    

                    
                    <div class="text-center mb-6 ${this.gameMode === 'img-to-en' ? 'p-2' : 'p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg'}">
                        ${questionContent}
                        ${this.gameMode === 'img-to-en' && word.image ? this.getHintButton(index) : ''}
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${options.map((option, optIndex) => `
                        <button class="choice-option p-4 text-left border-2 border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 hover:scale-105 transition-all duration-300 shadow-sm"
                                data-correct="${option === correctAnswer}"
                                onclick="window.choiceGame_${this.gameId.replace(/-/g, '_')}.selectOption(this, ${index})">
                            <span class="font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full text-xs mr-3">${String.fromCharCode(65 + optIndex)}</span>
                            <span class="font-medium text-gray-700">${option}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getQuestionContent(word) {
        switch (this.gameMode) {
            case 'en-to-vi':
                return `
                    <div class="text-4xl font-bold text-blue-600 mb-2">${word.english_word}</div>
                    <div class="text-lg text-gray-600 font-medium">[${word.pronunciation || ''}]</div>
                `;
            case 'vi-to-en':
                return `
                    <div class="text-3xl font-bold text-green-600 mb-2">${word.vietnamese_meaning}</div>
                    <div class="text-sm text-gray-500">Chọn từ tiếng Anh tương ứng</div>
                `;
            case 'img-to-en':
                return word.image ? `
                    <div class="relative inline-block image-question">
                        <img src="${word.image}" alt="${word.english_word}" 
                             class="w-48 h-48 object-cover rounded-lg shadow-md mx-auto mb-2 border-2 border-gray-200">
                    </div>
                    <div id="hint-${this.gameId}-${word.english_word.replace(/[^a-zA-Z0-9]/g, '_')}" class="hidden mt-2 text-lg font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-full inline-block">
                        💡 ${word.vietnamese_meaning}
                    </div>
                ` : `
                    <div class="text-3xl font-bold text-purple-600 mb-2">${word.vietnamese_meaning}</div>
                    <div class="text-sm text-gray-500">Không có hình ảnh - Chọn từ tiếng Anh</div>
                `;
        }
    }

    getHintButton(index) {
        return `
            <div class="mt-3">
                <button onclick="window.choiceGame_${this.gameId.replace(/-/g, '_')}.toggleHint(${index})" 
                        class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-full transition-all duration-200 text-sm shadow-lg">
                    💡 Show Hint
                </button>
            </div>
        `;
    }

    getCorrectAnswer(word) {
        switch (this.gameMode) {
            case 'en-to-vi':
                return word.vietnamese_meaning;
            case 'vi-to-en':
            case 'img-to-en':
                return word.english_word;
        }
    }

    createOptions(correctWord, allWords) {
        let correctAnswer, otherWords, getOptionValue;
        
        switch (this.gameMode) {
            case 'en-to-vi':
                correctAnswer = correctWord.vietnamese_meaning;
                otherWords = allWords.filter(w => w.vietnamese_meaning !== correctWord.vietnamese_meaning);
                getOptionValue = (word) => word.vietnamese_meaning;
                break;
            case 'vi-to-en':
            case 'img-to-en':
                correctAnswer = correctWord.english_word;
                otherWords = allWords.filter(w => w.english_word !== correctWord.english_word);
                getOptionValue = (word) => word.english_word;
                break;
        }
        
        const options = [correctAnswer];
        
        // Add 3 wrong options
        while (options.length < 4 && otherWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherWords.length);
            const wrongOption = getOptionValue(otherWords[randomIndex]);
            if (!options.includes(wrongOption)) {
                options.push(wrongOption);
            }
            otherWords.splice(randomIndex, 1);
        }
        
        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    }

    selectOption(button, questionIndex) {
        const gameInstance = window[`choiceGame_${this.gameId.replace(/-/g, '_')}`];
        const item = button.closest('.choice-item');
        const options = item.querySelectorAll('.choice-option');
        
        // Remove previous selection
        options.forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Highlight selected
        button.classList.add('selected');
        
        // Store selection in answers array
        gameInstance.answers[gameInstance.currentQuestion] = {
            selectedOption: button.textContent.trim(),
            isCorrect: button.dataset.correct === 'true',
            answered: true
        };
        
        // Enable check button
        const checkButton = document.getElementById(`check-btn-${this.gameId}`);
        checkButton.disabled = false;
        checkButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    checkCurrentAnswer() {
        const gameInstance = window[`choiceGame_${this.gameId.replace(/-/g, '_')}`];
        const currentIndex = gameInstance.currentQuestion;
        const answer = gameInstance.answers[currentIndex];
        
        if (!answer || !answer.answered) {
            return;
        }
        
        const item = document.querySelector('.choice-item');
        const options = item.querySelectorAll('.choice-option');
        
        // Show correct/incorrect styling for all options
        options.forEach(option => {
            option.disabled = true;
            if (option.dataset.correct === 'true') {
                option.classList.add('correct');
            } else if (option.classList.contains('selected') && option.dataset.correct === 'false') {
                option.classList.add('incorrect');
            }
        });
        
        // Update score if this question hasn't been checked before
        if (!answer.checked) {
            answer.checked = true;
            if (answer.isCorrect) {
                gameInstance.score++;
            }
        }
        
        // Update score display
        document.getElementById(`score-display-${this.gameId}`).textContent = gameInstance.score;
        
        // Hide check button and enable next button
        const checkButton = document.getElementById(`check-btn-${this.gameId}`);
        checkButton.style.display = 'none';
        const nextButton = document.getElementById(`next-btn-${this.gameId}`);
        nextButton.disabled = false;
        nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        
        // Check if this is the last question
        if (currentIndex === gameInstance.words.length - 1) {
            nextButton.innerHTML = '🏆';
            nextButton.onclick = () => window[`choiceGame_${this.gameId.replace(/-/g, '_')}`].showSummary();
        }
    }

    nextQuestion() {
        const gameInstance = window[`choiceGame_${this.gameId.replace(/-/g, '_')}`];
        
        if (gameInstance.currentQuestion < gameInstance.words.length - 1) {
            gameInstance.currentQuestion++;
            this.updateQuestionDisplay();
            this.updateNavigationButtons();
        } else {
            this.showSummary();
        }
    }

    previousQuestion() {
        const gameInstance = window[`choiceGame_${this.gameId.replace(/-/g, '_')}`];
        
        if (gameInstance.currentQuestion > 0) {
            gameInstance.currentQuestion--;
            this.updateQuestionDisplay();
            this.updateNavigationButtons();
        }
    }

    updateQuestionDisplay() {
        const gameInstance = window[`choiceGame_${this.gameId.replace(/-/g, '_')}`];
        const currentIndex = gameInstance.currentQuestion;
        const word = gameInstance.words[currentIndex];
        
        // Update question card
        const questionCard = document.getElementById(`question-card-${this.gameId}`);
        questionCard.innerHTML = this.generateCurrentQuestionHTML(word, gameInstance.categoryWords, currentIndex);
        
        // Update current question number
        document.getElementById(`current-question-${this.gameId}`).textContent = currentIndex + 1;
        
        // Update question state
        const answer = gameInstance.answers[currentIndex];
        
        if (answer && answer.checked) {
            // Question already answered and checked
            const checkButton = document.getElementById(`check-btn-${this.gameId}`);
            checkButton.style.display = 'none';
            
            // Restore the selected answer and styling
            const options = questionCard.querySelectorAll('.choice-option');
            options.forEach(option => {
                option.disabled = true;
                if (option.dataset.correct === 'true') {
                    option.classList.add('correct');
                }
                // Restore selection
                const optionText = option.textContent.trim();
                if (answer.selectedOption.includes(optionText.split(' ').slice(1).join(' '))) {
                    option.classList.add('selected');
                    if (!answer.isCorrect) {
                        option.classList.add('incorrect');
                    }
                }
            });
        } else if (answer && answer.answered) {
            // Question answered but not checked yet
            // Restore selection
            const options = questionCard.querySelectorAll('.choice-option');
            options.forEach(option => {
                const optionText = option.textContent.trim();
                if (answer.selectedOption.includes(optionText.split(' ').slice(1).join(' '))) {
                    option.classList.add('selected');
                }
            });
            
            const checkButton = document.getElementById(`check-btn-${this.gameId}`);
            checkButton.style.display = 'inline-block';
            checkButton.disabled = false;
        } else {
            // Fresh question
            const checkButton = document.getElementById(`check-btn-${this.gameId}`);
            checkButton.style.display = 'inline-block';
            checkButton.disabled = true;
            checkButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
        
        // Update navigation buttons
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const gameInstance = window[`choiceGame_${this.gameId.replace(/-/g, '_')}`];
        const prevButton = document.getElementById(`prev-btn-${this.gameId}`);
        const nextButton = document.getElementById(`next-btn-${this.gameId}`);
        
        // Previous button
        if (gameInstance.currentQuestion === 0) {
            prevButton.disabled = true;
            prevButton.className = 'nav-button bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold px-3 py-1.5 rounded-full shadow-lg transition-all duration-300 cursor-not-allowed opacity-50 text-sm';
        } else {
            prevButton.disabled = false;
            prevButton.className = 'nav-button bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-lg hover:from-gray-600 hover:to-gray-700 hover:scale-105 transition-all duration-300 text-sm';
        }
        
        // Next button
        const currentAnswer = gameInstance.answers[gameInstance.currentQuestion];
        if (currentAnswer && currentAnswer.checked) {
            nextButton.disabled = false;
            nextButton.className = 'nav-button bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-700 hover:scale-105 transition-all duration-300 text-sm';
            
            if (gameInstance.currentQuestion === gameInstance.words.length - 1) {
                nextButton.innerHTML = '🏆';
                nextButton.onclick = () => window[`choiceGame_${this.gameId.replace(/-/g, '_')}`].showSummary();
            } else {
                nextButton.innerHTML = '→';
                nextButton.onclick = () => window[`choiceGame_${this.gameId.replace(/-/g, '_')}`].nextQuestion();
            }
        } else {
            nextButton.disabled = true;
            nextButton.className = 'nav-button bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-lg transition-all duration-300 opacity-50 cursor-not-allowed text-sm';
            nextButton.innerHTML = '→';
        }
    }

    resetGame() {
        const gameInstance = window[`choiceGame_${this.gameId.replace(/-/g, '_')}`];
        gameInstance.score = 0;
        gameInstance.currentQuestion = 0;
        gameInstance.answers = new Array(gameInstance.words.length).fill(null);
        
        // Reset score displays
        document.getElementById(`score-display-${this.gameId}`).textContent = '0';
        document.getElementById(`current-question-${this.gameId}`).textContent = '1';
        
        // Reset and update question display
        this.updateQuestionDisplay();
        this.updateNavigationButtons();
        
        // Reset check button
        const checkButton = document.getElementById(`check-btn-${this.gameId}`);
        checkButton.style.display = 'inline-block';
        checkButton.disabled = true;
        checkButton.classList.add('opacity-50', 'cursor-not-allowed');
        
        // Reset next button
        const nextButton = document.getElementById(`next-btn-${this.gameId}`);
        nextButton.innerHTML = '→';
        nextButton.onclick = () => window[`choiceGame_${this.gameId.replace(/-/g, '_')}`].nextQuestion();
    }

    showSummary() {
        const gameInstance = window[`choiceGame_${this.gameId.replace(/-/g, '_')}`];
        const totalQuestions = gameInstance.words.length;
        const correctAnswers = gameInstance.score;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        
        // Create summary modal
        const summary = document.createElement('div');
        summary.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50';
        summary.id = `summary-${this.gameId}`;
        
        summary.innerHTML = `
            <div class="bg-white rounded-xl p-8 shadow-2xl text-center max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div class="text-6xl mb-4">${percentage >= 80 ? '🏆' : percentage >= 60 ? '🎯' : '💪'}</div>
                <h3 class="text-3xl font-bold text-indigo-600 mb-4">Kết quả cuối cùng</h3>
                
                <div class="space-y-4 mb-6">
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-indigo-700">${correctAnswers}/${totalQuestions}</div>
                        <div class="text-sm text-gray-600">Câu trả lời đúng</div>
                    </div>
                    
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-green-700">${percentage}%</div>
                        <div class="text-sm text-gray-600">Tỷ lệ chính xác</div>
                    </div>
                </div>
                
                <div class="text-lg mb-6 ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                    <strong>
                        ${percentage >= 90 ? '🌟 Xuất sắc! Bạn đã thành thạo từ vựng này!' :
                          percentage >= 80 ? '🎉 Tuyệt vời! Bạn đã hiểu rất tốt!' :
                          percentage >= 70 ? '👏 Khá tốt! Hãy ôn lại một chút nữa!' :
                          percentage >= 60 ? '👍 Ổn! Bạn cần luyện tập thêm!' :
                          '💪 Đừng bỏ cuộc! Hãy thử lại để cải thiện!'}
                    </strong>
                </div>
                
                <!-- Question Review -->
                <div class="text-left mb-6 max-h-60 overflow-y-auto">
                    <h4 class="font-bold text-gray-700 mb-3 text-center">📋 Chi tiết từng câu:</h4>
                    <div class="space-y-2">
                        ${gameInstance.words.map((word, index) => {
                            const answer = gameInstance.answers[index];
                            const isCorrect = answer && answer.isCorrect;
                            return `
                                <div class="flex items-center justify-between p-2 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}">
                                    <span class="text-sm">
                                        <strong>Câu ${index + 1}:</strong> 
                                        ${this.gameMode === 'en-to-vi' ? word.english_word : 
                                          this.gameMode === 'vi-to-en' ? word.vietnamese_meaning : 
                                          word.image ? 'Hình ảnh' : word.vietnamese_meaning}
                                    </span>
                                    <span class="text-lg">${isCorrect ? '✅' : '❌'}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="flex flex-col gap-3">
                    <button onclick="window.choiceGame_${this.gameId.replace(/-/g, '_')}.resetGame(); document.getElementById('summary-${this.gameId}').remove();" 
                            class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-8 py-3 rounded-full hover:from-indigo-600 hover:to-purple-700 hover:scale-105 transition-all duration-300">
                        🔄 Chơi lại
                    </button>
                    <button onclick="document.getElementById('summary-${this.gameId}').remove();" 
                            class="bg-gray-500 text-white font-semibold px-8 py-2 rounded-full hover:bg-gray-600 transition-all duration-300">
                        Đóng
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(summary);
        
        // Show celebration if perfect score
        if (correctAnswers === totalQuestions) {
            setTimeout(() => this.showCelebration(), 1000);
        }
    }

    changeMode(newMode) {
        const gameInstance = window[`choiceGame_${this.gameId.replace(/-/g, '_')}`];
        this.gameMode = newMode;
        
        // Update mode buttons
        Object.keys(this.gameModes).forEach(mode => {
            const button = document.getElementById(`mode-${mode}-${this.gameId}`);
            if (button) {
                if (mode === newMode) {
                    button.className = 'mode-btn px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 bg-purple-500 text-white shadow-lg';
                } else {
                    button.className = 'mode-btn px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200';
                }
            }
        });
        

        
        // Reset game state first
        this.resetGame();
    }

    toggleHint(questionIndex) {
        const gameInstance = window[`choiceGame_${this.gameId.replace(/-/g, '_')}`];
        const word = gameInstance.words[questionIndex];
        const wordId = word.english_word.replace(/[^a-zA-Z0-9]/g, '_');
        const hintElement = document.getElementById(`hint-${this.gameId}-${wordId}`);
        const button = event.target;
        
        if (hintElement) {
            if (hintElement.classList.contains('hidden')) {
                // Show hint with animation
                hintElement.classList.remove('hidden');
                hintElement.classList.add('hint-revealed');
                
                // Update button
                button.innerHTML = '🙈 Hide Hint';
                button.className = 'bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-full transition-all duration-200 text-sm shadow-lg';
                
                // Add subtle animation to button
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            } else {
                // Hide hint
                hintElement.classList.add('hidden');
                hintElement.classList.remove('hint-revealed');
                
                // Update button
                button.innerHTML = '💡 Show Hint';
                button.className = 'bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-full transition-all duration-200 text-sm shadow-lg';
                
                // Add subtle animation to button
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            }
        }
    }

    showCelebration() {
        const gameInstance = window[`choiceGame_${this.gameId.replace(/-/g, '_')}`];
        const celebration = document.createElement('div');
        celebration.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30';
        
        celebration.innerHTML = `
            <div class="bg-white rounded-xl p-8 shadow-2xl text-center animate-pulse max-w-md mx-4">
                <div class="text-6xl mb-4">🎯</div>
                <h3 class="text-2xl font-bold text-indigo-600 mb-2">Perfect Score!</h3>
                <p class="text-gray-600">You got all ${gameInstance.words.length} questions correct!</p>
                <div class="text-gray-600 space-y-1 mt-4">
                    <p class="text-green-700 font-bold">🏆 Score: ${gameInstance.score}/${gameInstance.words.length}</p>
                    <p class="text-indigo-700 font-bold">🧠 Excellent vocabulary knowledge!</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-6 py-2 rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300">
                    🎉 Awesome!
                </button>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (celebration.parentElement) {
                celebration.remove();
            }
        }, 5000);
    }
}