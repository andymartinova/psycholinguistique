# 🎲 Générateur de Données Synthétiques Optimisées

Ce système génère des données synthétiques réalistes basées sur l'analyse des données réelles de votre base de données.

## ✨ Fonctionnalités

### 📊 Analyse des Données Existantes
- Analyse automatique des participants réels selon le groupe linguistique et le niveau d'allemand
- Calcul des statistiques par condition expérimentale
- Identification des patterns de temps de réponse et d'erreurs
- Exclusion automatique des données déjà générées (IP 1.1.1.1)

### 🎯 Génération Optimisée
- Génération basée sur les patterns réels observés
- Algorithme d'optimisation qui pondère les données selon la taille de l'échantillon
- Ajustement automatique selon le niveau de compétence
- Simulation réaliste des temps de réponse avec effet d'apprentissage

### 🔍 Identification des Données Générées
- **IP forcée à 1.1.1.1** pour toutes les données générées
- Permet de filtrer facilement les données synthétiques dans les analyses
- Facilite la distinction entre données réelles et générées

## 🚀 Utilisation

### Accès à l'interface

Ouvrez `synthetic-generator.html` dans votre navigateur.

### Étapes de génération

1. **Remplir les paramètres du participant**
   - Nom / ID du participant (ex: `SYNTH_001`)
   - Groupe linguistique (Français ou Portugais)
   - Niveau d'allemand (A1 à C2)

2. **Analyser les données existantes (optionnel mais recommandé)**
   - Cliquez sur "📊 Analyser les données existantes"
   - Le système récupère et analyse les données réelles correspondantes
   - Affiche les statistiques par condition

3. **Générer les données optimisées**
   - Cliquez sur "✨ Générer les données optimisées"
   - Les données sont générées en utilisant les patterns observés
   - Aperçu des données générées affiché

4. **Télécharger ou envoyer à l'API**
   - **Télécharger JSON** : Sauvegarde locale des données
   - **Envoyer à l'API** : Envoie directement dans la base de données avec IP 1.1.1.1

## 📈 Algorithme d'Optimisation Avancé

Le système utilise un **moteur d'optimisation avancé** (`OptimizationEngine`) qui combine plusieurs techniques statistiques :

### Techniques Utilisées

1. **Modèle Bayésien** : Combine les données observées avec les connaissances a priori
2. **Ajustement Sigmoïde** : Transition douce entre les niveaux de compétence
3. **Courbe d'Apprentissage Exponentielle** : Modélise l'amélioration progressive
4. **Distribution Normale Tronquée** : Génère des temps de réponse réalistes
5. **Cohérence Temporelle** : Corrèle les temps avec les trials précédents
6. **Effet de Fatigue** : Augmentation légère vers la fin
7. **Effet d'Hésitation** : Les erreurs prennent 18% plus de temps

### Analyse des Données Réelles

Le système analyse :
- **Précision globale** et par condition
- **Temps de réponse moyens** et écarts-types
- **Patterns d'erreurs** par type de phrase
- **Distribution** des réponses correctes/incorrectes
- **Corrélations temporelles** entre les trials

### Génération Optimisée

1. **Modèle Bayésien** : Plus l'échantillon est grand, plus on fait confiance aux données réelles
2. **Mélange adaptatif** : S'adapte automatiquement à la quantité de données (sature à 30 échantillons)
3. **Ajustement sigmoïde** : Transition naturelle selon le niveau de compétence
4. **Effet d'apprentissage** : Courbe exponentielle avec réduction jusqu'à 20%
5. **Cohérence temporelle** : Les temps sont corrélés avec les trials précédents
6. **Validation automatique** : Vérifie la cohérence des données générées

### Formule d'Optimisation (Modèle Bayésien)

```
Précision finale = (Précision observée × Force du posterior) + (Prior × (1 - Force du posterior))
Force du posterior = min(1.0, Taille échantillon / 30)
Ajustement compétence = sigmoid(skillLevel) × maxAdjustment
```

Voir `OPTIMIZATION_ALGORITHM.md` pour les détails complets de l'algorithme.

## 🔧 Configuration

### Paramètres par Condition

Les probabilités de base sont :
- `simple_non_ambiguous` : 95% (facile)
- `simple_ambiguous` : 70% (difficile)
- `complex_non_ambiguous` : 85% (moyen)
- `complex_ambiguous` : 60% (très difficile)

Ces valeurs sont ajustées automatiquement selon les données réelles.

### Niveaux de Compétence

Les niveaux de compétence de base sont :
- **A1** : 30% de compétence de base
- **A2** : 45%
- **B1** : 60%
- **B2** : 75%
- **C1** : 85%
- **C2** : 92%

## 📊 Format des Données Générées

```json
{
  "participant": {
    "id": "SYNTH_001",
    "languageGroup": "fr",
    "germanLevel": "B2",
    "startTime": "2025-01-15T10:30:00.000Z",
    "ipAddress": "1.1.1.1"
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

## 🔍 Filtrage des Données Générées

Pour filtrer les données générées dans vos analyses :

```javascript
// Exclure les données générées
const realParticipants = participants.filter(p => p.ipAddress !== '1.1.1.1');

// Inclure uniquement les données générées
const syntheticParticipants = participants.filter(p => p.ipAddress === '1.1.1.1');
```

## ⚠️ Notes Importantes

1. **Données synthétiques** : Ces données sont générées et ne doivent pas être utilisées pour des conclusions scientifiques réelles sans validation.

2. **IP 1.1.1.1** : Cette IP est utilisée comme marqueur. Assurez-vous qu'elle n'est pas utilisée par de vrais participants.

3. **Analyse requise** : Pour une génération optimale, analysez d'abord les données existantes avant de générer.

4. **Cohérence** : Les données générées suivent des patterns cohérents basés sur les données réelles.

## 🐛 Dépannage

### L'analyse ne trouve pas de données
- Vérifiez que l'API est accessible
- Vérifiez que des participants réels existent pour cette combinaison langue/niveau
- Les données générées (IP 1.1.1.1) sont automatiquement exclues de l'analyse

### Erreur lors du chargement des phrases
- Vérifiez que `js/data.js` existe et contient `EXPERIMENTAL_SENTENCES`
- Le système utilisera un fallback si le chargement échoue

### Erreur lors de l'envoi à l'API
- Vérifiez la configuration de l'API dans `js/config.js`
- Vérifiez que le backend accepte l'IP 1.1.1.1
- Consultez la console du navigateur pour plus de détails

## 📝 Exemple d'Utilisation

1. Ouvrir `synthetic-generator.html`
2. Entrer `SYNTH_001` comme ID
3. Sélectionner `Français` et `B2`
4. Cliquer sur "Analyser les données existantes"
5. Examiner les statistiques affichées
6. Cliquer sur "Générer les données optimisées"
7. Vérifier l'aperçu des données
8. Cliquer sur "Envoyer à l'API"
9. Les données sont maintenant dans la base avec IP 1.1.1.1

## ✅ Fonctionnalités Implémentées

- [x] Algorithme d'optimisation avancé avec techniques statistiques
- [x] **Validation automatique complète** de la cohérence des données générées
- [x] Modèle bayésien pour l'adaptation aux données réelles
- [x] Cohérence temporelle et validation des valeurs aberrantes
- [x] **Score de validation (0-100)** pour évaluer la qualité
- [x] **Régénération automatique** si le score est trop faible
- [x] **Validation multi-niveaux** : critiques, avertissements, statistiques

## 🔄 Améliorations Futures

- [ ] Support pour plusieurs algorithmes d'optimisation (architecture modulaire prête)
- [ ] Visualisation graphique des patterns
- [ ] Export des statistiques d'analyse
- [ ] Génération par lots de plusieurs participants
- [ ] Machine learning pour améliorer les prédictions

