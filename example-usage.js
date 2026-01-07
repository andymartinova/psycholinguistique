/**
 * Exemple d'utilisation du générateur de données synthétiques
 * 
 * Ce script montre comment utiliser le générateur de manière programmatique
 * pour créer des participants avec des caractéristiques spécifiques.
 */

const { generateParticipantData, generateMultipleParticipants } = require('./generate-synthetic-data');

// Exemple 1: Générer un participant spécifique
console.log('📝 Exemple 1: Générer un participant spécifique\n');

const participant1 = generateParticipantData(
    'P999',           // ID du participant
    'fr',             // Groupe linguistique (fr ou pt)
    'B2',             // Niveau d'allemand (A1, A2, B1, B2, C1, C2)
    new Date('2025-01-15T10:30:00Z')  // Date de début
);

console.log(`Participant: ${participant1.participant.id}`);
console.log(`Langue: ${participant1.participant.languageGroup}`);
console.log(`Nombre de trials: ${participant1.experiment.data.length}`);

// Calculer les statistiques
const data = participant1.experiment.data;
const correct = data.filter(d => d.correct).length;
const accuracy = (correct / data.length * 100).toFixed(1);
const avgTime = Math.round(data.reduce((sum, d) => sum + d.responseTime, 0) / data.length);

console.log(`Précision: ${accuracy}%`);
console.log(`Temps de réponse moyen: ${avgTime}ms\n`);

// Exemple 2: Générer plusieurs participants avec des caractéristiques variées
console.log('📝 Exemple 2: Générer plusieurs participants\n');

const participants = generateMultipleParticipants(5);

participants.forEach(p => {
    const pData = p.experiment.data;
    const pCorrect = pData.filter(d => d.correct).length;
    const pAccuracy = (pCorrect / pData.length * 100).toFixed(1);
    const pAvgTime = Math.round(pData.reduce((sum, d) => sum + d.responseTime, 0) / pData.length);
    
    console.log(`${p.participant.id} (${p.participant.languageGroup}): ${pAccuracy}% précision, ${pAvgTime}ms moyen`);
});

// Exemple 3: Analyser les données par condition
console.log('\n📝 Exemple 3: Analyse par condition\n');

const conditions = {};
participant1.experiment.data.forEach(trial => {
    const cond = trial.condition;
    if (!conditions[cond]) {
        conditions[cond] = { total: 0, correct: 0, totalTime: 0 };
    }
    conditions[cond].total++;
    if (trial.correct) conditions[cond].correct++;
    conditions[cond].totalTime += trial.responseTime;
});

Object.keys(conditions).forEach(cond => {
    const stats = conditions[cond];
    const accuracy = (stats.correct / stats.total * 100).toFixed(1);
    const avgTime = Math.round(stats.totalTime / stats.total);
    console.log(`${cond}: ${accuracy}% précision, ${avgTime}ms moyen (${stats.total} trials)`);
});

// Exemple 4: Exporter les données
console.log('\n📝 Exemple 4: Export des données\n');

const fs = require('fs');
const outputDir = './example-output';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Sauvegarder un participant
const filename = `${outputDir}/${participant1.participant.id}_example.json`;
fs.writeFileSync(filename, JSON.stringify(participant1, null, 2), 'utf-8');
console.log(`✅ Données sauvegardées dans ${filename}`);

// Sauvegarder tous les participants
const allFilename = `${outputDir}/all_examples.json`;
fs.writeFileSync(allFilename, JSON.stringify(participants, null, 2), 'utf-8');
console.log(`✅ Tous les participants sauvegardés dans ${allFilename}`);

console.log('\n✨ Exemples terminés!');

