// Gestion de la page d'accueil
class HomePage {
    constructor() {
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        const participantId = document.getElementById('participant-id');
        const languageGroup = document.getElementById('language-group');
        const startBtn = document.getElementById('start-btn');

        const validateForm = () => {
            const isValid = participantId.value.trim() && languageGroup.value;
            startBtn.disabled = !isValid;
        };

        participantId.addEventListener('input', validateForm);
        languageGroup.addEventListener('change', validateForm);
        validateForm(); // Valider au chargement pour les valeurs pré-remplies

        startBtn.addEventListener('click', () => {
            this.saveParticipantData();
            window.location.href = 'instructions.html';
        });
    }

    saveParticipantData() {
        const participantData = {
            id: document.getElementById('participant-id').value.trim(),
            languageGroup: document.getElementById('language-group').value,
            startTime: new Date().toISOString()
        };
        
        localStorage.setItem('participantData', JSON.stringify(participantData));
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
}); 