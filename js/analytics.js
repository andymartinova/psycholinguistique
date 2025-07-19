// Gestion de la page d'analyses
class AnalyticsPage {
    constructor() {
        this.importedData = [];
        this.charts = {};
        this.setupEventHandlers();
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

    handleFileImport(event) {
        const files = event.target.files;
        
        for (let file of files) {
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                this.readFile(file);
            } else {
                alert(`Le fichier ${file.name} n'est pas un fichier JSON valide.`);
            }
        }
        
        // Réinitialiser l'input pour permettre de sélectionner le même fichier
        event.target.value = '';
    }

    readFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Valider la structure des données
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
                    alert(`Le fichier ${file.name} ne contient pas des données d'expérience valides.`);
                }
            } catch (error) {
                alert(`Erreur lors de la lecture du fichier ${file.name}: ${error.message}`);
            }
        };
        
        reader.readAsText(file);
    }

    validateDataStructure(data) {
        // Vérifier que les données ont la structure attendue
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
            filesList.innerHTML = '<p>Aucun fichier importé</p>';
            return;
        }

        filesList.innerHTML = this.importedData.map((fileInfo, index) => `
            <div class="imported-file-item">
                <div class="imported-file-info">
                    <span class="imported-file-icon">📄</span>
                    <div class="imported-file-details">
                        <div class="imported-file-name">${fileInfo.name}</div>
                        <div class="imported-file-participant">
                            Participant: ${fileInfo.data.participant?.id || 'N/A'} 
                            (${fileInfo.data.experiment?.data?.length || 0} essais)
                        </div>
                    </div>
                </div>
                <div class="imported-file-actions">
                    <button class="remove-file-btn" data-index="${index}">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `).join('');

        // Ajouter les event listeners pour les boutons de suppression
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
                        name: 'Données locales',
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
                <div class="stat-label">Participants</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalTrials}</div>
                <div class="stat-label">Essais totaux</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgAccuracy.toFixed(1)}%</div>
                <div class="stat-label">Précision moyenne</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgResponseTime.toFixed(0)}ms</div>
                <div class="stat-label">Temps de réponse moyen</div>
            </div>
        `;
    }

    displayConditionStats() {
        const conditionStats = document.getElementById('condition-stats');
        if (!conditionStats) return;

        const allData = this.getAllExperimentData();
        const conditionLabels = {
            'simple_non_ambiguous': 'Simple, non ambiguë',
            'complex_non_ambiguous': 'Complexe, non ambiguë',
            'ambiguous_easy': 'Ambiguë, résolution facile',
            'ambiguous_difficult': 'Ambiguë, résolution difficile'
        };

        const conditionStatsData = this.calculateConditionStats(allData);
        
        conditionStats.innerHTML = Object.entries(conditionStatsData).map(([condition, stats]) => `
            <div class="stat-card">
                <div class="stat-label">${conditionLabels[condition] || condition}</div>
                <div class="stat-value">${stats.accuracy.toFixed(1)}%</div>
                <div class="stat-label">Précision (${stats.trials} essais)</div>
                <div class="stat-label">Temps moyen: ${stats.avgResponseTime.toFixed(0)}ms</div>
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
                    <div class="stat-label">Précision</div>
                    <div class="stat-label">Groupe: ${languageGroup}</div>
                    <div class="stat-label">Essais: ${summary.totalTrials}</div>
                    <div class="stat-label">Temps: ${summary.avgResponseTime}</div>
                </div>
            `;
        }).join('');
    }

    displayCharts() {
        const allData = this.getAllExperimentData();
        
        // Nettoyer les conteneurs de graphiques
        ['accuracy-chart', 'response-time-chart', 'participant-chart', 'learning-curve-chart'].forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
            }
        });

        // Créer les graphiques
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
            rawData.innerHTML = '<p>Aucune donnée disponible.</p>';
            return;
        }

        const tableHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Participant</th>
                        <th>Essai</th>
                        <th>Phrase</th>
                        <th>Condition</th>
                        <th>Attendu</th>
                        <th>Réponse</th>
                        <th>Temps</th>
                        <th>Correct</th>
                    </tr>
                </thead>
                <tbody>
                    ${allData.map(trial => {
                        // Nettoyer et valider les données
                        const participantId = trial.participantId || 'N/A';
                        const trialNumber = trial.trial || 'N/A';
                        const sentence = trial.sentence || 'N/A';
                        const condition = this.getConditionLabel(trial.condition || 'N/A');
                        const expected = trial.expected || 'N/A';
                        
                        // Gestion des réponses manquantes
                        let response = trial.response;
                        if (!response) {
                            response = 'MANQUANT';
                        } else if (response !== 'grammatical' && response !== 'ungrammatical') {
                            response = 'INVALIDE';
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
            'simple_non_ambiguous': 'Simple',
            'complex_non_ambiguous': 'Complexe',
            'ambiguous_easy': 'Ambiguë facile',
            'ambiguous_difficult': 'Ambiguë difficile',
            'simple': 'Simple',
            'complex': 'Complexe',
            'ambiguous': 'Ambiguë'
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
                <p>Aucune donnée d'expérience trouvée. Importez des fichiers JSON ou complétez une expérience.</p>
                <a href="experiment.html" class="btn btn-primary">Commencer l'expérience</a>
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
            alert('Aucune donnée à exporter.');
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
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données importées ?')) {
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
    
    // Exposer la méthode removeFile globalement pour les boutons
    window.removeFile = (index) => analytics.removeFile(index);
}); 