// Gestion de la page de résultats
class ResultsPage {
    constructor() {
        this.experimentData = this.loadExperimentData();
        this.setupEventHandlers();
        this.waitForTranslation();
    }

    waitForTranslation() {
        const checkI18n = () => {
            if (window.i18n && window.i18n.loaded) {
                this.setupDynamicTranslation();
                this.displayResults();
            } else {
                setTimeout(checkI18n, 100);
            }
        };
        checkI18n();
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
                el.textContent = translation;
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
        console.log('Displaying results...', this.experimentData);
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
            summaryStats.innerHTML = `<div class="info-box"><p>${window.i18n.t('analytics.no_data')}</p></div>`;
            return;
        }
        summaryStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${summary.totalTrials}</div>
                <div class="stat-label">${window.i18n.t('results.total_trials')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.accuracy}</div>
                <div class="stat-label">${window.i18n.t('results.accuracy')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.avgResponseTime}</div>
                <div class="stat-label">${window.i18n.t('results.average_time')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.correctResponses}</div>
                <div class="stat-label">${window.i18n.t('results.correct_answers')}</div>
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
            'simple_non_ambiguous': window.i18n.t('results.conditions.simple_unambiguous'),
            'complex_non_ambiguous': window.i18n.t('results.conditions.complex_unambiguous'),
            'ambiguous_easy': window.i18n.t('results.conditions.simple_ambiguous'),
            'ambiguous_difficult': window.i18n.t('results.conditions.complex_ambiguous')
        };
        conditionStats.innerHTML = Object.entries(summary.conditionStats).map(([condition, stats]) => `
            <div class="stat-card">
                <div class="stat-label">${conditionLabels[condition] || condition}</div>
                <div class="stat-value">${stats.accuracy}</div>
                <div class="stat-label">${window.i18n.t('results.accuracy')} (${stats.trials} ${window.i18n.t('results.total_trials').toLowerCase()})</div>
                <div class="stat-label">${window.i18n.t('results.average_time')}: ${stats.avgResponseTime}</div>
            </div>
        `).join('');
    }

    showNoDataMessage() {
        const summaryStats = document.getElementById('summary-stats');
        const conditionStats = document.getElementById('condition-stats');
        const noDataMessage = `
            <div class="info-box">
                <p>${window.i18n.t('analytics.no_data')}</p>
                <a href="experiment.html" class="btn btn-primary" data-i18n="home.start_button">${window.i18n.t('home.start_button')}</a>
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