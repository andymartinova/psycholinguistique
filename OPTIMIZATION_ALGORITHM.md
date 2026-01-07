# 🧠 Algorithme d'Optimisation Avancé

## Vue d'ensemble

Le moteur d'optimisation utilise des techniques statistiques avancées pour générer des données synthétiques réalistes basées sur les patterns observés dans les données réelles.

## Architecture

### Classe `OptimizationEngine`

Le moteur d'optimisation est une classe dédiée qui encapsule toute la logique de génération optimisée.

### Méthodes principales

#### 1. `optimizeTrial()` - Méthode principale

Cette méthode orchestre toute la génération d'un trial :

```javascript
optimizeTrial(condition, expected, trialNumber, totalTrials, skillLevel, previousTrials)
```

**Étapes :**
1. Calcul de la précision avec modèle bayésien
2. Génération de la réponse avec validation
3. Calcul du temps de réponse avec modèles avancés
4. Validation de cohérence temporelle

## Techniques Statistiques Utilisées

### 1. Modèle Bayésien pour la Précision

**Principe :** Combine les données observées (likelihood) avec les connaissances a priori (prior).

**Formule :**
```
Précision finale = (Précision observée × Force du posterior) + (Prior × (1 - Force du posterior))
Force du posterior = min(1.0, Taille échantillon / 30)
```

**Avantages :**
- S'adapte automatiquement à la quantité de données disponibles
- Plus l'échantillon est grand, plus on fait confiance aux données réelles
- Utilise les priors quand les données sont insuffisantes

### 2. Ajustement Sigmoïde pour la Compétence

**Principe :** Utilise une fonction sigmoïde pour une transition douce entre les niveaux de compétence.

**Formule :**
```
sigmoid(x) = 1 / (1 + e^(-steepness × (x - center)))
Ajustement = (sigmoid(skillLevel) - 0.5) × 2 × maxAdjustment
```

**Avantages :**
- Transition naturelle entre les niveaux
- Évite les discontinuités abruptes
- Plus réaliste qu'un ajustement linéaire

### 3. Courbe d'Apprentissage Exponentielle

**Principe :** Modélise l'amélioration progressive des performances.

**Formule :**
```
learningReduction = 1 - e^(-α × trialNumber)
learningFactor = 1.0 - learningReduction × 0.20
```

**Avantages :**
- Modélise l'apprentissage de manière réaliste
- Réduction progressive jusqu'à 20% maximum
- Plus rapide au début, puis stabilisation

### 4. Distribution Normale Tronquée

**Principe :** Génère des temps de réponse selon une distribution normale, mais tronquée pour éviter les valeurs aberrantes.

**Méthode :** Box-Muller transform avec rejet des valeurs hors limites.

**Avantages :**
- Distribution réaliste
- Évite les valeurs impossibles (< 300ms ou > 8000ms)
- Maintient la forme normale de la distribution

### 5. Cohérence Temporelle

**Principe :** Les temps de réponse sont corrélés avec les trials précédents.

**Formule :**
```
consistencyEffect = 1.0 + (ratio - 1.0) × 0.1
ratio = Temps moyen récent / Temps de base
```

**Avantages :**
- Simule la cohérence d'un participant réel
- Évite les variations trop brusques
- Plus réaliste qu'une génération indépendante

### 6. Effet de Fatigue

**Principe :** Légère augmentation des temps de réponse vers la fin de l'expérience.

**Formule :**
```
fatigueEffect = 1.0 + (trialNumber / totalTrials) × 0.05
```

**Avantages :**
- Modélise la fatigue cognitive
- Augmentation progressive et réaliste
- Maximum de 5% d'augmentation

### 7. Effet d'Hésitation

**Principe :** Les réponses incorrectes prennent plus de temps (hésitation).

**Formule :**
```
hesitationEffect = isCorrect ? 1.0 : 1.18
```

**Avantages :**
- Simule l'hésitation sur les erreurs
- Augmentation de 18% pour les erreurs
- Basé sur des observations psycholinguistiques

## Validation et Cohérence

### Validation des Données Générées

Le système valide automatiquement les données générées :

1. **Valeurs aberrantes** : Détecte les temps de réponse > 3 écarts-types
2. **Précision globale** : Vérifie que la précision est entre 50% et 98%
3. **Distribution des conditions** : Vérifie que chaque condition est représentée équitablement

### Cohérence Temporelle

- Les temps de réponse sont validés contre les trials précédents
- Si un temps est trop différent (> 3 écarts-types), il est ajusté
- Ajustement progressif (70% moyenne précédente, 30% nouvelle valeur)

## Paramètres et Configuration

### Priors de Base par Condition

| Condition | Grammatical | Ungrammatical |
|-----------|-------------|---------------|
| simple_non_ambiguous | 96% | 92% |
| simple_ambiguous | 72% | 68% |
| complex_non_ambiguous | 87% | 83% |
| complex_ambiguous | 62% | 58% |

### Temps de Réponse de Base

| Condition | Moyenne | Écart-type |
|-----------|---------|------------|
| simple_non_ambiguous | 1200ms | 300ms |
| simple_ambiguous | 2200ms | 500ms |
| complex_non_ambiguous | 1800ms | 400ms |
| complex_ambiguous | 2800ms | 600ms |

## Avantages de l'Algorithme

1. **Adaptatif** : S'adapte automatiquement à la quantité de données disponibles
2. **Réaliste** : Utilise des modèles basés sur la recherche psycholinguistique
3. **Cohérent** : Maintient la cohérence temporelle et statistique
4. **Validé** : Vérifie automatiquement la qualité des données générées
5. **Optimisé** : Précalcule les distributions pour améliorer les performances

## Extensibilité

L'architecture modulaire permet d'ajouter facilement :

- **Nouveaux algorithmes** : Implémenter de nouvelles méthodes dans des classes séparées
- **Nouveaux facteurs** : Ajouter des effets (fatigue, motivation, etc.)
- **Nouvelles validations** : Ajouter des règles de validation personnalisées

## Exemple d'Utilisation

```javascript
// Initialiser le moteur
const engine = new OptimizationEngine();
engine.initialize(analysisData);

// Générer un trial
const result = engine.optimizeTrial(
    'simple_ambiguous',
    'ungrammatical',
    15,  // trial number
    56,  // total trials
    0.75, // skill level (B2)
    previousTrials
);

// Valider les données générées
const validation = engine.validateGeneratedData(allTrials);
```

## Références

- Modèle bayésien : Gelman et al. (2013) "Bayesian Data Analysis"
- Courbe d'apprentissage : Newell & Rosenbloom (1981) "Mechanisms of Skill Acquisition"
- Distribution normale tronquée : Robert (1995) "Simulation of truncated normal variables"

