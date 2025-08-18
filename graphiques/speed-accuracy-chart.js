// Graphique de corrélation temps de réponse vs précision avec Chart.js
class SpeedAccuracyChart {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data;
        this.chart = null;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const chartData = this.prepareData();
        this.createChart(container, chartData);
    }

    prepareData() {
        // Grouper par participant et calculer les moyennes
        const participants = [...new Set(this.data.map(d => d.participantId))];
        const datasets = [];

        participants.forEach((participantId, index) => {
            const participantData = this.data.filter(d => d.participantId === participantId);
            
            // Calculer la précision globale du participant
            const totalTrials = participantData.length;
            const correctTrials = participantData.filter(d => d.correct).length;
            const accuracy = (correctTrials / totalTrials) * 100;
            
            // Calculer le temps de réponse moyen
            const validResponseTimes = participantData
                .map(d => d.responseTime)
                .filter(time => time !== null && time !== undefined && !isNaN(time) && time > 0);
            
            const avgResponseTime = validResponseTimes.length > 0 
                ? validResponseTimes.reduce((sum, time) => sum + time, 0) / validResponseTimes.length 
                : 0;

            const colors = [
                'rgba(66, 153, 225, 0.8)',
                'rgba(72, 187, 120, 0.8)',
                'rgba(237, 137, 54, 0.8)',
                'rgba(245, 101, 101, 0.8)',
                'rgba(159, 122, 234, 0.8)',
                'rgba(56, 178, 172, 0.8)'
            ];

            datasets.push({
                label: participantId,
                data: [{
                    x: avgResponseTime,
                    y: accuracy
                }],
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.8', '1'),
                borderWidth: 3,
                pointRadius: 8,
                pointHoverRadius: 12,
                pointBackgroundColor: colors[index % colors.length].replace('0.8', '1'),
                pointBorderColor: 'white',
                pointBorderWidth: 2
            });
        });

        return {
            datasets: datasets
        };
    }

    createChart(container, chartData) {
        if (chartData.datasets.length === 0) {
            container.innerHTML = '<p>Aucune donnée disponible pour l\'analyse vitesse-précision.</p>';
            return;
        }

        // Créer le canvas
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '400px';
        container.appendChild(canvas);

        // Configuration Chart.js
        const config = {
            type: 'scatter',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 10,
                            font: {
                                size: 11,
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#4299e1',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                return context[0].dataset.label;
                            },
                            label: function(context) {
                                return [
                                    `Temps moyen: ${formatResponseTime(context.parsed.x)}`,
                                    `Précision: ${context.parsed.y.toFixed(1)}%`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        ticks: {
                            callback: function(value) {
                                return formatResponseTime(value);
                            },
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'Temps de réponse moyen',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#4a5568'
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        title: {
                            display: true,
                            text: 'Précision (%)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#4a5568'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'point'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10
                    }
                }
            }
        };

        // Créer le graphique
        this.chart = new Chart(canvas, config);
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
        }
    }
}
