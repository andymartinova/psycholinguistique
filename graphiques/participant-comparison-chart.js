// Graphique de comparaison entre participants avec Chart.js
class ParticipantComparisonChart {
    constructor(containerId, importedData) {
        this.containerId = containerId;
        this.importedData = importedData;
        this.chart = null;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        container.innerHTML = '';

        const chartData = this.prepareData();
        if (Object.keys(chartData).length === 0) {
            container.innerHTML = '<p class="no-data">Aucune donnée de participant disponible pour la comparaison.</p>';
            return;
        }

        if (Object.keys(chartData).length === 1) {
            container.innerHTML = '<p class="no-data">Un seul participant disponible. La comparaison nécessite au moins 2 participants.</p>';
            return;
        }

        this.createChart(container, chartData);
    }

    prepareData() {
        // Grouper les données par participant et créer des courbes temporelles
        const chartData = {};
        
        this.importedData.forEach(fileInfo => {
            const data = fileInfo.data.experiment.data;
            const participantId = fileInfo.data.participant?.id || 'N/A';
            const languageGroup = fileInfo.data.participant?.languageGroup || 'N/A';
            
            // Vérifier que les données sont valides
            if (!data || data.length === 0) {
                console.warn(`Données invalides pour le participant ${participantId}`);
                return;
            }
            
            // Créer des points temporels pour chaque essai
            const timePoints = [];
            let cumulativeCorrect = 0;
            
            data.forEach((trial, index) => {
                if (trial.correct) cumulativeCorrect++;
                const accuracy = (cumulativeCorrect / (index + 1)) * 100;
                
                timePoints.push({
                    trialNumber: index + 1,
                    accuracy: accuracy,
                    responseTime: trial.responseTime || 0,
                    correct: trial.correct
                });
            });
            
            chartData[participantId] = {
                languageGroup: languageGroup,
                timePoints: timePoints,
                totalTrials: data.length
            };
        });
        
        return chartData;
    }

    createChart(container, chartData) {
        // Créer le canvas pour Chart.js
        const canvas = document.createElement('canvas');
        canvas.id = `${this.containerId}-chart`;
        canvas.className = 'chart';
        container.appendChild(canvas);

        // Détruire l'ancien graphique si besoin
        if (this.chart) {
            this.chart.destroy();
        }

        // Trouver le nombre maximum d'essais pour l'axe X
        const maxTrials = Math.max(...Object.values(chartData).map(p => p.totalTrials));
        const xLabels = Array.from({length: maxTrials}, (_, i) => i + 1);

        // Couleurs fixes pour l'ordre d'affichage
        const colorList = ['#4299e1', '#48bb78', '#718096', '#ed8936', '#9f7aea', '#38b2ac'];
        const participantIds = Object.keys(chartData);

        // Préparer les datasets pour Chart.js
        const datasets = participantIds.map((participantId, idx) => {
            const participantData = chartData[participantId];
            const color = colorList[idx % colorList.length];
            
            // Créer un tableau de données avec des valeurs pour tous les essais
            const data = new Array(maxTrials).fill(null);
            participantData.timePoints.forEach(point => {
                data[point.trialNumber - 1] = point.accuracy;
            });

            return {
                label: participantId,
                data: data,
                borderColor: color,
                backgroundColor: color + '20', // 20% d'opacité
                fill: false,
                tension: 0.1,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: color,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                spanGaps: false // Ne pas connecter les points manquants
            };
        });

        // Créer le graphique Chart.js
        this.chart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: xLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 20,
                        bottom: 20
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution de la performance par participant',
                        font: { size: 18, weight: 'bold' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function(context) {
                                return `Essai ${context[0].label}`;
                            },
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Numéro d\'essai',
                            font: { size: 14, weight: 'bold' }
                        },
                        ticks: {
                            font: { size: 12 }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Précision cumulative (%)',
                            font: { size: 14, weight: 'bold' }
                        },
                        ticks: {
                            font: { size: 12 },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
} 