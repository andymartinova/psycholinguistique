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
        // Plus besoin de remplir les listes manuellement, elles sont maintenant dans le HTML
        // Le système de traduction s'occupe automatiquement de traduire les éléments data-i18n
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new InstructionsPage();
}); 