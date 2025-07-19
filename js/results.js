import { generateSummary, downloadData } from './utils.js';

// Gestion de la page de résultats
class ResultsPage {
    constructor() {
        this.experimentData = this.loadExperimentData();
        this.setupEventHandlers();
        this.displayResults();
    }

    setupEventHandlers() {
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadData());
        }
    }

    loadExperimentData() {
        const data = localStorage.getItem('experimentData');
        return data ? JSON.parse(data) : null;
    }

    displayResults() {
        if (!this.experimentData) {
            this.showNoDataMessage();
            return;
        }

        this.displaySummaryStats();
        this.displayConditionStats();
    }

    displaySummaryStats() {
        const summaryStats = document.getElementById('summary-stats');
        if (!summaryStats) return;

        const summary = generateSummary(this.experimentData.experiment.data);
        
        summaryStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${summary.totalTrials}</div>
                <div class="stat-label">Essais totaux</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.accuracy}</div>
                <div class="stat-label">Précision</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.avgResponseTime}</div>
                <div class="stat-label">Temps de réponse moyen</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.correctResponses}</div>
                <div class="stat-label">Réponses correctes</div>
            </div>
        `;
    }

    displayConditionStats() {
        const conditionStats = document.getElementById('condition-stats');
        if (!conditionStats) return;

        const summary = generateSummary(this.experimentData.experiment.data);
        const conditionLabels = {
            'simple_non_ambiguous': 'Simple, non ambiguë',
            'complex_non_ambiguous': 'Complexe, non ambiguë',
            'ambiguous_easy': 'Ambiguë, résolution facile',
            'ambiguous_difficult': 'Ambiguë, résolution difficile'
        };

        conditionStats.innerHTML = Object.entries(summary.conditionStats).map(([condition, stats]) => `
            <div class="stat-card">
                <div class="stat-label">${conditionLabels[condition] || condition}</div>
                <div class="stat-value">${stats.accuracy}</div>
                <div class="stat-label">Précision (${stats.trials} essais)</div>
                <div class="stat-label">Temps moyen: ${stats.avgResponseTime}</div>
            </div>
        `).join('');
    }

    showNoDataMessage() {
        const summaryStats = document.getElementById('summary-stats');
        const conditionStats = document.getElementById('condition-stats');
        
        const noDataMessage = `
            <div class="info-box">
                <p>Aucune donnée d'expérience trouvée. Veuillez d'abord compléter l'expérience.</p>
                <a href="experiment.html" class="btn btn-primary">Commencer l'expérience</a>
            </div>
        `;

        if (summaryStats) summaryStats.innerHTML = noDataMessage;
        if (conditionStats) conditionStats.innerHTML = '';
    }

    downloadData() {
        if (this.experimentData) {
            const participantId = this.experimentData.participant.id || 'unknown';
            downloadData(this.experimentData, participantId);
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new ResultsPage();
}); 