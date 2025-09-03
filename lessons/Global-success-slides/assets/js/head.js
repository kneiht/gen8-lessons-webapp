
function adjustFontSize() {
    const screenWidth = window.innerWidth;
    const htmlElement = document.documentElement;

    if (screenWidth <= 768) { // Mobile breakpoint
        htmlElement.style.fontSize = '20px';
    } else {
        // Scale font size based on screen width, with 30px at 1680px width
        const scaleFactor = screenWidth / 1680;
        const fontSize = Math.max(20, Math.min(30, 30 * scaleFactor));
        htmlElement.style.fontSize = `${fontSize}px`;
    }
}

function showZoomInstructions() {
    // Check if it's a mobile device
    if (window.innerWidth <= 768) {
        return;
    }

    if (localStorage.getItem('hideZoomInstructions')) {
        return;
    }

    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        background: white;
        padding: 25px;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 90%;
        width: 400px;
        opacity: 0;
        transition: all 0.3s ease;
    `;

    popup.innerHTML = `
        <div style="
            text-align: center;
            margin-bottom: 20px;
        ">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 15px;">
                <path d="M15 3H21V9" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 21H3V15" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 3L14 10" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 21L10 14" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3 style="
                margin: 0 0 15px 0;
                color: #1f2937;
                font-size: 25px;
                font-weight: 600;
            ">Hướng dẫn phóng to/thu nhỏ</h3>
        </div>
        <div style="
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        ">
            <p style="
                margin: 0;
                color: #4b5563;
                font-size: 20px;
                line-height: 1.6;
            ">
                Bạn có thể sử dụng tổ hợp phím sau để phóng to/thu nhỏ nội dung cho phù hợp với màn hình của bạn:
            </p>
            <div style="
                margin-top: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <span style="
                        background: #e5e7eb;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 20px;
                        color: #374151;
                    ">Windows</span>
                    <span style="color: #4b5563;">Ctrl + (+/-)</span>
                </div>
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <span style="
                        background: #e5e7eb;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 20px;
                        color: #374151;
                    ">Mac</span>
                    <span style="color: #4b5563;">Command + (+/-)</span>
                </div>
            </div>
        </div>
        <button id="dismissPopup" style="
            background: #4f46e5;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            width: 100%;
            font-size: 15px;
            font-weight: 500;
            transition: background-color 0.2s ease;
        ">Không hiển thị lại</button>
    `;

    document.body.appendChild(popup);

    // Trigger animation
    requestAnimationFrame(() => {
        popup.style.transform = 'translate(-50%, -50%) scale(1)';
        popup.style.opacity = '1';
    });

    // Add hover effect to button
    const button = document.getElementById('dismissPopup');
    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#4338ca';
    });
    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#4f46e5';
    });

    button.addEventListener('click', () => {
        popup.style.transform = 'translate(-50%, -50%) scale(0.95)';
        popup.style.opacity = '0';
        setTimeout(() => {
            localStorage.setItem('hideZoomInstructions', 'true');
            popup.remove();
        }, 300);
    });
}

// Run on page load
window.addEventListener('DOMContentLoaded', () => {
    adjustFontSize();
    showZoomInstructions();
    loadVocabularyData();
    // Build voice selector when voices are available
    setTimeout(buildVoiceSelectors, 500);
});

// Run when window is resized
window.addEventListener('resize', adjustFontSize);

// ===== Text-to-Speech helpers =====
let ttsVoices = [];
let selectedEnVoiceName = localStorage.getItem('tts_en_voice') || '';
let selectedViVoiceName = localStorage.getItem('tts_vi_voice') || '';
let selectedTtsRate = parseFloat(localStorage.getItem('tts_rate') || '0.95') || 0.95;

function loadVoices() {
    try {
        ttsVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
        // Set default EN voice to "Aaron (en-US)" if available and not chosen yet
        if (!selectedEnVoiceName && Array.isArray(ttsVoices) && ttsVoices.length) {
            const aaron = ttsVoices.find(v => (v.name || '').toLowerCase().includes('aaron') && (v.lang || '').toLowerCase().startsWith('en-us'));
            if (aaron) {
                selectedEnVoiceName = aaron.name;
                localStorage.setItem('tts_en_voice', selectedEnVoiceName);
            }
        }
    } catch (e) {
        ttsVoices = [];
    }
}
loadVoices();
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoiceForLang(lang) {
    const lower = (lang || '').toLowerCase();
    // If user selected a specific voice, use it (when language matches)
    const preferredName = lower.startsWith('en') ? selectedEnVoiceName : lower.startsWith('vi') ? selectedViVoiceName : '';
    if (preferredName) {
        const preferred = ttsVoices.find(v => (v.name === preferredName) && (v.lang || '').toLowerCase().startsWith(lower.split('-')[0]));
        if (preferred) return preferred;
    }
    // Try exact match first
    const exact = ttsVoices.find(v => (v.lang || '').toLowerCase() === lower);
    if (exact) return exact;
    // Fallback: startsWith (e.g., 'en' or 'vi')
    const prefix = ttsVoices.find(v => (v.lang || '').toLowerCase().startsWith(lower.split('-')[0] || lower));
    return prefix || null;
}

function speakText(text, lang = 'en-US', rate = selectedTtsRate) {
    if (!text || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    const voice = pickVoiceForLang(lang);
    if (voice) utter.voice = voice;
    utter.rate = rate;
    window.speechSynthesis.speak(utter);
}

// Convenience wrappers used in onclick
function speakWordEn(text) { speakText(text, 'en-US'); }
function speakSentenceEn(text) { speakText(text, 'en-US'); }
function speakSentenceVi(text) { speakText(text, 'vi-VN'); }

// ===== Voice selector Popup =====
function openSettingsPopup() {
    if (!window.speechSynthesis) return;
    const existing = document.getElementById('tts-voice-modal');
    if (existing) { existing.remove(); }

    const overlay = document.createElement('div');
    overlay.id = 'tts-voice-modal';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:1000; display:flex; align-items:center; justify-content:center;';
    const modal = document.createElement('div');
    modal.style.cssText = 'background:white; border-radius:12px; padding:16px; width:90%; max-width:520px; box-shadow:0 10px 30px rgba(0,0,0,0.2);';
    modal.innerHTML = `
        <div class="text-center mb-3">
            <h3 class="text-xl font-bold text-indigo-700">Settings</h3>
            <p class="text-gray-600 text-sm">Chọn giọng cho tiếng Anh và tiếng Việt</p>
        </div>
        <div class="space-y-3">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">English voice</label>
                <select id="tts-en-select" class="w-full border rounded-md p-1 text-sm"></select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Vietnamese voice</label>
                <select id="tts-vi-select" class="w-full border rounded-md p-1 text-sm"></select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tốc độ đọc: <span id="tts-rate-value" class="font-semibold">${selectedTtsRate.toFixed(2)}</span></label>
                <input id="tts-rate" type="range" min="0.5" max="1.2" step="0.05" value="${selectedTtsRate}" class="w-full">
                <div class="text-xs text-gray-500 mt-1">Chậm ←→ Nhanh</div>
            </div>
            <hr class="my-4 border-gray-200">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hình nền (Background)</label>
                <div class="flex gap-2 mb-2 hidden">
                    <button id="random-bg-btn" type="button" class="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-3 py-1 rounded-md text-sm transition-colors">
                        🎲 Random Background
                    </button>
                    <button id="reset-bg" type="button" class="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-3 py-1 rounded-md text-sm transition-colors">
                        🔄 Reset
                    </button>
                </div>
                <input id="background-url" type="url" placeholder="Nhập link hình ảnh..." class="w-full border rounded-md p-1 text-sm" value="${localStorage.getItem('background_url') || ''}">
                <div class="text-xs text-gray-500 mt-1">Để trống để sử dụng hình nền ngẫu nhiên</div>
                <div class="mt-2 flex gap-2">
                    <button id="preview-bg" class="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Xem trước</button>
                    <button id="reset-bg" class="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm">Đặt lại</button>
                </div>
            </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
            <button id="tts-close" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 rounded-md">Đóng</button>
            <button id="tts-save" class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded-md">Lưu</button>
        </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function fillOptions(select, voices, currentName, label) {
        select.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = `${label} Auto`;
        select.appendChild(opt);
        voices.forEach(v => {
            const o = document.createElement('option');
            o.value = v.name;
            o.textContent = `${v.name} (${v.lang})`;
            if (v.name === currentName) o.selected = true;
            select.appendChild(o);
        });
    }

    const enSelect = modal.querySelector('#tts-en-select');
    const viSelect = modal.querySelector('#tts-vi-select');
    const enVoices = ttsVoices.filter(v => (v.lang || '').toLowerCase().startsWith('en'));
    const viVoices = ttsVoices.filter(v => (v.lang || '').toLowerCase().startsWith('vi'));
    fillOptions(enSelect, enVoices, selectedEnVoiceName, 'EN');
    fillOptions(viSelect, viVoices, selectedViVoiceName, 'VI');

    const rateInput = modal.querySelector('#tts-rate');
    const rateValue = modal.querySelector('#tts-rate-value');
    rateInput.addEventListener('input', () => { rateValue.textContent = parseFloat(rateInput.value).toFixed(2); });
    
    // Background functionality
    const backgroundUrlInput = modal.querySelector('#background-url');
    const previewBgBtn = modal.querySelector('#preview-bg');
    const resetBgBtn = modal.querySelector('#reset-bg');
    const randomBgBtn = modal.querySelector('#random-bg-btn');
    
    // Preview background
    previewBgBtn.addEventListener('click', () => {
        const url = backgroundUrlInput.value.trim();
        if (url) {
            document.body.style.backgroundImage = `url('${url}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
        }
    });
    
    // Random background button
    randomBgBtn.addEventListener('click', () => {
        backgroundUrlInput.value = '';
        localStorage.removeItem('background_url');
        
        // Apply new random local background
        const randomBg = getRandomLocalBackground();
        document.body.style.backgroundImage = `url('${randomBg}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        
        // Remove any existing background classes
        document.body.className = document.body.className.replace(/bg-\[url\([^)]+\)\]/g, '');
    });
    
    // Reset background to random local background
    resetBgBtn.addEventListener('click', () => {
        backgroundUrlInput.value = '';
        localStorage.removeItem('background_url');
        
        // Apply random local background
        const randomBg = getRandomLocalBackground();
        document.body.style.backgroundImage = `url('${randomBg}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        
        // Remove any existing background classes
        document.body.className = document.body.className.replace(/bg-\[url\([^)]+\)\]/g, '');
    });
    
    modal.querySelector('#tts-close').addEventListener('click', () => overlay.remove());
    modal.querySelector('#tts-save').addEventListener('click', () => {
        selectedEnVoiceName = enSelect.value;
        selectedViVoiceName = viSelect.value;
        selectedTtsRate = parseFloat(rateInput.value) || 0.95;
        
        // Save background URL
        const backgroundUrl = backgroundUrlInput.value.trim();
        if (backgroundUrl) {
            localStorage.setItem('background_url', backgroundUrl);
            document.body.style.backgroundImage = `url('${backgroundUrl}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
        } else {
            localStorage.removeItem('background_url');
            // Use random local background
            const randomBg = getRandomLocalBackground();
            document.body.style.backgroundImage = `url('${randomBg}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            
            // Remove any existing background classes
            document.body.className = document.body.className.replace(/bg-\[url\([^)]+\)\]/g, '');
        }
        
        localStorage.setItem('tts_en_voice', selectedEnVoiceName);
        localStorage.setItem('tts_vi_voice', selectedViVoiceName);
        localStorage.setItem('tts_rate', String(selectedTtsRate));
        overlay.remove();
    });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// Function to get random background from local backgrounds (1-22)
function getRandomLocalBackground() {
    const randomNumber = Math.floor(Math.random() * 22) + 1;
    return `../assets/backgrounds/${randomNumber}.webp`;
}

// Function to load background from localStorage
function loadBackgroundFromStorage() {
    const savedBackgroundUrl = localStorage.getItem('background_url');
    if (savedBackgroundUrl) {
        // Clear any existing inline styles first
        document.body.style.backgroundImage = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        
        // Apply the saved background
        document.body.style.backgroundImage = `url('${savedBackgroundUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    } else {
        // If no custom background, use random local background
        const randomBg = getRandomLocalBackground();
        document.body.style.backgroundImage = `url('${randomBg}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    }
}

// Load background when page loads
document.addEventListener('DOMContentLoaded', loadBackgroundFromStorage);