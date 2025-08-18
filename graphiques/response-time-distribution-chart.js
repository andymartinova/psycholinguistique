// Graphique de distribution des temps de réponse avec Chart.js
class ResponseTimeDistributionChart {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data;
        this.chart = null;
        this.init();
    }

    init() {
        console.log('ResponseTimeDistributionChart init called for container:', this.containerId);
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('Container not found:', this.containerId);
            return;
        }
        console.log('Container found, preparing data...');
        const chartData = this.prepareData();
        console.log('Chart data prepared:', chartData);
        this.createChart(container, chartData);
    }

    prepareData() {
        // Extraire tous les temps de réponse valides
        const responseTimes = this.data
            .map(d => d.responseTime)
            .filter(time => time !== null && time !== undefined && !isNaN(time) && time > 0);

        if (responseTimes.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Calculer les statistiques pour créer les bins
        const minTime = Math.min(...responseTimes);
        const maxTime = Math.max(...responseTimes);
        const range = maxTime - minTime;
        
        // Créer des bins (plages) de 500ms
        const binSize = 500;
        const numBins = Math.ceil(range / binSize) + 1;
        const bins = [];
        
        for (let i = 0; i < numBins; i++) {
            const binStart = minTime + (i * binSize);
            const binEnd = binStart + binSize;
            const count = responseTimes.filter(time => time >= binStart && time < binEnd).length;
            
            bins.push({
                start: binStart,
                end: binEnd,
                count: count,
                label: `${Math.round(binStart)}-${Math.round(binEnd)}ms`
            });
        }

        // Grouper par participant si plusieurs participants
        const participants = [...new Set(this.data.map(d => d.participantId))];
        
        if (participants.length === 1) {
            // Un seul participant - histogramme simple
            return {
                labels: bins.map(bin => bin.label),
                datasets: [{
                    label: 'Fréquence',
                    data: bins.map(bin => bin.count),
                    backgroundColor: 'rgba(66, 153, 225, 0.8)',
                    borderColor: 'rgba(66, 153, 225, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            };
        } else {
            // Plusieurs participants - histogrammes groupés
            const datasets = [];
            const colors = [
                'rgba(66, 153, 225, 0.8)',
                'rgba(72, 187, 120, 0.8)',
                'rgba(237, 137, 54, 0.8)',
                'rgba(245, 101, 101, 0.8)',
                'rgba(159, 122, 234, 0.8)',
                'rgba(56, 178, 172, 0.8)'
            ];

            participants.forEach((participantId, index) => {
                const participantData = this.data.filter(d => d.participantId === participantId);
                const participantTimes = participantData
                    .map(d => d.responseTime)
                    .filter(time => time !== null && time !== undefined && !isNaN(time) && time > 0);

                const participantBins = bins.map(bin => {
                    return participantTimes.filter(time => time >= bin.start && time < bin.end).length;
                });

                datasets.push({
                    label: participantId,
                    data: participantBins,
                    backgroundColor: colors[index % colors.length],
                    borderColor: colors[index % colors.length].replace('0.8', '1'),
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                });
            });

            return {
                labels: bins.map(bin => bin.label),
                datasets: datasets
            };
        }
    }

    createChart(container, chartData) {
        if (chartData.datasets.length === 0) {
            container.innerHTML = '<p>Aucune donnée de temps de réponse disponible.</p>';
            return;
        }

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
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} essais`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
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
                            text: 'Nombre d\'essais',
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
                                size: 10
                            },
                            maxRotation: 45
                        },
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Plages de temps de réponse',
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
