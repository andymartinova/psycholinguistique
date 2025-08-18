// Fonction pour formater les temps de réponse
/**
 * Formate un temps de réponse en millisecondes avec conversion en secondes
 * @param {number} ms - Temps en millisecondes
 * @returns {string} - Format: "10387ms (10.4s)"
 */
function formatResponseTime(ms) {
    if (ms === null || ms === undefined || isNaN(ms)) {
        return '0ms (0.0s)';
    }
    
    const seconds = ms / 1000;
    return `${Math.round(ms)}ms (${seconds.toFixed(1)}s)`;
}

// Fonction pour générer un résumé des données d'expérience
function generateSummary(data) {
    if (!data || data.length === 0) {
        return {
            totalTrials: 0,
            correctResponses: 0,
            accuracy: '0%',
            avgResponseTime: '0ms (0.0s)',
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