# ⚠️ IMPORTANT - Forcer l'IP à 1.1.1.1 pour les données synthétiques

## Problème

Lors de l'envoi de données synthétiques en batch, certains participants ont une IP incorrecte (ex: `15.188.145.20`, `51.44.161.180`) au lieu de `1.1.1.1`.

## Cause

Le backend utilise probablement `req.ip` (l'IP de la requête HTTP) au lieu de l'IP fournie dans le body JSON ou dans les headers.

## Solution Backend

### Endpoint concerné
```
POST /api/results
```

### Modifications requises

Le backend **DOIT** utiliser l'IP du body JSON (`participant.ipAddress`) au lieu de `req.ip` lorsque :

1. **Header `X-Synthetic-Data: true`** est présent, OU
2. **Header `X-Force-IP`** est présent, OU  
3. **Header `X-Use-Body-IP: true`** est présent, OU
4. **`metadata.synthetic === true`** dans le body, OU
5. **`metadata.forceIp === '1.1.1.1'`** dans le body

### Exemple d'implémentation (Node.js/Express)

```javascript
router.post('/api/results', async (req, res) => {
    try {
        const { participant, experiment, metadata } = req.body;
        
        // DÉTERMINER L'IP À UTILISER
        let ipAddress;
        
        // Priorité 1: Headers pour données synthétiques
        const isSynthetic = req.headers['x-synthetic-data'] === 'true' || 
                           req.headers['x-force-ip'] === '1.1.1.1' ||
                           req.headers['x-use-body-ip'] === 'true' ||
                           metadata?.synthetic === true ||
                           metadata?.forceIp === '1.1.1.1';
        
        if (isSynthetic) {
            // POUR LES DONNÉES SYNTHÉTIQUES: TOUJOURS utiliser l'IP du body
            ipAddress = participant?.ipAddress || '1.1.1.1';
            
            // Vérification: si l'IP n'est pas 1.1.1.1, la forcer
            if (ipAddress !== '1.1.1.1') {
                console.warn(`⚠️ IP non conforme pour données synthétiques: ${ipAddress}, correction à 1.1.1.1`);
                ipAddress = '1.1.1.1';
            }
        } else {
            // POUR LES DONNÉES RÉELLES: utiliser req.ip (comportement normal)
            ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0];
        }
        
        // Log pour vérification
        console.log('📥 IP utilisée:', {
            participantId: participant?.id,
            isSynthetic,
            ipFromBody: participant?.ipAddress,
            ipFromRequest: req.ip,
            ipFinale: ipAddress
        });
        
        // Créer le participant avec l'IP correcte
        const participantData = {
            participantId: participant.id,
            germanLevel: participant.germanLevel,
            nativeLanguage: participant.nativeLanguage,
            notBilingual: participant.notBilingual,
            startTime: participant.startTime,
            ipAddress: ipAddress  // ← UTILISER L'IP DÉTERMINÉE CI-DESSUS
        };
        
        // ... reste du code ...
        
    } catch (error) {
        // ...
    }
});
```

### Exemple d'implémentation (Python/Flask)

```python
@app.route('/api/results', methods=['POST'])
def create_result():
    data = request.json
    participant = data.get('participant', {})
    metadata = data.get('metadata', {})
    
    # DÉTERMINER L'IP À UTILISER
    is_synthetic = (
        request.headers.get('X-Synthetic-Data') == 'true' or
        request.headers.get('X-Force-IP') == '1.1.1.1' or
        request.headers.get('X-Use-Body-IP') == 'true' or
        metadata.get('synthetic') == True or
        metadata.get('forceIp') == '1.1.1.1'
    )
    
    if is_synthetic:
        # POUR LES DONNÉES SYNTHÉTIQUES: utiliser l'IP du body
        ip_address = participant.get('ipAddress', '1.1.1.1')
        if ip_address != '1.1.1.1':
            print(f"⚠️ IP non conforme pour données synthétiques: {ip_address}, correction à 1.1.1.1")
            ip_address = '1.1.1.1'
    else:
        # POUR LES DONNÉES RÉELLES: utiliser l'IP de la requête
        ip_address = request.remote_addr or request.headers.get('X-Forwarded-For', '').split(',')[0]
    
    # Créer le participant avec l'IP correcte
    participant_data = {
        'participantId': participant.get('id'),
        'germanLevel': participant.get('germanLevel'),
        'nativeLanguage': participant.get('nativeLanguage'),
        'notBilingual': participant.get('notBilingual'),
        'startTime': participant.get('startTime'),
        'ipAddress': ip_address  # ← UTILISER L'IP DÉTERMINÉE CI-DESSUS
    }
    
    # ... reste du code ...
```

## Headers envoyés par le frontend

Le frontend envoie les headers suivants pour les données synthétiques :

```http
POST /api/results
Content-Type: application/json
X-Force-IP: 1.1.1.1
X-Synthetic-Data: true
X-Use-Body-IP: true
```

## Body JSON envoyé

```json
{
  "participant": {
    "id": "PMK8FE1222V3W",
    "germanLevel": "A2",
    "nativeLanguage": "portuguese",
    "notBilingual": true,
    "startTime": "2026-01-10T14:53:55.034Z",
    "ipAddress": "1.1.1.1"  ← DOIT ÊTRE UTILISÉE
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

## Vérification

Après modification, vérifier que :
1. Les participants générés ont TOUS l'IP `1.1.1.1`
2. Les participants réels gardent leur IP réelle (`req.ip`)
3. Les logs montrent l'IP utilisée pour chaque participant

## Requête SQL pour corriger les données existantes

```sql
-- Mettre à jour les IP incorrectes pour les participants générés le 2026-01-10
UPDATE participants
SET "ipAddress" = '1.1.1.1'
WHERE DATE("startTime") = '2026-01-10'
  AND "ipAddress" != '1.1.1.1'
  AND "ipAddress" IN ('15.188.145.20', '51.44.161.180'); -- IPs incorrectes observées
```
