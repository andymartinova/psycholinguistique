/**
 * Générateur de données synthétiques pour l'expérience psycholinguistique
 * Crée des données réalistes qui simulent un comportement humain
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse le fichier data.js pour extraire les phrases expérimentales
 */
function loadSentencesFromDataFile() {
    try {
        const dataFile = fs.readFileSync(path.join(__dirname, 'js/data.js'), 'utf-8');
        
        // Extraire le contenu du tableau EXPERIMENTAL_SENTENCES
        // On cherche la partie entre les crochets
        const match = dataFile.match(/const EXPERIMENTAL_SENTENCES = \[([\s\S]*?)\];/);
        if (!match) {
            throw new Error('Impossible de trouver EXPERIMENTAL_SENTENCES dans data.js');
        }
        
        // Parser le contenu du tableau en utilisant eval (dans un contexte sécurisé)
        // On crée un objet temporaire pour capturer la constante
        const tempContext = {};
        const codeToEval = match[0] + '\n' + 'tempContext.sentences = EXPERIMENTAL_SENTENCES;';
        eval(codeToEval.replace('const EXPERIMENTAL_SENTENCES', 'EXPERIMENTAL_SENTENCES'));
        
        // Extraire les phrases avec eval (méthode alternative plus sûre)
        // On va plutôt parser manuellement les objets
        const sentences = [];
        const sentencePattern = /\{\s*sentence:\s*"([^"]+)",\s*condition:\s*"([^"]+)",\s*expected:\s*"([^"]+)"[^}]*\}/g;
        let m;
        while ((m = sentencePattern.exec(dataFile)) !== null) {
            sentences.push({
                sentence: m[1],
                condition: m[2],
                expected: m[3]
            });
        }
        
        if (sentences.length > 0) {
            return sentences;
        }
    } catch (error) {
        console.warn('⚠️  Impossible de charger les phrases depuis data.js:', error.message);
        console.warn('   Utilisation des phrases par défaut...');
    }
    
    // Phrases par défaut si le chargement échoue
    return [
    // Simple non-ambiguous (grammatical)
    { sentence: "sie steht jeden Tag um sechs Uhr auf", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Sie kommen morgen an", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Mach das Licht an", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Ich kann nicht einschlafen", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Wann kommst du in Berlin an?", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Er ruft mich jeden Sonntag an", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Du räumst dein Zimmer auf", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Sie macht das Fenster auf", condition: "simple_non_ambiguous", expected: "grammatical" },
    
    // Simple ambiguous (ungrammatical)
    { sentence: "Ich aufstehe jeden Tag um sieben Uhr", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Sie ankommen morgen", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Mach an das Licht!", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Ich kann nicht schlafen ein.", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Wann ankommst du in Berlin?", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Er anruft mich jeden Sonntag", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "du aufräumst dein Zimmer.", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Sie aufmacht das Fenster", condition: "simple_ambiguous", expected: "ungrammatical" },
    
    // Complex non-ambiguous (grammatical)
    { sentence: "Er schläft, da er müde ist.", condition: "complex_non_ambiguous", expected: "grammatical" },
    { sentence: "Sie lachen, denn sie sind glücklich", condition: "complex_non_ambiguous", expected: "grammatical" },
    { sentence: "Er trinkt, weil er Durst hat", condition: "complex_non_ambiguous", expected: "grammatical" },
    { sentence: "Ich gehe raus, obwohl das Wetter schlecht ist.", condition: "complex_non_ambiguous", expected: "grammatical" },
    { sentence: "Ich erkläre es, damit er es versteht", condition: "complex_non_ambiguous", expected: "grammatical" },
    { sentence: "Ich verstehe, dass du mitkommen willst", condition: "complex_non_ambiguous", expected: "grammatical" },
    { sentence: "Wir wissen nicht, ob er bei der Prüfung betrogen hat.", condition: "complex_non_ambiguous", expected: "grammatical" },
    { sentence: "Ihr seid eingeladen, wenn Ihr Zeit habt", condition: "complex_non_ambiguous", expected: "grammatical" },
    
    // Complex ambiguous (ungrammatical)
    { sentence: "Er bleibt zu Hause, während seine arbeitet Frau", condition: "complex_ambiguous", expected: "ungrammatical" },
    { sentence: "Wir fahren in Urlaub, nachdem wir haben gespart", condition: "complex_ambiguous", expected: "ungrammatical" },
    { sentence: "Er kauft Blumen, bevor er geht nach Hause", condition: "complex_ambiguous", expected: "ungrammatical" },
    { sentence: "Ich rufe dich an, sobald ich habe Zeit", condition: "complex_ambiguous", expected: "ungrammatical" },
    { sentence: "Sie lernt Deutsch, seit sie wohnt in Berlin", condition: "complex_ambiguous", expected: "ungrammatical" },
    { sentence: "Wir bleiben drinnen, falls es regnet heute", condition: "complex_non_ambiguous", expected: "ungrammatical" },
    { sentence: "Er ist müde, weil er hat spät ins Bett gegangen", condition: "complex_ambiguous", expected: "ungrammatical" },
    { sentence: "Sie kommt nicht, da sie ist sehr krank", condition: "complex_ambiguous", expected: "ungrammatical" },
    
    // Topicalisation (grammatical)
    { sentence: "Die Großmutter hat die Schokolade gegessen", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Den Kater jagt der Hund", condition: "simple_ambiguous", expected: "grammatical" },
    { sentence: "Den Ball jagt der Hund im Garten", condition: "simple_ambiguous", expected: "grammatical" },
    { sentence: "Den Alien erschreckt das Kind", condition: "simple_ambiguous", expected: "grammatical" },
    { sentence: "Der Spielerin gibt das Kind den Ball", condition: "simple_ambiguous", expected: "grammatical" },
    { sentence: "Mit viel Freude hat die Großmutter die Schokolade gegessen", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Im Park spielen die Kinder Fußball", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Langsam fährt das Auto die Straße entlang", condition: "simple_non_ambiguous", expected: "grammatical" },
    
    // Pronoms (grammatical)
    { sentence: "Ich gebe ihm das Buch", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Ich höre euch", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Sie liebt ihn", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Ich schenke dir eine Blume", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Er bringt ihnen die Zeitung", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Sie zeigt mir den Weg", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Er sieht mich", condition: "simple_non_ambiguous", expected: "grammatical" },
    { sentence: "Wir geben ihr die Schlüssel", condition: "simple_non_ambiguous", expected: "grammatical" },
    
    // Pronoms (ungrammatical)
    { sentence: "Ich gebe er das Buch", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Ich höre dir", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Sie liebt er", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Ich schenke dich eine Blume", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Er bringt sie die Zeitung", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Sie zeigt mich den Weg", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Er sieht mir", condition: "simple_ambiguous", expected: "ungrammatical" },
    { sentence: "Wir geben sie die Schlüssel", condition: "simple_ambiguous", expected: "ungrammatical" }
    ];
}

// Charger les phrases
const SENTENCES = loadSentencesFromDataFile();

// Configuration de l'expérience
const EXPERIMENT_CONFIG = {
    practiceTrials: 4,
    totalTrials: 56,
    pauseAfterTrials: 0,
    sentenceDisplayTime: 2000,
    feedbackTime: 1500
};

/**
 * Génère un nombre aléatoire selon une distribution normale (approximation)
 */
function normalRandom(mean, stdDev) {
    // Box-Muller transform pour générer des nombres selon une distribution normale
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
}

/**
 * Génère un nombre aléatoire dans une plage avec une distribution normale
 */
function randomNormalRange(mean, stdDev, min, max) {
    let value = normalRandom(mean, stdDev);
    // Clamper les valeurs extrêmes
    while (value < min || value > max) {
        value = normalRandom(mean, stdDev);
    }
    return Math.round(value);
}

/**
 * Calcule la probabilité de réponse correcte selon la condition et le niveau de compétence
 */
function getAccuracyProbability(condition, skillLevel, isGrammatical) {
    // Probabilités de base selon la condition
    const baseProbabilities = {
        'simple_non_ambiguous': 0.95,  // Facile, non ambigu
        'simple_ambiguous': 0.70,      // Difficile, ambigu
        'complex_non_ambiguous': 0.85, // Moyen, complexe mais non ambigu
        'complex_ambiguous': 0.60      // Très difficile, complexe et ambigu
    };
    
    // Ajuster selon le niveau de compétence (0.0 à 1.0)
    const baseProb = baseProbabilities[condition] || 0.75;
    
    // Les phrases grammaticales sont généralement mieux détectées
    const grammaticalBonus = isGrammatical ? 0.05 : -0.05;
    
    // Ajuster selon le niveau de compétence
    const adjustedProb = baseProb + (skillLevel - 0.5) * 0.3 + grammaticalBonus;
    
    // Clamper entre 0.5 et 0.99 (jamais parfait, jamais aléatoire)
    return Math.max(0.5, Math.min(0.99, adjustedProb));
}

/**
 * Génère un temps de réponse réaliste selon la condition et le trial
 */
function generateResponseTime(condition, trial, totalTrials, skillLevel, isCorrect) {
    // Temps de base selon la condition (en millisecondes)
    const baseTimes = {
        'simple_non_ambiguous': { mean: 1200, stdDev: 300 },
        'simple_ambiguous': { mean: 2200, stdDev: 500 },
        'complex_non_ambiguous': { mean: 1800, stdDev: 400 },
        'complex_ambiguous': { mean: 2800, stdDev: 600 }
    };
    
    const base = baseTimes[condition] || { mean: 2000, stdDev: 400 };
    
    // Effet d'apprentissage : plus rapide vers la fin (réduction de 20%)
    const learningFactor = 1 - (trial / totalTrials) * 0.2;
    
    // Les réponses incorrectes prennent souvent plus de temps (hésitation)
    const hesitationFactor = isCorrect ? 1.0 : 1.15;
    
    // Ajuster selon le niveau de compétence (les meilleurs sont plus rapides)
    const skillFactor = 1.0 - (skillLevel - 0.5) * 0.2;
    
    // Temps moyen ajusté
    const adjustedMean = base.mean * learningFactor * hesitationFactor * skillFactor;
    
    // Générer avec variation normale
    const responseTime = randomNormalRange(adjustedMean, base.stdDev, 300, 8000);
    
    return responseTime;
}

/**
 * Génère une réponse (grammatical ou ungrammatical) selon les probabilités
 */
function generateResponse(expected, accuracyProb) {
    return Math.random() < accuracyProb ? expected : 
           (expected === 'grammatical' ? 'ungrammatical' : 'grammatical');
}

/**
 * Génère les données d'un participant
 */
function generateParticipantData(participantId, languageGroup, germanLevel, startDate) {
    // Niveau de compétence (0.0 à 1.0) basé sur le niveau d'allemand
    const skillLevels = {
        'A1': 0.3,
        'A2': 0.45,
        'B1': 0.60,
        'B2': 0.75,
        'C1': 0.85,
        'C2': 0.92
    };
    const skillLevel = skillLevels[germanLevel] || 0.65;
    
    // Mélanger les phrases pour chaque participant
    const shuffledSentences = [...SENTENCES].sort(() => Math.random() - 0.5);
    
    // Sélectionner 56 phrases (ou moins si on n'en a pas assez)
    const selectedSentences = shuffledSentences.slice(0, Math.min(EXPERIMENT_CONFIG.totalTrials, shuffledSentences.length));
    
    const experimentData = [];
    const startTime = new Date(startDate);
    
    selectedSentences.forEach((sentenceData, index) => {
        const trial = index + 1;
        
        // Calculer la probabilité de réponse correcte
        const accuracyProb = getAccuracyProbability(
            sentenceData.condition,
            skillLevel,
            sentenceData.expected === 'grammatical'
        );
        
        // Générer la réponse
        const response = generateResponse(sentenceData.expected, accuracyProb);
        const isCorrect = response === sentenceData.expected;
        
        // Générer le temps de réponse
        const responseTime = generateResponseTime(
            sentenceData.condition,
            trial,
            EXPERIMENT_CONFIG.totalTrials,
            skillLevel,
            isCorrect
        );
        
        // Calculer le timestamp (environ 2-5 secondes entre chaque trial)
        const timeBetweenTrials = randomNormalRange(3000, 1000, 2000, 6000);
        const timestamp = new Date(startTime.getTime() + (trial - 1) * timeBetweenTrials + responseTime);
        
        experimentData.push({
            trial: trial,
            sentence: sentenceData.sentence,
            condition: sentenceData.condition,
            expected: sentenceData.expected,
            response: response,
            responseTime: responseTime,
            correct: isCorrect,
            timestamp: timestamp.toISOString()
        });
    });
    
    const endTime = new Date(experimentData[experimentData.length - 1].timestamp);
    endTime.setSeconds(endTime.getSeconds() + 2); // Ajouter 2 secondes après le dernier trial
    
    return {
        participant: {
            id: participantId,
            languageGroup: languageGroup,
            startTime: startTime.toISOString()
        },
        experiment: {
            config: EXPERIMENT_CONFIG,
            data: experimentData,
            endTime: endTime.toISOString()
        }
    };
}

/**
 * Génère plusieurs participants avec des caractéristiques variées
 */
function generateMultipleParticipants(count = 10) {
    const participants = [];
    const languageGroups = ['fr', 'pt'];
    const germanLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    
    // Date de base (aujourd'hui)
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 30)); // Dans les 30 derniers jours
    
    for (let i = 0; i < count; i++) {
        const participantId = `P${String(i + 1).padStart(3, '0')}`;
        const languageGroup = languageGroups[Math.floor(Math.random() * languageGroups.length)];
        const germanLevel = germanLevels[Math.floor(Math.random() * germanLevels.length)];
        
        // Date aléatoire dans les 30 derniers jours
        const participantDate = new Date(baseDate);
        participantDate.setDate(participantDate.getDate() - Math.floor(Math.random() * 30));
        participantDate.setHours(9 + Math.floor(Math.random() * 10)); // Entre 9h et 19h
        participantDate.setMinutes(Math.floor(Math.random() * 60));
        
        const data = generateParticipantData(participantId, languageGroup, germanLevel, participantDate);
        participants.push(data);
    }
    
    return participants;
}

// Fonction principale
function main() {
    const args = process.argv.slice(2);
    const count = args[0] ? parseInt(args[0]) : 10;
    const outputDir = args[1] || './synthetic-data';
    
    console.log(`🎲 Génération de ${count} participants synthétiques...`);
    
    // Créer le répertoire de sortie s'il n'existe pas
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const participants = generateMultipleParticipants(count);
    
    // Sauvegarder chaque participant dans un fichier séparé
    participants.forEach(participant => {
        const participantId = participant.participant.id;
        const date = new Date(participant.participant.startTime).toISOString().split('T')[0];
        const filename = path.join(outputDir, `${participantId}_${date}.json`);
        
        fs.writeFileSync(filename, JSON.stringify(participant, null, 2), 'utf-8');
        console.log(`✅ ${filename}`);
    });
    
    // Créer aussi un fichier avec tous les participants
    const allParticipantsFile = path.join(outputDir, 'all_participants.json');
    fs.writeFileSync(allParticipantsFile, JSON.stringify(participants, null, 2), 'utf-8');
    console.log(`✅ ${allParticipantsFile}`);
    
    // Afficher des statistiques
    console.log('\n📊 Statistiques:');
    participants.forEach(p => {
        const data = p.experiment.data;
        const correct = data.filter(d => d.correct).length;
        const accuracy = (correct / data.length * 100).toFixed(1);
        const avgTime = Math.round(data.reduce((sum, d) => sum + d.responseTime, 0) / data.length);
        console.log(`  ${p.participant.id}: ${accuracy}% de précision, ${avgTime}ms de temps moyen`);
    });
    
    console.log(`\n✨ Génération terminée! ${count} participants créés dans ${outputDir}/`);
}

// Exécuter si appelé directement
if (require.main === module) {
    main();
}

module.exports = {
    generateParticipantData,
    generateMultipleParticipants
};

