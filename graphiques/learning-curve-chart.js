// Graphique de courbe d'apprentissage avec Chart.js
class LearningCurveChart {
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
        if (Object.keys(chartData).length === 0) {
            container.innerHTML = '<p class="no-data">Aucune donnée disponible</p>';
            return;
        }

        this.createChart(container, chartData);
    }

    prepareData() {
        // Grouper les données par participant et calculer la performance par essai individuel
        const participants = [...new Set(this.data.map(d => d.participantId))];
        const chartData = {};

        participants.forEach(participantId => {
            const participantData = this.data.filter(d => d.participantId === participantId);
            const trials = [];

            // Créer un point pour chaque essai avec la précision cumulative
            let cumulativeCorrect = 0;
            participantData.forEach((trial, index) => {
                if (trial.correct) cumulativeCorrect++;
                const accuracy = (cumulativeCorrect / (index + 1)) * 100;
                
                trials.push({
                    trialNumber: index + 1,
                    accuracy: accuracy,
                    responseTime: trial.responseTime,
                    correct: trial.correct
                });
            });

            chartData[participantId] = trials;
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
        const maxTrials = Math.max(...Object.values(chartData).map(trials => trials.length));
        const xLabels = Array.from({length: maxTrials}, (_, i) => i + 1);

        // Couleurs pour les participants
        const colors = ['#4299e1', '#48bb78', '#ed8936', '#f56565', '#9f7aea', '#38b2ac'];

        // Préparer les datasets pour Chart.js
        const datasets = Object.entries(chartData).map(([participantId, trials], index) => {
            const color = colors[index % colors.length];
            
            // Créer un tableau de données avec des valeurs pour tous les essais
            const data = new Array(maxTrials).fill(null);
            trials.forEach(trial => {
                data[trial.trialNumber - 1] = trial.accuracy;
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
                        text: 'Courbe d\'apprentissage',
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