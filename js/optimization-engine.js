/**
 * Moteur d'optimisation avancé pour la génération de données synthétiques
 * Utilise des techniques statistiques avancées pour générer des données réalistes
 */

class OptimizationEngine {
    constructor() {
        this.analysisData = null;
        this.optimizationCache = {};
    }
    
    /**
     * Initialise le moteur avec les données d'analyse
     */
    initialize(analysisData) {
        this.analysisData = analysisData;
        this.optimizationCache = {};
        this.precomputeOptimizations();
    }
    
    /**
     * Précalcule les optimisations pour améliorer les performances
     */
    precomputeOptimizations() {
        if (!this.analysisData || !this.analysisData.conditionStats) {
            return;
        }
        
        // Précalculer les distributions pour chaque condition
        Object.keys(this.analysisData.conditionStats).forEach(condition => {
            const stats = this.analysisData.conditionStats[condition];
            this.optimizationCache[condition] = {
                responseTimeDistribution: this.fitDistribution(stats),
                accuracyModel: this.buildAccuracyModel(stats),
                errorPatterns: this.extractErrorPatterns(stats)
            };
        });
    }
    
    /**
     * Algorithme principal d'optimisation - Version avancée
     * Utilise plusieurs techniques statistiques combinées
     */
    optimizeTrial(condition, expected, trialNumber, totalTrials, skillLevel, previousTrials = []) {
        // 1. Calcul de la précision optimisée avec modèle bayésien
        const accuracy = this.optimizeAccuracy(condition, expected, skillLevel, previousTrials);
        
        // 2. Génération de la réponse avec validation de cohérence
        const response = this.generateResponse(accuracy, expected);
        const isCorrect = response === expected;
        
        // 3. Calcul du temps de réponse avec modèles avancés
        const responseTime = this.optimizeResponseTime(
            condition, 
            trialNumber, 
            totalTrials, 
            skillLevel, 
            isCorrect, 
            previousTrials
        );
        
        // 4. Validation de cohérence temporelle
        const validatedResponseTime = this.validateTemporalConsistency(
            responseTime, 
            previousTrials, 
            condition
        );
        
        return {
            accuracy: accuracy,
            response: response,
            isCorrect: isCorrect,
            responseTime: validatedResponseTime,
            confidence: this.calculateConfidence(condition, skillLevel)
        };
    }
    
    /**
     * Optimise la précision avec modèle bayésien
     * Combine les données réelles avec les priors selon la taille de l'échantillon
     */
    optimizeAccuracy(condition, expected, skillLevel, previousTrials) {
        // Prior de base selon la condition
        const basePrior = this.getBaseAccuracyPrior(condition, expected);
        
        // Si on a des données d'analyse, utiliser un modèle bayésien
        if (this.analysisData && this.analysisData.conditionStats[condition]) {
            const stats = this.analysisData.conditionStats[condition];
            const sampleSize = stats.total;
            
            // Calculer la précision observée pour ce type de phrase
            const observedAccuracy = this.getObservedAccuracy(stats, expected);
            
            // Modèle bayésien : combiner prior et likelihood
            // Plus l'échantillon est grand, plus on fait confiance aux données observées
            // Augmenter la confiance pour les petits échantillons aussi (minimum 10 échantillons)
            const minSamples = 10;
            const posteriorStrength = sampleSize >= minSamples 
                ? Math.min(1.0, (sampleSize - minSamples) / 20 + 0.5) // Entre 0.5 et 1.0
                : sampleSize / minSamples * 0.5; // Entre 0 et 0.5
            
            // Utiliser principalement les données observées si on a assez d'échantillons
            const bayesianAccuracy = observedAccuracy * posteriorStrength + basePrior * (1 - posteriorStrength);
            
            // Ajuster selon le niveau de compétence avec une fonction sigmoïde
            // Ajustement encore plus faible pour les niveaux bas (A1, A2)
            let adjustmentFactor = 0.5; // Facteur par défaut
            if (skillLevel < 0.45) {
                adjustmentFactor = 0.3; // Ajustement très faible pour A1/A2
            }
            const skillAdjustment = this.sigmoidAdjustment(skillLevel, bayesianAccuracy) * adjustmentFactor;
            
            // Ajuster selon les performances précédentes (effet d'apprentissage)
            const learningAdjustment = this.calculateLearningEffect(previousTrials, condition);
            
            // Combiner tous les facteurs
            let finalAccuracy = bayesianAccuracy + skillAdjustment + learningAdjustment;
            
            // Ajuster selon le type de phrase (grammatical vs ungrammatical)
            // Mais seulement si on n'a pas assez de données pour cette condition
            if (sampleSize < 20) {
                if (expected === 'grammatical') {
                    // Les phrases grammaticales sont généralement mieux détectées
                    finalAccuracy += 0.02;
                } else {
                    // Les phrases ungrammaticales sont plus difficiles
                    finalAccuracy -= 0.02;
                }
            }
            
            // Clamper entre des valeurs raisonnables
            return Math.max(0.50, Math.min(0.98, finalAccuracy));
        }
        
        // Fallback : utiliser les priors de base avec ajustement de compétence
        const skillAdjustment = this.sigmoidAdjustment(skillLevel, basePrior);
        return Math.max(0.50, Math.min(0.98, basePrior + skillAdjustment));
    }
    
    /**
     * Obtient le prior de base pour une condition
     */
    getBaseAccuracyPrior(condition, expected) {
        // Priors basés sur la littérature et les observations
        const priors = {
            'simple_non_ambiguous': {
                'grammatical': 0.96,
                'ungrammatical': 0.92
            },
            'simple_ambiguous': {
                'grammatical': 0.72,
                'ungrammatical': 0.68
            },
            'complex_non_ambiguous': {
                'grammatical': 0.87,
                'ungrammatical': 0.83
            },
            'complex_ambiguous': {
                'grammatical': 0.62,
                'ungrammatical': 0.58
            }
        };
        
        return priors[condition]?.[expected] || 0.75;
    }
    
    /**
     * Obtient la précision observée depuis les statistiques
     */
    getObservedAccuracy(stats, expected) {
        // Utiliser la précision globale de la condition
        // Les stats contiennent déjà la précision calculée pour cette condition
        return stats.accuracy || 0.75;
    }
    
    /**
     * Ajustement sigmoïde pour le niveau de compétence
     * Permet une transition douce entre les niveaux
     * Ajusté pour être plus réaliste pour les niveaux bas (A1, A2)
     */
    sigmoidAdjustment(skillLevel, baseAccuracy) {
        // Fonction sigmoïde centrée sur 0.60 (légèrement plus bas pour pénaliser les niveaux bas)
        const center = 0.60;
        const steepness = 12; // Plus raide pour une transition plus nette
        
        // Pour les niveaux très bas (A1, A2), utiliser une fonction différente
        if (skillLevel < 0.45) {
            // Ajustement plus conservateur pour A1/A2
            // Réduction plus importante de la précision
            const lowLevelPenalty = (0.45 - skillLevel) * 0.38; // Pénalité augmentée pour mieux correspondre aux données réelles
            return -lowLevelPenalty;
        }
        
        // Pour les niveaux moyens et élevés, utiliser la sigmoïde
        const sigmoid = 1 / (1 + Math.exp(-steepness * (skillLevel - center)));
        
        // Ajustement maximal de ±12% selon le niveau (réduit de 15%)
        const maxAdjustment = 0.12;
        const adjustment = (sigmoid - 0.5) * 2 * maxAdjustment;
        
        return adjustment;
    }
    
    /**
     * Calcule l'effet d'apprentissage basé sur les trials précédents
     */
    calculateLearningEffect(previousTrials, condition) {
        if (previousTrials.length === 0) return 0;
        
        // Filtrer les trials de la même condition
        const sameConditionTrials = previousTrials.filter(t => t.condition === condition);
        if (sameConditionTrials.length === 0) return 0;
        
        // Calculer la précision récente (derniers 5 trials de cette condition)
        const recentTrials = sameConditionTrials.slice(-5);
        const recentAccuracy = recentTrials.filter(t => t.correct).length / recentTrials.length;
        
        // Si la précision récente est meilleure, effet d'apprentissage positif
        const baseAccuracy = sameConditionTrials.filter(t => t.correct).length / sameConditionTrials.length;
        const learningGain = (recentAccuracy - baseAccuracy) * 0.1; // Facteur d'amortissement
        
        return learningGain;
    }
    
    /**
     * Génère une réponse avec validation de cohérence
     */
    generateResponse(accuracy, expected) {
        const random = Math.random();
        return random < accuracy ? expected : 
               (expected === 'grammatical' ? 'ungrammatical' : 'grammatical');
    }
    
    /**
     * Optimise le temps de réponse avec modèles avancés
     */
    optimizeResponseTime(condition, trialNumber, totalTrials, skillLevel, isCorrect, previousTrials) {
        // 1. Temps de base selon la condition
        let baseTime = this.getBaseResponseTime(condition);
        
        // 2. Si on a des données d'analyse, utiliser les distributions réelles
        if (this.analysisData && this.analysisData.conditionStats[condition]) {
            const stats = this.analysisData.conditionStats[condition];
            const realMean = stats.avgResponseTime || baseTime.mean;
            const realStdDev = stats.stdDevResponseTime || baseTime.stdDev;
            
            // Mélange pondéré : 80% données réelles, 20% prior
            baseTime = {
                mean: realMean * 0.8 + baseTime.mean * 0.2,
                stdDev: realStdDev * 0.8 + baseTime.stdDev * 0.2
            };
        }
        
        // 3. Effet d'apprentissage (courbe exponentielle décroissante)
        const learningCurve = this.calculateLearningCurve(trialNumber, totalTrials);
        
        // 4. Effet de compétence (les meilleurs sont plus rapides)
        const skillEffect = 1.0 - (skillLevel - 0.5) * 0.25;
        
        // 5. Effet d'hésitation sur les erreurs
        const hesitationEffect = isCorrect ? 1.0 : 1.18;
        
        // 6. Effet de fatigue (légère augmentation vers la fin)
        const fatigueEffect = 1.0 + (trialNumber / totalTrials) * 0.05;
        
        // 7. Effet de cohérence temporelle (corrélation avec les trials précédents)
        const consistencyEffect = this.calculateConsistencyEffect(previousTrials, condition);
        
        // Combiner tous les effets
        const adjustedMean = baseTime.mean * learningCurve * skillEffect * hesitationEffect * 
                                 fatigueEffect * consistencyEffect;
        
        // Générer avec distribution normale tronquée
        const responseTime = this.generateNormalTruncated(adjustedMean, baseTime.stdDev, 300, 8000);
        
        return Math.round(responseTime);
    }
    
    /**
     * Obtient le temps de réponse de base pour une condition
     */
    getBaseResponseTime(condition) {
        const baseTimes = {
            'simple_non_ambiguous': { mean: 1200, stdDev: 300 },
            'simple_ambiguous': { mean: 2200, stdDev: 500 },
            'complex_non_ambiguous': { mean: 1800, stdDev: 400 },
            'complex_ambiguous': { mean: 2800, stdDev: 600 }
        };
        return baseTimes[condition] || { mean: 2000, stdDev: 400 };
    }
    
    /**
     * Calcule la courbe d'apprentissage (exponentielle décroissante)
     */
    calculateLearningCurve(trialNumber, totalTrials) {
        // Courbe exponentielle : 1 - e^(-αt)
        // α ajusté pour avoir ~20% de réduction sur l'ensemble des trials
        const alpha = 0.003;
        const normalizedTrial = trialNumber / totalTrials;
        const learningReduction = 1 - Math.exp(-alpha * trialNumber);
        
        // Réduction maximale de 20%
        return 1.0 - learningReduction * 0.20;
    }
    
    /**
     * Calcule l'effet de cohérence temporelle
     * Les temps de réponse sont corrélés avec les trials précédents
     */
    calculateConsistencyEffect(previousTrials, condition) {
        if (previousTrials.length === 0) return 1.0;
        
        // Prendre les 3 derniers trials de la même condition
        const sameConditionTrials = previousTrials
            .filter(t => t.condition === condition)
            .slice(-3);
        
        if (sameConditionTrials.length === 0) return 1.0;
        
        // Calculer la moyenne des temps de réponse récents
        const avgRecentTime = sameConditionTrials.reduce((sum, t) => sum + (t.responseTime || 0), 0) / 
                             sameConditionTrials.length;
        
        // Ajuster légèrement vers cette moyenne (effet de cohérence)
        const baseTime = this.getBaseResponseTime(condition).mean;
        const ratio = avgRecentTime / baseTime;
        
        // Ajustement modéré (10% de l'écart)
        return 1.0 + (ratio - 1.0) * 0.1;
    }
    
    /**
     * Génère un nombre selon une distribution normale tronquée
     */
    generateNormalTruncated(mean, stdDev, min, max) {
        // Box-Muller transform
        let value;
        let attempts = 0;
        do {
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            value = mean + z * stdDev;
            attempts++;
        } while ((value < min || value > max) && attempts < 100);
        
        // Si on n'a pas réussi, utiliser une valeur dans la plage
        if (value < min || value > max) {
            value = Math.max(min, Math.min(max, mean));
        }
        
        return value;
    }
    
    /**
     * Valide la cohérence temporelle du temps de réponse
     */
    validateTemporalConsistency(responseTime, previousTrials, condition) {
        if (previousTrials.length === 0) return responseTime;
        
        // Vérifier que le temps n'est pas trop différent des trials précédents
        const sameConditionTrials = previousTrials
            .filter(t => t.condition === condition)
            .slice(-5);
        
        if (sameConditionTrials.length === 0) return responseTime;
        
        const avgPreviousTime = sameConditionTrials.reduce((sum, t) => sum + (t.responseTime || 0), 0) / 
                                sameConditionTrials.length;
        
        // Si l'écart est trop grand (> 3 écarts-types), ajuster
        const stdDev = this.getBaseResponseTime(condition).stdDev;
        const maxDeviation = 3 * stdDev;
        
        if (Math.abs(responseTime - avgPreviousTime) > maxDeviation) {
            // Ajuster vers la moyenne précédente avec un facteur d'amortissement
            return Math.round(avgPreviousTime * 0.7 + responseTime * 0.3);
        }
        
        return responseTime;
    }
    
    /**
     * Calcule le niveau de confiance dans les prédictions
     */
    calculateConfidence(condition, skillLevel) {
        let confidence = 0.5; // Confiance de base
        
        // Augmenter la confiance si on a des données d'analyse
        if (this.analysisData && this.analysisData.conditionStats[condition]) {
            const stats = this.analysisData.conditionStats[condition];
            const sampleSize = stats.total;
            // Plus l'échantillon est grand, plus on est confiant
            confidence += Math.min(0.4, sampleSize / 50);
        }
        
        // Ajuster selon le niveau de compétence (plus prévisible pour les extrêmes)
        if (skillLevel < 0.4 || skillLevel > 0.9) {
            confidence += 0.1;
        }
        
        return Math.min(1.0, confidence);
    }
    
    /**
     * Ajuste une distribution aux données observées
     */
    fitDistribution(stats) {
        return {
            mean: stats.avgResponseTime || 2000,
            stdDev: stats.stdDevResponseTime || 400,
            min: stats.minResponseTime || 300,
            max: stats.maxResponseTime || 8000
        };
    }
    
    /**
     * Construit un modèle de précision pour une condition
     */
    buildAccuracyModel(stats) {
        return {
            baseAccuracy: stats.accuracy || 0.75,
            sampleSize: stats.total || 0,
            confidence: Math.min(1.0, (stats.total || 0) / 30)
        };
    }
    
    /**
     * Extrait les patterns d'erreurs
     */
    extractErrorPatterns(stats) {
        return stats.errorPatterns || {
            errorRate: 0.25,
            commonErrors: []
        };
    }
    
    /**
     * Valide la cohérence globale des données générées - Version améliorée
     */
    validateGeneratedData(generatedTrials) {
        const issues = [];
        const warnings = [];
        const stats = {};
        
        if (!generatedTrials || generatedTrials.length === 0) {
            return {
                isValid: false,
                issues: ['Aucune donnée à valider'],
                warnings: [],
                stats: {}
            };
        }
        
        // ===== VALIDATION 1: Cohérence des temps de réponse =====
        const responseTimes = generatedTrials.map(t => t.responseTime || 0).filter(rt => rt > 0);
        if (responseTimes.length > 0) {
            const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            const stdDev = Math.sqrt(
                responseTimes.reduce((sum, rt) => sum + Math.pow(rt - avgTime, 2), 0) / responseTimes.length
            );
            
            stats.avgResponseTime = avgTime;
            stats.stdDevResponseTime = stdDev;
            stats.minResponseTime = Math.min(...responseTimes);
            stats.maxResponseTime = Math.max(...responseTimes);
            
            // Vérifier les valeurs aberrantes (outliers)
            const outliers = [];
            responseTimes.forEach((rt, index) => {
                const zScore = Math.abs((rt - avgTime) / stdDev);
                if (zScore > 3) {
                    outliers.push({ trial: index + 1, time: rt, zScore: zScore.toFixed(2) });
                }
            });
            
            if (outliers.length > 0) {
                if (outliers.length > generatedTrials.length * 0.05) { // Plus de 5% d'outliers
                    issues.push(`${outliers.length} temps de réponse aberrants détectés (> 3σ)`);
                } else {
                    warnings.push(`${outliers.length} temps de réponse légèrement aberrants détectés`);
                }
            }
            
            // Vérifier la plage raisonnable
            if (avgTime < 500 || avgTime > 5000) {
                warnings.push(`Temps de réponse moyen inhabituel: ${Math.round(avgTime)}ms`);
            }
        }
        
        // ===== VALIDATION 2: Précision globale =====
        const correctTrials = generatedTrials.filter(t => t.correct);
        const accuracy = correctTrials.length / generatedTrials.length;
        stats.accuracy = accuracy;
        stats.correctCount = correctTrials.length;
        stats.totalCount = generatedTrials.length;
        
        if (accuracy < 0.45) {
            issues.push(`Précision globale trop faible: ${(accuracy * 100).toFixed(1)}% (minimum attendu: 45%)`);
        } else if (accuracy > 0.98) {
            issues.push(`Précision globale suspecte (trop élevée): ${(accuracy * 100).toFixed(1)}% (maximum réaliste: 98%)`);
        } else if (accuracy < 0.50) {
            warnings.push(`Précision globale faible: ${(accuracy * 100).toFixed(1)}%`);
        }
        
        // ===== VALIDATION 3: Distribution des conditions =====
        const conditionCounts = {};
        const conditionAccuracies = {};
        generatedTrials.forEach(t => {
            const cond = t.condition;
            conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
            if (!conditionAccuracies[cond]) {
                conditionAccuracies[cond] = { correct: 0, total: 0 };
            }
            conditionAccuracies[cond].total++;
            if (t.correct) conditionAccuracies[cond].correct++;
        });
        
        stats.conditionCounts = conditionCounts;
        stats.conditionAccuracies = {};
        Object.keys(conditionAccuracies).forEach(cond => {
            stats.conditionAccuracies[cond] = conditionAccuracies[cond].correct / conditionAccuracies[cond].total;
        });
        
        const expectedPerCondition = generatedTrials.length / Object.keys(conditionCounts).length;
        Object.entries(conditionCounts).forEach(([cond, count]) => {
            const deviation = Math.abs(count - expectedPerCondition) / expectedPerCondition;
            // Seuils ajustés : être plus tolérant si on a peu de trials par condition
            const thresholdCritical = expectedPerCondition < 10 ? 0.5 : 0.4; // Plus tolérant si < 10 trials attendus
            const thresholdWarning = expectedPerCondition < 10 ? 0.35 : 0.25;
            
            if (deviation > thresholdCritical) {
                issues.push(`Distribution très déséquilibrée pour "${cond}": ${count} trials (attendu: ~${Math.round(expectedPerCondition)})`);
            } else if (deviation > thresholdWarning) {
                warnings.push(`Distribution légèrement déséquilibrée pour "${cond}": ${count} trials`);
            }
        });
        
        // ===== VALIDATION 4: Cohérence par condition =====
        if (this.analysisData && this.analysisData.conditionStats) {
            Object.keys(conditionCounts).forEach(condition => {
                const generatedAccuracy = stats.conditionAccuracies[condition];
                const realStats = this.analysisData.conditionStats[condition];
                
                if (realStats && realStats.total >= 10) {
                    const realAccuracy = realStats.accuracy;
                    const deviation = Math.abs(generatedAccuracy - realAccuracy);
                    
                    // Si l'écart est trop grand par rapport aux données réelles
                    if (deviation > 0.20) {
                        issues.push(`Précision pour "${condition}" très différente des données réelles: ${(generatedAccuracy * 100).toFixed(1)}% vs ${(realAccuracy * 100).toFixed(1)}%`);
                    } else if (deviation > 0.15) {
                        warnings.push(`Précision pour "${condition}" différente des données réelles: ${(generatedAccuracy * 100).toFixed(1)}% vs ${(realAccuracy * 100).toFixed(1)}%`);
                    }
                    
                    // Vérifier les temps de réponse par condition
                    const conditionTrials = generatedTrials.filter(t => t.condition === condition);
                    const conditionTimes = conditionTrials.map(t => t.responseTime || 0).filter(rt => rt > 0);
                    if (conditionTimes.length > 0) {
                        const avgConditionTime = conditionTimes.reduce((a, b) => a + b, 0) / conditionTimes.length;
                        const realAvgTime = realStats.avgResponseTime;
                        
                        if (realAvgTime > 0) {
                            const timeDeviation = Math.abs(avgConditionTime - realAvgTime) / realAvgTime;
                            if (timeDeviation > 0.30) {
                                warnings.push(`Temps moyen pour "${condition}" très différent: ${Math.round(avgConditionTime)}ms vs ${Math.round(realAvgTime)}ms`);
                            }
                        }
                    }
                }
            });
        }
        
        // ===== VALIDATION 5: Patterns d'erreurs =====
        const errorTrials = generatedTrials.filter(t => !t.correct);
        const errorRate = errorTrials.length / generatedTrials.length;
        
        // Vérifier que les erreurs ne sont pas toutes concentrées
        const errorsByCondition = {};
        errorTrials.forEach(t => {
            errorsByCondition[t.condition] = (errorsByCondition[t.condition] || 0) + 1;
        });
        
        // Vérifier la distribution des erreurs
        const maxErrorCondition = Object.entries(errorsByCondition)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (maxErrorCondition) {
            const [condition, errorCount] = maxErrorCondition;
            const conditionTotal = conditionCounts[condition] || 1;
            const errorProportion = errorCount / conditionTotal;
            
            // Si plus de 80% des erreurs viennent d'une seule condition, c'est suspect
            if (errorCount / errorTrials.length > 0.8 && errorTrials.length > 5) {
                warnings.push(`Erreurs très concentrées sur "${condition}" (${errorCount}/${errorTrials.length} erreurs)`);
            }
        }
        
        // ===== VALIDATION 6: Cohérence temporelle =====
        const temporalIssues = this.validateTemporalPatterns(generatedTrials);
        issues.push(...temporalIssues.critical);
        warnings.push(...temporalIssues.warnings);
        
        // ===== VALIDATION 7: Distribution grammatical vs ungrammatical =====
        const grammaticalTrials = generatedTrials.filter(t => t.expected === 'grammatical');
        const ungrammaticalTrials = generatedTrials.filter(t => t.expected === 'ungrammatical');
        const grammaticalRatio = grammaticalTrials.length / generatedTrials.length;
        
        stats.grammaticalRatio = grammaticalRatio;
        
        // Devrait être proche de 50/50
        if (grammaticalRatio < 0.35 || grammaticalRatio > 0.65) {
            warnings.push(`Distribution grammatical/ungrammatical déséquilibrée: ${(grammaticalRatio * 100).toFixed(1)}% grammatical`);
        }
        
        // ===== VALIDATION 8: Séquence des trials =====
        const sequenceIssues = this.validateTrialSequence(generatedTrials);
        warnings.push(...sequenceIssues);
        
        // ===== RÉSUMÉ =====
        const isValid = issues.length === 0;
        const score = this.calculateValidationScore(issues, warnings, stats);
        
        return {
            isValid: isValid,
            issues: issues,
            warnings: warnings,
            stats: stats,
            score: score,
            summary: this.generateValidationSummary(issues, warnings, stats)
        };
    }
    
    /**
     * Valide les patterns temporels
     */
    validateTemporalPatterns(trials) {
        const critical = [];
        const warnings = [];
        
        if (trials.length < 2) return { critical, warnings };
        
        // Vérifier que les timestamps sont dans l'ordre
        for (let i = 1; i < trials.length; i++) {
            const prevTime = new Date(trials[i - 1].timestamp).getTime();
            const currTime = new Date(trials[i].timestamp).getTime();
            
            if (currTime < prevTime) {
                critical.push(`Trial ${i + 1}: timestamp antérieur au trial précédent`);
            }
            
            // Vérifier les intervalles entre trials
            const interval = currTime - prevTime;
            if (interval < 1000) {
                warnings.push(`Trial ${i + 1}: intervalle très court (${Math.round(interval)}ms)`);
            } else if (interval > 30000) {
                warnings.push(`Trial ${i + 1}: intervalle très long (${Math.round(interval / 1000)}s)`);
            }
        }
        
        return { critical, warnings };
    }
    
    /**
     * Valide la séquence des trials
     */
    validateTrialSequence(trials) {
        const warnings = [];
        
        // Vérifier que les numéros de trial sont séquentiels
        for (let i = 0; i < trials.length; i++) {
            if (trials[i].trial !== i + 1) {
                warnings.push(`Trial ${i + 1}: numéro de trial incorrect (${trials[i].trial})`);
            }
        }
        
        // Vérifier les patterns d'erreurs consécutives
        let consecutiveErrors = 0;
        let maxConsecutiveErrors = 0;
        
        trials.forEach(t => {
            if (!t.correct) {
                consecutiveErrors++;
                maxConsecutiveErrors = Math.max(maxConsecutiveErrors, consecutiveErrors);
            } else {
                consecutiveErrors = 0;
            }
        });
        
        if (maxConsecutiveErrors > 8) {
            warnings.push(`${maxConsecutiveErrors} erreurs consécutives détectées (peut être normal mais vérifier)`);
        }
        
        return warnings;
    }
    
    /**
     * Calcule un score de validation (0-100)
     */
    calculateValidationScore(issues, warnings, stats) {
        let score = 100;
        
        // Pénalités pour les issues critiques
        score -= issues.length * 15;
        
        // Pénalités pour les warnings
        score -= warnings.length * 5;
        
        // Bonus pour la cohérence avec les données réelles
        if (this.analysisData && stats.conditionAccuracies) {
            let consistencyBonus = 0;
            let consistencyCount = 0;
            
            Object.keys(stats.conditionAccuracies).forEach(condition => {
                const realStats = this.analysisData.conditionStats[condition];
                if (realStats && realStats.total >= 10) {
                    const deviation = Math.abs(stats.conditionAccuracies[condition] - realStats.accuracy);
                    if (deviation < 0.10) {
                        consistencyBonus += 5;
                    }
                    consistencyCount++;
                }
            });
            
            if (consistencyCount > 0) {
                score += consistencyBonus / consistencyCount;
            }
        }
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    /**
     * Génère un résumé textuel de la validation
     */
    generateValidationSummary(issues, warnings, stats) {
        const parts = [];
        
        if (issues.length === 0 && warnings.length === 0) {
            parts.push("✅ Toutes les validations sont passées avec succès");
        } else {
            if (issues.length > 0) {
                parts.push(`❌ ${issues.length} problème(s) critique(s) détecté(s)`);
            }
            if (warnings.length > 0) {
                parts.push(`⚠️ ${warnings.length} avertissement(s)`);
            }
        }
        
        if (stats.accuracy !== undefined) {
            parts.push(`Précision: ${(stats.accuracy * 100).toFixed(1)}%`);
        }
        
        if (stats.avgResponseTime !== undefined) {
            parts.push(`Temps moyen: ${Math.round(stats.avgResponseTime)}ms`);
        }
        
        return parts.join(' • ');
    }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizationEngine;
}

