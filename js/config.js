// Configuration de l'expérience
const EXPERIMENT_CONFIG = {
    practiceTrials: 4,
    totalTrials: 42, // Mis à jour pour correspondre au nouveau nombre de phrases
    pauseAfterTrials: 0,
    sentenceDisplayTime: 2000, // 2 secondes avant affichage des boutons
    feedbackTime: 1500 // 1.5 secondes pour le feedback
};

// Configuration de l'API pour l'envoi des résultats
const API_CONFIG = {
    // URL de votre endpoint API (à modifier selon votre backend)
    // Exemple: 'http://localhost:3000/api/results'
    // Ou pour un déploiement: 'https://votre-domaine.com/api/results'
    baseUrl: 'http://mkso4wgkkcswgskokcw8gs8s.91.98.29.236.sslip.io', // Base URL de l'API
    endpoint: '/api/results', // Endpoint pour l'envoi des résultats
    enabled: true, // Mettez à true pour activer l'envoi automatique
    timeout: 5000 // Timeout en millisecondes (5 secondes par défaut)
};

// Fonction pour obtenir l'URL complète de l'endpoint
function getApiEndpoint() {
    if (!API_CONFIG.enabled || !API_CONFIG.baseUrl || !API_CONFIG.endpoint) {
        return null;
    }
    return `${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`;
}

// Fonction pour obtenir l'URL de base de l'API
function getApiBaseUrl() {
    if (!API_CONFIG.enabled || !API_CONFIG.baseUrl) {
        return null;
    }
    return API_CONFIG.baseUrl;
} 