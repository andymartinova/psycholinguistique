-- Mettre à jour l'IP à 1.1.1.1 pour tous les participants avec startTime = '2026-01-10'
-- Cette requête met à jour uniquement les participants créés le 2026-01-10

UPDATE participants
SET "ipAddress" = '1.1.1.1'
WHERE DATE("startTime") = '2026-01-10'
  AND "ipAddress" != '1.1.1.1';

-- Vérifier le nombre de lignes affectées (optionnel, pour confirmation)
-- SELECT COUNT(*) as "participants_updated"
-- FROM participants
-- WHERE DATE("startTime") = '2026-01-10'
--   AND "ipAddress" = '1.1.1.1';

-- Voir les participants qui seront mis à jour (avant l'UPDATE, pour vérification)
-- SELECT id, "participantId", "germanLevel", "ipAddress", "startTime"
-- FROM participants
-- WHERE DATE("startTime") = '2026-01-10'
-- ORDER BY "startTime";
