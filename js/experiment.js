// Gestion de la page d'expérience principale
class ExperimentPage {
    constructor() {
        this.currentTrial = 0;
        this.experimentData = [];
        this.startTime = 0;
        this.responseTime = 0;
        this.currentSentence = null;
        this.justContinuedFromPause = false;
        this.isProcessingResponse = false; // Flag pour empêcher les doubles clics
        this.isSavingData = false; // Flag pour empêcher les envois multiples
        this.experimentSent = false; // Flag pour éviter d'envoyer l'experiment plusieurs fois
        this.setupEventHandlers();
        this.setupDynamicTranslation();
        this.startExperiment();
    }

    setupEventHandlers() {
        // Boutons de réponse
        document.querySelectorAll('[data-response]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleResponse(e));
        });

        // Bouton continuer (pause)
        const continueBtn = document.getElementById('pause-continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.continueExperiment());
        }

        // Support des touches clavier
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    setupDynamicTranslation() {
        // Pour traduire dynamiquement les boutons et textes statiques
        const checkI18n = () => {
            if (window.i18n && window.i18n.loaded) {
                this.translateStaticTexts();
            } else {
                setTimeout(checkI18n, 100);
            }
        };
        checkI18n();
    }

    translateStaticTexts() {
        // Traduction des boutons et textes statiques
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = window.i18n.t(key);
            if (translation) {
                el.innerHTML = translation;
            }
        });
    }

    handleKeyPress(event) {
        // Ignorer si les boutons sont désactivés, si on est en pause, ou si une réponse est en cours
        if (this.isProcessingResponse) {
            return;
        }
        
        const responseButtons = document.querySelector('.response-buttons');
        const pauseArea = document.querySelector('.pause-area');
        if (!responseButtons || responseButtons.style.opacity === '0') {
            return;
        }
        if (pauseArea && pauseArea.style.display === 'block') {
            return;
        }
        const key = event.key.toLowerCase();
        if (key === 'y' || key === 'o') {
            event.preventDefault();
            this.handleResponse({ target: { dataset: { response: 'grammatical' } } });
        } else if (key === 'n') {
            event.preventDefault();
            this.handleResponse({ target: { dataset: { response: 'ungrammatical' } } });
        }
    }

    startExperiment() {
        this.currentTrial = 0;
        this.experimentData = [];
        this.nextTrial();
    }

    async nextTrial() {
        if (this.currentTrial >= EXPERIMENT_CONFIG.totalTrials) {
            // Empêcher les appels multiples
            if (this.isSavingData) {
                return;
            }
            
            // Sauvegarder et envoyer les données avant de rediriger
            await this.saveExperimentData();
            // Attendre un court délai pour s'assurer que l'envoi est terminé
            await new Promise(resolve => setTimeout(resolve, 500));
            window.location.href = 'results.html';
            return;
        }
        if (this.currentTrial > 0 && this.currentTrial % EXPERIMENT_CONFIG.pauseAfterTrials === 0 && !this.justContinuedFromPause) {
            this.showPause();
            return;
        }
        this.justContinuedFromPause = false;
        const availableSentences = EXPERIMENTAL_SENTENCES.filter(s => 
            !this.experimentData.some(d => d.sentence === s.sentence)
        );
        if (availableSentences.length === 0) {
            this.experimentData = [];
            this.currentSentence = EXPERIMENTAL_SENTENCES[Math.floor(Math.random() * EXPERIMENTAL_SENTENCES.length)];
        } else {
            this.currentSentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
        }
        this.displaySentence(this.currentSentence.sentence);
        this.updateCounters();
        this.updateProgress();
    }

    displaySentence(sentence) {
        const sentenceDisplay = document.getElementById('sentence-display');
        if (sentenceDisplay) {
            sentenceDisplay.textContent = sentence;
            sentenceDisplay.classList.add('fade-in');
        }
        this.showResponseButtons();
        this.startTime = Date.now();
        setTimeout(() => {
            const sentenceDisplay = document.querySelector('.sentence');
            if (sentenceDisplay) sentenceDisplay.classList.remove('fade-in');
        }, EXPERIMENT_CONFIG.sentenceDisplayTime);
    }

    handleResponse(event) {
        // Empêcher les doubles clics
        if (this.isProcessingResponse) {
            return;
        }
        
        this.isProcessingResponse = true;
        
        let response;
        if (event.target && event.target.closest) {
            const button = event.target.closest('[data-response]');
            if (!button) {
                this.isProcessingResponse = false;
                return;
            }
            response = button.dataset.response;
        } else {
            response = event.target.dataset.response;
        }
        this.responseTime = Date.now() - this.startTime;
        this.disableResponseButtons();
        const trialData = {
            trial: this.currentTrial + 1,
            sentence: this.currentSentence.sentence,
            condition: this.currentSentence.condition,
            expected: this.currentSentence.expected,
            response: response,
            responseTime: this.responseTime,
            correct: response === this.currentSentence.expected,
            timestamp: new Date().toISOString()
        };
        this.experimentData.push(trialData);
        // Ne pas afficher de feedback pendant l'expérience principale
        this.currentTrial++;
        setTimeout(() => {
            this.isProcessingResponse = false;
            this.enableResponseButtons();
            this.nextTrial();
        }, 500);
    }

    showFeedback(isCorrect) {
        // Ne rien faire : pas de feedback pendant l'expérience principale
    }

    hideFeedback() {
        // Remet le texte de progression normal
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.innerHTML = window.i18n && window.i18n.loaded ? window.i18n.t('experiment.progress') : 'Essai';
        }
    }

    continueExperiment() {
        this.hidePause();
        this.justContinuedFromPause = true;
        this.nextTrial();
    }

    showPause() {
        const stimulusArea = document.querySelector('.stimulus-area');
        const pauseArea = document.querySelector('.pause-area');
        if (stimulusArea) stimulusArea.style.display = 'none';
        if (pauseArea) pauseArea.style.display = 'block';
    }

    hidePause() {
        const pauseArea = document.querySelector('.pause-area');
        const stimulusArea = document.querySelector('.stimulus-area');
        if (pauseArea) pauseArea.style.display = 'none';
        if (stimulusArea) stimulusArea.style.display = 'block';
    }

    hideResponseButtons() {
        const responseButtons = document.querySelector('.response-buttons');
        if (responseButtons) {
            responseButtons.style.opacity = '0';
            responseButtons.style.pointerEvents = 'none';
        }
    }

    showResponseButtons() {
        const responseButtons = document.querySelector('.response-buttons');
        if (responseButtons) {
            responseButtons.style.opacity = '1';
            responseButtons.style.pointerEvents = 'auto';
        }
    }

    disableResponseButtons() {
        const responseButtons = document.querySelectorAll('[data-response]');
        responseButtons.forEach(btn => {
            btn.disabled = true;
        });
    }

    enableResponseButtons() {
        const responseButtons = document.querySelectorAll('[data-response]');
        responseButtons.forEach(btn => {
            btn.disabled = false;
        });
    }

    updateCounters() {
        const counter = document.getElementById('trial-counter');
        if (counter) counter.textContent = this.currentTrial + 1;
    }

    updateProgress() {
        const progress = (this.experimentData.length / EXPERIMENT_CONFIG.totalTrials) * 100;
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
    }

    async saveExperimentData() {
        // Empêcher les appels multiples
        if (this.isSavingData) {
            return Promise.resolve();
        }
        
        // Empêcher d'envoyer l'experiment plusieurs fois
        if (this.experimentSent) {
            return Promise.resolve();
        }
        
        this.isSavingData = true;
        
        try {
            const participantData = JSON.parse(localStorage.getItem('participantData') || '{}');
            // Note: this.experimentData contient uniquement les trials de l'expérience principale,
            // pas les trials d'entraînement (training) qui ne sont pas sauvegardés
            const completeData = {
                participant: participantData,
                experiment: {
                    config: EXPERIMENT_CONFIG,
                    data: this.experimentData, // Seulement les trials de l'expérience principale
                    endTime: new Date().toISOString()
                }
            };
            localStorage.setItem('experimentData', JSON.stringify(completeData));
            
            // Envoyer automatiquement les résultats à l'API si configuré
            if (typeof sendResultsToAPI === 'function') {
                try {
                    // Attendre que l'envoi soit terminé avant de continuer
                    const result = await sendResultsToAPI(completeData);
                    if (result.success) {
                        this.experimentSent = true; // Marquer l'experiment comme envoyé
                    }
                    // Les données restent dans localStorage même en cas d'erreur
                } catch (error) {
                    // Les données restent dans localStorage même en cas d'erreur
                }
            }
        } finally {
            // Toujours réinitialiser le flag, même en cas d'erreur
            this.isSavingData = false;
        }
        
        return Promise.resolve();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new ExperimentPage();
}); 