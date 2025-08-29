// Gestion de la page de résultats
class ResultsPage {
    constructor() {
        this.experimentData = this.loadExperimentData();
        this.setupEventHandlers();
        this.setupDynamicTranslation();
        this.displayResults();
    }

    setupEventHandlers() {
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadData());
        }
    }

    setupDynamicTranslation() {
        // Traduction dynamique des textes statiques
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
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = window.i18n.t(key);
            if (translation) {
                el.innerHTML = translation;
            }
        });
    }

    loadExperimentData() {
        try {
            const data = localStorage.getItem('experimentData');
            if (!data) return null;
            const parsed = JSON.parse(data);
            if (!parsed || !parsed.experiment || !Array.isArray(parsed.experiment.data) || parsed.experiment.data.length === 0) {
                return null;
            }
            return parsed;
        } catch (e) {
            return null;
        }
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
        let summary;
        try {
            summary = generateSummary(this.experimentData.experiment.data);
        } catch (e) {
            summaryStats.innerHTML = `<div class="info-box"><p>Aucune donnée d'expérience trouvée. Complétez une expérience pour voir vos résultats.</p></div>`;
            return;
        }
        
        const totalTrialsText = window.i18n && window.i18n.t ? window.i18n.t('results.total_trials') : 'Nombre total d\'essais';
        const accuracyText = window.i18n && window.i18n.t ? window.i18n.t('results.accuracy') : 'Précision';
        const avgTimeText = window.i18n && window.i18n.t ? window.i18n.t('results.average_time') : 'Temps de réponse moyen';
        const correctText = window.i18n && window.i18n.t ? window.i18n.t('results.correct_answers') : 'Réponses correctes';
        
        summaryStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${summary.totalTrials}</div>
                <div class="stat-label">${totalTrialsText}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.accuracy}</div>
                <div class="stat-label">${accuracyText}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.avgResponseTime}</div>
                <div class="stat-label">${avgTimeText}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.correctResponses}</div>
                <div class="stat-label">${correctText}</div>
            </div>
        `;
    }

    displayConditionStats() {
        const conditionStats = document.getElementById('condition-stats');
        if (!conditionStats) return;
        let summary;
        try {
            summary = generateSummary(this.experimentData.experiment.data);
        } catch (e) {
            conditionStats.innerHTML = '';
            return;
        }
        
        const conditionLabels = {
            'simple_non_ambiguous': window.i18n && window.i18n.t ? window.i18n.t('results.conditions.simple_unambiguous') : 'Simple, non ambiguë',
            'complex_non_ambiguous': window.i18n && window.i18n.t ? window.i18n.t('results.conditions.complex_unambiguous') : 'Complexe, non ambiguë',
            'ambiguous_easy': window.i18n && window.i18n.t ? window.i18n.t('results.conditions.simple_ambiguous') : 'Simple, ambiguë',
            'ambiguous_difficult': window.i18n && window.i18n.t ? window.i18n.t('results.conditions.complex_ambiguous') : 'Complexe, ambiguë'
        };
        
        const accuracyText = window.i18n && window.i18n.t ? window.i18n.t('results.accuracy') : 'Précision';
        const totalTrialsText = window.i18n && window.i18n.t ? window.i18n.t('results.total_trials') : 'essais';
        const avgTimeText = window.i18n && window.i18n.t ? window.i18n.t('results.average_time') : 'Temps de réponse moyen';
        
        conditionStats.innerHTML = Object.entries(summary.conditionStats).map(([condition, stats]) => `
            <div class="stat-card">
                <div class="stat-label">${conditionLabels[condition] || condition}</div>
                <div class="stat-value">${stats.accuracy}</div>
                <div class="stat-label">${accuracyText} (${stats.trials} ${totalTrialsText})</div>
                <div class="stat-label">${avgTimeText}: ${stats.avgResponseTime}</div>
            </div>
        `).join('');
    }

    showNoDataMessage() {
        const summaryStats = document.getElementById('summary-stats');
        const conditionStats = document.getElementById('condition-stats');
        const noDataMessage = `
            <div class="info-box">
                <p>Aucune donnée d'expérience trouvée. Complétez une expérience pour voir vos résultats.</p>
                <a href="experiment.html" class="btn btn-primary">Commencer l'expérience</a>
            </div>
        `;
        if (summaryStats) summaryStats.innerHTML = noDataMessage;
        if (conditionStats) conditionStats.innerHTML = '';
    }

    downloadData() {
        if (this.experimentData) {
            const participantId = this.experimentData.participant?.id || 'unknown';
            downloadData(this.experimentData, participantId);
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new ResultsPage();
}); 