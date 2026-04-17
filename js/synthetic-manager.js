/**
 * Gestionnaire des données synthétiques
 * Permet de visualiser et supprimer les participants générés (IP 1.1.1.1)
 */

class SyntheticDataManager {
    constructor() {
        this.participants = [];
        this.setupEventHandlers();
        this.loadParticipants();
    }
    
    setupEventHandlers() {
        const refreshBtn = document.getElementById('refresh-btn');
        const deleteAllBtn = document.getElementById('delete-all-btn');
        
        refreshBtn.addEventListener('click', () => this.loadParticipants());
        deleteAllBtn.addEventListener('click', () => this.deleteAllParticipants());
    }
    
    /**
     * Charge tous les participants avec IP 1.1.1.1
     */
    async loadParticipants() {
        const loading = document.getElementById('loading');
        const table = document.getElementById('participants-table');
        const emptyState = document.getElementById('empty-state');
        const refreshBtn = document.getElementById('refresh-btn');
        
        loading.style.display = 'block';
        table.style.display = 'none';
        emptyState.style.display = 'none';
        refreshBtn.disabled = true;
        
        try {
            const baseUrl = getApiBaseUrl();
            if (!baseUrl) {
                throw new Error('API non configurée');
            }
            
            // Récupérer tous les participants
            let response = await fetch(`${baseUrl}/api/participants`);
            if (!response.ok) {
                response = await fetch(`${baseUrl}/api/results?participants=true`);
            }
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            const allParticipants = Array.isArray(data) ? data : (data.participants || []);
            
            // Filtrer uniquement les participants générés (IP 1.1.1.1)
            this.participants = allParticipants.filter(p => p.ipAddress === '1.1.1.1');
            
            // Récupérer les données d'expérience pour ces participants
            if (this.participants.length > 0) {
                const participantIds = this.participants.map(p => p.participantId || p.id);
                
                const processResponse = await fetch(`${baseUrl}/api/participants/process`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ participantIds })
                });
                
                if (processResponse.ok) {
                    const processData = await processResponse.json();
                    const participantsData = processData.data || processData;
                    
                    // Enrichir les participants avec leurs données d'expérience
                    this.participants = this.participants.map(p => {
                        const participantId = p.participantId || p.id;
                        const fullData = participantsData.find(pd => 
                            (pd.participantId || pd.id) === participantId
                        );
                        
                        if (fullData) {
                            const experiments = fullData.experiments || [];
                            const allTrials = experiments.flatMap(exp => exp.trials || exp.data || []);
                            
                            return {
                                ...p,
                                experiments: experiments,
                                trials: allTrials,
                                trialCount: allTrials.length,
                                accuracy: this.calculateAccuracy(allTrials),
                                avgResponseTime: this.calculateAvgResponseTime(allTrials)
                            };
                        }
                        
                        return {
                            ...p,
                            experiments: [],
                            trials: [],
                            trialCount: 0,
                            accuracy: 0,
                            avgResponseTime: 0
                        };
                    });
                }
            }
            
            this.displayParticipants();
            
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            alert(`Erreur lors du chargement: ${error.message}`);
            emptyState.style.display = 'block';
            emptyState.innerHTML = `<p>❌ Erreur lors du chargement: ${error.message}</p>`;
        } finally {
            loading.style.display = 'none';
            refreshBtn.disabled = false;
        }
    }
    
    /**
     * Calcule la précision d'un participant
     */
    calculateAccuracy(trials) {
        if (!trials || trials.length === 0) return 0;
        const correct = trials.filter(t => t.correct).length;
        return (correct / trials.length * 100).toFixed(1);
    }
    
    /**
     * Calcule le temps de réponse moyen
     */
    calculateAvgResponseTime(trials) {
        if (!trials || trials.length === 0) return 0;
        const times = trials.map(t => t.responseTime || 0).filter(rt => rt > 0);
        if (times.length === 0) return 0;
        return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    }
    
    /**
     * Affiche les participants dans le tableau
     */
    displayParticipants() {
        const table = document.getElementById('participants-table');
        const emptyState = document.getElementById('empty-state');
        const tbody = document.getElementById('participants-table-body');
        const countSpan = document.getElementById('participant-count');
        
        countSpan.textContent = `${this.participants.length} participant(s) généré(s)`;
        
        if (this.participants.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        table.style.display = 'table';
        emptyState.style.display = 'none';
        
        // Trier par date (plus récent en premier)
        const sorted = [...this.participants].sort((a, b) => {
            const dateA = new Date(a.startTime || a.createdAt || 0);
            const dateB = new Date(b.startTime || b.createdAt || 0);
            return dateB - dateA;
        });
        
        tbody.innerHTML = sorted.map((participant, index) => {
            const participantId = participant.participantId || participant.id;
            const nativeLang = participant.nativeLanguage || participant.languageGroup;
            const languageDisplay = (nativeLang === 'french' || nativeLang === 'fr') ? '🇫🇷 Français' :
                                  (nativeLang === 'portuguese' || nativeLang === 'pt') ? '🇧🇷 Portugais' : nativeLang;
            const germanLevel = participant.germanLevel || 'N/A';
            const startTime = participant.startTime || participant.createdAt;
            const dateDisplay = startTime ? new Date(startTime).toLocaleString('fr-FR') : 'N/A';
            const trialCount = participant.trialCount || 0;
            const accuracy = participant.accuracy || 0;
            const avgTime = participant.avgResponseTime || 0;
            
            // Badge de précision
            let accuracyBadge = '';
            if (accuracy >= 70) {
                accuracyBadge = `<span class="stats-badge badge-success">${accuracy}%</span>`;
            } else if (accuracy >= 50) {
                accuracyBadge = `<span class="stats-badge badge-warning">${accuracy}%</span>`;
            } else {
                accuracyBadge = `<span class="stats-badge badge-danger">${accuracy}%</span>`;
            }
            
            return `
                <tr data-participant-id="${participantId}">
                    <td><strong>${participantId}</strong></td>
                    <td>${languageDisplay}</td>
                    <td>${germanLevel}</td>
                    <td>${dateDisplay}</td>
                    <td>${trialCount}</td>
                    <td>${accuracyBadge}</td>
                    <td>${avgTime}ms</td>
                    <td>
                        <button class="btn-delete" 
                                data-participant-id="${participantId}"
                                onclick="syntheticManager.deleteParticipant('${participantId}')">
                            🗑️ Supprimer
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Supprime un participant et toutes ses données
     */
    async deleteParticipant(participantId) {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le participant "${participantId}" et toutes ses données ?\n\nCette action est irréversible.`)) {
            return;
        }
        
        const button = document.querySelector(`[data-participant-id="${participantId}"].btn-delete`);
        if (button) {
            button.disabled = true;
            button.textContent = '⏳ Suppression...';
        }
        
        try {
            const baseUrl = getApiBaseUrl();
            if (!baseUrl) {
                throw new Error('API non configurée');
            }
            
            // Supprimer le participant via l'API
            // Essayer d'abord DELETE, puis POST avec action=delete si DELETE n'est pas supporté
            let response = await fetch(`${baseUrl}/api/participants/${participantId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Si DELETE n'est pas supporté, essayer POST avec action delete
            if (!response.ok && response.status === 405) {
                response = await fetch(`${baseUrl}/api/participants/${participantId}/delete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
            }
            
            // Retirer le participant de la liste locale
            this.participants = this.participants.filter(p => 
                (p.participantId || p.id) !== participantId
            );
            
            // Mettre à jour l'affichage
            this.displayParticipants();
            
            alert(`✅ Participant "${participantId}" supprimé avec succès.`);
            
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            
            // Si l'API ne supporte pas DELETE, proposer une alternative
            if (error.message.includes('404') || error.message.includes('405') || error.message.includes('Method not allowed')) {
                alert(`⚠️ L'API ne supporte pas la suppression directe.\n\nEndpoint requis: DELETE /api/participants/${participantId}\n\nVeuillez:\n1. Supprimer le participant "${participantId}" manuellement depuis votre base de données\n2. Ou contacter l'administrateur pour activer cette fonctionnalité dans l'API`);
            } else {
                alert(`❌ Erreur lors de la suppression: ${error.message}`);
            }
            
            if (button) {
                button.disabled = false;
                button.textContent = '🗑️ Supprimer';
            }
        }
    }
    
    /**
     * Supprime tous les participants générés
     */
    async deleteAllParticipants() {
        if (this.participants.length === 0) {
            alert('Aucun participant à supprimer.');
            return;
        }
        
        const count = this.participants.length;
        if (!confirm(`⚠️ ATTENTION ⚠️\n\nVous êtes sur le point de supprimer ${count} participant(s) généré(s) et toutes leurs données.\n\nCette action est IRRÉVERSIBLE.\n\nÊtes-vous absolument sûr ?`)) {
            return;
        }
        
        // Demander une confirmation supplémentaire
        if (!confirm(`Dernière confirmation : Supprimer définitivement ${count} participant(s) ?`)) {
            return;
        }
        
        const deleteAllBtn = document.getElementById('delete-all-btn');
        deleteAllBtn.disabled = true;
        deleteAllBtn.textContent = `⏳ Suppression... (0/${count})`;
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        try {
            // Supprimer chaque participant
            for (let i = 0; i < this.participants.length; i++) {
                const participant = this.participants[i];
                const participantId = participant.participantId || participant.id;
                
                deleteAllBtn.textContent = `⏳ Suppression... (${i + 1}/${count})`;
                
                try {
                    await this.deleteParticipantSilent(participantId);
                    successCount++;
                } catch (error) {
                    errorCount++;
                    errors.push({ id: participantId, error: error.message });
                }
            }
            
            // Recharger la liste
            await this.loadParticipants();
            
            // Afficher le résumé
            let message = `✅ Suppression terminée !\n\n✅ Réussis: ${successCount}\n❌ Échecs: ${errorCount}`;
            
            if (errors.length > 0) {
                message += `\n\nParticipants en erreur:\n${errors.slice(0, 5).map(e => `- ${e.id}`).join('\n')}`;
                if (errors.length > 5) {
                    message += `\n... et ${errors.length - 5} autre(s)`;
                }
            }
            
            alert(message);
            
        } catch (error) {
            console.error('Erreur lors de la suppression en masse:', error);
            alert(`Erreur lors de la suppression en masse: ${error.message}`);
        } finally {
            deleteAllBtn.disabled = false;
            deleteAllBtn.textContent = '🗑️ Supprimer tous les participants générés';
        }
    }
    
    /**
     * Supprime un participant sans confirmation (pour la suppression en masse)
     */
    async deleteParticipantSilent(participantId) {
        const baseUrl = getApiBaseUrl();
        if (!baseUrl) {
            throw new Error('API non configurée');
        }
        
        // Essayer d'abord DELETE, puis POST si DELETE n'est pas supporté
        let response = await fetch(`${baseUrl}/api/participants/${participantId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Si DELETE n'est pas supporté, essayer POST
        if (!response.ok && response.status === 405) {
            response = await fetch(`${baseUrl}/api/participants/${participantId}/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
        }
        
        // Retirer le participant de la liste locale
        this.participants = this.participants.filter(p => 
            (p.participantId || p.id) !== participantId
        );
    }
}

// Initialisation
let syntheticManager;
document.addEventListener('DOMContentLoaded', () => {
    syntheticManager = new SyntheticDataManager();
    // Exposer globalement pour les boutons onclick
    window.syntheticManager = syntheticManager;
});

