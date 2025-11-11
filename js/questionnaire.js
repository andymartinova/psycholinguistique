// Gestion de la page de questionnaire
class QuestionnairePage {
    constructor() {
        this.setupEventHandlers();
        this.setupDynamicTranslation();
    }

    setupEventHandlers() {
        const form = document.getElementById('questionnaire-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitQuestionnaire();
            });
        }
    }

    setupDynamicTranslation() {
        // Pour traduire dynamiquement les textes
        const checkI18n = () => {
            if (window.i18n && window.i18n.loaded) {
                this.translatePage();
            } else {
                setTimeout(checkI18n, 100);
            }
        };
        checkI18n();
    }

    translatePage() {
        // Traduction des éléments avec data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = window.i18n.t(key);
            if (translation) {
                el.textContent = translation;
            }
        });

        // Traduction des placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(input => {
            const key = input.getAttribute('data-i18n-placeholder');
            const translation = window.i18n.t(key);
            if (translation) {
                input.placeholder = translation;
            }
        });
    }

    async submitQuestionnaire() {
        // Récupérer les données du formulaire
        const formData = {
            age: document.getElementById('age')?.value || null,
            gender: document.querySelector('input[name="gender"]:checked')?.value || null,
            learningDuration: document.getElementById('learning-duration')?.value || null,
            feeling: document.querySelector('input[name="feeling"]:checked')?.value || null,
            educationLevel: document.getElementById('education-level')?.value || null,
            germanUsageFrequency: document.querySelector('input[name="german-usage-frequency"]:checked')?.value || null
        };

        // Récupérer l'ID du participant depuis localStorage
        const participantData = JSON.parse(localStorage.getItem('participantData') || '{}');
        const participantId = participantData.id;

        if (!participantId) {
            console.error('ID du participant non trouvé');
            // Rediriger quand même vers les résultats
            window.location.href = 'results.html';
            return;
        }

        // Sauvegarder les données du questionnaire dans localStorage
        const questionnaireData = {
            participantId: participantId,
            ...formData,
            submittedAt: new Date().toISOString()
        };
        localStorage.setItem('questionnaireData', JSON.stringify(questionnaireData));

        // Envoyer les données au backend si l'API est configurée
        if (typeof getApiBaseUrl === 'function') {
            try {
                await this.sendQuestionnaireToAPI(participantId, formData);
            } catch (error) {
                console.error('Erreur lors de l\'envoi du questionnaire:', error);
                // Continuer même en cas d'erreur
            }
        }

        // Rediriger vers la page des résultats
        window.location.href = 'results.html';
    }

    async sendQuestionnaireToAPI(participantId, questionnaireData) {
        // Vérifier si getApiBaseUrl est disponible (depuis config.js)
        if (typeof getApiBaseUrl !== 'function') {
            console.log('getApiBaseUrl non disponible, envoi du questionnaire ignoré');
            return { success: false, message: 'API non configurée' };
        }
        
        const baseUrl = getApiBaseUrl();
        if (!baseUrl) {
            return { success: false, message: 'API non configurée' };
        }

        try {
            const response = await fetch(`${baseUrl}/api/participants/${participantId}/questionnaire`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(questionnaireData)
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Questionnaire envoyé avec succès:', result);
            return { success: true, data: result };
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi du questionnaire:', error);
            throw error;
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new QuestionnairePage();
});

