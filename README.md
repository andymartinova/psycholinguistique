# Expérience Psycholinguistique - Allemand

## Description

Cette application web permet de réaliser une expérience de psycholinguistique pour étudier le traitement syntaxique en allemand chez les locuteurs natifs (L1) et non-natifs (L2).

## Fonctionnalités

### 📋 Structure de l'expérience

- **Page d'accueil** : Informations participant et sélection du groupe linguistique
- **Instructions** : Explication détaillée de la tâche avec exemple
- **Phase d'entraînement** : 3 essais avec feedback pour familiarisation
- **Expérience principale** : 24 essais avec 4 conditions expérimentales
- **Pauses** : Pauses automatiques tous les 8 essais
- **Page de fin** : Téléchargement des données

### 🧱 Conditions expérimentales

1. **Phrases simples, non ambiguës** (6 phrases)
   - Exemple : "Der Hund schläft im Garten."
2. **Phrases complexes, non ambiguës** (6 phrases)
   - Exemple : "Der Mann, der gestern gekommen ist, arbeitet hier."
3. **Phrases ambiguës avec résolution facile** (6 phrases)
   - Exemple : "Der Hund beißt den Mann mit dem Stock."
4. **Phrases ambiguës avec résolution difficile** (6 phrases)
   - Exemple : "Der Hund beißt den Mann mit dem Stock schlägt."

### ⏱️ Mesures collectées

- Temps de réponse (en millisecondes)
- Réponse du participant (grammaticale/non grammaticale)
- Précision (comparaison avec la réponse attendue)
- Données démographiques (groupe L1/L2)

## Installation et utilisation

### Prérequis

- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Pas d'installation requise

### Démarrage

1. Ouvrez le fichier `index.html` dans votre navigateur
2. Ou servez les fichiers via un serveur web local

### Pour un serveur local (recommandé)

```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js (si vous avez http-server installé)
npx http-server

# Avec PHP
php -S localhost:8000
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

## Configuration

### Modifier les paramètres expérimentaux

Dans `script.js`, vous pouvez ajuster :

```javascript
const EXPERIMENT_CONFIG = {
  practiceTrials: 3, // Nombre d'essais d'entraînement
  totalTrials: 24, // Nombre total d'essais
  pauseAfterTrials: 8, // Pause tous les X essais
  sentenceDisplayTime: 2000, // Temps d'affichage de la phrase (ms)
  feedbackTime: 1500, // Temps de feedback (ms)
};
```

### Ajouter/modifier les phrases

Dans `script.js`, modifiez les tableaux :

- `EXPERIMENTAL_SENTENCES` : Phrases de l'expérience principale
- `PRACTICE_SENTENCES` : Phrases d'entraînement

Structure d'une phrase :

```javascript
{
    sentence: "Phrase en allemand",
    condition: "type_de_condition",
    expected: "grammatical" | "ungrammatical",
    translation: "Traduction en français"
}
```

## Format des données exportées

Les données sont exportées au format JSON avec la structure suivante :

```json
{
  "participant": {
    "id": "ID_du_participant",
    "languageGroup": "L1" | "L2",
    "startTime": "2024-01-01T10:00:00.000Z"
  },
  "experiment": {
    "config": { /* Configuration de l'expérience */ },
    "data": [
      {
        "trial": 1,
        "sentence": "Phrase présentée",
        "condition": "type_de_condition",
        "expected": "grammatical",
        "response": "grammatical",
        "responseTime": 1500,
        "correct": true,
        "timestamp": "2024-01-01T10:05:00.000Z"
      }
    ],
    "summary": {
      "totalTrials": 24,
      "correctResponses": 20,
      "accuracy": "83.33%",
      "avgResponseTime": "1450.50ms",
      "conditionStats": {
        "simple_non_ambiguous": {
          "trials": 6,
          "accuracy": "100.00",
          "avgResponseTime": "1200.00"
        }
      }
    }
  }
}
```

## Analyse des données

### Import dans R

```r
library(jsonlite)
library(dplyr)

# Lire les données
data <- fromJSON("experiment_data_P001_2024-01-01.json")

# Extraire les données des essais
trials <- data$experiment$data

# Analyser par condition
summary_by_condition <- trials %>%
  group_by(condition) %>%
  summarise(
    mean_rt = mean(responseTime),
    accuracy = mean(correct) * 100,
    n = n()
  )
```

### Import dans Python

```python
import json
import pandas as pd

# Lire les données
with open('experiment_data_P001_2024-01-01.json', 'r') as f:
    data = json.load(f)

# Convertir en DataFrame
df = pd.DataFrame(data['experiment']['data'])

# Analyser par condition
summary = df.groupby('condition').agg({
    'responseTime': 'mean',
    'correct': 'mean',
    'trial': 'count'
}).rename(columns={'trial': 'n', 'correct': 'accuracy'})
```

## Personnalisation

### Modifier le design

- Éditez `styles.css` pour changer l'apparence
- Les couleurs principales sont définies avec des variables CSS
- Design responsive pour mobile et desktop

### Ajouter de nouvelles conditions

1. Ajoutez les nouvelles phrases dans `EXPERIMENTAL_SENTENCES`
2. Mettez à jour la fonction `generateSummary()` pour inclure les nouvelles conditions
3. Ajustez `totalTrials` si nécessaire

### Modifier la tâche

- Changez les boutons de réponse dans `index.html`
- Modifiez la logique de `handleResponse()` dans `script.js`
- Ajustez les instructions en conséquence

## Sécurité et éthique

### Protection des données

- Les données sont stockées localement dans le navigateur
- Aucune donnée n'est envoyée à un serveur externe
- Export manuel des données par le participant

### Prévention de la triche

- Désactivation du clic droit pendant l'expérience
- Prévention des raccourcis clavier (F5, Ctrl+R)
- Avertissement lors de la fermeture de l'onglet

## Support

Pour toute question ou problème :

1. Vérifiez que votre navigateur est à jour
2. Désactivez les bloqueurs de scripts
3. Utilisez un serveur web local plutôt que d'ouvrir directement le fichier HTML

## Licence

Cette application est fournie à des fins de recherche et d'enseignement. Vous êtes libre de la modifier et de l'adapter à vos besoins.

## lien bugs

https://docs.google.com/spreadsheets/d/1MVpRAIouv9qD8R6I3KSqwDZIkVTWI7v6G3FWZUAIl2I/edit?gid=0#gid=0
