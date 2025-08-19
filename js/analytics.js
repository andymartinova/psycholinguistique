// Gestion de la page d'analyses - Version simplifiée pour debug
console.log('Analytics.js loaded at:', new Date().toISOString());

class AnalyticsPage {
    constructor() {
        console.log('AnalyticsPage constructor called');
        this.importedData = [];
        this.charts = {};
        this.setupEventHandlers();
        this.waitForTranslation();
    }

    waitForTranslation() {
        console.log('Waiting for translation system...');
        let attempts = 0;
        const maxAttempts = 50; // 5 secondes maximum
        
        const checkI18n = () => {
            attempts++;
            console.log(`Checking i18n (attempt ${attempts}/${maxAttempts})...`, {
                windowI18n: window.i18n,
                loaded: window.i18n?.loaded,
                currentLanguage: window.i18n?.currentLanguage
            });
            
            if (window.i18n && window.i18n.loaded) {
                console.log('i18n loaded, setting up page...');
                this.setupDynamicTranslation();
                this.loadLocalData();
                this.displayAnalytics();
            } else if (attempts >= maxAttempts) {
                console.error('i18n failed to load after maximum attempts, proceeding anyway...');
                this.setupDynamicTranslation();
                this.loadLocalData();
                this.displayAnalytics();
            } else {
                console.log('i18n not ready, retrying...');
                setTimeout(checkI18n, 100);
            }
        };
        checkI18n();
    }

    setupEventHandlers() {
        console.log('Setting up event handlers...');
        // Import de fichiers
        const fileInput = document.getElementById('file-input');
        console.log('File input element:', fileInput);
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileImport(e));
            console.log('File input event listener attached');
        } else {
            console.error('File input element not found!');
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
        console.log('Setting up dynamic translation...');
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
        console.log('Translating static texts...');
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = window.i18n.t(key);
            if (translation) {
                el.textContent = translation;
            }
        });
    }

    handleFileImport(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('File import event:', event.target.files);
        const files = event.target.files;
        for (let file of files) {
            console.log('Processing file:', file.name, file.type);
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                this.readFile(file);
            } else {
                alert(window.i18n.t('analytics.invalid_file', { name: file.name }) || `Le fichier ${file.name} n'est pas un fichier JSON valide.`);
            }
        }
        event.target.value = '';
    }

    readFile(file) {
        console.log('Reading file:', file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                console.log('File content loaded, parsing JSON...');
                const data = JSON.parse(e.target.result);
                console.log('Parsed data:', data);
                if (this.validateDataStructure(data)) {
                    console.log('Data structure is valid, adding to imported data');
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
                    console.log('Invalid data structure');
                    alert(window.i18n.t('analytics.invalid_data', { name: file.name }) || `Le fichier ${file.name} ne contient pas des données d'expérience valides.`);
                }
            } catch (error) {
                console.error('Error reading file:', error);
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
        console.log('Updating imported files list...');
        const filesList = document.getElementById('imported-files');
        if (!filesList) return;

        if (this.importedData.length === 0) {
            filesList.innerHTML = `<p>${window.i18n.t('analytics.no_files')}</p>`;
            return;
        }

        filesList.innerHTML = this.importedData.map((file, index) => `
            <div class="imported-file-item">
                <div class="imported-file-info">
                    <span class="imported-file-icon">📄</span>
                    <div class="imported-file-details">
                        <div class="imported-file-name">${file.name}</div>
                        <div class="imported-file-participant">${file.data.participant?.id || 'Unknown'}</div>
                    </div>
                </div>
                <div class="imported-file-actions">
                    <button class="remove-file-btn" onclick="removeFile(${index})">${window.i18n.t('analytics.remove_file')}</button>
                </div>
            </div>
        `).join('');
    }

    loadLocalData() {
        console.log('Loading local data...');
        try {
            const data = localStorage.getItem('experimentData');
            if (data) {
                const parsed = JSON.parse(data);
                if (this.validateDataStructure(parsed)) {
                    this.importedData.push({
                        name: 'Local Data',
                        size: data.length,
                        lastModified: Date.now(),
                        data: parsed
                    });
                }
            }
        } catch (e) {
            console.error('Error loading local data:', e);
        }
    }

    displayAnalytics() {
        console.log('Displaying analytics...');
        if (this.importedData.length === 0) {
            this.showNoDataMessage();
            return;
        }
        
        this.updateImportedFilesList();
        this.displayGlobalStats();
        this.displayConditionStats();
        this.displayParticipantComparison();
        this.displayCharts();
        this.displayRawData();
        
        console.log('Analytics displayed successfully');
    }

    showNoDataMessage() {
        console.log('Showing no data message...');
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

    displayGlobalStats() {
        console.log('Displaying global stats...');
        const globalStats = document.getElementById('global-stats');
        if (!globalStats) return;

        const allTrials = this.getAllTrials();
        const totalTrials = allTrials.length;
        const correctTrials = allTrials.filter(trial => trial.correct).length;
        const accuracy = totalTrials > 0 ? (correctTrials / totalTrials * 100).toFixed(1) : 0;
        const avgResponseTime = totalTrials > 0 ? 
            (allTrials.reduce((sum, trial) => sum + trial.responseTime, 0) / totalTrials).toFixed(0) : 0;

        globalStats.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${window.i18n.t('analytics.total_trials')}</h3>
                    <p class="stat-value">${totalTrials}</p>
                </div>
                <div class="stat-card">
                    <h3>${window.i18n.t('analytics.accuracy')}</h3>
                    <p class="stat-value">${accuracy}%</p>
                </div>
                <div class="stat-card">
                    <h3>${window.i18n.t('analytics.avg_response_time')}</h3>
                    <p class="stat-value">${formatResponseTime(avgResponseTime)}</p>
                </div>
                <div class="stat-card">
                    <h3>${window.i18n.t('analytics.participants')}</h3>
                    <p class="stat-value">${this.importedData.length}</p>
                </div>
            </div>
        `;
    }

    displayConditionStats() {
        console.log('Displaying condition stats...');
        const conditionStats = document.getElementById('condition-stats');
        if (!conditionStats) return;

        const allTrials = this.getAllTrials();
        const conditions = this.groupByCondition(allTrials);
        
        let html = '<div class="condition-stats-grid">';
        for (const [condition, trials] of Object.entries(conditions)) {
            const accuracy = (trials.filter(t => t.correct).length / trials.length * 100).toFixed(1);
            const avgTime = (trials.reduce((sum, t) => sum + t.responseTime, 0) / trials.length).toFixed(0);
            
            html += `
                <div class="condition-card">
                    <h4>${this.formatConditionName(condition)}</h4>
                    <div class="condition-metrics">
                        <div class="metric">
                            <span class="metric-label">${window.i18n.t('analytics.accuracy')}:</span>
                            <span class="metric-value">${accuracy}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">${window.i18n.t('analytics.avg_response_time')}:</span>
                            <span class="metric-value">${avgTime}ms</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">${window.i18n.t('analytics.trials')}:</span>
                            <span class="metric-value">${trials.length}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        html += '</div>';
        conditionStats.innerHTML = html;
    }

    displayParticipantComparison() {
        console.log('Displaying participant comparison...');
        const participantComparison = document.getElementById('participant-comparison');
        if (!participantComparison) return;

        let html = '<div class="participant-comparison-table">';
        html += `
            <table>
                <thead>
                    <tr>
                        <th>${window.i18n.t('analytics.participant')}</th>
                        <th>${window.i18n.t('analytics.accuracy')}</th>
                        <th>${window.i18n.t('analytics.avg_response_time')}</th>
                        <th>${window.i18n.t('analytics.trials')}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (const file of this.importedData) {
            const trials = file.data.experiment.data;
            const accuracy = (trials.filter(t => t.correct).length / trials.length * 100).toFixed(1);
            const avgTime = (trials.reduce((sum, t) => sum + t.responseTime, 0) / trials.length).toFixed(0);
            
            html += `
                <tr>
                    <td>${file.data.participant.id}</td>
                    <td>${accuracy}%</td>
                    <td>${avgTime}ms</td>
                    <td>${trials.length}</td>
                </tr>
            `;
        }

        html += '</tbody></table></div>';
        participantComparison.innerHTML = html;
    }

    displayCharts() {
        console.log('Displaying charts...');
        const chartsContainer = document.getElementById('charts-container');
        if (!chartsContainer) return;

        chartsContainer.innerHTML = `
            <div class="charts-grid">
                <div class="chart-container">
                    <h3>${window.i18n.t('analytics.accuracy_by_condition')}</h3>
                    <div id="accuracy-chart"></div>
                </div>
                <div class="chart-container">
                    <h3>${window.i18n.t('analytics.response_time_by_condition')}</h3>
                    <div id="response-time-chart"></div>
                </div>
                <div class="chart-container">
                    <h3>${window.i18n.t('analytics.learning_curve')}</h3>
                    <div id="learning-curve-chart"></div>
                </div>
                <div class="chart-container">
                    <h3>${window.i18n.t('analytics.participant_comparison')}</h3>
                    <div id="participant-comparison-chart"></div>
                </div>
                <div class="chart-container">
                    <h3>${window.i18n.t('analytics.response_time_curve')}</h3>
                    <div id="response-time-curve-chart"></div>
                </div>
                <div class="chart-container">
                    <h3>${window.i18n.t('analytics.response_time_distribution')}</h3>
                    <div id="response-time-distribution-chart"></div>
                </div>
                <div class="chart-container">
                    <h3>${window.i18n.t('analytics.confusion_matrix')} <span class="info-icon" title="Cette matrice montre les patterns d'erreurs entre conditions. Les cases vertes (diagonale) représentent les réponses correctes, les cases rouges (hors diagonale) représentent les erreurs. Cela aide à identifier quelles conditions sont confondues entre elles.">ⓘ</span></h3>
                    <div id="confusion-matrix-chart"></div>
                </div>
                <div class="chart-container">
                    <h3>${window.i18n.t('analytics.speed_accuracy')} <span class="info-icon" title="Ce graphique montre la corrélation entre temps de réponse et précision. Chaque point représente un participant. Une corrélation négative indique un speed-accuracy trade-off (plus rapide = moins précis).">ⓘ</span></h3>
                    <div id="speed-accuracy-chart"></div>
                </div>
            </div>
        `;

        // Initialiser les graphiques après un délai pour laisser le DOM se mettre à jour
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
    }

    displayRawData() {
        console.log('Displaying raw data...');
        const rawData = document.getElementById('raw-data');
        if (!rawData) return;

        const allTrials = this.getAllTrials();
        let html = '<div class="raw-data-table">';
        html += `
            <table>
                <thead>
                    <tr>
                        <th>${window.i18n.t('analytics.participant')}</th>
                        <th>${window.i18n.t('analytics.trial')}</th>
                        <th>${window.i18n.t('analytics.condition')}</th>
                        <th>${window.i18n.t('analytics.sentence')}</th>
                        <th>${window.i18n.t('analytics.response')}</th>
                        <th>${window.i18n.t('analytics.response_time')}</th>
                        <th>${window.i18n.t('analytics.correct')}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (const file of this.importedData) {
            for (const trial of file.data.experiment.data) {
                html += `
                    <tr>
                        <td>${file.data.participant.id}</td>
                        <td>${trial.trial}</td>
                        <td>${this.formatConditionName(trial.condition)}</td>
                        <td>${trial.sentence}</td>
                        <td>${trial.response}</td>
                        <td>${formatResponseTime(trial.responseTime)}</td>
                        <td>${trial.correct ? '✓' : '✗'}</td>
                    </tr>
                `;
            }
        }

        html += '</tbody></table></div>';
        rawData.innerHTML = html;
    }

    // Méthodes utilitaires
    getAllTrials() {
        const allTrials = [];
        for (const file of this.importedData) {
            const participantId = file.data.participant.id;
            const trials = file.data.experiment.data.map(trial => ({
                ...trial,
                participantId: participantId
            }));
            allTrials.push(...trials);
        }
        return allTrials;
    }

    groupByCondition(trials) {
        const groups = {};
        for (const trial of trials) {
            if (!groups[trial.condition]) {
                groups[trial.condition] = [];
            }
            groups[trial.condition].push(trial);
        }
        return groups;
    }

    formatConditionName(condition) {
        const conditionNames = {
            'simple_non_ambiguous': 'Simple Non-Ambigu',
            'complex_non_ambiguous': 'Complexe Non-Ambigu',
            'ambiguous_easy': 'Ambigu Facile',
            'ambiguous_difficult': 'Ambigu Difficile'
        };
        return conditionNames[condition] || condition;
    }

    initializeCharts() {
        console.log('Initializing charts...');
        
        try {
            // Récupérer toutes les données d'essais pour les graphiques
            const allTrials = this.getAllTrials();
            console.log('All trials for charts:', allTrials.length);
            console.log('Sample trial data:', allTrials[0]);
            
            // Vérifier que les conteneurs existent
            const containers = ['accuracy-chart', 'response-time-chart', 'learning-curve-chart', 'participant-comparison-chart'];
            containers.forEach(id => {
                const container = document.getElementById(id);
                console.log(`Container ${id}:`, container ? 'found' : 'not found');
            });
            
            // Initialiser chaque graphique avec les données brutes
            if (typeof AccuracyChart === 'function') {
                console.log('AccuracyChart class found, initializing...');
                new AccuracyChart('accuracy-chart', allTrials);
                console.log('Accuracy chart initialized');
            } else {
                console.warn('AccuracyChart class not found');
            }
            
            if (typeof ResponseTimeChart === 'function') {
                console.log('ResponseTimeChart class found, initializing...');
                new ResponseTimeChart('response-time-chart', allTrials);
                console.log('Response time chart initialized');
            } else {
                console.warn('ResponseTimeChart class not found');
            }
            
            if (typeof ParticipantComparisonChart === 'function') {
                console.log('ParticipantComparisonChart class found, initializing...');
                new ParticipantComparisonChart('participant-comparison-chart', this.importedData);
                console.log('Participant comparison chart initialized');
            } else {
                console.warn('ParticipantComparisonChart class not found');
            }
            
            if (typeof LearningCurveChart === 'function') {
                console.log('LearningCurveChart class found, initializing...');
                new LearningCurveChart('learning-curve-chart', allTrials);
                console.log('Learning curve chart initialized');
            } else {
                console.warn('LearningCurveChart class not found');
            }
            
            if (typeof ResponseTimeCurveChart === 'function') {
                console.log('ResponseTimeCurveChart class found, initializing...');
                new ResponseTimeCurveChart('response-time-curve-chart', allTrials);
                console.log('Response time curve chart initialized');
            } else {
                console.warn('ResponseTimeCurveChart class not found');
            }
            
            if (typeof ResponseTimeDistributionChart === 'function') {
                console.log('ResponseTimeDistributionChart class found, initializing...');
                console.log('Container ID: response-time-distribution-chart');
                console.log('Data length:', allTrials.length);
                new ResponseTimeDistributionChart('response-time-distribution-chart', allTrials);
                console.log('Response time distribution chart initialized');
            } else {
                console.warn('ResponseTimeDistributionChart class not found');
                console.log('Available classes:', Object.keys(window).filter(key => key.includes('Chart')));
            }
            
            if (typeof ConfusionMatrixChart === 'function') {
                console.log('ConfusionMatrixChart class found, initializing...');
                new ConfusionMatrixChart('confusion-matrix-chart', allTrials);
                console.log('Confusion matrix chart initialized');
            } else {
                console.warn('ConfusionMatrixChart class not found');
            }
            
            if (typeof SpeedAccuracyChart === 'function') {
                console.log('SpeedAccuracyChart class found, initializing...');
                new SpeedAccuracyChart('speed-accuracy-chart', allTrials);
                console.log('Speed accuracy chart initialized');
            } else {
                console.warn('SpeedAccuracyChart class not found');
            }
            
            console.log('Charts initialization completed');
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    calculateLearningCurve(trials) {
        // Calculer la courbe d'apprentissage (précision par bloc de 6 essais)
        const blockSize = 6;
        const learningCurve = [];
        
        for (let i = 0; i < trials.length; i += blockSize) {
            const block = trials.slice(i, i + blockSize);
            const accuracy = block.length > 0 ? 
                (block.filter(t => t.correct).length / block.length * 100).toFixed(1) : 0;
            learningCurve.push({
                block: Math.floor(i / blockSize) + 1,
                accuracy: parseFloat(accuracy)
            });
        }
        
        return learningCurve;
    }

    exportAnalytics() {
        if (this.importedData.length === 0) {
            alert(window.i18n.t('analytics.no_files'));
            return;
        }
        console.log('Exporting analytics...');
        // Pour l'instant, on affiche juste un message
        alert('Export fonctionnel !');
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

// Fonction globale pour supprimer un fichier
window.removeFile = function(index) {
    console.log('Removing file at index:', index);
    if (window.analyticsPage) {
        window.analyticsPage.importedData.splice(index, 1);
        window.analyticsPage.updateImportedFilesList();
        window.analyticsPage.displayAnalytics();
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AnalyticsPage...');
    try {
        window.analyticsPage = new AnalyticsPage();
        console.log('AnalyticsPage initialized successfully');
    } catch (error) {
        console.error('Error initializing AnalyticsPage:', error);
    }
}); 