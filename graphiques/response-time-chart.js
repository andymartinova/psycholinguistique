// Graphique de temps de réponse par condition avec Chart.js
class ResponseTimeChart {
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
        const conditions = ['simple_non_ambiguous', 'complex_non_ambiguous', 'ambiguous_easy', 'ambiguous_difficult'];
        const conditionLabels = {
            'simple_non_ambiguous': 'Simple Non-Ambigu',
            'complex_non_ambiguous': 'Complexe Non-Ambigu',
            'ambiguous_easy': 'Ambigu Facile',
            'ambiguous_difficult': 'Ambigu Difficile'
        };

        // Grouper par participant et condition
        const participants = [...new Set(this.data.map(d => d.participantId))];
        const datasets = [];

        participants.forEach((participantId, index) => {
            const participantData = conditions.map(condition => {
                const conditionData = this.data.filter(d => d.condition === condition && d.participantId === participantId);
                const avgResponseTime = conditionData.length > 0 
                    ? conditionData.reduce((sum, d) => sum + (d.responseTime || 0), 0) / conditionData.length 
                    : 0;
                return avgResponseTime;
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
                data: participantData,
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.8', '1'),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            });
        });

        return {
            labels: Object.values(conditionLabels),
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
            type: 'bar',
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
                            text: 'Temps de réponse moyen',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#4a5568'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Conditions expérimentales',
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