import { EXPERIMENT_CONFIG } from './config.js';
import { PRACTICE_SENTENCES } from './data.js';

// Gestion de la page d'entraînement
class TrainingPage {
    constructor() {
        this.practiceTrial = 0;
        this.startTime = 0;
        this.responseTime = 0;
        this.currentSentence = null;
        this.setupEventHandlers();
        this.startTraining();
    }

    setupEventHandlers() {
        // Boutons de réponse
        document.querySelectorAll('[data-response]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleResponse(e));
        });

        // Support des touches clavier
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(event) {
        // Ignorer si les boutons sont désactivés
        const responseButtons = document.querySelector('.response-buttons');
        if (!responseButtons || responseButtons.style.opacity === '0') {
            return;
        }

        const key = event.key.toLowerCase();
        
        if (key === 'y' || key === 'o') {
            // Y ou O pour Grammaticale
            event.preventDefault();
            this.handleResponse({ target: { dataset: { response: 'grammatical' } } });
        } else if (key === 'n') {
            // N pour Non grammaticale
            event.preventDefault();
            this.handleResponse({ target: { dataset: { response: 'ungrammatical' } } });
        }
    }

    startTraining() {
        this.practiceTrial = 0;
        this.nextPracticeTrial();
    }

    nextPracticeTrial() {
        if (this.practiceTrial >= PRACTICE_SENTENCES.length) {
            // Fin de l'entraînement
            this.showTrainingComplete();
            return;
        }

        this.currentSentence = PRACTICE_SENTENCES[this.practiceTrial];
        this.displaySentence(this.currentSentence.sentence);
        this.practiceTrial++;
        this.updateProgress();
    }

    displaySentence(sentence) {
        const sentenceDisplay = document.getElementById('sentence-display');
        if (sentenceDisplay) {
            sentenceDisplay.textContent = sentence;
            sentenceDisplay.classList.add('fade-in');
        }
        
        // Afficher les boutons immédiatement avec la phrase
        this.showResponseButtons();
        
        // Enregistrer le temps de début
        this.startTime = Date.now();
        
        // Retirer l'animation après un délai
        setTimeout(() => {
            const sentenceDisplay = document.querySelector('.sentence');
            if (sentenceDisplay) sentenceDisplay.classList.remove('fade-in');
        }, EXPERIMENT_CONFIG.sentenceDisplayTime);
    }

    handleResponse(event) {
        const response = event.target.dataset.response;
        this.responseTime = Date.now() - this.startTime;
        
        this.disableResponseButtons();
        
        const isCorrect = response === this.currentSentence.expected;
        
        // Afficher le feedback
        this.showFeedback(isCorrect);
        
        // Passer au prochain essai après un délai
        setTimeout(() => {
            this.hideFeedback();
            this.enableResponseButtons();
            this.nextPracticeTrial();
        }, 1500);
    }

    showFeedback(isCorrect) {
        const feedbackArea = document.querySelector('.feedback-area');
        const feedbackMessage = document.querySelector('.feedback-message');
        
        if (feedbackArea && feedbackMessage) {
            feedbackArea.style.display = 'block';
            
            if (isCorrect) {
                feedbackMessage.textContent = '✅ Correct !';
                feedbackMessage.className = 'feedback-message feedback-correct';
            } else {
                feedbackMessage.textContent = `❌ Incorrect. La réponse attendue était : ${this.currentSentence.expected === 'grammatical' ? 'Grammaticale' : 'Non grammaticale'}`;
                feedbackMessage.className = 'feedback-message feedback-incorrect';
            }
        }
    }

    hideFeedback() {
        const feedbackArea = document.querySelector('.feedback-area');
        if (feedbackArea) {
            feedbackArea.style.display = 'none';
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

    updateProgress() {
        const progress = (this.practiceTrial / PRACTICE_SENTENCES.length) * 100;
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        
        const counter = document.getElementById('practice-counter');
        if (counter) {
            counter.textContent = this.practiceTrial;
        }
    }

    showTrainingComplete() {
        const stimulusArea = document.querySelector('.stimulus-area');
        const navigationButtons = document.querySelector('.navigation-buttons');
        
        if (stimulusArea) stimulusArea.style.display = 'none';
        if (navigationButtons) navigationButtons.style.display = 'flex';
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new TrainingPage();
}); 