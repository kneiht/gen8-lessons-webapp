
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
});

// Run when window is resized
window.addEventListener('resize', adjustFontSize);
