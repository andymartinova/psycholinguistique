// Gestion de l'interface utilisateur
export class UI {
    constructor() {
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
            instructions: document.getElementById('instructions-screen'),
            practice: document.getElementById('practice-screen'),
            experiment: document.getElementById('experiment-screen'),
            end: document.getElementById('end-screen')
        };
        this.currentScreen = 'welcome';
    }

    showScreen(screenName) {
        // Masquer tous les écrans
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // Afficher l'écran demandé
        this.screens[screenName].classList.add('active');
        this.currentScreen = screenName;
    }

    displaySentence(sentence, currentScreen) {
        let sentenceDisplay;
        if (currentScreen === 'practice') {
            sentenceDisplay = document.getElementById('practice-sentence-display');
        } else if (currentScreen === 'experiment') {
            sentenceDisplay = document.getElementById('experiment-sentence-display');
        } else {
            sentenceDisplay = document.getElementById('sentence-display');
        }
        
        if (sentenceDisplay) {
            sentenceDisplay.textContent = sentence;
            sentenceDisplay.classList.add('fade-in');
        }
    }

    hideResponseButtons() {
        const currentScreenElement = document.querySelector('.screen.active');
        const responseButtons = currentScreenElement.querySelector('.response-buttons');
        if (responseButtons) {
            responseButtons.style.opacity = '0';
            responseButtons.style.pointerEvents = 'none';
        }
    }

    showResponseButtons() {
        const currentScreenElement = document.querySelector('.screen.active');
        const responseButtons = currentScreenElement.querySelector('.response-buttons');
        if (responseButtons) {
            responseButtons.style.opacity = '1';
            responseButtons.style.pointerEvents = 'auto';
        }
    }

    updateProgress(progress, type = 'experiment') {
        const progressFill = document.querySelector('.screen.active .progress-fill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
    }

    updateCounters(practiceCounter, trialCounter, totalTrials) {
        if (practiceCounter !== undefined) {
            const counter = document.getElementById('practice-counter');
            if (counter) counter.textContent = practiceCounter;
        }
        
        if (trialCounter !== undefined) {
            const counter = document.getElementById('trial-counter');
            if (counter) counter.textContent = trialCounter;
        }
        
        if (totalTrials !== undefined) {
            const counter = document.getElementById('total-trials');
            if (counter) counter.textContent = totalTrials;
        }
    }

    showPause() {
        const currentScreenElement = document.querySelector('.screen.active');
        const stimulusArea = currentScreenElement.querySelector('.stimulus-area');
        const pauseArea = currentScreenElement.querySelector('.pause-area');
        
        if (stimulusArea) stimulusArea.style.display = 'none';
        if (pauseArea) pauseArea.style.display = 'block';
    }

    hidePause() {
        const currentScreenElement = document.querySelector('.screen.active');
        const pauseArea = currentScreenElement.querySelector('.pause-area');
        const stimulusArea = currentScreenElement.querySelector('.stimulus-area');
        
        if (pauseArea) pauseArea.style.display = 'none';
        if (stimulusArea) stimulusArea.style.display = 'block';
    }

    showFeedback(message, isCorrect = true) {
        const currentScreenElement = document.querySelector('.screen.active');
        const feedbackArea = currentScreenElement.querySelector('.feedback-area');
        const feedbackMessage = currentScreenElement.querySelector('.feedback-message');
        const stimulusArea = currentScreenElement.querySelector('.stimulus-area');
        
        if (feedbackMessage) {
            feedbackMessage.textContent = message;
            feedbackMessage.className = `feedback-message ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
        }
        
        if (feedbackArea) feedbackArea.style.display = 'block';
        if (stimulusArea) stimulusArea.style.display = 'none';
    }

    hideFeedback() {
        const currentScreenElement = document.querySelector('.screen.active');
        const feedbackArea = currentScreenElement.querySelector('.feedback-area');
        const stimulusArea = currentScreenElement.querySelector('.stimulus-area');
        
        if (feedbackArea) feedbackArea.style.display = 'none';
        if (stimulusArea) stimulusArea.style.display = 'block';
    }

    disableResponseButtons() {
        const currentScreenElement = document.querySelector('.screen.active');
        const responseButtons = currentScreenElement.querySelectorAll('[data-response]');
        responseButtons.forEach(btn => {
            btn.disabled = true;
        });
    }

    enableResponseButtons() {
        const currentScreenElement = document.querySelector('.screen.active');
        const responseButtons = currentScreenElement.querySelectorAll('[data-response]');
        responseButtons.forEach(btn => {
            btn.disabled = false;
        });
    }

    attachResponseEvents(handlers) {
        // Attacher les événements aux boutons de réponse
        document.querySelectorAll('[data-response]').forEach(btn => {
            btn.removeEventListener('click', handlers.handleResponse);
            btn.addEventListener('click', handlers.handleResponse);
        });
        
        // Bouton suivant (feedback)
        const nextBtn = document.querySelector('.btn-next');
        if (nextBtn) {
            nextBtn.removeEventListener('click', handlers.nextPracticeTrial);
            nextBtn.addEventListener('click', handlers.nextPracticeTrial);
        }
        
        // Bouton continuer (pause)
        const continueBtn = document.getElementById('pause-continue-btn');
        if (continueBtn) {
            continueBtn.removeEventListener('click', handlers.continueExperiment);
            continueBtn.addEventListener('click', handlers.continueExperiment);
        }
    }
} 