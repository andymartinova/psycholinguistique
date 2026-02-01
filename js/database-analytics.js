// Gestion de l'exploitation des données de la base de données
class DatabaseAnalytics {
    constructor() {
        this.participants = [];
        this.filteredParticipants = [];
        this.selectedParticipants = new Set();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Bouton pour réinitialiser les filtres
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Bouton pour inclure les participants filtrés
        const includeFilteredBtn = document.getElementById('include-filtered-btn');
        if (includeFilteredBtn) {
            includeFilteredBtn.addEventListener('click', () => this.includeFiltered());
        }

        // Bouton pour exclure les participants filtrés
        const excludeFilteredBtn = document.getElementById('exclude-filtered-btn');
        if (excludeFilteredBtn) {
            excludeFilteredBtn.addEventListener('click', () => this.excludeFiltered());
        }

        // Filtres
        const filterInputs = ['filter-participant-id', 'filter-language', 'filter-german-level', 'filter-bilingual'];
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
            const tbody = document.getElementById('participants-table-body');
            if (tbody) {
                const errorText = window.i18n && window.i18n.loaded ? 
                    window.i18n.t('analytics.api_not_configured') : 'API non configurée';
                tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${errorText}</td></tr>`;
            }
            return;
        }

            // Afficher un message de chargement
        const tbody = document.getElementById('participants-table-body');
        if (tbody) {
            const loadingText = window.i18n && window.i18n.loaded ? 
                window.i18n.t('analytics.loading_participants') : 'Chargement des participants...';
            tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${loadingText}</td></tr>`;
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

            // Sélectionner tous les participants par défaut, sauf A1 et bilingues
            this.selectedParticipants.clear();
            this.participants.forEach(participant => {
                const participantId = participant.participantId || participant.id;
                if (participantId) {
                    // Exclure les participants A1 OU bilingues (notBilingual = false signifie isBilingual = true)
                    const germanLevel = participant.germanLevel;
                    const notBilingual = participant.notBilingual === true || participant.notBilingual === 'true';
                    const isBilingual = !notBilingual;
                    
                    // Ne pas sélectionner si A1 OU bilingue
                    if (germanLevel === 'A1' || isBilingual) {
                        // Exclure de la sélection par défaut
                        return;
                    }
                    
                    this.selectedParticipants.add(participantId);
                }
            });

            this.applyFilters();
            
            // Précharger automatiquement les participants présélectionnés
            if (this.selectedParticipants.size > 0) {
                console.log('🔄 Préchargement automatique de', this.selectedParticipants.size, 'participants présélectionnés...');
                // Attendre un peu pour que l'interface soit mise à jour
                setTimeout(() => {
                    this.processSelectedParticipants(true); // Mode silencieux pour le préchargement
                }, 500);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des participants:', error);
            const errorText = window.i18n && window.i18n.loaded ? 
                window.i18n.t('analytics.load_error') : 'Erreur lors du chargement des participants. Vérifiez que l\'API est accessible.';
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${errorText}</td></tr>`;
            }
            this.participants = [];
            this.displayParticipants([]);
        }
    }

    applyFilters() {
        const participantIdFilter = document.getElementById('filter-participant-id')?.value.toLowerCase() || '';
        const languageFilter = document.getElementById('filter-language')?.value || '';
        const germanLevelFilter = document.getElementById('filter-german-level')?.value || '';
        const bilingualFilter = document.getElementById('filter-bilingual')?.value || '';

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

            // Filtre par bilingue
            if (bilingualFilter) {
                const notBilingual = participant.notBilingual === true || participant.notBilingual === 'true';
                const isBilingual = !notBilingual;
                
                if (bilingualFilter === 'yes' && !isBilingual) {
                    return false;
                }
                if (bilingualFilter === 'no' && isBilingual) {
                    return false;
                }
            }

            return true;
        });

        this.displayParticipants(this.filteredParticipants);
    }

    clearFilters() {
        const participantIdFilter = document.getElementById('filter-participant-id');
        const languageFilter = document.getElementById('filter-language');
        const germanLevelFilter = document.getElementById('filter-german-level');
        const bilingualFilter = document.getElementById('filter-bilingual');
        
        if (participantIdFilter) participantIdFilter.value = '';
        if (languageFilter) languageFilter.value = '';
        if (germanLevelFilter) germanLevelFilter.value = '';
        if (bilingualFilter) bilingualFilter.value = '';
        
        this.applyFilters();
    }

    displayParticipants(participants) {
        const tbody = document.getElementById('participants-table-body');
        if (!tbody) return;

        if (participants.length === 0) {
            const emptyText = window.i18n && window.i18n.loaded ? 
                window.i18n.t('analytics.no_participants_found') : 'Aucun participant trouvé';
            tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${emptyText}</td></tr>`;
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

            // Déterminer si bilingue (notBilingual = false signifie isBilingual = true)
            const notBilingual = participant.notBilingual === true || participant.notBilingual === 'true';
            const isBilingual = !notBilingual;
            const bilingualDisplay = isBilingual ? 'Oui' : 'Non';

            return `
                <tr data-participant-id="${participantId}" class="${isSelected ? 'participant-selected' : 'participant-excluded'}">
                    <td>
                        <input type="checkbox" class="participant-checkbox" 
                               data-participant-id="${participantId}" 
                               ${isSelected ? 'checked' : ''}>
                    </td>
                    <td>${participantId}</td>
                    <td>${languageDisplay}</td>
                    <td>${germanLevel}</td>
                    <td>${bilingualDisplay}</td>
                    <td>${startTime}</td>
                    <td>
                        <button class="btn btn-sm download-csv-btn" data-participant-id="${participantId}" title="Télécharger CSV">
                            📥 CSV
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Ajouter les event listeners pour les boutons de téléchargement CSV
        tbody.querySelectorAll('.download-csv-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const participantId = e.target.closest('.download-csv-btn')?.dataset.participantId || 
                                     e.target.dataset.participantId;
                if (participantId) {
                    this.downloadParticipantCSV(participantId);
                }
            });
        });

        // Ajouter les event listeners pour les checkboxes
        tbody.querySelectorAll('.participant-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const participantId = e.target.dataset.participantId;
                const row = e.target.closest('tr');
                
                if (e.target.checked) {
                    this.selectedParticipants.add(participantId);
                    if (row) {
                        row.classList.remove('participant-excluded');
                        row.classList.add('participant-selected');
                    }
                } else {
                    this.selectedParticipants.delete(participantId);
                    if (row) {
                        row.classList.remove('participant-selected');
                        row.classList.add('participant-excluded');
                    }
                }
                this.updateSelectedCount();
                this.updateSelectAllCheckboxes();
            });
        });

        this.updateSelectedCount();
        this.updateSelectAllCheckboxes();
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

        // Mettre à jour toutes les checkboxes et les styles
        document.querySelectorAll('.participant-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
            const row = checkbox.closest('tr');
            if (row) {
                if (checked) {
                    row.classList.remove('participant-excluded');
                    row.classList.add('participant-selected');
                } else {
                    row.classList.remove('participant-selected');
                    row.classList.add('participant-excluded');
                }
            }
        });

        this.updateSelectedCount();
        this.updateSelectAllCheckboxes();
    }

    includeFiltered() {
        // Sélectionner tous les participants filtrés
        this.filteredParticipants.forEach(participant => {
            const participantId = participant.participantId || participant.id;
            this.selectedParticipants.add(participantId);
        });

        // Mettre à jour les checkboxes et les styles visibles
        document.querySelectorAll('.participant-checkbox').forEach(checkbox => {
            const participantId = checkbox.dataset.participantId;
            const row = checkbox.closest('tr');
            
            if (this.selectedParticipants.has(participantId)) {
                checkbox.checked = true;
                if (row) {
                    row.classList.remove('participant-excluded');
                    row.classList.add('participant-selected');
                }
            }
        });

        this.updateSelectedCount();
        this.updateSelectAllCheckboxes();
    }

    excludeFiltered() {
        // Désélectionner tous les participants filtrés
        this.filteredParticipants.forEach(participant => {
            const participantId = participant.participantId || participant.id;
            this.selectedParticipants.delete(participantId);
        });

        // Mettre à jour les checkboxes et les styles visibles
        document.querySelectorAll('.participant-checkbox').forEach(checkbox => {
            const participantId = checkbox.dataset.participantId;
            const row = checkbox.closest('tr');
            
            if (!this.selectedParticipants.has(participantId)) {
                checkbox.checked = false;
                if (row) {
                    row.classList.remove('participant-selected');
                    row.classList.add('participant-excluded');
                }
            }
        });

        this.updateSelectedCount();
        this.updateSelectAllCheckboxes();
    }

    updateSelectAllCheckboxes() {
        // Mettre à jour les checkboxes "Sélectionner tout" selon l'état actuel
        const allFilteredSelected = this.filteredParticipants.length > 0 && 
            this.filteredParticipants.every(participant => {
                const participantId = participant.participantId || participant.id;
                return this.selectedParticipants.has(participantId);
            });

        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        const selectAllParticipants = document.getElementById('select-all-participants');
        
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = allFilteredSelected;
        }
        if (selectAllParticipants) {
            selectAllParticipants.checked = allFilteredSelected;
        }
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

    async downloadParticipantCSV(participantId) {
        const baseUrl = getApiBaseUrl();
        if (!baseUrl) {
            alert('API non configurée');
            return;
        }

        try {
            // Utiliser l'endpoint /api/participants/process qui fonctionne
            const response = await fetch(`${baseUrl}/api/participants/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ participantIds: [participantId] })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            const participantsData = result.data || result;
            
            if (!Array.isArray(participantsData) || participantsData.length === 0) {
                throw new Error('Aucune donnée trouvée pour ce participant');
            }

            let participant = participantsData[0];
            
            // S'assurer qu'on utilise le bon participantId
            const actualParticipantId = participant.participantId || participant.id || participantId;
            
            // Si les métadonnées complètes ne sont pas disponibles, essayer de les récupérer depuis la liste des participants
            // (qui contient parfois plus de métadonnées que /api/participants/process)
            if (!participant.age && !participant.gender && !participant.learningDuration) {
                const fullParticipant = this.participants.find(p => 
                    (p.participantId || p.id) === actualParticipantId
                );
                if (fullParticipant) {
                    // Fusionner les métadonnées complètes avec les données d'expérience
                    participant = {
                        ...fullParticipant,
                        experiments: participant.experiments || fullParticipant.experiments || []
                    };
                }
            }
            
            console.log('📊 Données participant pour CSV:', participant);
            
            // Préparer les données pour le CSV
            const csvRows = [];
            
            // En-têtes avec toutes les colonnes (trials + métadonnées)
            csvRows.push('participant_id,languageGroup,germanLevel,trial,sentence,condition,expected,response,responseTime,correct,startTime,createdAt,updatedAt,nativeLanguage,notBilingual,age,gender,learningDuration,feeling,questionnaireSubmittedAt,educationLevel,germanUsageFrequency');
            
            // Mapper languageGroup
            const languageGroup = participant.nativeLanguage === 'french' ? 'fr' : 
                                 participant.nativeLanguage === 'portuguese' ? 'pt' : 
                                 participant.nativeLanguage || '';
            
            // Préparer les métadonnées une seule fois
            const metadata = [
                participant.startTime || '',
                participant.createdAt || '',
                participant.updatedAt || '',
                participant.nativeLanguage || '',
                participant.notBilingual === true ? 'true' : (participant.notBilingual === false ? 'false' : ''),
                participant.age || '',
                participant.gender || '',
                participant.learningDuration || '',
                participant.feeling || '',
                participant.questionnaireSubmittedAt || '',
                participant.educationLevel || '',
                participant.germanUsageFrequency || ''
            ];
            
            // Récupérer tous les trials de toutes les expériences
            const experiments = participant.experiments || [];
            experiments.forEach(experiment => {
                const trials = experiment.trials || experiment.data || [];
                trials.forEach((trial, index) => {
                    const trialNumber = trial.trial || (index + 1);
                    const row = [
                        this.escapeCSV(actualParticipantId),
                        this.escapeCSV(languageGroup),
                        this.escapeCSV(participant.germanLevel || ''),
                        trialNumber,
                        this.escapeCSV(trial.sentence || ''),
                        this.escapeCSV(trial.condition || ''),
                        this.escapeCSV(trial.expected || ''),
                        this.escapeCSV(trial.response || ''),
                        trial.responseTime || 0,
                        trial.correct === true ? 'True' : 'False',
                        // Ajouter les métadonnées à chaque ligne
                        ...metadata.map(v => this.escapeCSV(v))
                    ].join(',');
                    
                    csvRows.push(row);
                });
            });
            
            // Créer le CSV
            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${actualParticipantId}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Erreur lors du téléchargement CSV:', error);
            alert(`Erreur lors du téléchargement CSV: ${error.message}`);
        }
    }

    escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Si la valeur contient une virgule, des guillemets ou un saut de ligne, l'entourer de guillemets et échapper les guillemets
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
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

    async processSelectedParticipants(silent = false) {
        if (this.selectedParticipants.size === 0) {
            if (!silent) {
                alert('Aucun participant sélectionné');
            }
            return;
        }

        const baseUrl = getApiBaseUrl();
        if (!baseUrl) {
            if (!silent) {
                alert('API non configurée');
            }
            return;
        }

        const processBtn = document.getElementById('process-selected-btn');
        if (processBtn) {
            processBtn.disabled = true;
            processBtn.textContent = 'Traitement en cours...';
        }

        try {
            const selectedIds = Array.from(this.selectedParticipants);
            console.log('📊 Traitement de', selectedIds.length, 'participants:', selectedIds);

            // Utiliser le nouvel endpoint POST /api/participants/process pour récupérer tous les participants en une seule requête
            const response = await fetch(`${baseUrl}/api/participants/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ participantIds: selectedIds })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('📊 Réponse du backend:', result);

            // Le backend retourne { data: [...] } ou directement un tableau
            const participantsData = result.data || result;
            
            if (!Array.isArray(participantsData)) {
                throw new Error('Format de réponse invalide : attendu un tableau');
            }

            console.log('📊 Participants reçus:', participantsData.length);

            // Traiter les données (par exemple, les ajouter à la section d'analyse)
            this.importParticipantsData(participantsData);

            if (!silent) {
                alert(`${participantsData.length} participant(s) traité(s) avec succès`);
            } else {
                console.log(`✅ ${participantsData.length} participant(s) préchargé(s) avec succès`);
            }
        } catch (error) {
            console.error('Erreur lors du traitement:', error);
            if (!silent) {
                alert(`Erreur lors du traitement des participants: ${error.message}`);
            } else {
                console.error('❌ Erreur lors du préchargement:', error.message);
            }
        } finally {
            if (processBtn) {
                processBtn.disabled = false;
                const processBtnText = window.i18n && window.i18n.loaded ? 
                    window.i18n.t('analytics.process_selected') : 'Traiter les participants sélectionnés';
                processBtn.textContent = processBtnText;
            }
        }
    }

    importParticipantsData(participantsData) {
        console.log('📊 importParticipantsData - Données reçues:', participantsData);
        console.log('📊 Nombre de participants:', participantsData.length);
        
        // Convertir les données des participants au format attendu par analytics.js
        const formattedData = participantsData.map(participant => {
            console.log('📊 Participant:', participant.participantId || participant.id);
            console.log('📊 Expériences:', participant.experiments);
            
            // Récupérer toutes les expériences du participant
            const experiments = participant.experiments || [];
            
            return experiments.map(experiment => {
                const formatted = {
                    participant: {
                        id: participant.participantId || participant.id,
                        languageGroup: participant.nativeLanguage === 'french' ? 'fr' :
                                      participant.nativeLanguage === 'portuguese' ? 'pt' : null,
                        germanLevel: participant.germanLevel,
                        learningDuration: participant.learningDuration,
                        age: participant.age || null,
                        gender: participant.gender || null,
                        feeling: participant.feeling || null,
                        educationLevel: participant.educationLevel || null,
                        germanUsageFrequency: participant.germanUsageFrequency || null,
                        startTime: participant.startTime
                    },
                    experiment: {
                        config: experiment.config || {},
                        endTime: experiment.endTime,
                        data: experiment.trials || experiment.data || []
                    }
                };
                
                console.log('📊 Expérience formatée:', formatted);
                console.log('📊 Nombre de trials:', formatted.experiment.data.length);
                
                return formatted;
            });
        }).flat();

        console.log('📊 Données formatées totales:', formattedData);
        console.log('📊 Nombre d\'expériences formatées:', formattedData.length);

        // Déclencher un événement personnalisé pour que analytics.js puisse traiter ces données
        const event = new CustomEvent('participantsDataLoaded', { detail: formattedData });
        console.log('📊 Événement participantsDataLoaded déclenché');
        document.dispatchEvent(event);
    }
}

// Initialisation
let databaseAnalytics;
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si on est sur la page analytics-enhanced
    if (document.getElementById('participants-table')) {
        databaseAnalytics = new DatabaseAnalytics();
        // Charger automatiquement les participants au chargement de la page
        databaseAnalytics.loadParticipants();
    }
});

