# 🔧 Configuration Backend pour Forcer l'IP 1.1.1.1

## Problème

Les participants générés doivent avoir l'IP **1.1.1.1** pour être identifiables, mais le backend peut récupérer l'IP depuis la requête HTTP (`req.ip`) au lieu d'utiliser celle envoyée dans le body JSON.

## Solution

Le frontend envoie l'IP dans le body JSON ET dans des headers spéciaux. Le backend DOIT prioriser l'IP du body JSON.

## Format des Données Envoyées

### Body JSON

```json
{
  "participant": {
    "id": "PXYZ1234ABCD",
    "germanLevel": "B1",
    "nativeLanguage": "portuguese",
    "notBilingual": true,
    "startTime": "2025-01-15T10:30:00.000Z",
    "ipAddress": "1.1.1.1"  // ← IMPORTANT: Utiliser cette IP
  },
  "experiment": {
    "config": {...},
    "endTime": "...",
    "data": [...]
  },
  "metadata": {
    "synthetic": true,
    "forceIp": "1.1.1.1",
    "source": "synthetic-generator"
  }
}
```

### Headers HTTP

```
Content-Type: application/json
X-Force-IP: 1.1.1.1
X-Synthetic-Data: true
```

## Code Backend Requis

### Exemple avec Express/Node.js

```javascript
app.post('/api/results', async (req, res) => {
  const { participant, experiment, metadata } = req.body;
  
  // PRIORITÉ 1: Utiliser l'IP du body JSON si présente
  let ipAddress = participant.ipAddress;
  
  // PRIORITÉ 2: Si metadata.forceIp existe, l'utiliser
  if (metadata && metadata.forceIp) {
    ipAddress = metadata.forceIp;
  }
  
  // PRIORITÉ 3: Si header X-Force-IP existe, l'utiliser
  if (req.headers['x-force-ip']) {
    ipAddress = req.headers['x-force-ip'];
  }
  
  // DERNIER RECOURS: Utiliser req.ip (seulement si aucune IP n'est fournie)
  if (!ipAddress) {
    ipAddress = req.ip || req.connection.remoteAddress;
  }
  
  // Pour les données synthétiques, FORCER à 1.1.1.1
  if (metadata && metadata.synthetic) {
    ipAddress = '1.1.1.1';
  }
  
  // Créer le participant avec l'IP forcée
  const participantData = {
    id: participant.id,
    germanLevel: participant.germanLevel,
    nativeLanguage: participant.nativeLanguage,
    notBilingual: participant.notBilingual,
    startTime: participant.startTime,
    ipAddress: ipAddress  // ← Utiliser l'IP forcée, pas req.ip
  };
  
  // ... reste du code
});
```

### Exemple avec Prisma

```typescript
// Dans votre route POST /api/results
const participant = await prisma.participant.create({
  data: {
    id: body.participant.id,
    germanLevel: body.participant.germanLevel,
    nativeLanguage: body.participant.nativeLanguage,
    notBilingual: body.participant.notBilingual,
    startTime: new Date(body.participant.startTime),
    // IMPORTANT: Utiliser l'IP du body, pas req.ip
    ipAddress: body.participant.ipAddress || body.metadata?.forceIp || '1.1.1.1'
  }
});
```

## Vérification

Pour vérifier que l'IP est bien forcée :

1. Générer un participant via `synthetic-generator.html`
2. Vérifier dans la base de données que `ipAddress = '1.1.1.1'`
3. Si ce n'est pas le cas, le backend utilise `req.ip` au lieu de `body.participant.ipAddress`

## Logs de Débogage

Le frontend log les données envoyées dans la console :

```javascript
console.log('📤 Envoi avec IP forcée:', {
  participantId: formattedData.participant.id,
  ipAddress: formattedData.participant.ipAddress,
  fullData: formattedData
});
```

Vérifiez que `ipAddress` est bien `'1.1.1.1'` dans ces logs.

## Points Critiques

1. **NE JAMAIS utiliser `req.ip`** pour les données générées
2. **TOUJOURS utiliser `body.participant.ipAddress`** si présent
3. **Vérifier `metadata.synthetic`** pour forcer l'IP à 1.1.1.1
4. **Les headers `X-Force-IP` et `X-Synthetic-Data`** sont des indicateurs supplémentaires

## Test

Pour tester si le backend force bien l'IP :

1. Générer un participant avec IP 1.1.1.1
2. Vérifier dans la base de données
3. Si l'IP est différente, le backend doit être modifié

