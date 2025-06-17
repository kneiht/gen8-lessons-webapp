// Common functions for worksheets

// Function to print the worksheet
function printWorksheet() {
    window.print();
}

// Function to check answers in input fields
function checkAnswer(input) {
    const userAnswer = input.value ? input.value.toLowerCase().trim().replace(/[.,!?]/g, '') : input.checked ? input.value : '';
    const correctAnswer = input.dataset.answer.toLowerCase().trim().replace(/[.,!?]/g, '');
    console.log(userAnswer, correctAnswer);
    // Handle radio buttons
    if (input.type === 'radio') {
        const radioGroup = document.getElementsByName(input.name);
        radioGroup.forEach(radio => {
            const container = radio.closest('.radio-group');
            // Reset all containers first
            container.classList.remove('bg-green-100', 'border-green-500', 'bg-red-100', 'border-red-500');
            
            // Always show correct answer in green
            if (userAnswer === correctAnswer) {
                container.classList.add('bg-green-100', 'border-green-500');
            }
            
            // If this is the selected answer and it's wrong, show it in red
            if (userAnswer !== correctAnswer) {
                container.classList.add('bg-red-100', 'border-red-500');
            }
        });
        return;
    }
    
    // Handle text inputs
    if (userAnswer === correctAnswer) {
        input.classList.remove('border-red-500', 'bg-red-100', 'rounded-md');
        input.classList.add('border-green-500', 'bg-green-100', 'rounded-md');
    } else if (userAnswer !== '') {
        input.classList.remove('border-green-500', 'bg-green-100', 'rounded-md');
        input.classList.add('border-red-500', 'bg-red-100', 'rounded-md');
    }
}

// Function to highlight phrases in sentences
function highlightPhrase(element) {
    const text = element.querySelector('p').textContent;
    const phrasesToHighlight = element.dataset.phrases ? element.dataset.phrases.split(',') : [];
    
    let highlightedText = text;
    
    // Highlight each phrase
    phrasesToHighlight.forEach(phrase => {
        const cleanPhrase = phrase.trim();
        if (cleanPhrase) {
            // Create a case-insensitive regex for the phrase
            const regex = new RegExp(`\\b${cleanPhrase}\\b`, 'gi');
            highlightedText = highlightedText.replace(regex, match => `<span class="bg-yellow-200">${match}</span>`);
        }
    });
    
    element.querySelector('p').innerHTML = highlightedText;
} 