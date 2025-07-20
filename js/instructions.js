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
        // Attend que le système de traduction soit chargé
        const checkI18n = () => {
            if (window.i18n && window.i18n.loaded) {
                this.populateLists();
            } else {
                setTimeout(checkI18n, 100);
            }
        };
        checkI18n();
    }

    populateLists() {
        // Remplit la liste des étapes de procédure
        const procedureSteps = document.getElementById('procedure-steps');
        if (procedureSteps && window.i18n) {
            const steps = window.i18n.t('instructions.procedure_steps');
            if (Array.isArray(steps)) {
                procedureSteps.innerHTML = steps.map(step => `<li>${step}</li>`).join('');
            }
        }

        // Remplit la liste des contrôles
        const controlsItems = document.getElementById('controls-items');
        if (controlsItems && window.i18n) {
            const controls = window.i18n.t('instructions.controls_items');
            if (Array.isArray(controls)) {
                controlsItems.innerHTML = controls.map(control => `<li>${control}</li>`).join('');
            }
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new InstructionsPage();
}); 