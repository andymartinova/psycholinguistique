# Générateur de Données Synthétiques

Ce script génère des données synthétiques réalistes pour votre expérience psycholinguistique, simulant un comportement humain cohérent.

## Caractéristiques

Le générateur crée des données avec les caractéristiques suivantes :

### 🎯 Précision réaliste
- **Simple non-ambigu** : ~95% de précision (facile)
- **Simple ambigu** : ~70% de précision (difficile)
- **Complexe non-ambigu** : ~85% de précision (moyen)
- **Complexe ambigu** : ~60% de précision (très difficile)
- Ajustement selon le niveau d'allemand du participant (A1 à C2)

### ⏱️ Temps de réponse réalistes
- Variation selon la complexité de la phrase
- Effet d'apprentissage (plus rapide vers la fin)
- Les réponses incorrectes prennent souvent plus de temps (hésitation)
- Distribution normale avec variation naturelle

### 🧠 Patterns comportementaux
- Pas de performance parfaite (quelques erreurs naturelles)
- Variation dans les temps de réponse
- Cohérence dans les erreurs (certains patterns d'erreurs)
- Timestamps réalistes avec intervalles entre les trials

## Utilisation

### Génération basique

```bash
node generate-synthetic-data.js [nombre] [dossier_sortie]
```

**Paramètres :**
- `nombre` : Nombre de participants à générer (défaut: 10)
- `dossier_sortie` : Dossier où sauvegarder les fichiers (défaut: `./synthetic-data`)

**Exemples :**

```bash
# Générer 10 participants (par défaut)
node generate-synthetic-data.js

# Générer 25 participants
node generate-synthetic-data.js 25

# Générer 15 participants dans un dossier spécifique
node generate-synthetic-data.js 15 ./mes-donnees
```

### Format de sortie

Le script génère :
- Un fichier JSON par participant : `P001_2025-01-15.json`
- Un fichier consolidé : `all_participants.json`

### Structure des données générées

Chaque fichier JSON suit le même format que les données réelles :

```json
{
  "participant": {
    "id": "P001",
    "languageGroup": "fr",
    "startTime": "2025-01-15T10:30:00.000Z"
  },
  "experiment": {
    "config": {
      "practiceTrials": 4,
      "totalTrials": 56,
      "pauseAfterTrials": 0,
      "sentenceDisplayTime": 2000,
      "feedbackTime": 1500
    },
    "data": [
      {
        "trial": 1,
        "sentence": "sie steht jeden Tag um sechs Uhr auf",
        "condition": "simple_non_ambiguous",
        "expected": "grammatical",
        "response": "grammatical",
        "responseTime": 1250,
        "correct": true,
        "timestamp": "2025-01-15T10:30:02.250Z"
      }
    ],
    "endTime": "2025-01-15T10:35:00.000Z"
  }
}
```

## Personnalisation

### Modifier les niveaux de compétence

Dans le script, vous pouvez ajuster les niveaux de compétence par niveau d'allemand :

```javascript
const skillLevels = {
    'A1': 0.3,  // 30% de compétence de base
    'A2': 0.45,
    'B1': 0.60,
    'B2': 0.75,
    'C1': 0.85,
    'C2': 0.92  // 92% de compétence de base
};
```

### Modifier les probabilités de précision

Ajustez les probabilités de base selon les conditions :

```javascript
const baseProbabilities = {
    'simple_non_ambiguous': 0.95,
    'simple_ambiguous': 0.70,
    'complex_non_ambiguous': 0.85,
    'complex_ambiguous': 0.60
};
```

### Modifier les temps de réponse

Ajustez les temps moyens et écarts-types :

```javascript
const baseTimes = {
    'simple_non_ambiguous': { mean: 1200, stdDev: 300 },
    'simple_ambiguous': { mean: 2200, stdDev: 500 },
    'complex_non_ambiguous': { mean: 1800, stdDev: 400 },
    'complex_ambiguous': { mean: 2800, stdDev: 600 }
};
```

## Intégration avec vos données existantes

Si vous avez des fichiers SQL d'autres participants, vous pouvez :

1. **Analyser les patterns réels** : Examiner les temps de réponse moyens, les taux d'erreur par condition, etc.

2. **Ajuster le générateur** : Modifier les paramètres du script pour correspondre aux patterns observés dans vos données réelles.

3. **Créer un script d'import** : Convertir les données générées en format SQL si nécessaire.

### Exemple d'analyse des données existantes

Si vous avez des données SQL, vous pouvez calculer :
- Temps de réponse moyen par condition
- Taux de précision par condition
- Distribution des erreurs

Puis ajuster les paramètres du générateur en conséquence.

## Notes importantes

⚠️ **Ces données sont synthétiques** : Elles sont conçues pour tester et développer votre système d'analyse, mais ne doivent pas être utilisées pour des conclusions scientifiques réelles.

✅ **Cohérence** : Les données générées suivent des patterns cohérents qui simulent un comportement humain réaliste.

🔄 **Reproductibilité** : Pour obtenir les mêmes résultats, vous pouvez fixer la graine aléatoire en ajoutant au début du script :
```javascript
// Fixer la graine pour la reproductibilité
Math.random = (function() {
    let seed = 12345; // Votre graine
    return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
})();
```

## Support

Pour toute question ou problème, vérifiez que :
- Node.js est installé (`node --version`)
- Le fichier `js/data.js` existe et contient les phrases expérimentales
- Vous avez les permissions d'écriture dans le dossier de sortie

