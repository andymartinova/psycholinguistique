// Gestion de l'exploitation des données de la base de données
class DatabaseAnalytics {
    constructor() {
        this.participants = [];
        this.filteredParticipants = [];
        this.selectedParticipants = new Set();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Bouton pour charger les participants
        const loadBtn = document.getElementById('load-participants-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadParticipants());
        }

        // Bouton pour réinitialiser les filtres
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Filtres
        const filterInputs = ['filter-participant-id', 'filter-language', 'filter-german-level'];
        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
                element.addEventListener('input', () => this.applyFilters());
            }
        });

        // Sélection tout
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        }

        const selectAllParticipants = document.getElementById('select-all-participants');
        if (selectAllParticipants) {
            selectAllParticipants.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        }

        // Bouton pour traiter les participants sélectionnés
        const processBtn = document.getElementById('process-selected-btn');
        if (processBtn) {
            processBtn.addEventListener('click', () => this.processSelectedParticipants());
        }
    }

    async loadParticipants() {
        const baseUrl = getApiBaseUrl();
        if (!baseUrl) {
            alert('API non configurée');
            return;
        }

        const loadBtn = document.getElementById('load-participants-btn');
        if (loadBtn) {
            loadBtn.disabled = true;
            loadBtn.textContent = 'Chargement...';
        }

        try {
            // Essayer d'abord GET /api/participants
            let response = await fetch(`${baseUrl}/api/participants`);
            
            // Si ça ne fonctionne pas, essayer GET /api/results?participants=true
            if (!response.ok) {
                response = await fetch(`${baseUrl}/api/results?participants=true`);
            }

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            // Adapter selon le format de réponse de l'API
            if (Array.isArray(data)) {
                this.participants = data;
            } else if (data.participants && Array.isArray(data.participants)) {
                this.participants = data.participants;
            } else {
                this.participants = [];
            }

            this.applyFilters();
        } catch (error) {
            console.error('Erreur lors du chargement des participants:', error);
            alert('Erreur lors du chargement des participants. Vérifiez que l\'API est accessible et qu\'un endpoint GET /api/participants existe.');
            this.participants = [];
            this.displayParticipants([]);
        } finally {
            if (loadBtn) {
                loadBtn.disabled = false;
                loadBtn.textContent = 'Charger les participants';
            }
        }
    }

    applyFilters() {
        const participantIdFilter = document.getElementById('filter-participant-id')?.value.toLowerCase() || '';
        const languageFilter = document.getElementById('filter-language')?.value || '';
        const germanLevelFilter = document.getElementById('filter-german-level')?.value || '';

        this.filteredParticipants = this.participants.filter(participant => {
            // Filtre par ID
            if (participantIdFilter) {
                const participantId = (participant.participantId || participant.id || '').toLowerCase();
                if (!participantId.includes(participantIdFilter)) {
                    return false;
                }
            }

            // Filtre par langue
            if (languageFilter) {
                const nativeLanguage = participant.nativeLanguage || participant.languageGroup;
                if (nativeLanguage !== languageFilter) {
                    // Gérer le mapping fr -> french, pt -> portuguese
                    if (languageFilter === 'french' && nativeLanguage !== 'fr' && nativeLanguage !== 'french') {
                        return false;
                    }
                    if (languageFilter === 'portuguese' && nativeLanguage !== 'pt' && nativeLanguage !== 'portuguese') {
                        return false;
                    }
                }
            }

            // Filtre par niveau d'allemand
            if (germanLevelFilter) {
                if (participant.germanLevel !== germanLevelFilter) {
                    return false;
                }
            }

            return true;
        });

        this.displayParticipants(this.filteredParticipants);
    }

    clearFilters() {
        document.getElementById('filter-participant-id').value = '';
        document.getElementById('filter-language').value = '';
        document.getElementById('filter-german-level').value = '';
        this.applyFilters();
    }

    displayParticipants(participants) {
        const tbody = document.getElementById('participants-table-body');
        if (!tbody) return;

        if (participants.length === 0) {
            const emptyText = window.i18n && window.i18n.loaded ? 
                window.i18n.t('analytics.no_participants_found') : 'Aucun participant trouvé';
            tbody.innerHTML = `<tr><td colspan="8" class="empty-state">${emptyText}</td></tr>`;
            this.updateSelectedCount();
            return;
        }

        tbody.innerHTML = participants.map((participant, index) => {
            const participantId = participant.participantId || participant.id || 'N/A';
            const nativeLanguage = participant.nativeLanguage || participant.languageGroup || 'N/A';
            const germanLevel = participant.germanLevel || 'N/A';
            const startTime = participant.startTime ? new Date(participant.startTime).toLocaleDateString('fr-FR') : 'N/A';
            const ipAddress = participant.ipAddress || 'N/A';
            const experimentsCount = participant.experiments?.length || participant._count?.experiments || 0;
            const isSelected = this.selectedParticipants.has(participantId);

            // Mapper la langue pour l'affichage
            let languageDisplay = nativeLanguage;
            if (nativeLanguage === 'french' || nativeLanguage === 'fr') {
                languageDisplay = '🇫🇷 Français';
            } else if (nativeLanguage === 'portuguese' || nativeLanguage === 'pt') {
                languageDisplay = '🇧🇷 Portugais';
            }

            return `
                <tr data-participant-id="${participantId}">
                    <td>
                        <input type="checkbox" class="participant-checkbox" 
                               data-participant-id="${participantId}" 
                               ${isSelected ? 'checked' : ''}>
                    </td>
                    <td>${participantId}</td>
                    <td>${languageDisplay}</td>
                    <td>${germanLevel}</td>
                    <td>${startTime}</td>
                    <td>${ipAddress}</td>
                    <td>${experimentsCount}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary view-participant-btn" 
                                data-participant-id="${participantId}"
                                data-i18n="analytics.view_details">
                            Voir détails
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Ajouter les event listeners pour les checkboxes
        tbody.querySelectorAll('.participant-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const participantId = e.target.dataset.participantId;
                if (e.target.checked) {
                    this.selectedParticipants.add(participantId);
                } else {
                    this.selectedParticipants.delete(participantId);
                }
                this.updateSelectedCount();
            });
        });

        // Ajouter les event listeners pour les boutons "Voir détails"
        tbody.querySelectorAll('.view-participant-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const participantId = e.target.dataset.participantId;
                this.viewParticipantDetails(participantId);
            });
        });

        this.updateSelectedCount();
    }

    toggleSelectAll(checked) {
        this.filteredParticipants.forEach(participant => {
            const participantId = participant.participantId || participant.id;
            if (checked) {
                this.selectedParticipants.add(participantId);
            } else {
                this.selectedParticipants.delete(participantId);
            }
        });

        // Mettre à jour toutes les checkboxes
        document.querySelectorAll('.participant-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });

        document.getElementById('select-all-checkbox').checked = checked;
        document.getElementById('select-all-participants').checked = checked;

        this.updateSelectedCount();
    }

    updateSelectedCount() {
        const count = this.selectedParticipants.size;
        const countElement = document.getElementById('selected-count');
        if (countElement) {
            const selectedText = window.i18n && window.i18n.loaded ? 
                window.i18n.t('analytics.selected_count') : 'participant(s) sélectionné(s)';
            countElement.innerHTML = `${count} <span data-i18n="analytics.selected_count">${selectedText}</span>`;
            // Retraduire après mise à jour
            if (window.i18n && window.i18n.loaded) {
                window.i18n.translate();
            }
        }

        const processBtn = document.getElementById('process-selected-btn');
        if (processBtn) {
            processBtn.disabled = count === 0;
        }
    }

    async viewParticipantDetails(participantId) {
        const baseUrl = getApiBaseUrl();
        if (!baseUrl) {
            alert('API non configurée');
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/api/participants/${participantId}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const participant = await response.json();
            
            // Afficher les détails dans une modal ou une section dédiée
            alert(`Détails du participant ${participantId}:\n\n` +
                  `Langue: ${participant.nativeLanguage || 'N/A'}\n` +
                  `Niveau d'allemand: ${participant.germanLevel || 'N/A'}\n` +
                  `Date de début: ${participant.startTime || 'N/A'}\n` +
                  `IP: ${participant.ipAddress || 'N/A'}\n` +
                  `Nombre d'expériences: ${participant.experiments?.length || 0}`);
        } catch (error) {
            console.error('Erreur lors de la récupération des détails:', error);
            alert('Erreur lors de la récupération des détails du participant');
        }
    }

    async processSelectedParticipants() {
        if (this.selectedParticipants.size === 0) {
            alert('Aucun participant sélectionné');
            return;
        }

        const baseUrl = getApiBaseUrl();
        if (!baseUrl) {
            alert('API non configurée');
            return;
        }

        const processBtn = document.getElementById('process-selected-btn');
        if (processBtn) {
            processBtn.disabled = true;
            processBtn.textContent = 'Traitement en cours...';
        }

        try {
            const selectedIds = Array.from(this.selectedParticipants);
            const participantsData = [];

            // Récupérer les données complètes pour chaque participant sélectionné
            for (const participantId of selectedIds) {
                try {
                    const response = await fetch(`${baseUrl}/api/participants/${participantId}`);
                    if (response.ok) {
                        const participant = await response.json();
                        participantsData.push(participant);
                    }
                } catch (error) {
                    console.error(`Erreur pour le participant ${participantId}:`, error);
                }
            }

            // Traiter les données (par exemple, les ajouter à la section d'analyse)
            this.importParticipantsData(participantsData);

            alert(`${participantsData.length} participant(s) traité(s) avec succès`);
        } catch (error) {
            console.error('Erreur lors du traitement:', error);
            alert('Erreur lors du traitement des participants');
        } finally {
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = 'Traiter les participants sélectionnés';
            }
        }
    }

    importParticipantsData(participantsData) {
        // Convertir les données des participants au format attendu par analytics.js
        const formattedData = participantsData.map(participant => {
            // Récupérer toutes les expériences du participant
            const experiments = participant.experiments || [];
            
            return experiments.map(experiment => {
                return {
                    participant: {
                        id: participant.participantId || participant.id,
                        languageGroup: participant.nativeLanguage === 'french' ? 'fr' : 
                                      participant.nativeLanguage === 'portuguese' ? 'pt' : null,
                        germanLevel: participant.germanLevel,
                        startTime: participant.startTime
                    },
                    experiment: {
                        config: experiment.config || {},
                        endTime: experiment.endTime,
                        data: experiment.trials || []
                    }
                };
            });
        }).flat();

        // Déclencher un événement personnalisé pour que analytics.js puisse traiter ces données
        const event = new CustomEvent('participantsDataLoaded', { detail: formattedData });
        document.dispatchEvent(event);
    }
}

// Initialisation
let databaseAnalytics;
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si on est sur la page analytics-enhanced
    if (document.getElementById('load-participants-btn')) {
        databaseAnalytics = new DatabaseAnalytics();
    }
});

