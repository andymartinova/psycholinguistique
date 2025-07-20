// Gestion de la page d'analyses
class AnalyticsPage {
    constructor() {
        this.importedData = [];
        this.charts = {};
        this.setupEventHandlers();
        this.setupDynamicTranslation();
        this.loadLocalData();
        this.displayAnalytics();
    }

    setupEventHandlers() {
        // Import de fichiers
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        }

        // Boutons d'action
        const exportBtn = document.getElementById('export-analytics-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAnalytics());
        }

        const clearBtn = document.getElementById('clear-data-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllData());
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

    handleFileImport(event) {
        const files = event.target.files;
        for (let file of files) {
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                this.readFile(file);
            } else {
                alert(window.i18n.t('analytics.invalid_file', { name: file.name }) || `Le fichier ${file.name} n'est pas un fichier JSON valide.`);
            }
        }
        event.target.value = '';
    }

    readFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (this.validateDataStructure(data)) {
                    const fileInfo = {
                        name: file.name,
                        size: file.size,
                        lastModified: file.lastModified,
                        data: data
                    };
                    this.importedData.push(fileInfo);
                    this.updateImportedFilesList();
                    this.displayAnalytics();
                } else {
                    alert(window.i18n.t('analytics.invalid_data', { name: file.name }) || `Le fichier ${file.name} ne contient pas des données d'expérience valides.`);
                }
            } catch (error) {
                alert(window.i18n.t('analytics.read_error', { name: file.name, error: error.message }) || `Erreur lors de la lecture du fichier ${file.name}: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }

    validateDataStructure(data) {
        return data && 
               data.participant && 
               data.experiment && 
               data.experiment.data && 
               Array.isArray(data.experiment.data);
    }

    updateImportedFilesList() {
        const filesList = document.getElementById('imported-files');
        if (!filesList) return;
        if (this.importedData.length === 0) {
            filesList.innerHTML = `<p>${window.i18n.t('analytics.no_files')}</p>`;
            return;
        }
        filesList.innerHTML = this.importedData.map((fileInfo, index) => `
            <div class="imported-file-item">
                <div class="imported-file-info">
                    <span class="imported-file-icon">📄</span>
                    <div class="imported-file-details">
                        <div class="imported-file-name">${fileInfo.name}</div>
                        <div class="imported-file-participant">
                            ${window.i18n.t('analytics.participant_label') || 'Participant'}: ${fileInfo.data.participant?.id || 'N/A'} 
                            (${fileInfo.data.experiment?.data?.length || 0} ${window.i18n.t('results.total_trials').toLowerCase()})
                        </div>
                    </div>
                </div>
                <div class="imported-file-actions">
                    <button class="remove-file-btn" data-index="${index}">
                        🗑️ ${window.i18n.t('analytics.remove_file')}
                    </button>
                </div>
            </div>
        `).join('');
        const removeButtons = filesList.querySelectorAll('.remove-file-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeFile(index);
            });
        });
    }

    removeFile(index) {
        this.importedData.splice(index, 1);
        this.updateImportedFilesList();
        this.displayAnalytics();
    }

    loadLocalData() {
        const localData = localStorage.getItem('experimentData');
        if (localData) {
            try {
                const data = JSON.parse(localData);
                if (this.validateDataStructure(data)) {
                    this.importedData.push({
                        name: window.i18n ? window.i18n.t('analytics.local_data') : 'Données locales',
                        size: localData.length,
                        lastModified: Date.now(),
                        data: data
                    });
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données locales:', error);
            }
        }
    }

    displayAnalytics() {
        if (this.importedData.length === 0) {
            this.showNoDataMessage();
            return;
        }
        this.displayGlobalStats();
        this.displayConditionStats();
        this.displayParticipantComparison();
        this.displayCharts();
        this.displayRawData();
    }

    displayGlobalStats() {
        const globalStats = document.getElementById('global-stats');
        if (!globalStats) return;
        const allData = this.getAllExperimentData();
        const totalTrials = allData.length;
        const totalParticipants = this.importedData.length;
        const avgAccuracy = this.calculateAverageAccuracy(allData);
        const avgResponseTime = this.calculateAverageResponseTime(allData);
        globalStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${totalParticipants}</div>
                <div class="stat-label">${window.i18n.t('analytics.stats.total_participants')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalTrials}</div>
                <div class="stat-label">${window.i18n.t('results.total_trials')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgAccuracy.toFixed(1)}%</div>
                <div class="stat-label">${window.i18n.t('analytics.stats.average_accuracy')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgResponseTime.toFixed(0)}ms</div>
                <div class="stat-label">${window.i18n.t('analytics.stats.average_response_time')}</div>
            </div>
        `;
    }

    displayConditionStats() {
        const conditionStats = document.getElementById('condition-stats');
        if (!conditionStats) return;
        const allData = this.getAllExperimentData();
        const conditionLabels = {
            'simple_non_ambiguous': window.i18n.t('results.conditions.simple_unambiguous'),
            'complex_non_ambiguous': window.i18n.t('results.conditions.complex_unambiguous'),
            'ambiguous_easy': window.i18n.t('results.conditions.simple_ambiguous'),
            'ambiguous_difficult': window.i18n.t('results.conditions.complex_ambiguous')
        };
        const conditionStatsData = this.calculateConditionStats(allData);
        conditionStats.innerHTML = Object.entries(conditionStatsData).map(([condition, stats]) => `
            <div class="stat-card">
                <div class="stat-label">${conditionLabels[condition] || condition}</div>
                <div class="stat-value">${stats.accuracy.toFixed(1)}%</div>
                <div class="stat-label">${window.i18n.t('results.accuracy')} (${stats.trials} ${window.i18n.t('results.total_trials').toLowerCase()})</div>
                <div class="stat-label">${window.i18n.t('results.average_time')}: ${stats.avgResponseTime.toFixed(0)}ms</div>
            </div>
        `).join('');
    }

    displayParticipantComparison() {
        const participantComparison = document.getElementById('participant-comparison');
        if (!participantComparison) return;
        participantComparison.innerHTML = this.importedData.map(fileInfo => {
            const data = fileInfo.data.experiment.data;
            const summary = generateSummary(data);
            const participantId = fileInfo.data.participant?.id || 'N/A';
            const languageGroup = fileInfo.data.participant?.languageGroup || 'N/A';
            return `
                <div class="stat-card">
                    <div class="stat-label">${participantId}</div>
                    <div class="stat-value">${summary.accuracy}</div>
                    <div class="stat-label">${window.i18n.t('results.accuracy')}</div>
                    <div class="stat-label">${window.i18n.t('home.language_group_label')}: ${languageGroup}</div>
                    <div class="stat-label">${window.i18n.t('results.total_trials')}: ${summary.totalTrials}</div>
                    <div class="stat-label">${window.i18n.t('results.average_time')}: ${summary.avgResponseTime}</div>
                </div>
            `;
        }).join('');
    }

    displayCharts() {
        const allData = this.getAllExperimentData();
        ['accuracy-chart', 'response-time-chart', 'participant-chart', 'learning-curve-chart'].forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
            }
        });
        if (allData.length > 0) {
            this.charts.accuracy = new AccuracyChart('accuracy-chart', allData);
            this.charts.responseTime = new ResponseTimeChart('response-time-chart', allData);
            this.charts.participant = new ParticipantComparisonChart('participant-chart', this.importedData);
            this.charts.learningCurve = new LearningCurveChart('learning-curve-chart', allData);
        }
    }

    displayRawData() {
        const rawData = document.getElementById('raw-data');
        if (!rawData) return;
        const allData = this.getAllExperimentData();
        if (allData.length === 0) {
            rawData.innerHTML = `<p>${window.i18n.t('analytics.no_data')}</p>`;
            return;
        }
        const tableHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${window.i18n.t('analytics.participant_label') || 'Participant'}</th>
                        <th>${window.i18n.t('results.trial') || 'Essai'}</th>
                        <th>${window.i18n.t('results.sentence') || 'Phrase'}</th>
                        <th>${window.i18n.t('results.condition') || 'Condition'}</th>
                        <th>${window.i18n.t('results.expected') || 'Attendu'}</th>
                        <th>${window.i18n.t('results.response') || 'Réponse'}</th>
                        <th>${window.i18n.t('results.time') || 'Temps'}</th>
                        <th>${window.i18n.t('results.correct') || 'Correct'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${allData.map(trial => {
                        const participantId = trial.participantId || 'N/A';
                        const trialNumber = trial.trial || 'N/A';
                        const sentence = trial.sentence || 'N/A';
                        const condition = this.getConditionLabel(trial.condition || 'N/A');
                        const expected = trial.expected || 'N/A';
                        let response = trial.response;
                        if (!response) {
                            response = window.i18n.t('results.missing') || 'MANQUANT';
                        } else if (response !== 'grammatical' && response !== 'ungrammatical') {
                            response = window.i18n.t('results.invalid') || 'INVALIDE';
                        }
                        const responseTime = formatResponseTime(trial.responseTime || 0);
                        const isCorrect = trial.correct === true;
                        return `
                            <tr>
                                <td>${participantId}</td>
                                <td>${trialNumber}</td>
                                <td>${sentence}</td>
                                <td>${condition}</td>
                                <td>${expected}</td>
                                <td>${response}</td>
                                <td>${responseTime}</td>
                                <td>${isCorrect ? '✅' : '❌'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        rawData.innerHTML = tableHTML;
    }

    getAllExperimentData() {
        const allData = [];
        this.importedData.forEach(fileInfo => {
            const participantId = fileInfo.data.participant?.id || 'N/A';
            const experimentData = fileInfo.data.experiment.data;
            experimentData.forEach(trial => {
                allData.push({
                    ...trial,
                    participantId: participantId
                });
            });
        });
        return allData;
    }

    calculateAverageAccuracy(data) {
        if (data.length === 0) return 0;
        const correctResponses = data.filter(d => d.correct).length;
        return (correctResponses / data.length) * 100;
    }

    calculateAverageResponseTime(data) {
        if (data.length === 0) return 0;
        const totalTime = data.reduce((sum, d) => sum + d.responseTime, 0);
        return totalTime / data.length;
    }

    calculateConditionStats(data) {
        const conditionStats = {};
        ['simple_non_ambiguous', 'complex_non_ambiguous', 'ambiguous_easy', 'ambiguous_difficult'].forEach(condition => {
            const conditionData = data.filter(d => d.condition === condition);
            if (conditionData.length > 0) {
                conditionStats[condition] = {
                    trials: conditionData.length,
                    accuracy: this.calculateAverageAccuracy(conditionData),
                    avgResponseTime: this.calculateAverageResponseTime(conditionData)
                };
            }
        });
        return conditionStats;
    }

    getConditionLabel(condition) {
        if (!condition || condition === 'N/A') return 'N/A';
        const labels = {
            'simple_non_ambiguous': window.i18n.t('results.conditions.simple_unambiguous'),
            'complex_non_ambiguous': window.i18n.t('results.conditions.complex_unambiguous'),
            'ambiguous_easy': window.i18n.t('results.conditions.simple_ambiguous'),
            'ambiguous_difficult': window.i18n.t('results.conditions.complex_ambiguous'),
            'simple': window.i18n.t('results.conditions.simple_unambiguous'),
            'complex': window.i18n.t('results.conditions.complex_unambiguous'),
            'ambiguous': window.i18n.t('results.conditions.simple_ambiguous')
        };
        return labels[condition] || condition;
    }

    showNoDataMessage() {
        const globalStats = document.getElementById('global-stats');
        const conditionStats = document.getElementById('condition-stats');
        const participantComparison = document.getElementById('participant-comparison');
        const chartsContainer = document.getElementById('charts-container');
        const rawData = document.getElementById('raw-data');
        const noDataMessage = `
            <div class="info-box">
                <p>${window.i18n.t('analytics.no_data')}</p>
                <a href="experiment.html" class="btn btn-primary" data-i18n="home.start_button">${window.i18n.t('home.start_button')}</a>
            </div>
        `;
        if (globalStats) globalStats.innerHTML = noDataMessage;
        if (conditionStats) conditionStats.innerHTML = '';
        if (participantComparison) participantComparison.innerHTML = '';
        if (chartsContainer) chartsContainer.innerHTML = noDataMessage;
        if (rawData) rawData.innerHTML = '';
    }

    exportAnalytics() {
        if (this.importedData.length === 0) {
            alert(window.i18n.t('analytics.no_files'));
            return;
        }
        const analyticsData = {
            importedData: this.importedData,
            analytics: {
                globalStats: this.calculateGlobalStats(),
                conditionStats: this.calculateConditionStats(this.getAllExperimentData()),
                exportTime: new Date().toISOString()
            }
        };
        downloadData(analyticsData, 'analytics_complete');
    }

    calculateGlobalStats() {
        const allData = this.getAllExperimentData();
        return {
            totalParticipants: this.importedData.length,
            totalTrials: allData.length,
            averageAccuracy: this.calculateAverageAccuracy(allData),
            averageResponseTime: this.calculateAverageResponseTime(allData)
        };
    }

    clearAllData() {
        if (confirm(window.i18n.t('analytics.clear_confirm'))) {
            this.importedData = [];
            localStorage.removeItem('experimentData');
            this.updateImportedFilesList();
            this.displayAnalytics();
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const analytics = new AnalyticsPage();
    window.removeFile = (index) => analytics.removeFile(index);
}); 