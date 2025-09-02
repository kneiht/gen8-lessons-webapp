/**
 * Game Utilities - Common functions for all games
 */

class GameUtils {
    /**
     * Generate unique game ID
     */
    static generateGameId(prefix = 'game') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Select random words from a category
     */
    static selectRandomWords(words, maxCount) {
        const shuffled = [...words].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(maxCount, words.length));
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Create popup with custom content
     */
    static createPopup(content, options = {}) {
        const {
            className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30',
            closeOnBackgroundClick = true,
            autoClose = false,
            autoCloseDelay = 3000
        } = options;

        const popup = document.createElement('div');
        popup.className = className;
        popup.innerHTML = content;

        // Add click event to close popup
        const closeBtn = popup.querySelector('button');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => popup.remove());
        }

        // Close on background click
        if (closeOnBackgroundClick) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    popup.remove();
                }
            });
        }

        // Auto close if specified
        if (autoClose) {
            setTimeout(() => popup.remove(), autoCloseDelay);
        }

        document.body.appendChild(popup);
        return popup;
    }

    /**
     * Create celebration popup
     */
    static createCelebrationPopup(title, message, time, onClose = null) {
        const content = `
            <div class="bg-white rounded-xl p-8 shadow-2xl text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h3 class="text-2xl font-bold text-green-600 mb-2">${title}</h3>
                <p class="text-gray-600">${message}</p>
                ${time ? `<p class="text-indigo-700 font-bold mt-2">⏱️ Time: ${time} seconds</p>` : ''}
                <button class="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200">
                    Close
                </button>
            </div>
        `;

        const popup = this.createPopup(content);
        
        if (onClose) {
            const closeBtn = popup.querySelector('button');
            closeBtn.addEventListener('click', () => {
                popup.remove();
                onClose();
            });
        }

        return popup;
    }

    /**
     * Create instruction popup
     */
    static createInstructionPopup(title, description, onClose = null) {
        const content = `
            <div class="bg-white rounded-xl p-6 shadow-2xl text-center max-w-md mx-4">
                <h3 class="text-xl font-bold text-indigo-700 mb-3">${title}</h3>
                <p class="text-gray-700 text-lg leading-relaxed">
                    ${description}
                </p>
                <button class="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200">
                    Got it!
                </button>
            </div>
        `;

        const popup = this.createPopup(content);
        
        if (onClose) {
            const closeBtn = popup.querySelector('button');
            closeBtn.addEventListener('click', () => {
                popup.remove();
                onClose();
            });
        }

        return popup;
    }

    /**
     * Format time in seconds to MM:SS format
     */
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Add CSS classes with smooth transitions
     */
    static addClassesWithTransition(element, classes, duration = 300) {
        element.style.transition = `all ${duration}ms ease-in-out`;
        classes.forEach(cls => element.classList.add(cls));
    }

    /**
     * Remove CSS classes with smooth transitions
     */
    static removeClassesWithTransition(element, classes, duration = 300) {
        element.style.transition = `all ${duration}ms ease-in-out`;
        classes.forEach(cls => element.classList.remove(cls));
    }
}

/**
 * Base Game Class - Common functionality for all games
 */
class GameBase {
    constructor(gameName, maxWords = 6) {
        this.gameName = gameName;
        this.gameId = GameUtils.generateGameId(gameName.toLowerCase().replace(/\s+/g, '-'));
        this.maxWords = maxWords;
        this.categoryWords = [];
        this.words = [];
        this.isGameStarted = false;
        this.isGameOver = false;
        this.timer = 0;
        this.timerInterval = null;
    }

    /**
     * Get game information
     */
    getGameInfo() {
        throw new Error('getGameInfo() must be implemented by subclass');
    }

    /**
     * Create game slide
     */
    createSlide(categoryWords, categoryName) {
        throw new Error('createSlide() must be implemented by subclass');
    }

    /**
     * Start timer
     */
    startTimer(slide) {
        const timerDiv = slide.querySelector(`#timer-${this.gameId}`);
        if (!timerDiv) return;

        this.timerInterval = setInterval(() => {
            if (!this.isGameOver) {
                this.timer++;
                const timerValueSpan = timerDiv.querySelector(`#timer-value-${this.gameId}`);
                if (timerValueSpan) {
                    timerValueSpan.textContent = GameUtils.formatTime(this.timer);
                }
            }
        }, 1000);
    }

    /**
     * Stop timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Reset timer
     */
    resetTimer() {
        this.timer = 0;
        this.stopTimer();
    }

    /**
     * Show celebration popup
     */
    showCelebration(title, message, onClose = null) {
        return GameUtils.createCelebrationPopup(title, message, this.timer, onClose);
    }

    /**
     * Show instruction popup
     */
    showInstruction(title, description, onClose = null) {
        return GameUtils.createInstructionPopup(title, description, onClose);
    }

    /**
     * Cleanup game resources
     */
    cleanup() {
        this.stopTimer();
        this.isGameStarted = false;
        this.isGameOver = false;
    }
}

/**
 * UI Components - Reusable UI elements
 */
class UIComponents {
    /**
     * Create game controls (timer, score, start, restart buttons)
     */
    static createGameControls(gameId, maxScore, options = {}) {
        const {
            showTimer = true,
            showScore = true,
            showStart = true,
            showRestart = true,
            startText = '▶️ Start Game',
            restartText = '🔄 Restart'
        } = options;

    // Wrapper: column on mobile (two rows), row on desktop
    let controlsHTML = `
    <div class="w-full my-2 flex flex-col sm:flex-row sm:justify-center gap-3 sm:gap-4 items-stretch">
    `;

    // Stats group (row 1 on mobile, left side on desktop)
    controlsHTML += `
    <div class="w-full sm:w-auto flex flex-row  gap-2 sm:gap-4 justify-stretch sm:justify-start">
    `;
    if (showTimer) {
    controlsHTML += `
        <div id="timer-${gameId}" 
        class="bg-yellow-100 text-yellow-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm w-full sm:w-28"
        style="display: none;">
        ⏱️ <span id="timer-value-${gameId}">00:00</span>
        </div>
    `;
    }
    if (showScore) {
    controlsHTML += `
        <div id="score-${gameId}" 
        class="bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-full shadow-lg text-center text-sm w-full sm:w-28"
        style="display: none;">
        🎯 <span id="score-value-${gameId}">0/${maxScore}</span>
        </div>
    `;
    }
    controlsHTML += `</div>`;

    // Actions group (row 2 on mobile, right side on desktop)
    controlsHTML += `
    <div class="w-full sm:w-auto flex flex-row gap-2 sm:gap-4 justify-stretch sm:justify-end">
    `;
    if (showStart) {
    controlsHTML += `
        <button id="start-btn-${gameId}" 
        class="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-1.5 rounded-full shadow-lg transition-all duration-200 text-sm w-full sm:w-auto">
        ${startText}
        </button>
    `;
    }
    if (showRestart) {
    controlsHTML += `
        <button id="restart-btn-${gameId}" 
        class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-1.5 rounded-full shadow-lg transition-all duration-200 text-sm w-full sm:w-auto"
        style="display: none;">
        ${restartText}
        </button>
    `;
    }
    controlsHTML += `</div>`;

    // End wrapper
    controlsHTML += `</div>`;
    return controlsHTML;

    }

    /**
     * Create game card with common styling
     */
    static createGameCard(index, cardData, options = {}) {
        const {
            className = 'game-card bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-300 hover:scale-105 border-2 border-gray-200 min-h-[100px] flex items-center justify-center text-center',
            disabled = true,
            text = '?',
            textClass = 'text-lg font-semibold text-gray-400'
        } = options;

        const disabledClasses = disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-blue-50';
        const finalClassName = `${className} ${disabledClasses}`;

        return `
            <div class="${finalClassName}"
                 data-card-index="${index}"
                 data-card-id="${cardData.id}"
                 data-card-type="${cardData.type}">
                <span class="card-text ${textClass}">${text}</span>
            </div>
        `;
    }
}
