// Graphique de courbe du temps de réponse avec Chart.js
class ResponseTimeCurveChart {
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
        // Grouper les données par participant et calculer le temps de réponse par essai
        const participants = [...new Set(this.data.map(d => d.participantId))];
        const datasets = [];

        participants.forEach((participantId, index) => {
            const participantData = this.data.filter(d => d.participantId === participantId);
            const trials = [];

            // Créer un point pour chaque essai avec le temps de réponse
            participantData.forEach((trial, trialIndex) => {
                trials.push({
                    x: trialIndex + 1,
                    y: trial.responseTime
                });
            });

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
                data: trials,
                borderColor: colors[index % colors.length].replace('0.8', '1'),
                backgroundColor: colors[index % colors.length].replace('0.8', '0.1'),
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
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
        // Créer le canvas
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '400px';
        container.appendChild(canvas);

        // Configuration Chart.js
        const config = {
            type: 'line',
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
                                return `Essai ${context[0].parsed.x}`;
                            },
                            label: function(context) {
                                return `${context.dataset.label}: ${formatResponseTime(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
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
                            text: 'Temps de réponse',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#4a5568'
                        }
                    },
                    x: {
                        type: 'linear',
                        ticks: {
                            stepSize: 6,
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
                            text: 'Numéro d\'essai',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#4a5568',
                            align: 'start'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
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
