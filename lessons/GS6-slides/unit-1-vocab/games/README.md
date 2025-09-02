# Games Directory

This directory contains all the educational games for the vocabulary learning application.

## File Structure

### Core Files
- **`game-utils.js`** - Common utility classes and functions for all games
- **`game-manager.js`** - Manages game selection and navigation
- **`matching-game.js`** - Matching game implementation

### Game Files
- **`memory-game.js`** - Memory card game
- **`word-scramble-game.js`** - Word scramble game
- **`fill-blank-game.js`** - Fill in the blank game
- **`multiple-choice-game.js`** - Multiple choice quiz game
- **`typing-game.js`** - Typing practice game
- **`crossword-game.js`** - Crossword puzzle game
- **`picture-quiz-game.js`** - Picture-based quiz game
- **`hangman-game.js`** - Hangman word guessing game

## Architecture

### GameBase Class
Base class that provides common functionality for all games:
- Timer management
- Game state management
- Popup creation
- Resource cleanup

### GameUtils Class
Static utility functions:
- `generateGameId()` - Create unique game IDs
- `selectRandomWords()` - Randomly select words from categories
- `shuffleArray()` - Shuffle arrays using Fisher-Yates algorithm
- `createPopup()` - Create customizable popups
- `createCelebrationPopup()` - Create celebration popups
- `createInstructionPopup()` - Create instruction popups
- `formatTime()` - Format seconds to MM:SS
- `addClassesWithTransition()` - Add CSS classes with smooth transitions
- `removeClassesWithTransition()` - Remove CSS classes with smooth transitions

### UIComponents Class
Static UI creation functions:
- `createGameControls()` - Create game control buttons (timer, score, start, restart)
- `createGameCard()` - Create styled game cards

## Usage Example

```javascript
// Extend GameBase for a new game
class MyNewGame extends GameBase {
    constructor() {
        super('My New Game', 5); // game name, max words
    }
    
    getGameInfo() {
        return {
            name: 'My New Game',
            description: 'Description of the game',
            icon: '🎮'
        };
    }
    
    createSlide(categoryWords, categoryName) {
        // Use utility functions
        this.words = GameUtils.selectRandomWords(categoryWords, this.maxWords);
        
        // Use UI components
        const controls = UIComponents.createGameControls(this.gameId, this.words.length);
        
        // Create slide HTML...
    }
}
```

## Benefits of Refactoring

1. **Code Reusability** - Common functions can be used across multiple games
2. **Maintainability** - Changes to common functionality only need to be made in one place
3. **Consistency** - All games use the same UI components and utility functions
4. **Easier Development** - New games can be created by extending GameBase
5. **Better Organization** - Clear separation of concerns between utilities, base classes, and game-specific logic

## Dependencies

- **`game-utils.js`** must be loaded before any game files
- All games extend from `GameBase` class
- Games use utility functions from `GameUtils` and `UIComponents` classes