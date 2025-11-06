// Fonction pour formater les temps de réponse
function formatResponseTime(ms) {
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

// Fonction pour générer un résumé des données d'expérience
function generateSummary(data) {
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
    const avgResponseTime = formatResponseTime(Math.round(totalTime / totalTrials));

    // Statistiques par condition
    const conditionStats = {};
    const conditions = [...new Set(data.map(d => d.condition))];
    
    conditions.forEach(condition => {
        const conditionData = data.filter(d => d.condition === condition);
        const conditionCorrect = conditionData.filter(d => d.correct).length;
        const conditionAccuracy = ((conditionCorrect / conditionData.length) * 100).toFixed(1) + '%';
        const conditionAvgTime = formatResponseTime(Math.round(
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

// Fonction pour télécharger les données
function downloadData(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Fonction pour formater les données selon le format API
function formatDataForAPI(localStorageData) {
    const participantData = localStorageData.participant || {};
    const experimentData = localStorageData.experiment || {};
    
    // Mapper languageGroup vers nativeLanguage selon l'API
    let nativeLanguage = null;
    if (participantData.languageGroup === 'fr') {
        nativeLanguage = 'french';
    } else if (participantData.languageGroup === 'pt') {
        nativeLanguage = 'portuguese';
    }
    
    // Nettoyer germanLevel : convertir chaîne vide en null
    let germanLevel = participantData.germanLevel;
    if (!germanLevel || germanLevel === '' || germanLevel === '—') {
        germanLevel = null;
    }
    
    // Validation : l'ID du participant est requis
    if (!participantData.id || participantData.id.trim() === '') {
        throw new Error('ID du participant requis pour créer le participant');
    }
    
    // Formater les données selon le format attendu par l'API
    const formattedData = {
        participant: {
            id: participantData.id.trim(),
            germanLevel: germanLevel,
            nativeLanguage: nativeLanguage,
            startTime: participantData.startTime || new Date().toISOString()
        },
        experiment: {
            config: experimentData.config || {},
            endTime: experimentData.endTime || new Date().toISOString(),
            data: experimentData.data || []
        }
    };
    
    return formattedData;
}

// Fonction pour envoyer les résultats à l'API
async function sendResultsToAPI(localStorageData) {
    // Vérifier si l'API est configurée et activée
    if (typeof getApiEndpoint !== 'function') {
        return { success: false, message: 'getApiEndpoint non définie' };
    }
    
    if (typeof API_CONFIG === 'undefined') {
        return { success: false, message: 'API_CONFIG non défini' };
    }
    
    const endpoint = getApiEndpoint();
    
    if (!endpoint) {
        return { success: false, message: 'API non configurée' };
    }

    try {
        // Formater les données selon le format API
        const formattedData = formatDataForAPI(localStorageData);
        
        // Validation basique
        if (!formattedData.participant.id) {
            throw new Error('ID du participant manquant');
        }
        
        if (!formattedData.experiment.data || formattedData.experiment.data.length === 0) {
            throw new Error('Aucune donnée d\'expérience à envoyer');
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout || 10000);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedData),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorData;
            let errorText = '';
            try {
                errorText = await response.text();
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { error: `Erreur HTTP ${response.status}`, message: response.statusText };
            }
            
            // Messages d'erreur plus explicites selon le code de statut
            let errorMessage = errorData.error || `Erreur HTTP: ${response.status}`;
            if (errorData.message) {
                errorMessage += ` - ${errorData.message}`;
            }
            
            if (response.status === 500) {
                if (errorData.message && errorData.message.includes('DATABASE_URL')) {
                    errorMessage = 'Erreur serveur - DATABASE_URL non configurée. Vérifiez le fichier .env du backend et redémarrez le serveur.';
                } else if (errorData.message && errorData.message.includes('Prisma')) {
                    errorMessage = 'Erreur serveur - Problème avec Prisma. Vérifiez la configuration de la base de données et exécutez: npm run prisma:generate && npm run prisma:migrate';
                } else {
                    errorMessage = 'Erreur serveur - Le backend a rencontré un problème. Vérifiez les logs du serveur.';
                }
            } else if (response.status === 400) {
                errorMessage = 'Données invalides - ' + (errorData.error || errorData.message || 'Vérifiez le format des données envoyées.');
            } else if (response.status === 404) {
                errorMessage = 'Endpoint non trouvé - Vérifiez l\'URL de l\'API.';
            }
            
            throw new Error(errorMessage);
        }

        const result = await response.json();
        return { success: true, data: result };

    } catch (error) {
        if (error.name === 'AbortError') {
            return { success: false, message: 'Timeout - l\'envoi a pris trop de temps' };
        }
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { success: false, message: 'Erreur réseau - vérifiez que le serveur est accessible et CORS est configuré' };
        }
        return { success: false, message: error.message };
    }
}

// Fonction pour configurer la sécurité de l'expérience
function setupSecurity() {
    // Empêcher la navigation avec les touches du clavier
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault(); // Empêcher Ctrl+R (recharger)
            }
            if (e.key === 'w' || e.key === 'W') {
                e.preventDefault(); // Empêcher Ctrl+W (fermer)
            }
        }
        if (e.key === 'F5' || e.key === 'F11') {
            e.preventDefault(); // Empêcher F5 et F11
        }
    });

    // Empêcher le clic droit
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Avertir avant de quitter la page
    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        e.returnValue = '';
    });
} 