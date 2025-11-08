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
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && (savedLang === 'fr' || savedLang === 'pt')) {
            return savedLang;
        }

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
        try {
            await this.loadTranslations(this.currentLanguage);
            this.setupLanguageSwitcher();
            this.translatePage();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du système de traduction:', error);
        }
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
                    "participant_label": "Numéro de participant :",
                    "participant_placeholder": "P001",
                    "language_group_label": "Groupe linguistique :",
                    "language_group_select": "Sélectionnez votre groupe",
                    "language_group_fr": "Locuteur natif français",
                    "language_group_pt": "Locuteur natif portugais",
                    "german_level_label": "Niveau en allemand d'après le test :",
                    "pretest_notice_html": "Avant de commencer le test, nous vous demandons de réaliser un test de niveau en allemand suivant ce lien : <a href=\"https://strommeninc.com/language-tests/german-level-test/?utm_source=chatgpt.com\" target=\"_blank\" rel=\"noopener noreferrer\">Strømmen German Level Test</a>",  
                    "start_button": "Commencer l'expérience",
                    "instructions_button": "Voir les instructions",
                    "analytics_button": "Analyses individuelles",
                    "objective_title": "🎯 Objectif",
                    "objective_text": "Juger la grammaticalité de phrases en allemand",
                    "duration_title": "⏱️ Durée",
                    "duration_text": "Environ 10-15 minutes",
                    "data_title": "📊 Données",
                    "data_text": "Mesure de précision et temps de réponse"
                },
                "instructions": {
                    "title": "📋 Instructions",
                    "objective_title": "🎯 Objectif de l'expérience",
                    "objective_text": "Vous allez participer à une expérience sur la compréhension des phrases en allemand. Votre tâche est de juger si chaque phrase vous semble grammaticalement correcte ou incorrecte.",
                    "procedure_title": "📝 Procédure",
                    "procedure_step1": "Entraînement : Vous commencerez par 4 phrases d'entraînement avec feedback",
                    "procedure_step2": "Expérience : Vous verrez 42 phrases et devrez juger leur grammaticalité",
                    "procedure_step3": "Réponse : Cliquez sur \"Grammaticale\" ou \"Non grammaticale\"",
                    "procedure_step4": "Vitesse : Répondez le plus rapidement et précisément possible",
                    "controls_title": "⌨️ Contrôles",
                    "controls_item1": "Souris : Cliquez sur les boutons",
                    "controls_item2": "Clavier : Utilisez Y (ou O) pour \"Grammaticale\" et N pour \"Non grammaticale\"",
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
                    "grammaticality_title": "📚 Explication de la notion de grammaticalité",
                    "grammaticality_block": "<p>Dans cet exercice, le terme « grammatical » se réfère à la correction syntaxique d’une phrase, c’est‑à‑dire au respect des règles de construction de l’allemand.</p><p>Une phrase peut être grammaticale même si elle semble étrange ou inhabituelle. Par exemple :</p><div class=\"example-phrase\"><p><em>« Am Abend liest das Mädchen schnell ein Buch »</em></p></div><p>est grammaticale : la structure S‑V‑O est correcte, même si l’ordre des compléments rend la phrase un peu inhabituelle.</p><p>En revanche, une phrase qui viole les règles syntaxiques, comme :</p><div class=\"example-phrase\"><p><em>« Trinkt Peter am Morgen Kaffee liest »</em></p></div><p>est agrammaticale, car l’ordre des verbes et des compléments ne respecte pas la grammaire allemande.</p><p><strong>L’objectif est donc de juger la grammaticalité d’après la structure syntaxique et non la plausibilité du sens.</strong></p>",
                    "training_title": "🎓 Entraînement",
                    "training_text": "Vous allez d'abord faire 4 essais d'entraînement avec feedback pour vous familiariser avec la tâche.",
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
                    "conditions_title": "Performance par condition",
                    "total_trials": "Nombre total d'essais",
                    "correct_answers": "Réponses correctes",
                    "accuracy": "Précision",
                    "average_time": "Temps de réponse moyen",
                    "download_button": "📥 Télécharger les données",
                    "download_text": "Vous pouvez télécharger vos données d'expérience au format JSON pour une analyse plus approfondie.",
                    "contact_text": "Si vous avez des questions concernant cette expérience, n'hésitez pas à nous contacter.",
                    "back_experiment": "← Retour à l'expérience",
                    "conditions": {
                        "simple_ambiguous": "Simple, ambiguë",
                        "simple_unambiguous": "Simple, non ambiguë",
                        "complex_ambiguous": "Complexe, ambiguë",
                        "complex_unambiguous": "Complexe, non ambiguë"
                    },
                    "new_experiment_button": "🔄 Nouvelle expérience",
                    "analytics_button": "📈 Voir les analyses",
                    "trial": "Essai",
                    "sentence": "Phrase",
                    "condition": "Condition",
                    "expected": "Attendu",
                    "response": "Réponse",
                    "time": "Temps",
                    "correct": "Correct",
                    "missing": "MANQUANT",
                    "invalid": "INVALIDE"
                },
                "analytics": {
                    "title": "📈 Analyses",
                    "description": "Importez et analysez les données d'expérience",
                    "import_title": "📁 Importer des données",
                    "import_description": "Glissez-déposez des fichiers JSON ou cliquez pour sélectionner",
                    "select_files": "Sélectionner des fichiers",
                    "import_text": "Vous pouvez importer des fichiers JSON exportés depuis l'expérience pour analyser plusieurs participants.",
                    "import_button": "Choisir un ou plusieurs fichiers JSON",
                    "import_placeholder": "Aucun fichier sélectionné",
                    "no_files": "Aucun fichier importé",
                    "remove_file": "Supprimer",
                    "export_data": "📥 Exporter les données",
                    "clear_data": "🗑️ Effacer toutes les données",
                    "clear_confirm": "Êtes-vous sûr de vouloir effacer toutes les données importées ?",
                    "no_data": "Aucune donnée d'expérience trouvée. Importez des fichiers JSON ou complétez une expérience.",
                    "global_stats": "Statistiques globales",
                    "condition_stats": "Statistiques par condition",
                    "performance_charts": "Graphiques de performance",
                    "performance_summary": "Résumé de performance",
                    "performance_by_condition": "Performance par condition",
                    "accuracy_by_condition": "Précision par condition",
                    "response_time_by_condition": "Temps de réponse par condition",
                    "participant_comparison": "Comparaison des participants",
                    "learning_curve": "Courbe d'apprentissage",
                    "raw_data": "Données brutes",
                    "stats_title": "Statistiques globales",
                    "conditions_title": "Performance par condition",
                    "participant_comparison_title": "Comparaison des participants",
                    "charts_title": "📈 Graphiques",
                    "raw_data_title": "📋 Données brutes",
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
                    },
                    "participant_label": "Participant",
                    "local_data": "Données locales",
                    "invalid_file": "Le fichier {name} n'est pas un fichier JSON valide.",
                    "invalid_data": "Le fichier {name} ne contient pas des données d'expérience valides.",
                    "read_error": "Erreur lors de la lecture du fichier {name}: {error}"
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
                    "participant_label": "Número do participante:",
                    "participant_placeholder": "P001",
                    "language_group_label": "Grupo linguístico:",
                    "language_group_select": "Selecione seu grupo",
                    "language_group_fr": "Falante nativo de francês",
                    "language_group_pt": "Falante nativo de português",
                    "german_level_label": "Nível de alemão de acordo com o teste:",
                    "pretest_notice_html": "Antes de começar o teste, pedimos que você realize um teste de nível de alemão neste link: <a href=\"https://strommeninc.com/language-tests/german-level-test/?utm_source=chatgpt.com\" target=\"_blank\" rel=\"noopener noreferrer\">Strømmen German Level Test</a>.",
                    "start_button": "Iniciar experimento",
                    "instructions_button": "Ver instruções",
                    "analytics_button": "Análises avançadas",
                    "objective_title": "🎯 Objetivo",
                    "objective_text": "Julgar a gramaticalidade de frases em alemão",
                    "duration_title": "⏱️ Duração",
                    "duration_text": "Aproximadamente 10-15 minutos",
                    "data_title": "📊 Dados",
                    "data_text": "Medição de precisão e tempo de resposta"
                },
                "instructions": {
                    "title": "📋 Instruções",
                    "objective_title": "🎯 Objetivo do experimento",
                    "objective_text": "Você participará de um experimento sobre a compreensão de frases em alemão. Sua tarefa é julgar se cada frase parece gramaticalmente correta ou incorreta.",
                    "procedure_title": "📝 Procedimento",
                    "procedure_step1": "Treinamento: Você começará com 4 frases de treinamento com feedback",
                    "procedure_step2": "Experimento: Você verá 42 frases e deverá julgar sua gramaticalidade",
                    "procedure_step3": "Resposta: Clique em \"Gramatical\" ou \"Não gramatical\"",
                    "procedure_step4": "Velocidade: Responda o mais rápido e preciso possível",
                    "controls_title": "⌨️ Controles",
                    "controls_item1": "Mouse: Clique nos botões",
                    "controls_item2": "Teclado: Use Y (ou O) para \"Gramatical\" e N para \"Não gramatical\"",
                    "examples_title": "🔍 Exemplos de frases",
                    "grammatical_example": "Gramatical: \"Der Hund schläft im Garten.\" (O cachorro dorme no jardim.)",
                    "ungrammatical_example": "Não gramatical: \"Der Hund schlafen im Garten.\" (O cachorro dormir no jardim.)",
                    "grammaticality_title": "📚 Explicação da noção de gramaticalidade",
                    "grammaticality_block": "<p>Neste exercício, o termo «gramatical» refere-se à correção sintática de uma frase, ou seja, ao respeito às regras de construção do alemão.</p><p>Uma frase pode ser gramatical mesmo que pareça estranha ou incomum. Por exemplo:</p><div class=\"example-phrase\"><p><em>«Am Abend liest das Mädchen schnell ein Buch»</em></p></div><p>é gramatical: a estrutura S‑V‑O está correta, mesmo que a ordem dos complementos torne a frase um pouco incomum.</p><p>Por outro lado, uma frase que viola as regras sintáticas, como:</p><div class=\"example-phrase\"><p><em>«Trinkt Peter am Morgen Kaffee liest»</em></p></div><p>é agramatical, pois a ordem dos verbos e dos complementos não respeita a gramática alemã.</p><p><strong>O objetivo é julgar a gramaticalidade segundo a estrutura sintática e não a plausibilidade do sentido.</strong></p>",
                    "training_title": "🎓 Treinamento",
                    "training_text": "Você fará primeiro 4 tentativas de treinamento com feedback para se familiarizar com a tarefa.",
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
                    "conditions_title": "Performance por condição",
                    "total_trials": "Número total de tentativas",
                    "correct_answers": "Respostas corretas",
                    "accuracy": "Precisão",
                    "average_time": "Tempo médio de resposta",
                    "download_button": "📥 Baixar dados",
                    "download_text": "Você pode baixar seus dados de experiência em formato JSON para uma análise mais aprofundada.",
                    "contact_text": "Se você tiver dúvidas sobre este experimento, não hesite em nos contatar.",
                    "back_experiment": "← Voltar ao experimento",
                    "conditions": {
                        "simple_ambiguous": "Simples, ambígua",
                        "simple_unambiguous": "Simples, não ambígua",
                        "complex_ambiguous": "Complexa, ambígua",
                        "complex_unambiguous": "Complexa, não ambígua"
                    },
                    "new_experiment_button": "🔄 Novo experimento",
                    "analytics_button": "📈 Ver análises",
                    "trial": "Tentativa",
                    "sentence": "Frase",
                    "condition": "Condição",
                    "expected": "Esperado",
                    "response": "Resposta",
                    "time": "Tempo",
                    "correct": "Correto",
                    "missing": "FALTANTE",
                    "invalid": "INVÁLIDO"
                },
                "analytics": {
                    "title": "📈 Análises",
                    "description": "Importe e analise dados de experimento",
                    "import_title": "📁 Importar dados",
                    "import_description": "Arraste e solte arquivos JSON ou clique para selecionar",
                    "select_files": "Selecionar arquivos",
                    "import_text": "Você pode importar arquivos JSON exportados do experimento para analisar vários participantes.",
                    "import_button": "Escolher um ou mais arquivos JSON",
                    "import_placeholder": "Nenhum arquivo selecionado",
                    "no_files": "Nenhum arquivo importado",
                    "remove_file": "Remover",
                    "export_data": "📥 Exportar dados",
                    "clear_data": "🗑️ Limpar todos os dados",
                    "clear_confirm": "Tem certeza de que deseja limpar todos os dados importados?",
                    "no_data": "Nenhum dado de experimento encontrado. Importe arquivos JSON ou complete um experimento.",
                    "global_stats": "Estatísticas globais",
                    "condition_stats": "Estatísticas por condição",
                    "performance_charts": "Gráficos de performance",
                    "performance_summary": "Resumo de performance",
                    "performance_by_condition": "Performance por condição",
                    "accuracy_by_condition": "Precisão por condição",
                    "response_time_by_condition": "Tempo de resposta por condição",
                    "participant_comparison": "Comparação de participantes",
                    "learning_curve": "Curva de aprendizado",
                    "raw_data": "Dados brutos",
                    "stats_title": "Estatísticas globais",
                    "conditions_title": "Performance por condição",
                    "participant_comparison_title": "Comparação de participantes",
                    "charts_title": "📈 Gráficos",
                    "raw_data_title": "📋 Dados brutos",
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
                    },
                    "participant_label": "Participante",
                    "local_data": "Dados locais",
                    "invalid_file": "O arquivo {name} não é um arquivo JSON válido.",
                    "invalid_data": "O arquivo {name} não contém dados de experimento válidos.",
                    "read_error": "Erro ao ler o arquivo {name}: {error}"
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
            return null; // ne pas renvoyer la clé brute
        }

        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null; // manquante => null
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
            
            // N'écrase pas si traduction absente ou identique à la clé
            if (translation && translation !== key) {
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
            
            if (translation && translation !== key) {
                element.innerHTML = translation;
            }
        });

        // Traduit les titres de page
        const pageTitle = document.querySelector('title');
        if (pageTitle && pageTitle.getAttribute('data-i18n')) {
            const key = pageTitle.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation && translation !== key) {
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
                    🇫🇷 ${this.t('language.fr') || 'Français'}
                </button>
                <button class="language-btn ${this.currentLanguage === 'pt' ? 'active' : ''}" 
                        onclick="i18n.changeLanguage('pt')">
                    🇧🇷 ${this.t('language.pt') || 'Português'}
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
document.addEventListener('DOMContentLoaded', async () => {
    i18n = new I18n();
    
    // Attendre que l'initialisation soit terminée
    await i18n.init();
    
    // Émettre l'événement i18nReady
    window.dispatchEvent(new CustomEvent('i18nReady'));
});

// Fonction utilitaire pour traduire
function t(key, params = {}) {
    return i18n ? (i18n.t(key, params) || key) : key;
} 