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
        // Import de fichiers - bouton
        const uploadBtn = document.getElementById('upload-btn');
        const fileInput = document.getElementById('file-input');
        if (uploadBtn && fileInput) {
            // Gestionnaire pour le bouton d'upload
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fileInput.click();
            });
            // Gestionnaire pour la sélection de fichiers
            fileInput.addEventListener('change', (e) => {
                this.handleFileImport(e);
            });
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
                
                if (files.length > 0) {
                    // Créer un événement factice pour utiliser handleFileImport
                    const fakeEvent = {
                        target: { files: files }
                    };
                    this.handleFileImport(fakeEvent);
                }
            });
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

        // Écouter l'événement de chargement des participants depuis la base de données
        document.addEventListener('participantsDataLoaded', (e) => {
            this.handleParticipantsDataLoaded(e.detail);
        });
    }

    setupDynamicTranslation() {
        // Traduction immédiate si i18n est déjà prêt
        if (window.i18n && window.i18n.loaded) {
            this.translateStaticTexts();
        } else {
            // Sinon, attendre que i18n soit prêt
            const checkI18n = () => {
                if (window.i18n && window.i18n.loaded) {
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
        const files = event.target.files;
        
        if (!files || files.length === 0) {
            console.warn('Aucun fichier sélectionné');
            return;
        }
        
        for (let file of files) {
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
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
        console.log('🔍 validateDataStructure - Vérification de:', data);
        
        // Structure de base requise
        const hasBasicStructure = data && 
               data.participant && 
               data.experiment && 
               data.experiment.data && 
               Array.isArray(data.experiment.data);
        
        console.log('🔍 Structure de base valide?', hasBasicStructure);
        console.log('🔍 data:', !!data);
        console.log('🔍 data.participant:', !!data?.participant);
        console.log('🔍 data.experiment:', !!data?.experiment);
        console.log('🔍 data.experiment.data:', data?.experiment?.data);
        console.log('🔍 Array.isArray(data.experiment.data):', Array.isArray(data?.experiment?.data));
        
        if (hasBasicStructure) {
            // Vérifier que les données contiennent les champs requis
            const firstTrial = data.experiment.data[0];
            console.log('🔍 Premier trial:', firstTrial);
            
            if (firstTrial) {
                const hasRequiredFields = firstTrial.hasOwnProperty('trial') && 
                                        firstTrial.hasOwnProperty('sentence') && 
                                        firstTrial.hasOwnProperty('condition') && 
                                        firstTrial.hasOwnProperty('expected') && 
                                        firstTrial.hasOwnProperty('response') && 
                                        firstTrial.hasOwnProperty('responseTime') && 
                                        firstTrial.hasOwnProperty('correct');
                
                console.log('🔍 Champs requis présents?', hasRequiredFields);
                console.log('🔍 trial:', firstTrial.hasOwnProperty('trial'));
                console.log('🔍 sentence:', firstTrial.hasOwnProperty('sentence'));
                console.log('🔍 condition:', firstTrial.hasOwnProperty('condition'));
                console.log('🔍 expected:', firstTrial.hasOwnProperty('expected'));
                console.log('🔍 response:', firstTrial.hasOwnProperty('response'));
                console.log('🔍 responseTime:', firstTrial.hasOwnProperty('responseTime'));
                console.log('🔍 correct:', firstTrial.hasOwnProperty('correct'));
                
                return hasRequiredFields;
            } else {
                console.warn('⚠️ Aucun trial dans experiment.data');
                // Si le tableau est vide, on accepte quand même la structure
                return data.experiment.data.length === 0;
            }
        }
        
        console.warn('❌ Structure de données invalide');
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

    handleParticipantsDataLoaded(formattedData) {
        console.log('📈 handleParticipantsDataLoaded - Données reçues:', formattedData);
        console.log('📈 Nombre d\'expériences reçues:', formattedData?.length || 0);
        
        // formattedData est un tableau d'objets, chacun représentant une expérience
        // Chaque objet a la structure: { participant: {...}, experiment: {...} }
        
        if (!formattedData || !Array.isArray(formattedData) || formattedData.length === 0) {
            console.warn('❌ Aucune donnée de participants à traiter');
            return;
        }

        // Vérifier si on doit remplacer les données existantes ou les ajouter
        // Pour l'instant, on remplace les données existantes pour éviter les doublons
        this.importedData = [];

        // Convertir chaque expérience au format attendu par analytics.js
        formattedData.forEach((experimentData, index) => {
            console.log(`📈 Traitement de l'expérience ${index}:`, experimentData);
            console.log(`📈 Structure valide?`, this.validateDataStructure(experimentData));
            
            if (this.validateDataStructure(experimentData)) {
                const participantId = experimentData.participant?.id || `P${index + 1}`;
                const fileInfo = {
                    name: `Participant ${participantId} - Database`,
                    size: JSON.stringify(experimentData).length,
                    lastModified: Date.now(),
                    data: experimentData
                };
                this.importedData.push(fileInfo);
                console.log(`✅ Expérience ${index} ajoutée pour participant ${participantId}`);
            } else {
                console.warn(`❌ Structure de données invalide pour l'expérience ${index}:`, experimentData);
                console.warn(`❌ Structure attendue:`, {
                    participant: 'object',
                    experiment: 'object',
                    'experiment.data': 'array'
                });
            }
        });

        console.log('📈 Données importées finales:', this.importedData);
        console.log('📈 Nombre d\'entrées importées:', this.importedData.length);

        // Mettre à jour l'affichage
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
        console.log('📊 displayAnalytics - importedData.length:', this.importedData.length);
        console.log('📊 displayAnalytics - importedData:', this.importedData);
        
        if (this.importedData.length === 0) {
            console.log('📊 Aucune donnée importée, chargement des données locales...');
            this.loadLocalData();
        }
        if (this.importedData.length === 0) {
            console.warn('❌ Aucune donnée disponible, affichage du message "No data"');
            this.showNoDataMessage();
            return;
        }
        console.log('✅ Affichage des analyses avec', this.importedData.length, 'entrées');
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
        
        if (totalTrials === 0) {
            globalStats.innerHTML = '<p class="no-data">Aucune donnée disponible</p>';
            return;
        }
        
        // Compter les participants uniques au lieu du nombre d'entrées
        const uniqueParticipants = new Set(this.importedData.map(fileInfo => fileInfo.data.participant?.id || 'unknown'));
        const totalParticipants = uniqueParticipants.size;
        
        // Statistiques de base
        const avgAccuracy = this.calculateAverageAccuracy(allData);
        const avgResponseTimeRaw = this.calculateAverageResponseTime(allData);
        const avgResponseTime = Math.round(avgResponseTimeRaw);
        
        // Statistiques de précision
        const correctResponses = allData.filter(d => d.correct).length;
        const incorrectResponses = totalTrials - correctResponses;
        const correctPercentage = (correctResponses / totalTrials) * 100;
        const incorrectPercentage = (incorrectResponses / totalTrials) * 100;
        
        // Statistiques de temps de réponse
        const responseTimes = allData.map(d => d.responseTime || 0).filter(rt => rt > 0);
        const minResponseTime = responseTimes.length > 0 ? Math.round(Math.min(...responseTimes)) : 0;
        const maxResponseTime = responseTimes.length > 0 ? Math.round(Math.max(...responseTimes)) : 0;
        const medianResponseTime = Math.round(this.calculateMedian(responseTimes));
        
        // Statistiques par langue maternelle
        const participantsByLanguage = {};
        this.importedData.forEach(fileInfo => {
            const participantId = fileInfo.data.participant?.id || 'unknown';
            const languageGroup = fileInfo.data.participant?.languageGroup || 'unknown';
            if (!participantsByLanguage[languageGroup]) {
                participantsByLanguage[languageGroup] = new Set();
            }
            participantsByLanguage[languageGroup].add(participantId);
        });
        
        // Statistiques par niveau d'allemand
        const participantsByLevel = {};
        this.importedData.forEach(fileInfo => {
            const participantId = fileInfo.data.participant?.id || 'unknown';
            const germanLevel = fileInfo.data.participant?.germanLevel || 'N/A';
            if (!participantsByLevel[germanLevel]) {
                participantsByLevel[germanLevel] = new Set();
            }
            participantsByLevel[germanLevel].add(participantId);
        });
        
        // Statistiques de réponses grammaticales/non grammaticales
        const grammaticalResponses = allData.filter(d => d.response === 'grammatical').length;
        const nonGrammaticalResponses = allData.filter(d => d.response === 'non_grammatical').length;
        
        // Fonction helper pour les traductions sécurisées
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };
        
        // Formater les langues pour l'affichage
        const formatLanguage = (lang) => {
            if (lang === 'fr') return '🇫🇷 Français';
            if (lang === 'pt') return '🇧🇷 Portugais';
            return lang;
        };
        
        globalStats.innerHTML = `
            <!-- Section principale - Statistiques globales -->
            <div class="stats-section-main">
                <div class="stat-card-compact stat-card-primary">
                    <div class="stat-value-compact">${totalParticipants}</div>
                    <div class="stat-label-compact">${t('analytics.stats.total_participants', 'Participants')}</div>
                </div>
                <div class="stat-card-compact stat-card-primary">
                    <div class="stat-value-compact">${totalTrials}</div>
                    <div class="stat-label-compact">${t('results.total_trials', 'Essais')}</div>
                </div>
                <div class="stat-card-compact stat-card-primary">
                    <div class="stat-value-compact">${avgAccuracy.toFixed(1)}%</div>
                    <div class="stat-label-compact">${t('analytics.stats.average_accuracy', 'Précision')}</div>
                </div>
                <div class="stat-card-compact stat-card-primary">
                    <div class="stat-value-compact">${this.formatResponseTime(avgResponseTime)}</div>
                    <div class="stat-label-compact">${t('analytics.stats.average_response_time', 'Temps moyen')}</div>
                </div>
            </div>
            
            <!-- Section précision - Réponses correctes/incorrectes -->
            <div class="stats-section-grouped">
                <div class="stat-card-compact stat-card-success">
                    <div class="stat-value-compact">${correctResponses}</div>
                    <div class="stat-label-compact">${t('analytics.stats.correct_responses', 'Correctes')}</div>
                    <div class="stat-subvalue-compact">${correctPercentage.toFixed(1)}%</div>
                </div>
                <div class="stat-card-compact stat-card-danger">
                    <div class="stat-value-compact">${incorrectResponses}</div>
                    <div class="stat-label-compact">${t('analytics.stats.incorrect_responses', 'Incorrectes')}</div>
                    <div class="stat-subvalue-compact">${incorrectPercentage.toFixed(1)}%</div>
                </div>
            </div>
            
            <!-- Section temps - Min/Max/Médian -->
            <div class="stats-section-grouped">
                <div class="stat-card-compact stat-card-info">
                    <div class="stat-value-compact">${this.formatResponseTime(minResponseTime)}</div>
                    <div class="stat-label-compact">${t('analytics.stats.min_response_time', 'Min')}</div>
                </div>
                <div class="stat-card-compact stat-card-info">
                    <div class="stat-value-compact">${this.formatResponseTime(maxResponseTime)}</div>
                    <div class="stat-label-compact">${t('analytics.stats.max_response_time', 'Max')}</div>
                </div>
                <div class="stat-card-compact stat-card-info">
                    <div class="stat-value-compact">${this.formatResponseTime(medianResponseTime)}</div>
                    <div class="stat-label-compact">${t('analytics.stats.median_response_time', 'Médian')}</div>
                </div>
            </div>
            
            <!-- Section langues - Regroupées -->
            ${Object.entries(participantsByLanguage).length > 0 ? `
            <div class="stats-section-grouped">
                ${Object.entries(participantsByLanguage).map(([lang, participants]) => `
                    <div class="stat-card-compact stat-card-language">
                        <div class="stat-value-compact">${participants.size}</div>
                        <div class="stat-label-compact">${formatLanguage(lang)}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            <!-- Section niveaux - Regroupés -->
            ${Object.entries(participantsByLevel).filter(([level]) => level !== 'N/A' && level !== null && level !== '').length > 0 ? `
            <div class="stats-section-grouped">
                ${Object.entries(participantsByLevel)
                    .filter(([level]) => level !== 'N/A' && level !== null && level !== '')
                    .map(([level, participants]) => `
                    <div class="stat-card-compact stat-card-level">
                        <div class="stat-value-compact">${participants.size}</div>
                        <div class="stat-label-compact">${level}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
        `;
    }
    
    calculateMedian(values) {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
    }
    
    formatResponseTime(ms) {
        if (!ms || ms === 0 || isNaN(ms)) return '0s (0ms)';
        // Arrondir d'abord les millisecondes
        const roundedMs = Math.round(Number(ms));
        // Toujours afficher en secondes et millisecondes
        const seconds = roundedMs / 1000;
        if (seconds < 10) {
            // Arrondir à 3 décimales pour les secondes < 10
            const roundedSeconds = Math.round(seconds * 1000) / 1000;
            return `${roundedSeconds.toFixed(3)}s (${roundedMs}ms)`;
        }
        // Arrondir à 1 décimale pour les secondes >= 10
        const roundedSeconds = Math.round(seconds * 10) / 10;
        return `${roundedSeconds.toFixed(1)}s (${roundedMs}ms)`;
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
            'simple_ambiguous': t('results.conditions.simple_ambiguous', 'Simple, ambiguous'),
            'complex_ambiguous': t('results.conditions.complex_ambiguous', 'Complex, ambiguous'),
            'ambiguous_easy': t('results.conditions.simple_ambiguous', 'Simple, ambiguous'), // Ancien nom (compatibilité)
            'ambiguous_difficult': t('results.conditions.complex_ambiguous', 'Complex, ambiguous') // Ancien nom (compatibilité)
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
                'simple_ambiguous': t('results.conditions.simple_ambiguous', 'Simple, ambiguous'),
                'complex_ambiguous': t('results.conditions.complex_ambiguous', 'Complex, ambiguous'),
                'ambiguous_easy': t('results.conditions.simple_ambiguous', 'Simple, ambiguous'), // Ancien nom (compatibilité)
                'ambiguous_difficult': t('results.conditions.complex_ambiguous', 'Complex, ambiguous') // Ancien nom (compatibilité)
            };
            
            // Vérifier que les classes de graphiques sont disponibles
            
            // Nouveau graphique de performance par condition
            if (typeof PerformanceByConditionChart !== 'undefined') {
                try {
                    this.charts.performanceByCondition = new PerformanceByConditionChart('performance-by-condition-chart', allData, labels);
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
                } catch (error) {
                    console.error('Erreur lors de la création du graphique de courbe d\'apprentissage:', error);
                    document.getElementById('learning-curve-chart').innerHTML = `<p>Erreur: ${error.message}</p>`;
                }
            } else {
                console.error('LearningCurveChart class not found');
                document.getElementById('learning-curve-chart').innerHTML = '<p>Erreur: Classe LearningCurveChart non trouvée</p>';
            }
        } else {
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
                        <th>${t('results.correct', 'Correct')}</th>
                        <th>${t('results.time', 'Time')}</th>
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
                                <td>${isCorrect ? '✅' : '❌'}</td>
                                <td>${responseTime}</td>
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
        // Utiliser les noms de conditions réels utilisés dans les données
        ['simple_non_ambiguous', 'complex_non_ambiguous', 'simple_ambiguous', 'complex_ambiguous'].forEach(condition => {
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
            'simple_ambiguous': t('results.conditions.simple_ambiguous', 'Simple, ambiguous'),
            'complex_ambiguous': t('results.conditions.complex_ambiguous', 'Complex, ambiguous'),
            'ambiguous_easy': t('results.conditions.simple_ambiguous', 'Simple, ambiguous'), // Ancien nom (compatibilité)
            'ambiguous_difficult': t('results.conditions.complex_ambiguous', 'Complex, ambiguous'), // Ancien nom (compatibilité)
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

        if (globalStats) globalStats.innerHTML = '';
        if (conditionStats) conditionStats.innerHTML = '';
        if (participantComparison) participantComparison.innerHTML = '';
        if (chartsContainer) chartsContainer.innerHTML = '';
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
        // Compter les participants uniques au lieu du nombre d'entrées
        const uniqueParticipants = new Set(this.importedData.map(fileInfo => fileInfo.data.participant?.id || 'unknown'));
        return {
            totalParticipants: uniqueParticipants.size,
            totalTrials: allData.length,
            averageAccuracy: this.calculateAverageAccuracy(allData),
            averageResponseTime: this.calculateAverageResponseTime(allData)
        };
    }

    emailData() {
        // Fonction helper pour les traductions sécurisées
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };

        if (this.importedData.length === 0) {
            alert(t('analytics.no_data_to_email', 'Aucune donnée à envoyer. Veuillez d\'abord importer des fichiers JSON.'));
            return;
        }

        // Adresse e-mail fixe
        const recipientEmail = 'andyvmartins@gmail.com';

        // Préparer les données pour l'e-mail
        const subject = encodeURIComponent(t('analytics.email_subject', 'Données d\'expérience psycholinguistique'));
        const body = this.prepareEmailBody();
        const bodyEncoded = encodeURIComponent(body);

        // Créer le lien mailto avec les fichiers en pièces jointes (simulation)
        const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${bodyEncoded}`;
        
        // Ouvrir le client e-mail
        window.open(mailtoLink);
        
        // Afficher un message d'information
        //alert(t('analytics.email_sent_auto', 'Le client e-mail s\'ouvre automatiquement avec votre adresse e-mail. Exportez et attachez les fichiers JSON, puis envoyez.'));
    }

    prepareEmailBody() {
        const t = (key, fallback) => {
            return window.i18n && window.i18n.t ? window.i18n.t(key) : fallback;
        };

        // Compter les participants uniques au lieu du nombre d'entrées
        const uniqueParticipants = new Set(this.importedData.map(fileInfo => fileInfo.data.participant?.id || 'unknown'));
        const totalParticipants = uniqueParticipants.size;
        const totalTrials = this.importedData.reduce((sum, file) => sum + (file.data.experiment?.data?.length || 0), 0);
        const allData = this.importedData.flatMap(file => file.data.experiment?.data || []);
        const overallAccuracy = this.calculateAverageAccuracy(allData);

        let body = t('analytics.email_greeting', 'Bonjour,\n\n');
        body += t('analytics.email_intro', 'Veuillez trouver ci-joint les données d\'expérience psycholinguistique :\n\n');
        
        body += t('analytics.email_stats', 'Résumé des données :\n');
        body += `- Nombre de participants : ${totalParticipants}\n`;
        body += `- Nombre total d'essais : ${totalTrials}\n`;
        body += `- Précision globale : ${overallAccuracy.toFixed(1)}%\n\n`;
        
        body += t('analytics.email_files', 'Fichiers à attacher :\n');
        this.importedData.forEach((file, index) => {
            const participantId = file.data.participant?.id || `Participant_${index + 1}`;
            const trialCount = file.data.experiment?.data?.length || 0;
            body += `- ${file.name} (${participantId}, ${trialCount} essais)\n`;
        });
        
        body += `\n${t('analytics.email_instructions', 'Instructions :\n')}`;
        body += t('analytics.email_attach', '1. Exportez les données en cliquant sur "Exporter les données"\n');
        body += t('analytics.email_attach_files', '2. Attachez les fichiers JSON téléchargés à cet e-mail\n');
        body += t('analytics.email_send', '3. Envoyez l\'e-mail\n\n');
        
        body += t('analytics.email_closing', 'Cordialement,\nL\'équipe de recherche');
        
        return body;
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
    
    // Initialisation immédiate avec fallback pour les traductions
    const initAnalytics = () => {
        const analytics = new AnalyticsPage();
        window.removeFile = (index) => analytics.removeFile(index);
        window.analyticsPage = analytics; // Rendre accessible globalement pour debug
    };
    
    // Essayer d'attendre le système de traduction, mais avec timeout
    let i18nTimeout = setTimeout(() => {
        initAnalytics();
    }, 3000); // 3 secondes de timeout
    
    // Écouter l'événement i18nReady
    window.addEventListener('i18nReady', () => {
        clearTimeout(i18nTimeout);
        initAnalytics();
    });
    
    // Fallback si l'événement n'est pas émis
    const waitForI18n = () => {
        if (window.i18n && window.i18n.loaded && window.i18n.translations) {
            clearTimeout(i18nTimeout);
            initAnalytics();
        } else {
            setTimeout(waitForI18n, 500);
        }
    };
    
    // Attendre un peu plus longtemps pour s'assurer que i18n est complètement initialisé
    setTimeout(waitForI18n, 1000);
}); 