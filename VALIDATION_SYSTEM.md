# 🔍 Système de Validation Automatique

## Vue d'ensemble

Le système de validation automatique vérifie la cohérence et la qualité des données générées à plusieurs niveaux.

## Types de Validations

### 1. Validation des Temps de Réponse

#### Valeurs aberrantes (Outliers)
- Détecte les temps > 3 écarts-types de la moyenne
- **Critique** si > 5% des trials sont des outliers
- **Avertissement** si < 5% mais > 0%

#### Plage raisonnable
- Vérifie que le temps moyen est entre 500ms et 5000ms
- Avertissement si hors de cette plage

#### Statistiques calculées
- Moyenne, écart-type, min, max

### 2. Validation de la Précision Globale

#### Seuils
- **Critique** si précision < 45% ou > 98%
- **Avertissement** si précision < 50%

#### Raison
- Une précision trop faible suggère un problème dans la génération
- Une précision trop élevée (> 98%) est irréaliste pour des humains

### 3. Validation de la Distribution des Conditions

#### Équilibre
- Vérifie que chaque condition est représentée équitablement
- **Critique** si écart > 40% de l'attendu
- **Avertissement** si écart > 25%

#### Exemple
- Si 56 trials et 4 conditions, on attend ~14 trials par condition
- Critique si une condition a < 8 ou > 20 trials

### 4. Validation de Cohérence avec les Données Réelles

#### Précision par condition
- Compare la précision générée avec les données réelles
- **Critique** si écart > 20%
- **Avertissement** si écart > 15%

#### Temps de réponse par condition
- Compare les temps moyens avec les données réelles
- **Avertissement** si écart > 30%

#### Condition
- Nécessite au moins 10 échantillons réels pour cette condition

### 5. Validation des Patterns d'Erreurs

#### Concentration des erreurs
- Vérifie que les erreurs ne sont pas toutes concentrées sur une condition
- **Avertissement** si > 80% des erreurs viennent d'une seule condition

#### Raison
- Les erreurs devraient être distribuées selon la difficulté de chaque condition

### 6. Validation Temporelle

#### Ordre des timestamps
- Vérifie que les timestamps sont dans l'ordre croissant
- **Critique** si un timestamp est antérieur au précédent

#### Intervalles entre trials
- Vérifie que les intervalles sont raisonnables
- **Avertissement** si intervalle < 1s ou > 30s

### 7. Validation de la Distribution Grammatical/Ungrammatical

#### Équilibre
- Vérifie que la distribution est proche de 50/50
- **Avertissement** si < 35% ou > 65% de phrases grammaticales

### 8. Validation de la Séquence des Trials

#### Numérotation
- Vérifie que les numéros de trial sont séquentiels (1, 2, 3, ...)
- **Avertissement** si numérotation incorrecte

#### Erreurs consécutives
- Détecte les séries d'erreurs consécutives
- **Avertissement** si > 8 erreurs consécutives

## Score de Validation

### Calcul du Score (0-100)

```
Score initial = 100
- 15 points par problème critique
- 5 points par avertissement
+ Bonus de cohérence avec données réelles (jusqu'à +5 par condition)
```

### Interprétation

- **90-100** : Excellent ✅
- **70-89** : Bon ✓
- **50-69** : Acceptable ⚠️
- **0-49** : Problèmes ❌

### Bonus de Cohérence

Si les données générées sont cohérentes avec les données réelles :
- Écart < 10% : +5 points par condition
- Calculé uniquement si ≥ 10 échantillons réels disponibles

## Affichage des Résultats

### Interface Utilisateur

1. **Badge de validation** avec score coloré
2. **Résumé textuel** des validations
3. **Liste des problèmes critiques** (rouge)
4. **Liste des avertissements** (orange)
5. **Statistiques par condition** (précision)
6. **Bouton de régénération** si score < 50

### Exemple d'Affichage

```
Validation: ✓ Excellent (92/100)

📊 Résumé: ✅ Toutes les validations sont passées avec succès • Précision: 78.5% • Temps moyen: 1850ms

Précision par condition:
- simple_non_ambiguous: 94.2% (8/8)
- simple_ambiguous: 68.8% (11/16)
- complex_non_ambiguous: 85.7% (12/14)
- complex_ambiguous: 61.1% (11/18)
```

## Régénération Automatique

### Déclenchement

Si le score de validation est < 50, un bouton "🔄 Régénérer les données" apparaît.

### Fonctionnement

1. L'utilisateur clique sur le bouton
2. Le système régénère jusqu'à 5 fois
3. Garde la meilleure tentative (score le plus élevé)
4. S'arrête si score ≥ 90

### Avantages

- Améliore automatiquement la qualité des données
- Évite les régénérations manuelles répétées
- Garantit un minimum de qualité

## Statistiques Calculées

### Globales
- Précision globale
- Temps de réponse moyen
- Écart-type des temps
- Min/Max des temps

### Par Condition
- Nombre de trials
- Précision
- Temps moyen
- Comparaison avec données réelles

### Distribution
- Ratio grammatical/ungrammatical
- Distribution des conditions
- Patterns d'erreurs

## Utilisation Programmatique

```javascript
// Valider des données générées
const validation = optimizationEngine.validateGeneratedData(trials);

// Vérifier le résultat
if (validation.isValid) {
    console.log('✅ Validation réussie');
} else {
    console.error('❌ Problèmes:', validation.issues);
    console.warn('⚠️ Avertissements:', validation.warnings);
}

// Accéder au score
console.log(`Score: ${validation.score}/100`);

// Accéder aux statistiques
console.log('Stats:', validation.stats);
```

## Recommandations

### Score < 50
- **Action requise** : Régénérer les données
- Les données peuvent être utilisables mais avec précaution

### Score 50-69
- **Recommandé** : Examiner les avertissements
- Les données sont acceptables mais peuvent être améliorées

### Score 70-89
- **Bon** : Les données sont de bonne qualité
- Peu d'améliorations nécessaires

### Score ≥ 90
- **Excellent** : Les données sont de très haute qualité
- Prêtes pour l'analyse

## Limitations

1. **Données réelles requises** : Certaines validations nécessitent des données réelles pour comparaison
2. **Seuils arbitraires** : Les seuils sont basés sur des heuristiques, pas sur des tests statistiques formels
3. **Pas de validation statistique** : Ne teste pas si les distributions sont statistiquement différentes

## Améliorations Futures

- [ ] Tests statistiques formels (chi-square, t-test)
- [ ] Validation croisée avec d'autres participants
- [ ] Détection de patterns suspects (fraude, incohérence)
- [ ] Validation basée sur le machine learning
- [ ] Export des rapports de validation détaillés

