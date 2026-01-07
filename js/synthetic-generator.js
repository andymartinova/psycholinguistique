/**
 * Générateur de données synthétiques optimisées
 * Analyse les données réelles et génère des données cohérentes
 */

class SyntheticDataGenerator {
    constructor() {
        this.analysisData = null;
        this.generatedData = null;
        this.allGeneratedData = null; // Pour la génération en masse
        this.optimizationEngine = new OptimizationEngine();
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        const form = document.getElementById('generator-form');
        const generateBtn = document.getElementById('generate-btn');
        const downloadBtn = document.getElementById('download-btn');
        const sendApiBtn = document.getElementById('send-api-btn');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateOptimizedData();
        });
        downloadBtn?.addEventListener('click', () => this.downloadData());
        sendApiBtn?.addEventListener('click', () => this.sendToAPI());
    }
    
    /**
     * Analyse les données existantes de la base de données
     * @param {boolean} silent - Si true, n'affiche pas les résultats (pour génération automatique)
     */
    async analyzeExistingData(silent = false) {
        const languageGroup = document.getElementById('language-group').value;
        const germanLevel = document.getElementById('german-level').value;
        
        if (!languageGroup || !germanLevel) {
            alert('Veuillez sélectionner le groupe linguistique et le niveau d\'allemand avant d\'analyser.');
            return;
        }
        
        // Plus besoin du bouton d'analyse puisqu'il est supprimé
        
        try {
            const baseUrl = getApiBaseUrl();
            if (!baseUrl) {
                throw new Error('API non configurée');
            }
            
            // Récupérer tous les participants
            let response = await fetch(`${baseUrl}/api/participants`);
            if (!response.ok) {
                response = await fetch(`${baseUrl}/api/results?participants=true`);
            }
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            const participants = Array.isArray(data) ? data : (data.participants || []);
            
            // Exclure uniquement les données générées (IP 1.1.1.1)
            // On garde TOUS les autres participants pour une meilleure analyse
            const realParticipants = participants.filter(p => p.ipAddress !== '1.1.1.1');
            
            if (realParticipants.length === 0) {
                this.displayAnalysisResults(null, languageGroup, germanLevel, true);
                return;
            }
            
            // Récupérer les données d'expérience pour TOUS les participants réels
            const participantIds = realParticipants.map(p => p.participantId || p.id);
            const processResponse = await fetch(`${baseUrl}/api/participants/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ participantIds })
            });
            
            if (!processResponse.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }
            
            const processData = await processResponse.json();
            const allParticipantsData = processData.data || processData;
            
            // Analyser TOUTES les données avec ajustement selon le niveau
            this.analysisData = this.analyzeAllParticipantsData(allParticipantsData, languageGroup, germanLevel);
            
            // Initialiser le moteur d'optimisation avec les données analysées
            this.optimizationEngine.initialize(this.analysisData);
            
            // Toujours afficher les résultats (même en mode automatique)
            this.displayAnalysisResults(this.analysisData, languageGroup, germanLevel, true);
            
        } catch (error) {
            console.error('Erreur lors de l\'analyse:', error);
            // Afficher quand même les résultats (même si vides)
            this.displayAnalysisResults(null, languageGroup, germanLevel, true);
            // En mode silencieux, on continue quand même avec les données par défaut
            if (silent) {
                console.warn('⚠️ Analyse échouée, utilisation des paramètres par défaut');
                this.analysisData = null;
            } else {
                alert(`Erreur lors de l'analyse: ${error.message}`);
            }
        }
    }
    
    /**
     * Analyse TOUTES les données disponibles et ajuste selon le niveau cible
     */
    analyzeAllParticipantsData(allParticipantsData, targetLanguageGroup, targetGermanLevel) {
        // Analyser toutes les données
        const allTrials = [];
        const participantsByLevel = {};
        const participantsByLanguage = {};
        
        allParticipantsData.forEach(participant => {
            const experiments = participant.experiments || [];
            const participantLevel = participant.germanLevel;
            const participantLang = participant.nativeLanguage || participant.languageGroup;
            
            // Grouper par niveau
            if (!participantsByLevel[participantLevel]) {
                participantsByLevel[participantLevel] = [];
            }
            
            // Grouper par langue
            const langKey = (participantLang === 'french' || participantLang === 'fr') ? 'fr' : 
                          (participantLang === 'portuguese' || participantLang === 'pt') ? 'pt' : 'other';
            if (!participantsByLanguage[langKey]) {
                participantsByLanguage[langKey] = [];
            }
            
            experiments.forEach(experiment => {
                const trials = experiment.trials || experiment.data || [];
                trials.forEach(trial => {
                    allTrials.push({
                        ...trial,
                        participantLevel: participantLevel,
                        participantLang: langKey
                    });
                });
            });
        });
        
        if (allTrials.length === 0) {
            return null;
        }
        
        // Statistiques globales
        const totalTrials = allTrials.length;
        const correctTrials = allTrials.filter(t => t.correct).length;
        const globalAccuracy = correctTrials / totalTrials;
        
        // Statistiques par condition (toutes données confondues)
        const conditionStats = {};
        const conditions = [...new Set(allTrials.map(t => t.condition))];
        
        conditions.forEach(condition => {
            const conditionTrials = allTrials.filter(t => t.condition === condition);
            const conditionCorrect = conditionTrials.filter(t => t.correct).length;
            const conditionAccuracy = conditionCorrect / conditionTrials.length;
            
            const responseTimes = conditionTrials.map(t => t.responseTime || 0).filter(rt => rt > 0);
            const avgResponseTime = responseTimes.length > 0 
                ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
                : 0;
            const stdDevResponseTime = responseTimes.length > 0
                ? Math.sqrt(responseTimes.reduce((sum, rt) => sum + Math.pow(rt - avgResponseTime, 2), 0) / responseTimes.length)
                : 0;
            
            // Analyser par niveau pour ajuster
            const accuracyByLevel = {};
            const timeByLevel = {};
            
            ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].forEach(level => {
                const levelTrials = conditionTrials.filter(t => t.participantLevel === level);
                if (levelTrials.length > 0) {
                    accuracyByLevel[level] = levelTrials.filter(t => t.correct).length / levelTrials.length;
                    const levelTimes = levelTrials.map(t => t.responseTime || 0).filter(rt => rt > 0);
                    if (levelTimes.length > 0) {
                        timeByLevel[level] = levelTimes.reduce((a, b) => a + b, 0) / levelTimes.length;
                    }
                }
            });
            
            conditionStats[condition] = {
                total: conditionTrials.length,
                correct: conditionCorrect,
                accuracy: conditionAccuracy,
                avgResponseTime: avgResponseTime,
                stdDevResponseTime: stdDevResponseTime,
                minResponseTime: Math.min(...responseTimes),
                maxResponseTime: Math.max(...responseTimes),
                accuracyByLevel: accuracyByLevel,
                timeByLevel: timeByLevel
            };
        });
        
        // Statistiques par type de phrase
        const grammaticalTrials = allTrials.filter(t => t.expected === 'grammatical');
        const ungrammaticalTrials = allTrials.filter(t => t.expected === 'ungrammatical');
        
        // Ajuster les statistiques selon le niveau cible
        const adjustedConditionStats = this.adjustStatsForLevel(conditionStats, targetGermanLevel);
        
        return {
            totalParticipants: allParticipantsData.length,
            totalTrials: totalTrials,
            overallAccuracy: globalAccuracy,
            conditionStats: adjustedConditionStats,
            rawConditionStats: conditionStats, // Garder les stats brutes aussi
            grammaticalStats: {
                total: grammaticalTrials.length,
                correct: grammaticalTrials.filter(t => t.correct).length,
                accuracy: grammaticalTrials.length > 0 ? grammaticalTrials.filter(t => t.correct).length / grammaticalTrials.length : 0
            },
            ungrammaticalStats: {
                total: ungrammaticalTrials.length,
                correct: ungrammaticalTrials.filter(t => t.correct).length,
                accuracy: ungrammaticalTrials.length > 0 ? ungrammaticalTrials.filter(t => t.correct).length / ungrammaticalTrials.length : 0
            },
            participantsByLevel: Object.keys(participantsByLevel).map(level => ({
                level: level,
                count: participantsByLevel[level].length
            })),
            participantsByLanguage: Object.keys(participantsByLanguage).map(lang => ({
                language: lang,
                count: participantsByLanguage[lang].length
            }))
        };
    }
    
    /**
     * Ajuste les statistiques selon le niveau cible
     */
    adjustStatsForLevel(conditionStats, targetLevel) {
        const adjusted = {};
        
        // Niveaux de compétence (pour interpolation)
        const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const targetIndex = levelOrder.indexOf(targetLevel);
        
        Object.keys(conditionStats).forEach(condition => {
            const stats = conditionStats[condition];
            const adjustedStats = { ...stats };
            
            // Ajuster la précision selon le niveau
            if (stats.accuracyByLevel && Object.keys(stats.accuracyByLevel).length > 0) {
                // Trouver les niveaux les plus proches
                const availableLevels = Object.keys(stats.accuracyByLevel)
                    .filter(level => stats.accuracyByLevel[level] !== undefined)
                    .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));
                
                if (availableLevels.length > 0) {
                    // Si on a des données pour ce niveau exact, les utiliser
                    if (stats.accuracyByLevel[targetLevel]) {
                        adjustedStats.accuracy = stats.accuracyByLevel[targetLevel];
                    } else {
                        // Interpoler entre les niveaux les plus proches
                        const lowerLevel = availableLevels.filter(l => levelOrder.indexOf(l) <= targetIndex).pop();
                        const upperLevel = availableLevels.filter(l => levelOrder.indexOf(l) >= targetIndex)[0];
                        
                        if (lowerLevel && upperLevel) {
                            const lowerIndex = levelOrder.indexOf(lowerLevel);
                            const upperIndex = levelOrder.indexOf(upperLevel);
                            const lowerAccuracy = stats.accuracyByLevel[lowerLevel];
                            const upperAccuracy = stats.accuracyByLevel[upperLevel];
                            
                            if (lowerIndex === upperIndex) {
                                adjustedStats.accuracy = lowerAccuracy;
                            } else {
                                // Interpolation linéaire avec biais vers le niveau inférieur pour A2
                                let ratio = (targetIndex - lowerIndex) / (upperIndex - lowerIndex);
                                
                                // Pour A2, biaiser vers le niveau inférieur (plus réaliste)
                                if (targetLevel === 'A2') {
                                    ratio = ratio * 0.7; // Réduire l'influence du niveau supérieur
                                }
                                
                                adjustedStats.accuracy = lowerAccuracy + (upperAccuracy - lowerAccuracy) * ratio;
                                
                                // Pour A2, s'assurer que la précision n'est pas trop élevée
                                if (targetLevel === 'A2' && adjustedStats.accuracy > 0.70) {
                                    adjustedStats.accuracy = Math.min(0.70, adjustedStats.accuracy * 0.9);
                                }
                            }
                        } else if (lowerLevel) {
                            adjustedStats.accuracy = stats.accuracyByLevel[lowerLevel];
                            // Pour A2, réduire encore si on utilise seulement le niveau inférieur
                            if (targetLevel === 'A2') {
                                adjustedStats.accuracy = adjustedStats.accuracy * 0.95;
                            }
                        } else if (upperLevel) {
                            adjustedStats.accuracy = stats.accuracyByLevel[upperLevel];
                            // Pour A2, réduire si on utilise seulement le niveau supérieur
                            if (targetLevel === 'A2') {
                                adjustedStats.accuracy = adjustedStats.accuracy * 0.85;
                            }
                        }
                    }
                }
            }
            
            // Ajuster le temps de réponse selon le niveau
            if (stats.timeByLevel && Object.keys(stats.timeByLevel).length > 0) {
                const availableLevels = Object.keys(stats.timeByLevel)
                    .filter(level => stats.timeByLevel[level] !== undefined)
                    .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));
                
                if (availableLevels.length > 0) {
                    if (stats.timeByLevel[targetLevel]) {
                        adjustedStats.avgResponseTime = stats.timeByLevel[targetLevel];
                    } else {
                        const lowerLevel = availableLevels.filter(l => levelOrder.indexOf(l) <= targetIndex).pop();
                        const upperLevel = availableLevels.filter(l => levelOrder.indexOf(l) >= targetIndex)[0];
                        
                        if (lowerLevel && upperLevel) {
                            const lowerIndex = levelOrder.indexOf(lowerLevel);
                            const upperIndex = levelOrder.indexOf(upperLevel);
                            const lowerTime = stats.timeByLevel[lowerLevel];
                            const upperTime = stats.timeByLevel[upperLevel];
                            
                            if (lowerIndex === upperIndex) {
                                adjustedStats.avgResponseTime = lowerTime;
                            } else {
                                const ratio = (targetIndex - lowerIndex) / (upperIndex - lowerIndex);
                                adjustedStats.avgResponseTime = lowerTime + (upperTime - lowerTime) * ratio;
                            }
                        } else if (lowerLevel) {
                            adjustedStats.avgResponseTime = stats.timeByLevel[lowerLevel];
                        } else if (upperLevel) {
                            adjustedStats.avgResponseTime = stats.timeByLevel[upperLevel];
                        }
                    }
                }
            }
            
            adjusted[condition] = adjustedStats;
        });
        
        return adjusted;
    }
    
    /**
     * Analyse les données des participants pour extraire les patterns (méthode originale conservée)
     */
    analyzeParticipantsData(participantsData) {
        const allTrials = [];
        
        participantsData.forEach(participant => {
            const experiments = participant.experiments || [];
            experiments.forEach(experiment => {
                const trials = experiment.trials || experiment.data || [];
                allTrials.push(...trials);
            });
        });
        
        if (allTrials.length === 0) {
            return null;
        }
        
        // Statistiques globales
        const totalTrials = allTrials.length;
        const correctTrials = allTrials.filter(t => t.correct).length;
        const accuracy = correctTrials / totalTrials;
        
        // Statistiques par condition
        const conditionStats = {};
        const conditions = [...new Set(allTrials.map(t => t.condition))];
        
        conditions.forEach(condition => {
            const conditionTrials = allTrials.filter(t => t.condition === condition);
            const conditionCorrect = conditionTrials.filter(t => t.correct).length;
            const conditionAccuracy = conditionCorrect / conditionTrials.length;
            
            const responseTimes = conditionTrials.map(t => t.responseTime || 0).filter(rt => rt > 0);
            const avgResponseTime = responseTimes.length > 0 
                ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
                : 0;
            const stdDevResponseTime = responseTimes.length > 0
                ? Math.sqrt(responseTimes.reduce((sum, rt) => sum + Math.pow(rt - avgResponseTime, 2), 0) / responseTimes.length)
                : 0;
            
            // Analyser les patterns d'erreurs
            const errorTrials = conditionTrials.filter(t => !t.correct);
            const errorPatterns = this.analyzeErrorPatterns(errorTrials, condition);
            
            conditionStats[condition] = {
                total: conditionTrials.length,
                correct: conditionCorrect,
                accuracy: conditionAccuracy,
                avgResponseTime: avgResponseTime,
                stdDevResponseTime: stdDevResponseTime,
                minResponseTime: Math.min(...responseTimes),
                maxResponseTime: Math.max(...responseTimes),
                errorPatterns: errorPatterns
            };
        });
        
        // Statistiques par type de phrase (grammatical vs ungrammatical)
        const grammaticalTrials = allTrials.filter(t => t.expected === 'grammatical');
        const ungrammaticalTrials = allTrials.filter(t => t.expected === 'ungrammatical');
        
        return {
            totalParticipants: participantsData.length,
            totalTrials: totalTrials,
            overallAccuracy: accuracy,
            conditionStats: conditionStats,
            grammaticalStats: {
                total: grammaticalTrials.length,
                correct: grammaticalTrials.filter(t => t.correct).length,
                accuracy: grammaticalTrials.length > 0 ? grammaticalTrials.filter(t => t.correct).length / grammaticalTrials.length : 0
            },
            ungrammaticalStats: {
                total: ungrammaticalTrials.length,
                correct: ungrammaticalTrials.filter(t => t.correct).length,
                accuracy: ungrammaticalTrials.length > 0 ? ungrammaticalTrials.filter(t => t.correct).length / ungrammaticalTrials.length : 0
            }
        };
    }
    
    /**
     * Analyse les patterns d'erreurs
     */
    analyzeErrorPatterns(errorTrials, condition) {
        // Analyser quelles phrases causent le plus d'erreurs
        const sentenceErrors = {};
        errorTrials.forEach(trial => {
            const sentence = trial.sentence || '';
            if (!sentenceErrors[sentence]) {
                sentenceErrors[sentence] = 0;
            }
            sentenceErrors[sentence]++;
        });
        
        // Calculer le taux d'erreur moyen pour cette condition
        const errorRate = errorTrials.length / (errorTrials.length + (errorTrials[0]?.totalCorrect || 0));
        
        return {
            errorRate: errorRate,
            commonErrors: Object.entries(sentenceErrors)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([sentence, count]) => ({ sentence, count }))
        };
    }
    
    /**
     * Affiche les résultats de l'analyse
     */
    displayAnalysisResults(analysisData, languageGroup, germanLevel, isGlobalAnalysis = false) {
        const analysisSection = document.getElementById('analysis-section');
        const statsGrid = document.getElementById('analysis-stats');
        const detailsDiv = document.getElementById('analysis-details');
        
        analysisSection.style.display = 'block';
        
        if (!analysisData) {
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <h4>Aucune donnée trouvée</h4>
                    <div class="value">0 participants</div>
                    <p style="margin-top: 10px; font-size: 12px; color: #666;">
                        Aucune donnée réelle trouvée dans la base de données.
                        Les données seront générées avec des paramètres par défaut.
                    </p>
                </div>
            `;
            detailsDiv.innerHTML = '';
            return;
        }
        
        // Afficher les statistiques principales
        const analysisInfo = isGlobalAnalysis 
            ? `<span class="info-badge" style="font-size: 10px; margin-left: 5px;">Analyse globale ajustée pour ${germanLevel}</span>`
            : '';
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <h4>Participants analysés${analysisInfo}</h4>
                <div class="value">${analysisData.totalParticipants}</div>
                ${analysisData.participantsByLevel ? `
                    <p style="margin-top: 5px; font-size: 11px; color: #666;">
                        ${analysisData.participantsByLevel.map(p => `${p.level}: ${p.count}`).join(', ')}
                    </p>
                ` : ''}
            </div>
            <div class="stat-card">
                <h4>Total des trials</h4>
                <div class="value">${analysisData.totalTrials}</div>
            </div>
            <div class="stat-card">
                <h4>Précision globale</h4>
                <div class="value">${(analysisData.overallAccuracy * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-card">
                <h4>Précision (grammatical)</h4>
                <div class="value">${(analysisData.grammaticalStats.accuracy * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-card">
                <h4>Précision (ungrammatical)</h4>
                <div class="value">${(analysisData.ungrammaticalStats.accuracy * 100).toFixed(1)}%</div>
            </div>
        `;
        
        // Afficher les détails par condition
        let detailsHTML = '<h3>Statistiques par condition:</h3><table style="width: 100%; border-collapse: collapse; margin-top: 10px;"><tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Condition</th><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Trials</th><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Précision</th><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Temps moyen</th></tr>';
        
        Object.entries(analysisData.conditionStats).forEach(([condition, stats]) => {
            detailsHTML += `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${condition}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${stats.total}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${(stats.accuracy * 100).toFixed(1)}%</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${Math.round(stats.avgResponseTime)}ms</td>
                </tr>
            `;
        });
        
        detailsHTML += '</table>';
        detailsDiv.innerHTML = detailsHTML;
    }
    
    /**
     * Génère un ID participant unique (même format que le formulaire de base)
     */
    generateParticipantId() {
        // Générer un ID unique : P + timestamp + 4 caractères aléatoires
        const timestamp = Date.now().toString(36).toUpperCase();
        const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `P${timestamp}${randomChars}`;
    }
    
    /**
     * Génère des données optimisées basées sur l'analyse
     * @param {boolean} retry - Si true, c'est une tentative de régénération
     */
    async generateOptimizedData(retry = false) {
        const languageGroup = document.getElementById('language-group').value;
        const germanLevel = document.getElementById('german-level').value;
        const participantCount = parseInt(document.getElementById('participant-count').value) || 1;
        
        if (!languageGroup || !germanLevel) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        
        if (participantCount < 1 || participantCount > 100) {
            alert('Le nombre de participants doit être entre 1 et 100.');
            return;
        }
        
        const loading = document.getElementById('loading');
        const generateBtn = document.getElementById('generate-btn');
        
        loading.classList.add('active');
        generateBtn.disabled = true;
        
        try {
            // Analyser automatiquement les données si ce n'est pas déjà fait
            if (!this.analysisData || retry) {
                loading.innerHTML = '<p>⏳ Analyse des données existantes...</p>';
                await this.analyzeExistingData(true); // true = mode silencieux (pas d'affichage)
            }
            
            // Charger les phrases expérimentales
            loading.innerHTML = '<p>⏳ Chargement des phrases expérimentales...</p>';
            const sentences = await this.loadExperimentalSentences();
            
            // Génération en masse
            const allGeneratedData = [];
            
            // Générer chaque participant
            for (let i = 0; i < participantCount; i++) {
                const participantId = this.generateParticipantId();
                
                // Mettre à jour la barre de progression
                if (participantCount > 1) {
                    const progress = ((i + 1) / participantCount * 100).toFixed(0);
                    loading.innerHTML = `<p>⏳ Génération en cours... ${i + 1}/${participantCount} (${progress}%)</p>`;
                } else {
                    loading.innerHTML = '<p>⏳ Génération des données optimisées...</p>';
                }
                
                // Si c'est une régénération, essayer jusqu'à obtenir un score acceptable
                let maxAttempts = retry ? 5 : 1;
                let attempt = 0;
                let bestData = null;
                let bestScore = 0;
                
                while (attempt < maxAttempts) {
                    attempt++;
                    
                    // Générer les données optimisées
                    const generatedData = this.generateDataOptimized(
                        participantId,
                        languageGroup,
                        germanLevel,
                        sentences,
                        this.analysisData
                    );
                    
                    const validation = generatedData.validation;
                    
                    // Si c'est une régénération, garder la meilleure tentative
                    if (retry) {
                        if (validation.score > bestScore) {
                            bestScore = validation.score;
                            bestData = generatedData;
                        }
                        
                        // Si on a un score excellent, s'arrêter
                        if (validation.score >= 90) {
                            break;
                        }
                    } else {
                        // Première génération, utiliser directement
                        bestData = generatedData;
                        break;
                    }
                }
                
                allGeneratedData.push(bestData);
            }
            
            // Si un seul participant, afficher normalement
            if (participantCount === 1) {
                this.generatedData = allGeneratedData[0];
                this.displayGeneratedData(allGeneratedData[0]);
            } else {
                // Afficher le résumé de la génération en masse
                this.displayBulkGenerationResults(allGeneratedData);
            }
            
        } catch (error) {
            console.error('Erreur lors de la génération:', error);
            alert(`Erreur lors de la génération: ${error.message}`);
        } finally {
            loading.classList.remove('active');
            generateBtn.disabled = false;
        }
    }
    
    /**
     * Charge les phrases expérimentales
     */
    async loadExperimentalSentences() {
        // Vérifier si EXPERIMENTAL_SENTENCES est déjà disponible (chargé par une autre page)
        if (typeof EXPERIMENTAL_SENTENCES !== 'undefined' && Array.isArray(EXPERIMENTAL_SENTENCES)) {
            return EXPERIMENTAL_SENTENCES.map(s => ({
                sentence: s.sentence,
                condition: s.condition,
                expected: s.expected
            }));
        }
        
        // Essayer de charger le script data.js
        try {
            const script = document.createElement('script');
            script.src = 'js/data.js';
            script.async = false;
            
            await new Promise((resolve, reject) => {
                script.onload = () => {
                    setTimeout(() => {
                        if (typeof EXPERIMENTAL_SENTENCES !== 'undefined' && Array.isArray(EXPERIMENTAL_SENTENCES)) {
                            resolve();
                        } else {
                            reject(new Error('EXPERIMENTAL_SENTENCES non défini après chargement'));
                        }
                    }, 100);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
            
            if (typeof EXPERIMENTAL_SENTENCES !== 'undefined' && Array.isArray(EXPERIMENTAL_SENTENCES)) {
                return EXPERIMENTAL_SENTENCES.map(s => ({
                    sentence: s.sentence,
                    condition: s.condition,
                    expected: s.expected
                }));
            }
        } catch (error) {
            console.warn('Impossible de charger data.js via script, utilisation du parser:', error);
        }
        
        // Fallback: parser depuis le fichier
        try {
            const response = await fetch('js/data.js');
            const text = await response.text();
            
            const sentences = [];
            // Pattern amélioré pour capturer les phrases
            const sentencePattern = /\{\s*sentence:\s*"((?:[^"\\]|\\.)+)",\s*condition:\s*"([^"]+)",\s*expected:\s*"([^"]+)"[^}]*\}/g;
            let match;
            
            while ((match = sentencePattern.exec(text)) !== null) {
                sentences.push({
                    sentence: match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
                    condition: match[2],
                    expected: match[3]
                });
            }
            
            if (sentences.length > 0) {
                console.log(`✅ ${sentences.length} phrases chargées depuis data.js`);
                return sentences;
            }
        } catch (error) {
            console.error('Erreur lors du parsing:', error);
        }
        
        // Dernier recours: phrases par défaut
        console.warn('Utilisation des phrases par défaut (nombre limité)');
        return this.getDefaultSentences();
    }
    
    /**
     * Phrases par défaut si le chargement échoue
     */
    getDefaultSentences() {
        // Retourner quelques phrases de base pour éviter les erreurs
        return [
            { sentence: "sie steht jeden Tag um sechs Uhr auf", condition: "simple_non_ambiguous", expected: "grammatical" },
            { sentence: "Ich aufstehe jeden Tag um sieben Uhr", condition: "simple_ambiguous", expected: "ungrammatical" },
            { sentence: "Er schläft, da er müde ist.", condition: "complex_non_ambiguous", expected: "grammatical" },
            { sentence: "Er bleibt zu Hause, während seine arbeitet Frau", condition: "complex_ambiguous", expected: "ungrammatical" }
        ];
    }
    
    /**
     * Sélectionne les phrases de manière équilibrée par condition
     */
    selectBalancedSentences(sentences, totalTrials) {
        if (sentences.length === 0) {
            return [];
        }
        
        // Grouper les phrases par condition
        const byCondition = {};
        sentences.forEach(s => {
            if (!byCondition[s.condition]) {
                byCondition[s.condition] = [];
            }
            byCondition[s.condition].push(s);
        });
        
        // Mélanger chaque groupe
        Object.keys(byCondition).forEach(condition => {
            byCondition[condition] = byCondition[condition].sort(() => Math.random() - 0.5);
        });
        
        // Calculer le nombre de phrases par condition (équilibré)
        const conditions = Object.keys(byCondition);
        const perCondition = Math.floor(totalTrials / conditions.length);
        const remainder = totalTrials % conditions.length;
        
        const selected = [];
        const usedIndices = new Set();
        
        // Sélectionner équitablement de chaque condition
        conditions.forEach((condition, index) => {
            const count = perCondition + (index < remainder ? 1 : 0);
            const available = byCondition[condition];
            
            // Prendre jusqu'à 'count' phrases de cette condition
            for (let i = 0; i < Math.min(count, available.length); i++) {
                selected.push(available[i]);
            }
        });
        
        // Si on n'a pas assez de phrases, compléter avec des phrases aléatoires
        if (selected.length < totalTrials) {
            const remaining = sentences.filter(s => !selected.includes(s));
            const shuffled = remaining.sort(() => Math.random() - 0.5);
            selected.push(...shuffled.slice(0, totalTrials - selected.length));
        }
        
        // Mélanger final pour randomiser l'ordre
        return selected.sort(() => Math.random() - 0.5);
    }
    
    /**
     * Génère des données optimisées basées sur l'analyse
     */
    generateDataOptimized(participantId, languageGroup, germanLevel, sentences, analysisData) {
        // Utiliser le générateur Node.js si disponible, sinon générer côté client
        const startTime = new Date();
        
        // Si on a des données d'analyse, les utiliser pour optimiser
        const optimizedParams = this.calculateOptimizedParameters(germanLevel, analysisData);
        
        // Sélectionner les phrases de manière équilibrée par condition
        const selectedSentences = this.selectBalancedSentences(sentences, 56);
        
        const experimentData = [];
        
        // Variable pour suivre le temps cumulatif
        let cumulativeTime = startTime.getTime();
        
        selectedSentences.forEach((sentenceData, index) => {
            const trial = index + 1;
            const condition = sentenceData.condition;
            const expected = sentenceData.expected;
            
            // Utiliser le moteur d'optimisation avancé
            const previousTrials = experimentData.slice(); // Trials précédents pour la cohérence
            const optimization = this.optimizationEngine.optimizeTrial(
                condition,
                expected,
                trial,
                56, // totalTrials
                optimizedParams.skillLevel,
                previousTrials
            );
            
            // Calculer le timestamp de manière cumulative pour garantir l'ordre
            // Temps d'affichage de la phrase (2 secondes selon config)
            const sentenceDisplayTime = 2000;
            
            // Temps entre les trials : 3-5 secondes (variation réaliste)
            // Ce temps représente la pause entre la fin d'un trial et le début du suivant
            const timeBetweenTrials = 3000 + Math.random() * 2000;
            
            // Le timestamp représente le moment où la phrase est affichée
            // = temps cumulatif + pause entre trials
            cumulativeTime += timeBetweenTrials;
            const timestamp = new Date(cumulativeTime);
            
            // Ajouter le temps d'affichage de la phrase + temps de réponse
            // pour le prochain trial
            cumulativeTime += sentenceDisplayTime + optimization.responseTime;
            
            experimentData.push({
                trial: trial,
                sentence: sentenceData.sentence,
                condition: condition,
                expected: expected,
                response: optimization.response,
                responseTime: optimization.responseTime,
                correct: optimization.isCorrect,
                timestamp: timestamp.toISOString()
            });
        });
        
        // Valider les données générées avec validation complète
        const validation = this.optimizationEngine.validateGeneratedData(experimentData);
        
        // Log détaillé pour le débogage
        if (!validation.isValid || validation.warnings.length > 0) {
            console.group('🔍 Validation des données générées');
            if (validation.issues.length > 0) {
                console.error('❌ Problèmes critiques:', validation.issues);
            }
            if (validation.warnings.length > 0) {
                console.warn('⚠️ Avertissements:', validation.warnings);
            }
            console.log('📊 Statistiques:', validation.stats);
            console.log(`📈 Score de validation: ${validation.score}/100`);
            console.groupEnd();
        } else {
            console.log('✅ Validation réussie - Score:', validation.score);
        }
        
        const endTime = new Date(experimentData[experimentData.length - 1].timestamp);
        endTime.setSeconds(endTime.getSeconds() + 2);
        
        const generatedData = {
            participant: {
                id: participantId,
                languageGroup: languageGroup,
                germanLevel: germanLevel,
                startTime: startTime.toISOString(),
                ipAddress: '1.1.1.1' // IP forcée pour identifier les données générées
            },
            experiment: {
                config: {
                    practiceTrials: 4,
                    totalTrials: 56,
                    pauseAfterTrials: 0,
                    sentenceDisplayTime: 2000,
                    feedbackTime: 1500
                },
                data: experimentData,
                endTime: endTime.toISOString()
            },
            validation: validation // Inclure les résultats de validation
        };
        
        return generatedData;
    }
    
    /**
     * Calcule les paramètres optimisés basés sur l'analyse
     */
    calculateOptimizedParameters(germanLevel, analysisData) {
        // Niveaux de compétence de base (ajustés pour être plus réalistes)
        // A2 réduit car avait trop de bonnes réponses
        const skillLevels = {
            'A1': 0.30,
            'A2': 0.32,  // Réduit pour correspondre à ~60.9% de précision réelle (au lieu de 69-71%)
            'B1': 0.60,
            'B2': 0.75,
            'C1': 0.85,
            'C2': 0.92
        };
        let baseSkill = skillLevels[germanLevel] || 0.65;
        
        // Si on a des données d'analyse, ajuster selon les patterns réels
        if (analysisData) {
            // Ajuster le niveau de compétence selon la précision observée
            const observedAccuracy = analysisData.overallAccuracy;
            
            // Ajustement plus conservateur pour les niveaux bas (A1, A2)
            let adjustmentFactor = 0.5; // Facteur par défaut
            if (germanLevel === 'A1' || germanLevel === 'A2') {
                adjustmentFactor = 0.2; // Ajustement encore plus faible pour A1/A2
            }
            
            const skillAdjustment = (observedAccuracy - 0.65) * adjustmentFactor;
            
            // Limites plus strictes pour A2 - plafond réduit pour éviter trop de bonnes réponses
            if (germanLevel === 'A2') {
                baseSkill = Math.max(0.30, Math.min(0.40, baseSkill + skillAdjustment));
            } else {
                baseSkill = Math.max(0.28, Math.min(0.95, baseSkill + skillAdjustment));
            }
        }
        
        return {
            skillLevel: baseSkill,
            analysisData: analysisData
        };
    }
    
    /**
     * Obtient la probabilité de précision optimisée
     */
    getOptimizedAccuracy(condition, expected, optimizedParams, analysisData) {
        // Probabilités de base
        const baseProbabilities = {
            'simple_non_ambiguous': 0.95,
            'simple_ambiguous': 0.70,
            'complex_non_ambiguous': 0.85,
            'complex_ambiguous': 0.60
        };
        
        let baseProb = baseProbabilities[condition] || 0.75;
        
        // Si on a des données d'analyse, utiliser les statistiques réelles
        if (analysisData && analysisData.conditionStats[condition]) {
            const realStats = analysisData.conditionStats[condition];
            // Mélanger les données réelles (70%) avec les données de base (30%)
            baseProb = realStats.accuracy * 0.7 + baseProb * 0.3;
        }
        
        // Ajuster selon le niveau de compétence
        const skillAdjustment = (optimizedParams.skillLevel - 0.5) * 0.3;
        const grammaticalBonus = expected === 'grammatical' ? 0.05 : -0.05;
        
        const adjustedProb = baseProb + skillAdjustment + grammaticalBonus;
        return Math.max(0.5, Math.min(0.99, adjustedProb));
    }
    
    /**
     * Obtient le temps de réponse optimisé
     */
    getOptimizedResponseTime(condition, trial, totalTrials, optimizedParams, analysisData, isCorrect) {
        // Temps de base
        const baseTimes = {
            'simple_non_ambiguous': { mean: 1200, stdDev: 300 },
            'simple_ambiguous': { mean: 2200, stdDev: 500 },
            'complex_non_ambiguous': { mean: 1800, stdDev: 400 },
            'complex_ambiguous': { mean: 2800, stdDev: 600 }
        };
        
        let base = baseTimes[condition] || { mean: 2000, stdDev: 400 };
        
        // Si on a des données d'analyse, utiliser les temps réels
        if (analysisData && analysisData.conditionStats[condition]) {
            const realStats = analysisData.conditionStats[condition];
            // Mélanger les données réelles (70%) avec les données de base (30%)
            base = {
                mean: realStats.avgResponseTime * 0.7 + base.mean * 0.3,
                stdDev: realStats.stdDevResponseTime * 0.7 + base.stdDev * 0.3
            };
        }
        
        // Effet d'apprentissage
        const learningFactor = 1 - (trial / totalTrials) * 0.2;
        
        // Hésitation sur les erreurs
        const hesitationFactor = isCorrect ? 1.0 : 1.15;
        
        // Ajustement selon le niveau de compétence
        const skillFactor = 1.0 - (optimizedParams.skillLevel - 0.5) * 0.2;
        
        const adjustedMean = base.mean * learningFactor * hesitationFactor * skillFactor;
        
        // Générer avec distribution normale (approximation)
        const z = Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
        const responseTime = adjustedMean + z * base.stdDev;
        
        return Math.max(300, Math.min(8000, Math.round(responseTime)));
    }
    
    /**
     * Affiche les données générées
     */
    displayGeneratedData(data) {
        const resultsSection = document.getElementById('results-section');
        const statsDiv = document.getElementById('generation-stats');
        const previewDiv = document.getElementById('preview-data');
        
        resultsSection.style.display = 'block';
        
        // Calculer les statistiques
        const trials = data.experiment.data;
        const correct = trials.filter(t => t.correct).length;
        const accuracy = (correct / trials.length * 100).toFixed(1);
        const avgTime = Math.round(trials.reduce((sum, t) => sum + t.responseTime, 0) / trials.length);
        
        // Afficher les informations de validation complètes
        const validation = data.validation || { isValid: true, issues: [], warnings: [], score: 100 };
        
        // Badge de validation avec score
        let validationBadge;
        if (validation.score >= 90) {
            validationBadge = `<span class="success-badge">✓ Excellent (${validation.score}/100)</span>`;
        } else if (validation.score >= 70) {
            validationBadge = `<span class="info-badge">✓ Bon (${validation.score}/100)</span>`;
        } else if (validation.score >= 50) {
            validationBadge = `<span class="warning-badge">⚠ Acceptable (${validation.score}/100)</span>`;
        } else {
            validationBadge = `<span class="warning-badge" style="background: #f44336;">❌ Problèmes (${validation.score}/100)</span>`;
        }
        
        // Statistiques par condition
        const conditionStats = {};
        trials.forEach(t => {
            if (!conditionStats[t.condition]) {
                conditionStats[t.condition] = { total: 0, correct: 0 };
            }
            conditionStats[t.condition].total++;
            if (t.correct) conditionStats[t.condition].correct++;
        });
        
        let conditionStatsHTML = '';
        if (Object.keys(conditionStats).length > 0) {
            conditionStatsHTML = `
                <div style="margin-top: 15px;">
                    <h4 style="margin-bottom: 10px;">Précision par condition:</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        ${Object.entries(conditionStats).map(([cond, stats]) => {
                            const condAccuracy = (stats.correct / stats.total * 100).toFixed(1);
                            return `
                                <div style="padding: 10px; background: #f5f5f5; border-radius: 4px;">
                                    <strong>${cond}</strong><br>
                                    ${condAccuracy}% (${stats.correct}/${stats.total})
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        statsDiv.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Participant</h4>
                    <div class="value">${data.participant.id}</div>
                </div>
                <div class="stat-card">
                    <h4>Précision</h4>
                    <div class="value">${accuracy}%</div>
                </div>
                <div class="stat-card">
                    <h4>Temps moyen</h4>
                    <div class="value">${avgTime}ms</div>
                </div>
                <div class="stat-card">
                    <h4>Total trials</h4>
                    <div class="value">${trials.length}</div>
                </div>
                <div class="stat-card">
                    <h4>Validation</h4>
                    <div class="value" style="font-size: 14px;">${validationBadge}</div>
                </div>
            </div>
            
            ${validation.summary ? `
                <div style="margin-top: 15px; padding: 12px; background: #e3f2fd; border-radius: 4px; border-left: 4px solid #2196F3;">
                    <strong>📊 Résumé de validation:</strong> ${validation.summary}
                </div>
            ` : ''}
            
            ${validation.issues && validation.issues.length > 0 ? `
                <div style="margin-top: 15px; padding: 12px; background: #ffebee; border-radius: 4px; border-left: 4px solid #f44336;">
                    <strong>❌ Problèmes critiques (${validation.issues.length}):</strong>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                        ${validation.issues.map(issue => `<li style="margin: 4px 0;">${issue}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${validation.warnings && validation.warnings.length > 0 ? `
                <div style="margin-top: 15px; padding: 12px; background: #fff3cd; border-radius: 4px; border-left: 4px solid #ff9800;">
                    <strong>⚠️ Avertissements (${validation.warnings.length}):</strong>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                        ${validation.warnings.slice(0, 10).map(warning => `<li style="margin: 4px 0;">${warning}</li>`).join('')}
                        ${validation.warnings.length > 10 ? `<li style="color: #666; font-style: italic;">... et ${validation.warnings.length - 10} autre(s)</li>` : ''}
                    </ul>
                </div>
            ` : ''}
            
            ${conditionStatsHTML}
            
            ${validation.score < 50 ? `
                <div style="margin-top: 15px; padding: 12px; background: #ffebee; border-radius: 4px; border-left: 4px solid #f44336;">
                    <strong>⚠️ Score de validation faible</strong>
                    <p style="margin: 8px 0;">Les données générées présentent des problèmes. Il est recommandé de régénérer.</p>
                    <button id="regenerate-btn" class="btn btn-warning" style="margin-top: 10px;">
                        🔄 Régénérer les données
                    </button>
                </div>
            ` : ''}
        `;
        
        // Ajouter le gestionnaire d'événement pour le bouton de régénération
        const regenerateBtn = document.getElementById('regenerate-btn');
        if (regenerateBtn) {
            // Supprimer les anciens listeners pour éviter les doublons
            const newRegenerateBtn = regenerateBtn.cloneNode(true);
            regenerateBtn.parentNode.replaceChild(newRegenerateBtn, regenerateBtn);
            
            newRegenerateBtn.addEventListener('click', () => {
                if (confirm('Voulez-vous régénérer les données avec les mêmes paramètres ?\n\nLe système essaiera jusqu\'à 5 fois pour obtenir un meilleur score.')) {
                    this.generateOptimizedData(true); // true = mode retry
                }
            });
        }
        
        // Nettoyer les données pour l'aperçu (enlever la validation)
        const previewData = { ...data };
        delete previewData.validation;
        previewDiv.textContent = JSON.stringify(previewData, null, 2);
    }
    
    /**
     * Affiche les résultats de la génération en masse
     */
    displayBulkGenerationResults(allData) {
        const resultsSection = document.getElementById('results-section');
        const statsDiv = document.getElementById('generation-stats');
        const previewDiv = document.getElementById('preview-data');
        
        resultsSection.style.display = 'block';
        
        // Calculer les statistiques globales
        const allTrials = allData.flatMap(d => d.experiment.data);
        const totalCorrect = allTrials.filter(t => t.correct).length;
        const globalAccuracy = (totalCorrect / allTrials.length * 100).toFixed(1);
        const avgTime = Math.round(allTrials.reduce((sum, t) => sum + t.responseTime, 0) / allTrials.length);
        
        // Statistiques de validation
        const validations = allData.map(d => d.validation);
        const avgScore = Math.round(validations.reduce((sum, v) => sum + v.score, 0) / validations.length);
        const validCount = validations.filter(v => v.isValid).length;
        
        statsDiv.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Participants générés</h4>
                    <div class="value">${allData.length}</div>
                </div>
                <div class="stat-card">
                    <h4>Précision globale</h4>
                    <div class="value">${globalAccuracy}%</div>
                </div>
                <div class="stat-card">
                    <h4>Temps moyen</h4>
                    <div class="value">${avgTime}ms</div>
                </div>
                <div class="stat-card">
                    <h4>Score moyen</h4>
                    <div class="value">${avgScore}/100</div>
                </div>
                <div class="stat-card">
                    <h4>Validés</h4>
                    <div class="value">${validCount}/${allData.length}</div>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <h3>Liste des participants générés:</h3>
                <div style="max-height: 300px; overflow-y: auto; margin-top: 10px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f5f5f5;">
                                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">ID</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Précision</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Score</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allData.map((data, index) => {
                                const trials = data.experiment.data;
                                const correct = trials.filter(t => t.correct).length;
                                const accuracy = (correct / trials.length * 100).toFixed(1);
                                const validation = data.validation;
                                const scoreClass = validation.score >= 90 ? 'score-excellent' : 
                                                  validation.score >= 70 ? 'score-good' : 
                                                  validation.score >= 50 ? 'score-acceptable' : 'score-poor';
                                
                                return `
                                    <tr>
                                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.participant.id}</td>
                                        <td style="padding: 8px; border-bottom: 1px solid #eee;">${accuracy}%</td>
                                        <td style="padding: 8px; border-bottom: 1px solid #eee;">
                                            <span class="${scoreClass}">${validation.score}/100</span>
                                        </td>
                                        <td style="padding: 8px; border-bottom: 1px solid #eee;">
                                            <button class="btn btn-sm" onclick="syntheticGenerator.viewParticipantData(${index})" style="padding: 4px 8px; font-size: 12px;">
                                                👁️ Voir
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Stocker toutes les données pour le téléchargement
        this.allGeneratedData = allData;
        this.generatedData = allData[0]; // Pour compatibilité avec les autres méthodes
        
        // Aperçu du premier participant
        const previewData = { ...allData[0] };
        delete previewData.validation;
        previewDiv.textContent = JSON.stringify(previewData, null, 2);
    }
    
    /**
     * Affiche les données d'un participant spécifique
     */
    viewParticipantData(index) {
        if (!this.allGeneratedData || !this.allGeneratedData[index]) return;
        
        this.generatedData = this.allGeneratedData[index];
        this.displayGeneratedData(this.allGeneratedData[index]);
        
        // Scroll vers le haut pour voir les détails
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * Télécharge les données générées
     */
    downloadData() {
        // Si génération en masse, télécharger tous les participants
        if (this.allGeneratedData && this.allGeneratedData.length > 1) {
            // Créer un ZIP ou télécharger un fichier JSON avec tous les participants
            const allDataJson = JSON.stringify(this.allGeneratedData, null, 2);
            const blob = new Blob([allDataJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            a.download = `synthetic_participants_${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else if (this.generatedData) {
            // Télécharger un seul participant
            const jsonString = JSON.stringify(this.generatedData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            const date = new Date(this.generatedData.participant.startTime).toISOString().split('T')[0];
            a.download = `${this.generatedData.participant.id}_${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
    
    /**
     * Envoie les données à l'API
     */
    async sendToAPI() {
        const sendBtn = document.getElementById('send-api-btn');
        sendBtn.disabled = true;
        
        // Si génération en masse, envoyer tous les participants
        const dataToSend = (this.allGeneratedData && this.allGeneratedData.length > 1) 
            ? this.allGeneratedData 
            : [this.generatedData];
        
        if (!dataToSend || dataToSend.length === 0) return;
        
        sendBtn.textContent = `⏳ Envoi en cours... (0/${dataToSend.length})`;
        
        try {
            const baseUrl = getApiBaseUrl();
            if (!baseUrl) {
                throw new Error('API non configurée');
            }
            
            const results = [];
            let successCount = 0;
            let errorCount = 0;
            
            // Envoyer chaque participant
            for (let i = 0; i < dataToSend.length; i++) {
                const data = dataToSend[i];
                sendBtn.textContent = `⏳ Envoi en cours... (${i + 1}/${dataToSend.length})`;
                
                try {
                    // Formater les données pour l'API
                    const formattedData = this.formatDataForAPI(data);
                    
                    // Vérification finale : s'assurer que l'IP est bien 1.1.1.1
                    if (formattedData.participant.ipAddress !== '1.1.1.1') {
                        console.error('❌ ERREUR CRITIQUE: IP non conforme dans formattedData:', formattedData.participant.ipAddress);
                        formattedData.participant.ipAddress = '1.1.1.1';
                    }
                    
                    // Vérification supplémentaire dans metadata
                    if (formattedData.metadata && formattedData.metadata.forceIp !== '1.1.1.1') {
                        formattedData.metadata.forceIp = '1.1.1.1';
                    }
                    
                    // Log détaillé pour vérification
                    console.log('📤 Envoi avec IP forcée:', {
                        participantId: formattedData.participant.id,
                        ipAddress: formattedData.participant.ipAddress,
                        metadata: formattedData.metadata,
                        verification: formattedData.participant.ipAddress === '1.1.1.1' ? '✅ OK' : '❌ ERREUR'
                    });
                    
                    // Vérification finale avant envoi
                    if (formattedData.participant.ipAddress !== '1.1.1.1') {
                        throw new Error(`IP non conforme avant envoi: ${formattedData.participant.ipAddress}`);
                    }
                    
                    // Envoyer avec headers spéciaux pour forcer l'IP côté backend
                    const response = await fetch(`${baseUrl}/api/results`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Force-IP': '1.1.1.1', // Header pour forcer l'IP côté backend
                            'X-Synthetic-Data': 'true', // Marqueur pour données synthétiques
                            'X-Use-Body-IP': 'true' // Indicateur pour utiliser l'IP du body
                        },
                        body: JSON.stringify(formattedData)
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
                    }
                    
                    const result = await response.json();
                    results.push({ id: data.participant.id, success: true, result });
                    successCount++;
                } catch (error) {
                    console.error(`Erreur pour ${data.participant.id}:`, error);
                    results.push({ id: data.participant.id, success: false, error: error.message });
                    errorCount++;
                }
            }
            
            // Afficher le résumé
            if (dataToSend.length === 1) {
                alert(`✅ Données envoyées avec succès!\n\nParticipant ID: ${results[0].id}\nIP: 1.1.1.1 (marqueur de données générées)`);
            } else {
                alert(`✅ Envoi terminé!\n\n✅ Réussis: ${successCount}\n❌ Échecs: ${errorCount}\n\nTous les participants ont l'IP: 1.1.1.1 (marqueur de données générées)`);
            }
            
        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            alert(`Erreur lors de l'envoi: ${error.message}`);
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = '📤 Envoyer à l\'API';
        }
    }
    
    /**
     * Formate les données pour l'API
     * FORCE l'IP à 1.1.1.1 pour les données générées
     */
    formatDataForAPI(data) {
        const participantData = data.participant;
        const experimentData = data.experiment;
        
        let nativeLanguage = null;
        if (participantData.languageGroup === 'fr') {
            nativeLanguage = 'french';
        } else if (participantData.languageGroup === 'pt') {
            nativeLanguage = 'portuguese';
        }
        
        // Format identique à formatDataForAPI dans utils.js mais avec IP FORCÉE
        // L'IP doit être TOUJOURS 1.1.1.1 pour les données générées
        // IMPORTANT: Le backend DOIT utiliser cette IP au lieu de req.ip
        const formattedData = {
            participant: {
                id: participantData.id.trim(),
                germanLevel: participantData.germanLevel || null,
                nativeLanguage: nativeLanguage,
                notBilingual: participantData.notBilingual !== undefined ? participantData.notBilingual : true,
                startTime: participantData.startTime,
                ipAddress: '1.1.1.1' // FORCÉE - Le backend DOIT utiliser cette valeur
            },
            experiment: {
                config: experimentData.config || {},
                endTime: experimentData.endTime,
                data: experimentData.data || []
            },
            // Ajouter des métadonnées pour forcer l'IP
            metadata: {
                synthetic: true,
                forceIp: '1.1.1.1',
                source: 'synthetic-generator'
            }
        };
        
        // Triple vérification : s'assurer que l'IP est bien 1.1.1.1
        if (formattedData.participant.ipAddress !== '1.1.1.1') {
            console.error('❌ ERREUR CRITIQUE: IP non conforme:', formattedData.participant.ipAddress);
            formattedData.participant.ipAddress = '1.1.1.1';
        }
        
        // Vérification finale avant retour
        if (formattedData.participant.ipAddress !== '1.1.1.1') {
            throw new Error('IP non conforme après toutes les vérifications');
        }
        
        return formattedData;
    }
    
    // Les méthodes optimizeGeneration et getBaseAccuracy ont été remplacées par OptimizationEngine
    // Conservées pour compatibilité mais ne sont plus utilisées
}

// Initialisation
let syntheticGenerator;
document.addEventListener('DOMContentLoaded', () => {
    syntheticGenerator = new SyntheticDataGenerator();
    // Exposer globalement pour les boutons onclick
    window.syntheticGenerator = syntheticGenerator;
});


