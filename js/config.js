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
    // En production sur Vercel, utilisez le proxy relatif pour éviter Mixed Content
    // baseUrl sera déterminé dynamiquement via getApiBaseUrl()
    endpoint: '/api/results', // Endpoint pour l'envoi des résultats (proxifié par Vercel)
    enabled: true, // Mettez à true pour activer l'envoi automatique
    timeout: 5000 // Timeout en millisecondes (5 secondes par défaut)
};

// Fonction pour obtenir l'URL de base de l'API
// En production (HTTPS), utilise l'origine actuelle (proxy Vercel)
// En développement (HTTP local), utilise l'URL directe du backend
function getApiBaseUrl() {
    if (!API_CONFIG.enabled) {
        return null;
    }
    
    // Si on est en HTTPS (production Vercel), utilise le proxy relatif
    if (window.location.protocol === 'https:') {
        return window.location.origin;
    }
    
    // Sinon, utilise l'URL directe du backend (développement local)
    return 'http://mkso4wgkkcswgskokcw8gs8s.91.98.29.236.sslip.io';
}

// Fonction pour obtenir l'URL complète de l'endpoint
function getApiEndpoint() {
    if (!API_CONFIG.enabled || !API_CONFIG.endpoint) {
        return null;
    }
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
        return null;
    }
    return `${baseUrl}${API_CONFIG.endpoint}`;
} 