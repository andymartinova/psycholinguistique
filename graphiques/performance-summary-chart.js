// Graphique de résumé de performance global avec Chart.js
class PerformanceSummaryChart {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data;
        this.chart = null;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        container.innerHTML = '';

        const chartData = this.prepareData();
        if (chartData.totalTrials === 0) {
            container.innerHTML = '<p class="no-data">Aucune donnée disponible</p>';
            return;
        }

        // Afficher les statistiques principales
        const statsDiv = document.createElement('div');
        statsDiv.className = 'ps-stats';
        statsDiv.innerHTML = `
            <div class="ps-stat-card"><div class="ps-stat-label">Total essais</div><div class="ps-stat-value">${chartData.totalTrials}</div></div>
            <div class="ps-stat-card"><div class="ps-stat-label">Participants</div><div class="ps-stat-value">${chartData.totalParticipants}</div></div>
            <div class="ps-stat-card"><div class="ps-stat-label">Précision globale</div><div class="ps-stat-value">${chartData.overallAccuracy.toFixed(1)}%</div></div>
            <div class="ps-stat-card"><div class="ps-stat-label">Temps moyen</div><div class="ps-stat-value">${chartData.averageResponseTime.toFixed(0)} ms</div></div>
        `;
        statsDiv.style.display = 'flex';
        statsDiv.style.gap = '24px';
        statsDiv.style.justifyContent = 'center';
        statsDiv.style.marginBottom = '32px';
        container.appendChild(statsDiv);

        // Créer le canvas pour Chart.js
        const canvas = document.createElement('canvas');
        canvas.id = `${this.containerId}-chart`;
        canvas.className = 'chart';
        // Ne pas fixer width/height ici, laisser Chart.js gérer le responsive
        container.appendChild(canvas);

        // Préparer les données pour Chart.js
        const labels = chartData.conditions.map(c => c.condition);
        const accuracies = chartData.conditions.map(c => isNaN(c.accuracy) ? 0 : c.accuracy);
        const essais = chartData.conditions.map(c => c.trials);
        const labelsLongs = chartData.conditions.map(c => c.conditionLong);

        // Détruire l'ancien graphique si besoin
        if (this.chart) {
            this.chart.destroy();
        }

        // Créer le graphique Chart.js
        this.chart = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Précision (%)',
                        data: accuracies,
                        backgroundColor: [
                            '#4299e1', '#48bb78', '#ed8936', '#f56565'
                        ],
                        borderColor: '#2d3748',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 110 // encore plus d'espace en bas pour les labels inclinés
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance par condition',
                        font: { size: 18 }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                // Afficher le label long dans le tooltip
                                return labelsLongs[context[0].dataIndex];
                            },
                            afterLabel: function(context) {
                                return `Essais: ${chartData.conditions[context.dataIndex].trials}`;
                            }
                        }
                    },
                    legend: { display: false }
                },
                scales: {
                    x: {
                        title: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 60,
                            minRotation: 45,
                            autoSkip: false,
                            padding: 10,
                            font: { size: 12 }
                        },
                        offset: true
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Précision (%)'
                        },
                        ticks: {
                            padding: 12
                        }
                    }
                }
            }
        });
    }

    prepareData() {
        if (!this.data || this.data.length === 0) {
            return {
                totalTrials: 0,
                totalParticipants: 0,
                overallAccuracy: 0,
                averageResponseTime: 0,
                conditions: []
            };
        }

        // Mapping pour labels courts et longs
        const labelMap = {
            'simple_non_ambiguous': { short: 'Simple', long: 'Simple, non ambiguë' },
            'complex_non_ambiguous': { short: 'Complexe', long: 'Complexe, non ambiguë' },
            'simple_ambiguous': { short: 'Amb. simple', long: 'Simple, ambiguë' },
            'complex_ambiguous': { short: 'Amb. complexe', long: 'Complexe, ambiguë' },
            'ambiguous_easy': { short: 'Amb. facile', long: 'Ambiguë, résolution facile' }, // Ancien nom (compatibilité)
            'ambiguous_difficult': { short: 'Amb. diff.', long: 'Ambiguë, résolution difficile' } // Ancien nom (compatibilité)
        };

        // Calculer les statistiques globales
        const totalTrials = this.data.length;
        const totalParticipants = new Set(this.data.map(d => d.participantId)).size;
        const correctResponses = this.data.filter(d => d.correct).length;
        const overallAccuracy = (correctResponses / totalTrials) * 100;
        const totalResponseTime = this.data.reduce((sum, d) => sum + (d.responseTime || 0), 0);
        const averageResponseTime = totalResponseTime / totalTrials;

        // Statistiques par condition
        const conditions = ['simple_non_ambiguous', 'complex_non_ambiguous', 'simple_ambiguous', 'complex_ambiguous'];
        const conditionStats = conditions.map(condition => {
            const conditionData = this.data.filter(d => d.condition === condition);
            if (conditionData.length === 0) return null;

            const conditionCorrect = conditionData.filter(d => d.correct).length;
            const conditionAccuracy = (conditionCorrect / conditionData.length) * 100;
            const conditionAvgTime = conditionData.reduce((sum, d) => sum + (d.responseTime || 0), 0) / conditionData.length;

            return {
                condition: labelMap[condition]?.short || condition,
                conditionLong: labelMap[condition]?.long || condition,
                trials: conditionData.length,
                accuracy: conditionAccuracy,
                avgResponseTime: conditionAvgTime
            };
        }).filter(Boolean);

        return {
            totalTrials,
            totalParticipants,
            overallAccuracy,
            averageResponseTime,
            conditions: conditionStats
        };
    }

    getConditionLabel(condition) {
        const labels = {
            'simple_non_ambiguous': 'Simple, non ambiguë',
            'complex_non_ambiguous': 'Complexe, non ambiguë',
            'ambiguous_easy': 'Ambiguë, résolution facile',
            'ambiguous_difficult': 'Ambiguë, résolution difficile'
        };
        return labels[condition] || condition;
    }
}

// N'oublie pas d'inclure Chart.js dans ton HTML :
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
// Et ajoute un peu de CSS pour .ps-stats et .ps-stat-card si tu veux un rendu plus joli. 