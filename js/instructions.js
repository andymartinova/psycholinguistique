// Gestion de la page d'instructions
class InstructionsPage {
    constructor() {
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        const startPracticeBtn = document.getElementById('start-practice-btn');
        
        startPracticeBtn.addEventListener('click', () => {
            window.location.href = 'training.html';
        });
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new InstructionsPage();
}); 