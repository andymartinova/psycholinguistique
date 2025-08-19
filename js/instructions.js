// Gestion de la page d'instructions
class InstructionsPage {
    constructor() {
        this.setupEventHandlers();
        this.setupDynamicContent();
    }

    setupEventHandlers() {
        const startPracticeBtn = document.getElementById('start-practice-btn');
        
        startPracticeBtn.addEventListener('click', () => {
            window.location.href = 'training.html';
        });
    }

    setupDynamicContent() {
        // Plus besoin de contenu dynamique
        // Le système data-i18n gère automatiquement les traductions
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new InstructionsPage();
}); 