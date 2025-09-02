/**
 * Fill in the Blank Game - Điền từ tiếng Anh vào chỗ trống trong câu
 */

class FillBlankGame {
    constructor() {
        this.gameId = 'fillblank-game-' + Date.now();
        this.maxWords = 5;
    }

    getGameInfo() {
        return {
            name: 'Fill in the Blank',
            description: 'Điền từ vào chỗ trống trong câu',
            icon: '✏️'
        };
    }

    createSlide(categoryWords, categoryName) {
        const words = this.selectRandomWords(categoryWords, this.maxWords);

        const slide = document.createElement('div');
        slide.className = 'slide content-box px-5 py-2 rounded-2xl w-full h-full';
        
        slide.innerHTML = `
            <div class="h-full flex flex-col">
                <h2 class="text-xl font-bold text-indigo-700 mb-2 text-center">
                    ✏️ Game: Điền vào chỗ trống
                </h2>
                <p class="text-lg text-center mb-6 text-gray-600">
                    Điền từ tiếng Anh phù hợp vào chỗ trống trong câu
                </p>
                
                <div class="flex-1 max-w-4xl mx-auto w-full space-y-6">
                    ${words.map((word, index) => {
                        const sentence = this.createBlankSentence(word);
                        return `
                            <div class="fill-blank-item bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                <div class="mb-4">
                                    <div class="flex items-center justify-between mb-3">
                                        <span class="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                            Câu ${index + 1}
                                        </span>
                                        <span class="text-sm text-gray-500">
                                            Gợi ý: <em>${word.vietnamese_meaning}</em>
                                        </span>
                                    </div>
                                    
                                    <div class="text-lg mb-4 leading-relaxed">
                                        ${sentence.before}
                                        <input type="text" 
                                               id="blank-${this.gameId}-${index}"
                                               class="fill-blank-input inline-block mx-2 px-3 py-2 border-2 border-dashed border-gray-400 rounded-lg text-center font-semibold bg-yellow-50 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                               placeholder="......"
                                               data-answer="${word.english_word.toLowerCase()}"
                                               style="min-width: ${Math.max(word.english_word.length * 12, 80)}px">
                                        ${sentence.after}
                                    </div>
                                    
                                    <div class="text-gray-600 italic">
                                        <strong>Tiếng Việt:</strong> ${sentence.vietnamese}
                                    </div>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <div id="result-${this.gameId}-${index}" class="text-sm font-medium h-6"></div>
                                    <button onclick="window.fillBlankGame_${this.gameId.replace(/-/g, '_')}.checkAnswer(${index})"
                                            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                        Kiểm tra
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="text-center mt-6">
                    <div class="flex justify-center gap-8 mb-4">
                        <div id="score-${this.gameId}" class="text-lg font-bold text-green-600">
                            Điểm: 0/${words.length}
                        </div>
                        <div id="progress-${this.gameId}" class="text-lg font-bold text-blue-600">
                            Hoàn thành: 0/${words.length}
                        </div>
                    </div>
                    
                    <div class="flex justify-center gap-4">
                        <button onclick="window.fillBlankGame_${this.gameId.replace(/-/g, '_')}.checkAllAnswers()"
                                class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                            ✅ Kiểm tra tất cả
                        </button>
                        <button onclick="window.fillBlankGame_${this.gameId.replace(/-/g, '_')}.showHints()"
                                class="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                            💡 Hiện gợi ý
                        </button>
                        <button onclick="window.fillBlankGame_${this.gameId.replace(/-/g, '_')}.resetGame()"
                                class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                            🔄 Làm lại
                        </button>
                    </div>
                    
                    <div id="message-${this.gameId}" class="text-sm text-gray-500 mt-4 h-6">
                        Điền từ vào chỗ trống rồi nhấn "Kiểm tra"
                    </div>
                </div>
            </div>
        `;

        // Initialize game instance
        window[`fillBlankGame_${this.gameId.replace(/-/g, '_')}`] = {
            words: words,
            correctAnswers: 0,
            completedItems: 0,
            checkAnswer: (index) => this.checkAnswer(index),
            checkAllAnswers: () => this.checkAllAnswers(),
            showHints: () => this.showHints(),
            resetGame: () => this.resetGame()
        };

        return slide;
    }

    selectRandomWords(words, maxCount) {
        const shuffled = this.shuffleArray([...words]);
        return shuffled.slice(0, Math.min(maxCount, words.length));
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    createBlankSentence(word) {
        // Use example sentence if available, otherwise create generic sentence
        if (word.example_sentence_en && word.example_sentence_vi) {
            const englishSentence = word.example_sentence_en;
            const vietnameseSentence = word.example_sentence_vi;
            
            // Replace the word with blank (case-insensitive)
            const wordRegex = new RegExp(`\\b${word.english_word}\\b`, 'gi');
            const match = englishSentence.match(wordRegex);
            
            if (match) {
                const parts = englishSentence.split(wordRegex);
                return {
                    before: parts[0],
                    after: parts.slice(1).join('______'),
                    vietnamese: vietnameseSentence
                };
            }
        }
        
        // Fallback to generic sentences
        const genericSentences = [
            {
                before: "I really like this ",
                after: " very much.",
                vietnamese: `Tôi thực sự thích ${word.vietnamese_meaning} này rất nhiều.`
            },
            {
                before: "The ",
                after: " is very beautiful.",
                vietnamese: `${word.vietnamese_meaning} rất đẹp.`
            },
            {
                before: "Can you see the ",
                after: " over there?",
                vietnamese: `Bạn có thể thấy ${word.vietnamese_meaning} ở đằng kia không?`
            },
            {
                before: "We need to buy a new ",
                after: " for our house.",
                vietnamese: `Chúng ta cần mua ${word.vietnamese_meaning} mới cho nhà mình.`
            },
            {
                before: "This ",
                after: " is my favorite.",
                vietnamese: `${word.vietnamese_meaning} này là yêu thích của tôi.`
            }
        ];

        return genericSentences[Math.floor(Math.random() * genericSentences.length)];
    }

    checkAnswer(index) {
        const gameInstance = window[`fillBlankGame_${this.gameId.replace(/-/g, '_')}`];
        const input = document.getElementById(`blank-${this.gameId}-${index}`);
        const result = document.getElementById(`result-${this.gameId}-${index}`);
        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = input.dataset.answer;

        if (userAnswer === correctAnswer) {
            // Correct
            result.textContent = '✅ Chính xác!';
            result.className = 'text-sm font-medium h-6 text-green-600';
            input.className = input.className.replace(/border-\w+-\d+/g, 'border-green-500');
            input.style.backgroundColor = '#dcfce7';
            input.disabled = true;
            
            if (!input.dataset.scored) {
                gameInstance.correctAnswers++;
                input.dataset.scored = 'true';
            }
        } else {
            // Incorrect
            result.textContent = `❌ Sai! Đáp án: "${input.dataset.answer}"`;
            result.className = 'text-sm font-medium h-6 text-red-600';
            input.className = input.className.replace(/border-\w+-\d+/g, 'border-red-500');
            input.style.backgroundColor = '#fef2f2';
            
            setTimeout(() => {
                input.style.backgroundColor = '#fefce8';
                input.className = input.className.replace(/border-\w+-\d+/g, 'border-gray-400');
            }, 3000);
        }

        this.updateProgress();
    }

    checkAllAnswers() {
        const gameInstance = window[`fillBlankGame_${this.gameId.replace(/-/g, '_')}`];
        
        for (let i = 0; i < gameInstance.words.length; i++) {
            const input = document.getElementById(`blank-${this.gameId}-${i}`);
            if (!input.disabled) {
                this.checkAnswer(i);
            }
        }
        
        // Show final message if all completed
        setTimeout(() => {
            if (gameInstance.correctAnswers === gameInstance.words.length) {
                this.showCelebration();
            }
        }, 1000);
    }

    showHints() {
        const gameInstance = window[`fillBlankGame_${this.gameId.replace(/-/g, '_')}`];
        
        gameInstance.words.forEach((word, index) => {
            const input = document.getElementById(`blank-${this.gameId}-${index}`);
            if (!input.disabled) {
                // Show first letter as hint
                const firstLetter = word.english_word.charAt(0).toUpperCase();
                const restLength = word.english_word.length - 1;
                input.placeholder = firstLetter + '_'.repeat(restLength);
                input.style.backgroundColor = '#fef3c7';
            }
        });

        document.getElementById(`message-${this.gameId}`).textContent = '💡 Gợi ý đã được hiển thị!';
        setTimeout(() => {
            document.getElementById(`message-${this.gameId}`).textContent = 'Điền từ vào chỗ trống rồi nhấn "Kiểm tra"';
        }, 3000);
    }

    resetGame() {
        const gameInstance = window[`fillBlankGame_${this.gameId.replace(/-/g, '_')}`];
        
        gameInstance.correctAnswers = 0;
        gameInstance.completedItems = 0;
        
        gameInstance.words.forEach((word, index) => {
            const input = document.getElementById(`blank-${this.gameId}-${index}`);
            const result = document.getElementById(`result-${this.gameId}-${index}`);
            
            input.value = '';
            input.disabled = false;
            input.placeholder = '......';
            input.style.backgroundColor = '#fefce8';
            input.className = input.className.replace(/border-\w+-\d+/g, 'border-gray-400');
            input.removeAttribute('data-scored');
            
            result.textContent = '';
            result.className = 'text-sm font-medium h-6';
        });
        
        this.updateProgress();
        
        document.getElementById(`message-${this.gameId}`).textContent = 'Game đã được làm mới!';
        setTimeout(() => {
            document.getElementById(`message-${this.gameId}`).textContent = 'Điền từ vào chỗ trống rồi nhấn "Kiểm tra"';
        }, 2000);
    }

    updateProgress() {
        const gameInstance = window[`fillBlankGame_${this.gameId.replace(/-/g, '_')}`];
        
        // Count completed items (correct or incorrect attempts)
        let completedCount = 0;
        gameInstance.words.forEach((word, index) => {
            const input = document.getElementById(`blank-${this.gameId}-${index}`);
            if (input.disabled) completedCount++;
        });
        
        gameInstance.completedItems = completedCount;
        
        // Update display
        document.getElementById(`score-${this.gameId}`).textContent = 
            `Điểm: ${gameInstance.correctAnswers}/${gameInstance.words.length}`;
        document.getElementById(`progress-${this.gameId}`).textContent = 
            `Hoàn thành: ${gameInstance.completedItems}/${gameInstance.words.length}`;
    }

    showCelebration(gameInstance) {
        const celebration = document.createElement('div');
        celebration.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30';
        celebration.innerHTML = `
            <div class="bg-white rounded-xl p-8 shadow-2xl text-center animate-pulse">
                <div class="text-6xl mb-4">✏️</div>
                <h3 class="text-2xl font-bold text-green-600 mb-2">Excellent Work!</h3>
                <p class="text-gray-600">You filled in all ${gameInstance.words.length} blanks correctly!</p>
                <p class="text-indigo-700 font-bold mt-2">Perfect score: ${gameInstance.correctAnswers}/${gameInstance.words.length}</p>
            </div>
        `;

        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 3000);
    }
}