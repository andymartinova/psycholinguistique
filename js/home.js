// Gestion de la page d'accueil
class HomePage {
    constructor() {
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Les boutons sont maintenant des liens directs, pas besoin d'event handlers
        console.log('Page d\'accueil chargée');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
}); 