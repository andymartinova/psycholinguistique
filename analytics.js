// Gestion de la page d'analyses
class AnalyticsPage {
    constructor() {
        console.log('Constructeur AnalyticsPage appelé');
        this.importedData = [];
        this.charts = {};
        this.setupEventHandlers();
        this.setupDynamicTranslation();
        this.loadLocalData();
        this.displayAnalytics();
        console.log('Constructeur AnalyticsPage terminé');
    }

    setupEventHandlers() {
        console.log('Configuration des gestionnaires d\'événements...');
        
        // Import de fichiers - bouton
        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('file-input');
        
        console.log('Élément upload-btn trouvé:', !!uploadBtn);
        console.log('Élément file-input trouvé:', !!fileInput);
        console.log('Élément upload-btn:', uploadBtn);
        console.log('Élément file-input:', fileInput);
        
        if (uploadBtn && fileInput) {
            // Gestionnaire pour le bouton d'upload
            uploadBtn.addEventListener('click', (e) => {
                console.log('Bouton d\'upload cliqué', e);
                e.preventDefault();
                fileInput.click();
            });
            
            // Gestionnaire pour la sélection de fichiers
            fileInput.addEventListener('change', (e) => {
                console.log('Fichier sélectionné:', e.target.files);
                console.log('Nombre de fichiers:', e.target.files.length);
                this.handleFileImport(e);
            });
            
            console.log('Événements d\'upload configurés avec succès');
        } else {
            console.error('Éléments d\'upload non trouvés!');
            console.error('uploadBtn:', uploadBtn);
            console.error('fileInput:', fileInput);
        }

        // Support du glisser-déposer
        const importArea = document.querySelector('.import-area');
        if (importArea) {
            importArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                importArea.style.borderColor = '#007bff';
                importArea.style.backgroundColor = '#f8f9fa';
            });
            
            importArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                importArea.style.borderColor = '#ccc';
                importArea.style.backgroundColor = 'transparent';
            });
            
            importArea.addEventListener('drop', (e) => {
                e.preventDefault();
                importArea.style.borderColor = '#ccc';
                importArea.style.backgroundColor = 'transparent';
                
                const files = e.dataTransfer.files;
                console.log('Fichiers glissés-déposés:', files);
                
                if (files.length > 0) {
                    // Créer un événement factice pour utiliser handleFileImport
                    const fakeEvent = {
                        target: { files: files }
                    };
                    this.handleFileImport(fakeEvent);
                }
            });
            
            console.log('Support du glisser-déposer configuré');
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
        
        // Bouton de test
        const testBtn = document.getElementById('test-btn');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                console.log('Bouton de test cliqué');
                alert('JavaScript fonctionne !');
            });
        }
        
        console.log('Gestionnaires d\'événements configurés');
    }

    setupDynamicTranslation() {
        // Traduction immédiate si i18n est déjà prêt
        if (window.i18n && window.i18n.loaded) {
            console.log('Traduction immédiate des textes...');
            this.translateStaticTexts();
        } else {
            // Sinon, attendre que i18n soit prêt
            const checkI18n = () => {
                if (window.i18n && window.i18n.loaded) {
                    console.log('Système de traduction chargé, traduction des textes...');
                    this.translateStaticTexts();
                } else {
                    setTimeout(checkI18n, 100);
                }
            };
            setTimeout(checkI18n, 100);
        }
    }

    translateStaticTexts() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = window.i18n.t(key);
            if (translation) {
                el.innerHTML = translation;
            } else {
                console.warn(`Traduction manquante pour la clé: ${key}`);
            }
        });
    }

    handleFileImport(event) {
        console.log('Fonction handleFileImport appelée');
        console.log('Event:', event);
        console.log('Event target:', event.target);
        console.log('Event target files:', event.target.files);
        
        const files = event.target.files;
        console.log('Nombre de fichiers sélectionnés:', files.length);
        
        if (!files || files.length === 0) {
            console.warn('Aucun fichier sélectionné');
            return;
        }
        
        for (let file of files) {
            console.log('Traitement du fichier:', file.name, 'Type:', file.type);
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                console.log('Fichier JSON valide, lecture en cours...');
                this.readFile(file);
            } else {
                console.warn('Fichier non-JSON rejeté:', file.name);
                const message = window.i18n && window.i18n.t ? 
                    window.i18n.t('analytics.invalid_file', { name: file.name }) : 
                    `Le fichier ${file.name} n'est pas un fichier JSON valide.`;
                alert(message);
            }
        }
        event.target.value = '';
    }

    readFile(file) {
        console.log('Lecture du fichier:', file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('Fichier lu, parsing JSON...');
            try {
                const data = JSON.parse(e.target.result);
                console.log('JSON parsé avec succès, validation de la structure...');
                console.log('Structure des données:', data);
                
                if (this.validateDataStructure(data)) {
                    console.log('Structure valide, ajout aux données importées');
                    const fileInfo = {
                        name: file.name,
                        size: file.size,
                        lastModified: file.lastModified,
                        data: data
                    };
                    this.importedData.push(fileInfo);
                    this.updateImportedFilesList();
                    this.displayAnalytics();
                    console.log('Fichier importé avec succès');
                } else {
                    console.error('Structure de données invalide');
                    alert(window.i18n.t('analytics.invalid_data', { name: file.name }) || `Le fichier ${file.name} ne contient pas des données d'expérience valides.`);
                }
            } catch (error) {
                console.error('Erreur lors du parsing JSON:', error);
                alert(window.i18n.t('analytics.read_error', { name: file.name, error: error.message }) || `Erreur lors de la lecture du fichier ${file.name}: ${error.message}`);
            }
        };
        reader.onerror = (error) => {
            console.error('Erreur lors de la lecture du fichier:', error);
            alert(`Erreur lors de la lecture du fichier ${file.name}`);
        };
        reader.readAsText(file);
    }

    validateDataStructure(data) {
        console.log('Validation de la structure des données...');
        console.log('data existe:', !!data);
        console.log('data.participant existe:', !!(data && data.participant));
        console.log('data.experiment existe:', !!(data && data.experiment));
        console.log('data.experiment.data existe:', !!(data && data.experiment && data.experiment.data));
        console.log('data.experiment.data est un tableau:', !!(data && data.experiment && data.experiment.data && Array.isArray(data.experiment.data)));
        
        // Structure de base requise
        const hasBasicStructure = data && 
               data.participant && 
               data.experiment && 
               data.experiment.data && 
               Array.isArray(data.experiment.data);
        
        if (hasBasicStructure) {
            console.log('Structure de base valide');
            
            // Vérifier que les données contiennent les champs requis
            const firstTrial = data.experiment.data[0];
            if (firstTrial) {
                console.log('Premier essai:', firstTrial);
                const hasRequiredFields = firstTrial.hasOwnProperty('trial') && 
                                        firstTrial.hasOwnProperty('sentence') && 
                                        firstTrial.hasOwnProperty('condition') && 
                                        firstTrial.hasOwnProperty('expected') && 
                                        firstTrial.hasOwnProperty('response') && 
                                        firstTrial.hasOwnProperty('responseTime') && 
                                        firstTrial.hasOwnProperty('correct');
                
                console.log('Champs requis présents:', hasRequiredFields);
                return hasRequiredFields;
            }
        }
        
        console.log('Structure invalide');
        return false;
    }

    updateImportedFilesList() {
        const filesList = document.getElementById('imported-files');
        if (!filesList) return;
        
        // Fonction helper pour les traductions sécurisées
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };
        
        if (this.importedData.length === 0) {
            filesList.innerHTML = `<p>${t('analytics.no_files', 'No files imported')}</p>`;
            return;
        }
        filesList.innerHTML = this.importedData.map((fileInfo, index) => `
            <div class="imported-file-item">
                <div class="imported-file-info">
                    <span class="imported-file-icon">📄</span>
                    <div class="imported-file-details">
                        <div class="imported-file-name">${fileInfo.name}</div>
                        <div class="imported-file-participant">
                            ${t('analytics.participant_label', 'Participant')}: ${fileInfo.data.participant?.id || 'N/A'} 
                            (${fileInfo.data.experiment?.data?.length || 0} ${t('results.total_trials', 'trials').toLowerCase()})
                        </div>
                    </div>
                </div>
                <div class="imported-file-actions">
                    <button class="remove-file-btn" data-index="${index}">
                        🗑️ ${t('analytics.remove_file', 'Remove')}
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
                    // Fonction helper pour les traductions sécurisées
                    const t = (key, fallback) => {
                        return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
                    };
                    
                    this.importedData.push({
                        name: t('analytics.local_data', 'Local data'),
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
            this.loadLocalData();
        }
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
        
        // Fonction helper pour les traductions sécurisées
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };
        
        globalStats.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${totalParticipants}</div>
                <div class="stat-label">${t('analytics.stats.total_participants', 'Total participants')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalTrials}</div>
                <div class="stat-label">${t('results.total_trials', 'Total trials')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgAccuracy.toFixed(1)}%</div>
                <div class="stat-label">${t('analytics.stats.average_accuracy', 'Average accuracy')}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${avgResponseTime.toFixed(0)}ms</div>
                <div class="stat-label">${t('analytics.stats.average_response_time', 'Average response time')}</div>
            </div>
        `;
    }

    displayConditionStats() {
        const conditionStats = document.getElementById('condition-stats');
        if (!conditionStats) return;
        const allData = this.getAllExperimentData();
        
        // Fonction helper pour les traductions sécurisées
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };
        
        const conditionLabels = {
            'simple_non_ambiguous': t('results.conditions.simple_unambiguous', 'Simple, non ambiguous'),
            'complex_non_ambiguous': t('results.conditions.complex_unambiguous', 'Complex, non ambiguous'),
            'ambiguous_easy': t('results.conditions.simple_ambiguous', 'Simple, ambiguous'),
            'ambiguous_difficult': t('results.conditions.complex_ambiguous', 'Complex, ambiguous')
        };
        const conditionStatsData = this.calculateConditionStats(allData);
        conditionStats.innerHTML = Object.entries(conditionStatsData).map(([condition, stats]) => `
            <div class="stat-card">
                <div class="stat-label">${conditionLabels[condition] || condition}</div>
                <div class="stat-value">${stats.accuracy.toFixed(1)}%</div>
                <div class="stat-label">${t('results.accuracy', 'Accuracy')} (${stats.trials} ${t('results.total_trials', 'trials').toLowerCase()})</div>
                <div class="stat-label">${t('results.average_time', 'Average time')}: ${stats.avgResponseTime.toFixed(0)}ms</div>
            </div>
        `).join('');
    }

    displayParticipantComparison() {
        const participantComparison = document.getElementById('participant-comparison');
        if (!participantComparison) return;
        
        // Fonction helper pour les traductions sécurisées
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };
        
        participantComparison.innerHTML = this.importedData.map(fileInfo => {
            const data = fileInfo.data.experiment.data;
            const summary = this.generateSummary(data);
            const participantId = fileInfo.data.participant?.id || 'N/A';
            const languageGroup = fileInfo.data.participant?.languageGroup || 'N/A';
            return `
                <div class="stat-card">
                    <div class="stat-label">${participantId}</div>
                    <div class="stat-value">${summary.accuracy}</div>
                    <div class="stat-label">${t('results.accuracy', 'Accuracy')}</div>
                    <div class="stat-label">${t('home.language_group_label', 'Language group')}: ${languageGroup}</div>
                    <div class="stat-label">${t('results.total_trials', 'Total trials')}: ${summary.totalTrials}</div>
                    <div class="stat-label">${t('results.average_time', 'Average time')}: ${summary.avgResponseTime}</div>
                </div>
            `;
        }).join('');
    }

    // Fonction pour générer un résumé des données d'expérience
    generateSummary(data) {
        if (!data || data.length === 0) {
            return {
                totalTrials: 0,
                correctResponses: 0,
                accuracy: '0%',
                avgResponseTime: '0ms',
                conditionStats: {}
            };
        }

        const totalTrials = data.length;
        const correctResponses = data.filter(d => d.correct).length;
        const accuracy = ((correctResponses / totalTrials) * 100).toFixed(1) + '%';
        
        const totalTime = data.reduce((sum, d) => sum + (d.responseTime || 0), 0);
        const avgResponseTime = this.formatResponseTime(Math.round(totalTime / totalTrials));

        // Statistiques par condition
        const conditionStats = {};
        const conditions = [...new Set(data.map(d => d.condition))];
        
        conditions.forEach(condition => {
            const conditionData = data.filter(d => d.condition === condition);
            const conditionCorrect = conditionData.filter(d => d.correct).length;
            const conditionAccuracy = ((conditionCorrect / conditionData.length) * 100).toFixed(1) + '%';
            const conditionAvgTime = this.formatResponseTime(Math.round(
                conditionData.reduce((sum, d) => sum + (d.responseTime || 0), 0) / conditionData.length
            ));
            
            conditionStats[condition] = {
                trials: conditionData.length,
                accuracy: conditionAccuracy,
                avgResponseTime: conditionAvgTime
            };
        });

        return {
            totalTrials,
            correctResponses,
            accuracy,
            avgResponseTime,
            conditionStats
        };
    }

    // Fonction pour formater les temps de réponse
    formatResponseTime(ms) {
        if (!ms || ms === 0) return '0ms';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const remainingMs = ms % 1000;
        
        if (minutes > 0) {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')} (${ms}ms)`;
        } else if (seconds > 0) {
            return `${remainingSeconds}.${remainingMs.toString().padStart(3, '0')}s (${ms}ms)`;
        } else {
            return `${ms}ms`;
        }
    }

    displayCharts() {
        const allData = this.getAllExperimentData();
        console.log('Données pour les graphiques:', allData);
        
        // Vider tous les conteneurs de graphiques
        ['performance-summary-chart', 'performance-by-condition-chart', 'accuracy-chart', 'response-time-chart', 'participant-chart', 'learning-curve-chart'].forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
            }
        });
        
        if (allData.length > 0) {
            // Fonction helper pour les traductions sécurisées
            const t = (key, fallback) => {
                return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
            };
            
            const labels = {
                'simple_non_ambiguous': t('results.conditions.simple_unambiguous', 'Simple, non ambiguous'),
                'complex_non_ambiguous': t('results.conditions.complex_unambiguous', 'Complex, non ambiguous'),
                'ambiguous_easy': t('results.conditions.simple_ambiguous', 'Simple, ambiguous'),
                'ambiguous_difficult': t('results.conditions.complex_ambiguous', 'Complex, ambiguous')
            };
            
            console.log('Labels des conditions:', labels);
            
            // Vérifier que les classes de graphiques sont disponibles
            console.log('PerformanceSummaryChart disponible:', typeof PerformanceSummaryChart !== 'undefined');
            console.log('PerformanceByConditionChart disponible:', typeof PerformanceByConditionChart !== 'undefined');
            console.log('AccuracyChart disponible:', typeof AccuracyChart !== 'undefined');
            console.log('ResponseTimeChart disponible:', typeof ResponseTimeChart !== 'undefined');
            console.log('ParticipantComparisonChart disponible:', typeof ParticipantComparisonChart !== 'undefined');
            console.log('LearningCurveChart disponible:', typeof LearningCurveChart !== 'undefined');
            
            // Nouveau graphique de résumé de performance
            if (typeof PerformanceSummaryChart !== 'undefined') {
                try {
                    this.charts.performanceSummary = new PerformanceSummaryChart('performance-summary-chart', allData);
                    console.log('Graphique de résumé de performance créé avec succès');
                } catch (error) {
                    console.error('Erreur lors de la création du graphique de résumé de performance:', error);
                    document.getElementById('performance-summary-chart').innerHTML = `<p>Erreur: ${error.message}</p>`;
                }
            } else {
                console.error('PerformanceSummaryChart class not found');
                document.getElementById('performance-summary-chart').innerHTML = '<p>Erreur: Classe PerformanceSummaryChart non trouvée</p>';
            }
            
            // Nouveau graphique de performance par condition
            if (typeof PerformanceByConditionChart !== 'undefined') {
                try {
                    this.charts.performanceByCondition = new PerformanceByConditionChart('performance-by-condition-chart', allData, labels);
                    console.log('Graphique de performance par condition créé avec succès');
                } catch (error) {
                    console.error('Erreur lors de la création du graphique de performance par condition:', error);
                    document.getElementById('performance-by-condition-chart').innerHTML = `<p>Erreur: ${error.message}</p>`;
                }
            } else {
                console.error('PerformanceByConditionChart class not found');
                document.getElementById('performance-by-condition-chart').innerHTML = '<p>Erreur: Classe PerformanceByConditionChart non trouvée</p>';
            }
            
            // Graphiques existants
            if (typeof AccuracyChart !== 'undefined') {
                try {
                    this.charts.accuracy = new AccuracyChart('accuracy-chart', allData, labels);
                    console.log('Graphique de précision créé avec succès');
                } catch (error) {
                    console.error('Erreur lors de la création du graphique de précision:', error);
                    document.getElementById('accuracy-chart').innerHTML = `<p>Erreur: ${error.message}</p>`;
                }
            } else {
                console.error('AccuracyChart class not found');
                document.getElementById('accuracy-chart').innerHTML = '<p>Erreur: Classe AccuracyChart non trouvée</p>';
            }
            
            if (typeof ResponseTimeChart !== 'undefined') {
                try {
                    this.charts.responseTime = new ResponseTimeChart('response-time-chart', allData, labels);
                    console.log('Graphique de temps de réponse créé avec succès');
                } catch (error) {
                    console.error('Erreur lors de la création du graphique de temps de réponse:', error);
                    document.getElementById('response-time-chart').innerHTML = `<p>Erreur: ${error.message}</p>`;
                }
            } else {
                console.error('ResponseTimeChart class not found');
                document.getElementById('response-time-chart').innerHTML = '<p>Erreur: Classe ResponseTimeChart non trouvée</p>';
            }
            
            if (typeof ParticipantComparisonChart !== 'undefined') {
                try {
                    this.charts.participant = new ParticipantComparisonChart('participant-chart', this.importedData);
                    console.log('Graphique de comparaison des participants créé avec succès');
                } catch (error) {
                    console.error('Erreur lors de la création du graphique de comparaison:', error);
                    document.getElementById('participant-chart').innerHTML = `<p>Erreur: ${error.message}</p>`;
                }
            } else {
                console.error('ParticipantComparisonChart class not found');
                document.getElementById('participant-chart').innerHTML = '<p>Erreur: Classe ParticipantComparisonChart non trouvée</p>';
            }
            
            if (typeof LearningCurveChart !== 'undefined') {
                try {
                    this.charts.learningCurve = new LearningCurveChart('learning-curve-chart', allData);
                    console.log('Graphique de courbe d\'apprentissage créé avec succès');
                } catch (error) {
                    console.error('Erreur lors de la création du graphique de courbe d\'apprentissage:', error);
                    document.getElementById('learning-curve-chart').innerHTML = `<p>Erreur: ${error.message}</p>`;
                }
            } else {
                console.error('LearningCurveChart class not found');
                document.getElementById('learning-curve-chart').innerHTML = '<p>Erreur: Classe LearningCurveChart non trouvée</p>';
            }
        } else {
            console.log('Aucune donnée disponible pour les graphiques');
            ['performance-summary-chart', 'performance-by-condition-chart', 'accuracy-chart', 'response-time-chart', 'participant-chart', 'learning-curve-chart'].forEach(id => {
                const container = document.getElementById(id);
                if (container) {
                    container.innerHTML = '<p>Aucune donnée disponible</p>';
                }
            });
        }
    }

    displayRawData() {
        const rawData = document.getElementById('raw-data');
        if (!rawData) return;
        const allData = this.getAllExperimentData();
        
        // Fonction helper pour les traductions sécurisées
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };
        
        if (allData.length === 0) {
            rawData.innerHTML = `<p>${t('analytics.no_data', 'No data available')}</p>`;
            return;
        }
        const tableHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>${t('analytics.participant_label', 'Participant')}</th>
                        <th>${t('results.trial', 'Trial')}</th>
                        <th>${t('results.sentence', 'Sentence')}</th>
                        <th>${t('results.condition', 'Condition')}</th>
                        <th>${t('results.expected', 'Expected')}</th>
                        <th>${t('results.response', 'Response')}</th>
                        <th>${t('results.time', 'Time')}</th>
                        <th>${t('results.correct', 'Correct')}</th>
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
                            response = t('results.missing', 'MISSING');
                        } else if (response !== 'grammatical' && response !== 'ungrammatical') {
                            response = t('results.invalid', 'INVALID');
                        }
                        const responseTime = this.formatResponseTime(trial.responseTime || 0);
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
        
        // Fonction helper pour les traductions sécurisées
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };
        
        const labels = {
            'simple_non_ambiguous': t('results.conditions.simple_unambiguous', 'Simple, non ambiguous'),
            'complex_non_ambiguous': t('results.conditions.complex_unambiguous', 'Complex, non ambiguous'),
            'ambiguous_easy': t('results.conditions.simple_ambiguous', 'Simple, ambiguous'),
            'ambiguous_difficult': t('results.conditions.complex_ambiguous', 'Complex, ambiguous'),
            'simple': t('results.conditions.simple_unambiguous', 'Simple, non ambiguous'),
            'complex': t('results.conditions.complex_unambiguous', 'Complex, non ambiguous'),
            'ambiguous': t('results.conditions.simple_ambiguous', 'Simple, ambiguous')
        };
        return labels[condition] || condition;
    }

    showNoDataMessage() {
        // Fonction helper pour les traductions sécurisées
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };
        
        const globalStats = document.getElementById('global-stats');
        const conditionStats = document.getElementById('condition-stats');
        const participantComparison = document.getElementById('participant-comparison');
        const chartsContainer = document.getElementById('charts-container');
        const rawData = document.getElementById('raw-data');
        const noDataMessage = `
            <div class="info-box">
                <p>${t('analytics.no_data', 'No experiment data found. Import JSON files or complete an experiment.')}</p>
                <a href="experiment.html" class="btn btn-primary" data-i18n="home.start_button">${t('home.start_button', 'Start experiment')}</a>
            </div>
        `;
        if (globalStats) globalStats.innerHTML = noDataMessage;
        if (conditionStats) conditionStats.innerHTML = '';
        if (participantComparison) participantComparison.innerHTML = '';
        if (chartsContainer) chartsContainer.innerHTML = noDataMessage;
        if (rawData) rawData.innerHTML = '';
    }

    exportAnalytics() {
        // Fonction helper pour les traductions sécurisées
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };
        
        if (this.importedData.length === 0) {
            alert(t('analytics.no_files', 'No files to export'));
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
        // Fonction helper pour les traductions sécurisées
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };
        
        if (confirm(t('analytics.clear_confirm', 'Are you sure you want to clear all imported data?'))) {
            this.importedData = [];
            localStorage.removeItem('experimentData');
            this.updateImportedFilesList();
            this.displayAnalytics();
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation de la page analytics...');
    
    // Initialisation immédiate avec fallback pour les traductions
    const initAnalytics = () => {
        console.log('Initialisation de la page analytics...');
        const analytics = new AnalyticsPage();
        window.removeFile = (index) => analytics.removeFile(index);
        window.analyticsPage = analytics; // Rendre accessible globalement pour debug
    };
    
    // Essayer d'attendre le système de traduction, mais avec timeout
    let i18nTimeout = setTimeout(() => {
        console.log('Timeout du système de traduction, initialisation sans traduction...');
        initAnalytics();
    }, 3000); // 3 secondes de timeout
    
    // Écouter l'événement i18nReady
    window.addEventListener('i18nReady', () => {
        console.log('Événement i18nReady reçu, initialisation de la page analytics...');
        clearTimeout(i18nTimeout);
        initAnalytics();
    });
    
    // Fallback si l'événement n'est pas émis
    const waitForI18n = () => {
        console.log('Vérification du système de traduction...');
        console.log('window.i18n existe:', !!window.i18n);
        console.log('window.i18n.loaded:', !!(window.i18n && window.i18n.loaded));
        console.log('window.i18n.translations existe:', !!(window.i18n && window.i18n.translations));
        
        if (window.i18n && window.i18n.loaded && window.i18n.translations) {
            console.log('Système de traduction prêt (fallback), initialisation de la page analytics...');
            clearTimeout(i18nTimeout);
            initAnalytics();
        } else {
            console.log('Système de traduction non encore prêt, nouvelle tentative dans 500ms...');
            setTimeout(waitForI18n, 500);
        }
    };
    
    // Attendre un peu plus longtemps pour s'assurer que i18n est complètement initialisé
    setTimeout(waitForI18n, 1000);
}); 