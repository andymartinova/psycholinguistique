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

    generateParticipantId() {
        // Générer un ID unique : P + timestamp + 4 caractères aléatoires
        const timestamp = Date.now().toString(36).toUpperCase();
        const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `P${timestamp}${randomChars}`;
    }

    saveParticipantData() {
        // Générer automatiquement un ID participant unique
        const participantId = this.generateParticipantId();
        const languageGroupRadio = document.querySelector('input[name="language-group"]:checked');
        const languageGroup = languageGroupRadio ? languageGroupRadio.value : '';
        const germanLevel = document.getElementById('german-level') ? document.getElementById('german-level').value : '';
        const notBilingual = document.getElementById('not-bilingual') ? document.getElementById('not-bilingual').checked : false;
        const data = {
            id: participantId,
            languageGroup: languageGroup,
            germanLevel: germanLevel,
            notBilingual: notBilingual,
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