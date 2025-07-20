// Système de traduction internationalisation
class I18n {
    constructor() {
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
        await this.loadTranslations(this.currentLanguage);
        this.setupLanguageSwitcher();
        this.translatePage();
    }

    // Charge les traductions (intégrées directement)
    async loadTranslations(lang) {
        try {
            // Traductions intégrées directement dans le code
            const translations = this.getEmbeddedTranslations(lang);
            this.translations = translations;
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

    // Traductions intégrées directement
    getEmbeddedTranslations(lang) {
        const translations = {
            fr: {
                "nav": {
                    "home": "🏠 Accueil",
                    "instructions": "📋 Instructions",
                    "training": "🎓 Entraînement",
                    "experiment": "🧪 Expérience",
                    "results": "📊 Résultats",
                    "analytics": "📈 Analyses"
                },
                "home": {
                    "title": "Expérience Psycholinguistique",
                    "subtitle": "Étude sur la compréhension des phrases en allemand",
                    "welcome": "Bienvenue dans cette expérience de recherche !",
                    "description": "Cette expérience vise à étudier la compréhension des phrases en allemand. Votre participation nous aidera à mieux comprendre les processus cognitifs impliqués dans la compréhension linguistique.",
                    "start_button": "Commencer l'expérience",
                    "instructions_button": "Voir les instructions",
                    "analytics_button": "Analyses avancées"
                },
                "instructions": {
                    "title": "📋 Instructions",
                    "objective_title": "🎯 Objectif de l'expérience",
                    "objective_text": "Vous allez participer à une expérience sur la compréhension des phrases en allemand. Votre tâche est de juger si chaque phrase vous semble grammaticalement correcte ou incorrecte.",
                    "procedure_title": "📝 Procédure",
                    "procedure_steps": [
                        "Entraînement : Vous commencerez par 3 phrases d'entraînement avec feedback",
                        "Expérience : Vous verrez 24 phrases et devrez juger leur grammaticalité",
                        "Réponse : Cliquez sur \"Grammaticale\" ou \"Non grammaticale\"",
                        "Vitesse : Répondez le plus rapidement et précisément possible"
                    ],
                    "controls_title": "⌨️ Contrôles",
                    "controls_items": [
                        "Souris : Cliquez sur les boutons",
                        "Clavier : Utilisez Y (ou O) pour \"Grammaticale\" et N pour \"Non grammaticale\""
                    ],
                    "important_title": "⚠️ Important",
                    "important_items": [
                        "Ne revenez pas en arrière pendant l'expérience",
                        "Ne fermez pas le navigateur",
                        "Concentrez-vous sur la tâche",
                        "L'expérience dure environ 10-15 minutes"
                    ],
                    "examples_title": "🔍 Exemples de phrases",
                    "grammatical_example": "Grammaticale : \"Der Hund schläft im Garten.\" (Le chien dort dans le jardin.)",
                    "ungrammatical_example": "Non grammaticale : \"Der Hund schlafen im Garten.\" (Le chien dormir dans le jardin.)",
                    "training_title": "🎓 Entraînement",
                    "training_text": "Vous allez d'abord faire 3 essais d'entraînement avec feedback pour vous familiariser avec la tâche.",
                    "back_button": "← Retour à l'accueil",
                    "start_training_button": "Commencer l'entraînement"
                },
                "training": {
                    "title": "🎓 Entraînement",
                    "counter": "Essai d'entraînement",
                    "question": "Cette phrase vous semble-t-elle grammaticale ?",
                    "grammatical_button": "✅ Grammaticale",
                    "ungrammatical_button": "❌ Non grammaticale",
                    "key_hint_y": "(Y)",
                    "key_hint_n": "(N)",
                    "feedback_correct": "Correct ! Cette phrase est grammaticale.",
                    "feedback_incorrect": "Incorrect. Cette phrase n'est pas grammaticale.",
                    "next_button": "Suivant",
                    "progress": "Progression de l'entraînement"
                },
                "experiment": {
                    "title": "🧪 Expérience",
                    "counter": "Question",
                    "question": "Cette phrase vous semble-t-elle grammaticale ?",
                    "grammatical_button": "✅ Grammaticale",
                    "ungrammatical_button": "❌ Non grammaticale",
                    "key_hint_y": "(Y)",
                    "key_hint_n": "(N)",
                    "progress": "Progression de l'expérience",
                    "pause_title": "⏸️ Pause",
                    "pause_text": "Prenez une courte pause. Vous pouvez continuer quand vous êtes prêt.",
                    "continue_button": "Continuer"
                },
                "results": {
                    "title": "📊 Résultats",
                    "completion_title": "Expérience terminée !",
                    "completion_text": "Merci pour votre participation ! Voici un résumé de vos résultats :",
                    "summary_title": "Résumé des résultats",
                    "total_trials": "Nombre total d'essais",
                    "correct_answers": "Réponses correctes",
                    "accuracy": "Précision",
                    "average_time": "Temps de réponse moyen",
                    "conditions": {
                        "simple_ambiguous": "Simple, ambiguë",
                        "simple_unambiguous": "Simple, non ambiguë",
                        "complex_ambiguous": "Complexe, ambiguë",
                        "complex_unambiguous": "Complexe, non ambiguë"
                    },
                    "download_button": "📥 Télécharger les données",
                    "new_experiment_button": "🔄 Nouvelle expérience",
                    "analytics_button": "📈 Voir les analyses"
                },
                "analytics": {
                    "title": "📈 Analyses",
                    "import_title": "📁 Import de données",
                    "import_text": "Vous pouvez importer des fichiers JSON exportés depuis l'expérience pour analyser plusieurs participants.",
                    "import_button": "Choisir des fichiers",
                    "import_placeholder": "Aucun fichier sélectionné",
                    "no_files": "Aucun fichier importé",
                    "remove_file": "Supprimer",
                    "export_button": "📥 Exporter les analyses",
                    "clear_data_button": "🗑️ Effacer toutes les données",
                    "clear_confirm": "Êtes-vous sûr de vouloir effacer toutes les données importées ?",
                    "no_data": "Aucune donnée d'expérience trouvée. Importez des fichiers JSON ou complétez une expérience.",
                    "charts": {
                        "accuracy": "Précision par condition",
                        "response_time": "Temps de réponse par condition",
                        "participant_comparison": "Comparaison des participants",
                        "learning_curve": "Courbe d'apprentissage"
                    },
                    "stats": {
                        "total_participants": "Total participants",
                        "average_accuracy": "Précision moyenne",
                        "average_response_time": "Temps de réponse moyen"
                    }
                },
                "common": {
                    "loading": "Chargement...",
                    "error": "Erreur",
                    "success": "Succès",
                    "cancel": "Annuler",
                    "confirm": "Confirmer",
                    "close": "Fermer"
                },
                "language": {
                    "fr": "Français",
                    "pt": "Português"
                }
            },
            pt: {
                "nav": {
                    "home": "🏠 Início",
                    "instructions": "📋 Instruções",
                    "training": "🎓 Treinamento",
                    "experiment": "🧪 Experimento",
                    "results": "📊 Resultados",
                    "analytics": "📈 Análises"
                },
                "home": {
                    "title": "Experimento Psicolinguístico",
                    "subtitle": "Estudo sobre a compreensão de frases em alemão",
                    "welcome": "Bem-vindo a este experimento de pesquisa!",
                    "description": "Este experimento visa estudar a compreensão de frases em alemão. Sua participação nos ajudará a entender melhor os processos cognitivos envolvidos na compreensão linguística.",
                    "start_button": "Iniciar experimento",
                    "instructions_button": "Ver instruções",
                    "analytics_button": "Análises avançadas"
                },
                "instructions": {
                    "title": "📋 Instruções",
                    "objective_title": "🎯 Objetivo do experimento",
                    "objective_text": "Você participará de um experimento sobre a compreensão de frases em alemão. Sua tarefa é julgar se cada frase parece gramaticalmente correta ou incorreta.",
                    "procedure_title": "📝 Procedimento",
                    "procedure_steps": [
                        "Treinamento: Você começará com 3 frases de treinamento com feedback",
                        "Experimento: Você verá 24 frases e deverá julgar sua gramaticalidade",
                        "Resposta: Clique em \"Gramatical\" ou \"Não gramatical\"",
                        "Velocidade: Responda o mais rápido e preciso possível"
                    ],
                    "controls_title": "⌨️ Controles",
                    "controls_items": [
                        "Mouse: Clique nos botões",
                        "Teclado: Use Y (ou O) para \"Gramatical\" e N para \"Não gramatical\""
                    ],
                    "important_title": "⚠️ Importante",
                    "important_items": [
                        "Não volte atrás durante o experimento",
                        "Não feche o navegador",
                        "Concentre-se na tarefa",
                        "O experimento dura aproximadamente 10-15 minutos"
                    ],
                    "examples_title": "🔍 Exemplos de frases",
                    "grammatical_example": "Gramatical: \"Der Hund schläft im Garten.\" (O cachorro dorme no jardim.)",
                    "ungrammatical_example": "Não gramatical: \"Der Hund schlafen im Garten.\" (O cachorro dormir no jardim.)",
                    "training_title": "🎓 Treinamento",
                    "training_text": "Você fará primeiro 3 tentativas de treinamento com feedback para se familiarizar com a tarefa.",
                    "back_button": "← Voltar ao início",
                    "start_training_button": "Iniciar treinamento"
                },
                "training": {
                    "title": "🎓 Treinamento",
                    "counter": "Tentativa de treinamento",
                    "question": "Esta frase parece gramatical para você?",
                    "grammatical_button": "✅ Gramatical",
                    "ungrammatical_button": "❌ Não gramatical",
                    "key_hint_y": "(Y)",
                    "key_hint_n": "(N)",
                    "feedback_correct": "Correto! Esta frase é gramatical.",
                    "feedback_incorrect": "Incorreto. Esta frase não é gramatical.",
                    "next_button": "Próximo",
                    "progress": "Progresso do treinamento"
                },
                "experiment": {
                    "title": "🧪 Experimento",
                    "counter": "Questão",
                    "question": "Esta frase parece gramatical para você?",
                    "grammatical_button": "✅ Gramatical",
                    "ungrammatical_button": "❌ Não gramatical",
                    "key_hint_y": "(Y)",
                    "key_hint_n": "(N)",
                    "progress": "Progresso do experimento",
                    "pause_title": "⏸️ Pausa",
                    "pause_text": "Faça uma pausa curta. Você pode continuar quando estiver pronto.",
                    "continue_button": "Continuar"
                },
                "results": {
                    "title": "📊 Resultados",
                    "completion_title": "Experimento concluído!",
                    "completion_text": "Obrigado pela sua participação! Aqui está um resumo dos seus resultados:",
                    "summary_title": "Resumo dos resultados",
                    "total_trials": "Número total de tentativas",
                    "correct_answers": "Respostas corretas",
                    "accuracy": "Precisão",
                    "average_time": "Tempo médio de resposta",
                    "conditions": {
                        "simple_ambiguous": "Simples, ambígua",
                        "simple_unambiguous": "Simples, não ambígua",
                        "complex_ambiguous": "Complexa, ambígua",
                        "complex_unambiguous": "Complexa, não ambígua"
                    },
                    "download_button": "📥 Baixar dados",
                    "new_experiment_button": "🔄 Novo experimento",
                    "analytics_button": "📈 Ver análises"
                },
                "analytics": {
                    "title": "📈 Análises",
                    "import_title": "📁 Importar dados",
                    "import_text": "Você pode importar arquivos JSON exportados do experimento para analisar vários participantes.",
                    "import_button": "Escolher arquivos",
                    "import_placeholder": "Nenhum arquivo selecionado",
                    "no_files": "Nenhum arquivo importado",
                    "remove_file": "Remover",
                    "export_button": "📥 Exportar análises",
                    "clear_data_button": "🗑️ Limpar todos os dados",
                    "clear_confirm": "Tem certeza de que deseja limpar todos os dados importados?",
                    "no_data": "Nenhum dado de experimento encontrado. Importe arquivos JSON ou complete um experimento.",
                    "charts": {
                        "accuracy": "Precisão por condição",
                        "response_time": "Tempo de resposta por condição",
                        "participant_comparison": "Comparação de participantes",
                        "learning_curve": "Curva de aprendizado"
                    },
                    "stats": {
                        "total_participants": "Total de participantes",
                        "average_accuracy": "Precisão média",
                        "average_response_time": "Tempo médio de resposta"
                    }
                },
                "common": {
                    "loading": "Carregando...",
                    "error": "Erro",
                    "success": "Sucesso",
                    "cancel": "Cancelar",
                    "confirm": "Confirmar",
                    "close": "Fechar"
                },
                "language": {
                    "fr": "Français",
                    "pt": "Português"
                }
            }
        };

        return translations[lang] || translations['fr'];
    }

    // Change la langue
    async changeLanguage(lang) {
        if (lang === this.currentLanguage) return;
        
        await this.loadTranslations(lang);
        this.translatePage();
        this.updateLanguageSwitcher();
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
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = translation;
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
    i18n = new I18n();
});

// Fonction utilitaire pour traduire
function t(key, params = {}) {
    return i18n ? i18n.t(key, params) : key;
} 