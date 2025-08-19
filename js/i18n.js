// Système de traduction internationalisation
class I18n {
    constructor() {
        console.log('I18n constructor called');
        this.currentLanguage = this.detectLanguage();
        this.translations = {};
        this.loaded = false;
        this.init();
    }

    // Détecte la langue du navigateur
    detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        // Supporte français et portugais
        if (langCode === 'pt' || langCode === 'pt-br') {
            return 'pt';
        } else if (langCode === 'fr') {
            return 'fr';
        }
        
        // Par défaut français
        return 'fr';
    }

    // Initialise le système
    async init() {
        console.log('I18n init called');
        try {
            await this.loadTranslations(this.currentLanguage);
            this.setupLanguageSwitcher();
            this.translatePage();
            console.log('I18n init completed successfully');
        } catch (error) {
            console.error('Error in I18n init:', error);
        }
    }

    // Charge les traductions depuis les fichiers JSON
    async loadTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
            this.currentLanguage = lang;
            this.loaded = true;
            
            // Sauvegarde la langue dans localStorage
            localStorage.setItem('preferredLanguage', lang);
            
            console.log(`Traductions chargées pour: ${lang}`);
        } catch (error) {
            console.error('Erreur lors du chargement des traductions:', error);
            // Fallback vers français
            if (lang !== 'fr') {
                await this.loadTranslations('fr');
            }
        }
    }

    // Change la langue
    async changeLanguage(lang) {
        if (lang === this.currentLanguage) return;
        
        await this.loadTranslations(lang);
        this.translatePage();
        this.updateLanguageSwitcher();
        
        // Mettre à jour les graphiques si on est sur la page analytics
        if (window.analyticsPage && typeof window.analyticsPage.displayCharts === 'function') {
            window.analyticsPage.displayCharts();
        }
    }

    // Traduit une clé
    t(key, params = {}) {
        if (!this.loaded) {
            return key; // Retourne la clé si les traductions ne sont pas chargées
        }

        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Clé de traduction manquante: ${key}`);
                return key;
            }
        }

        // Remplace les paramètres si fournis
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            for (const [param, replacement] of Object.entries(params)) {
                value = value.replace(new RegExp(`{${param}}`, 'g'), replacement);
            }
        }

        return value;
    }

    // Traduit toute la page
    translatePage() {
        if (!this.loaded) return;

        // Traduit les éléments avec data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' && element.hasAttribute('data-i18n-placeholder')) {
                    element.placeholder = translation;
                } else if (element.tagName === 'OPTION') {
                    element.textContent = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Traduit les éléments avec data-i18n-html
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.t(key);
            
            if (translation) {
                element.innerHTML = translation;
            }
        });

        // Traduit les titres de page
        const pageTitle = document.querySelector('title');
        if (pageTitle && pageTitle.getAttribute('data-i18n')) {
            const key = pageTitle.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) {
                pageTitle.textContent = translation;
            }
        }
    }

    // Configure le sélecteur de langue
    setupLanguageSwitcher() {
        // Crée le sélecteur de langue s'il n'existe pas
        let languageSwitcher = document.getElementById('language-switcher');
        
        if (!languageSwitcher) {
            languageSwitcher = document.createElement('div');
            languageSwitcher.id = 'language-switcher';
            languageSwitcher.className = 'language-switcher';
            
            // Ajoute le sélecteur en haut à droite
            const header = document.querySelector('body');
            if (header) {
                header.insertBefore(languageSwitcher, header.firstChild);
            }
        }

        this.updateLanguageSwitcher();
    }

    // Met à jour le sélecteur de langue
    updateLanguageSwitcher() {
        const languageSwitcher = document.getElementById('language-switcher');
        if (!languageSwitcher) return;

        languageSwitcher.innerHTML = `
            <div class="language-selector">
                <button class="language-btn ${this.currentLanguage === 'fr' ? 'active' : ''}" 
                        onclick="i18n.changeLanguage('fr')">
                    🇫🇷 ${this.t('language.fr')}
                </button>
                <button class="language-btn ${this.currentLanguage === 'pt' ? 'active' : ''}" 
                        onclick="i18n.changeLanguage('pt')">
                    🇧🇷 ${this.t('language.pt')}
                </button>
            </div>
        `;
    }

    // Traduit une liste d'éléments
    translateList(container, items, template) {
        if (!this.loaded || !container) return;

        container.innerHTML = '';
        
        items.forEach(item => {
            const element = document.createElement('div');
            element.innerHTML = template(item);
            container.appendChild(element.firstElementChild);
        });
    }
}

// Instance globale
let i18n;

// Initialise le système quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing i18n system...');
    try {
        i18n = new I18n();
        window.i18n = i18n; // Attache à window pour l'accessibilité globale
        console.log('i18n system initialized successfully');
    } catch (error) {
        console.error('Error initializing i18n:', error);
    }
});

// Fonction utilitaire pour traduire
function t(key, params = {}) {
    return i18n ? i18n.t(key, params) : key;
}
