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