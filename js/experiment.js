import { EXPERIMENT_CONFIG } from './config.js';
import { EXPERIMENTAL_SENTENCES } from './data.js';

// Gestion de la page d'expérience principale
class ExperimentPage {
    constructor() {
        this.currentTrial = 0;
        this.experimentData = [];
        this.startTime = 0;
        this.responseTime = 0;
        this.currentSentence = null;
        this.justContinuedFromPause = false;
        
        this.setupEventHandlers();
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

    handleKeyPress(event) {
        // Ignorer si les boutons sont désactivés ou si on est en pause
        const responseButtons = document.querySelector('.response-buttons');
        const pauseArea = document.querySelector('.pause-area');
        
        // Vérifier si les boutons sont disponibles et visibles
        if (!responseButtons || responseButtons.style.opacity === '0') {
            return;
        }
        
        // Vérifier si on est en pause
        if (pauseArea && pauseArea.style.display === 'block') {
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

    startExperiment() {
        this.currentTrial = 0;
        this.experimentData = [];
        this.nextTrial();
    }

    nextTrial() {
        if (this.currentTrial >= EXPERIMENT_CONFIG.totalTrials) {
            // Fin de l'expérience
            this.saveExperimentData();
            window.location.href = 'results.html';
            return;
        }

        // Vérifier si on doit faire une pause
        if (this.currentTrial > 0 && this.currentTrial % EXPERIMENT_CONFIG.pauseAfterTrials === 0 && !this.justContinuedFromPause) {
            this.showPause();
            return;
        }

        // Réinitialiser le flag
        this.justContinuedFromPause = false;

        // Sélectionner une phrase aléatoire
        const availableSentences = EXPERIMENTAL_SENTENCES.filter(s => 
            !this.experimentData.some(d => d.sentence === s.sentence)
        );
        
        if (availableSentences.length === 0) {
            // Toutes les phrases ont été utilisées, mélanger et recommencer
            this.experimentData = [];
            this.currentSentence = EXPERIMENTAL_SENTENCES[Math.floor(Math.random() * EXPERIMENTAL_SENTENCES.length)];
        } else {
            this.currentSentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
        }

        this.displaySentence(this.currentSentence.sentence);
        
        // Mettre à jour les compteurs et la progression
        this.updateCounters();
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
        let response;
        
        // Vérifier si c'est un clic sur un bouton ou une touche clavier
        if (event.target && event.target.closest) {
            // Clic sur un bouton
            const button = event.target.closest('[data-response]');
            if (!button) return;
            response = button.dataset.response;
        } else {
            // Touche clavier - la réponse est directement dans event.target.dataset.response
            response = event.target.dataset.response;
        }
        
        this.responseTime = Date.now() - this.startTime;
        
        this.disableResponseButtons();
        
        // Enregistrer les données pour l'expérience principale
        const trialData = {
            trial: this.currentTrial + 1, // Utiliser le bon numéro d'essai
            sentence: this.currentSentence.sentence,
            condition: this.currentSentence.condition,
            expected: this.currentSentence.expected,
            response: response,
            responseTime: this.responseTime,
            correct: response === this.currentSentence.expected,
            timestamp: new Date().toISOString()
        };
        
        this.experimentData.push(trialData);
        
        // Incrémenter le compteur d'essai après avoir enregistré les données
        this.currentTrial++;
        
        // Passer au prochain essai après un court délai
        setTimeout(() => {
            this.enableResponseButtons();
            this.nextTrial();
        }, 500);
    }

    continueExperiment() {
        console.log('Fonction continueExperiment appelée');
        this.hidePause();
        
        // Activer le flag pour éviter de retomber dans la pause
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

    saveExperimentData() {
        const participantData = JSON.parse(localStorage.getItem('participantData') || '{}');
        const completeData = {
            participant: participantData,
            experiment: {
                config: EXPERIMENT_CONFIG,
                data: this.experimentData,
                endTime: new Date().toISOString()
            }
        };
        
        localStorage.setItem('experimentData', JSON.stringify(completeData));
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new ExperimentPage();
}); 