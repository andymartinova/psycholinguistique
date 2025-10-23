// Gestion de la page d'accueil
class HomePage {
    constructor() {
        this.setupEventHandlers();
        this.setupDynamicTranslation();
    }

    setupEventHandlers() {
        const form = document.getElementById('participant-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveParticipantData();
                window.location.href = 'instructions.html';
            });
        }
    }

    saveParticipantData() {
        const participantId = document.getElementById('participant-id').value.trim();
        const languageGroup = document.getElementById('language-group').value;
        const germanLevel = document.getElementById('german-level') ? document.getElementById('german-level').value : '';
        const data = {
            id: participantId,
            languageGroup: languageGroup,
            germanLevel: germanLevel,
            startTime: new Date().toISOString()
        };
        localStorage.setItem('participantData', JSON.stringify(data));
    }

    setupDynamicTranslation() {
        // Pour traduire dynamiquement les placeholders
        const checkI18n = () => {
            if (window.i18n && window.i18n.loaded) {
                this.translatePlaceholders();
            } else {
                setTimeout(checkI18n, 100);
            }
        };
        checkI18n();
    }

    translatePlaceholders() {
        document.querySelectorAll('[data-i18n-placeholder]').forEach(input => {
            const key = input.getAttribute('data-i18n-placeholder');
            const translation = window.i18n.t(key);
            if (translation) {
                input.placeholder = translation;
            }
        });
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
}); 