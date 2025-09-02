# 🎮 Interactive Vocabulary Games System

Hệ thống game tương tác cho việc học từ vựng tiếng Anh với 9 games khác nhau.

## 📁 Cấu trúc Files

```
games/
├── README.md                  # File hướng dẫn này
├── game-manager.js           # Quản lý tất cả games
├── matching-game.js          # Game ghép đôi
├── memory-game.js            # Game lật thẻ
├── word-scramble-game.js     # Game sắp xếp chữ cái
├── fill-blank-game.js        # Game điền chỗ trống
├── multiple-choice-game.js   # Game trắc nghiệm
├── typing-game.js            # Game gõ từ
├── crossword-game.js         # Game ô chữ
├── picture-quiz-game.js      # Game đoán từ qua hình
└── hangman-game.js          # Game Hangman
```

## 🎯 9 Games Tương Tác

### 1. **Matching Game** 🃏
- Ghép đôi từ tiếng Anh với nghĩa tiếng Việt
- Click vào 2 thẻ để ghép cặp
- Tính điểm theo số cặp đúng

### 2. **Memory Game** 🧠
- Game lật thẻ tìm cặp từ + nghĩa
- Tính thời gian và số lượt
- Hiển thị điểm số cuối game

### 3. **Word Scramble Game** 🔤
- Sắp xếp chữ cái tạo thành từ đúng
- Có gợi ý nghĩa tiếng Việt
- Timer 60 giây cho toàn bộ game

### 4. **Fill in the Blank** ✏️
- Điền từ vào chỗ trống trong câu
- Sử dụng example_sentence hoặc tạo câu generic
- Button "Hiện gợi ý" cho chữ cái đầu

### 5. **Multiple Choice** 🎯
- Chọn nghĩa đúng trong 4 đáp án
- Hiển thị từ + phiên âm
- Tự động tạo các đáp án sai ngẫu nhiên

### 6. **Typing Game** ⌨️
- Gõ từ tiếng Anh theo nghĩa tiếng Việt
- Hỗ trợ Enter để submit
- Hiển thị đáp án khi sai

### 7. **Crossword Game** 🧩
- Ô chữ mini với 4 từ
- Gợi ý là nghĩa tiếng Việt
- Tự động chuyển ô khi gõ

### 8. **Picture Quiz Game** 🖼️
- Đoán từ qua hình ảnh
- Fallback khi không có hình
- 4 lựa chọn cho mỗi câu hỏi

### 9. **Hangman Game** 🎪
- Đoán từ theo từng chữ cái
- Biểu tượng emoji thay vì hình vẽ
- Button "Từ mới" để chơi tiếp

## 🚀 Cách Hoạt Động Mới

### Game Selection System
Thay vì tạo game ngẫu nhiên, hệ thống hiện tại tạo một **Game Selection Slide** cho mỗi category từ vựng:

```javascript
// Khởi tạo
const gameManager = new GameManager();
gameManager.initializeGames();

// Tạo slide chọn game
const gameSelectionSlide = gameManager.createGameSelectionSlide(categoryWords, categoryName);
```

### Game Selection Slide
- Hiển thị tất cả 9 games có sẵn
- Mỗi game có icon, tên và mô tả
- Người dùng click vào game để chọn
- Hiển thị số lượng từ vựng có sẵn

### Game Mode Features
Khi vào game:
- **Nút "Thoát Game"** xuất hiện ở góc trên bên phải
- **Slide navigation** bị ẩn (nút prev/next/outline)
- **Keyboard navigation** bị vô hiệu hóa (arrow keys)
- **Touch swipe** bị vô hiệu hóa
- **Outline modal** không thể mở

### Exit Game
- Click nút "Thoát Game" để quay lại slide chọn game
- Tất cả controls được khôi phục
- Game state được reset

## 📋 Yêu cầu File vocab.json

```json
[
  {
    "group": "School Supplies",
    "words": [
      {
        "english_word": "school bag",
        "pronunciation": "/skuːl bæɡ/",
        "vietnamese_meaning": "(n): cặp sách",
        "example_sentence_en": "I carry my books in my school bag.",
        "example_sentence_vi": "Tôi mang sách vở trong cặp sách của mình.",
        "image": "assets/images/school-bag.webp",
        "alt": "Image for school bag"
      }
    ]
  }
]
```

## 🎨 Tùy chỉnh Games

### Thay đổi số lượng từ mỗi game:
```javascript
// Trong constructor của mỗi game
this.maxWords = 8; // Thay đổi số này
```

### Thêm game mới:
1. Tạo file `new-game.js` 
2. Implement class với phương thức `createSlide(categoryWords, categoryName)` và `getGameInfo()`
3. Thêm vào `game-manager.js`:
```javascript
this.games = [
    // ... existing games
    'NewGame'
];
```
4. Thêm script tag vào HTML

### Tùy chỉnh CSS:
- Mỗi game có CSS riêng trong slide HTML
- Sử dụng Tailwind CSS classes
- Có thể override trong file CSS chính

## 🐛 Troubleshooting

### Games không hiển thị:
1. Kiểm tra console errors
2. Đảm bảo tất cả script files được load
3. Kiểm tra cấu trúc vocab.json

### Games không hoạt động:
1. Kiểm tra GameManager đã được khởi tạo
2. Đảm bảo từ vựng có đủ words cho game
3. Kiểm tra unique gameId không trung lặp

### Hình ảnh không hiển thị:
1. Kiểm tra đường dẫn trong vocab.json
2. Đảm bảo folder images/ tồn tại
3. Picture Quiz Game có fallback tự động

### Không thể thoát game:
1. Kiểm tra nút "Thoát Game" có hiển thị không
2. Đảm bảo gameManager.exitGame() được gọi
3. Kiểm tra console errors

## 📱 Responsive Design

- Tất cả games được thiết kế responsive
- Hỗ trợ touch gestures trên mobile  
- Grid layout tự động điều chỉnh
- Text size scaling theo màn hình

## ⚡ Performance Tips

- Games chỉ được tạo khi cần thiết
- Unique IDs tránh conflict
- Event listeners được cleanup tự động
- Memory efficient với small word sets

## 🔧 Mở rộng

Hệ thống được thiết kế modular, dễ dàng:
- Thêm games mới
- Modify games hiện có
- Tích hợp vào projects khác
- Customize theo nhu cầu riêng

## 🎮 Game Flow

1. **Vocabulary Slides** → Hiển thị từ vựng theo category
2. **Game Selection Slide** → Hiển thị 9 games để chọn
3. **Selected Game** → Vào game cụ thể với nút "Thoát Game"
4. **Exit Game** → Quay lại Game Selection Slide
5. **Continue** → Chọn game khác hoặc chuyển slide