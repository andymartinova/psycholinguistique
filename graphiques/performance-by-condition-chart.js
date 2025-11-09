// Graphique de performance par condition avec Chart.js
class PerformanceByConditionChart {
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
        if (chartData.length === 0) {
            container.innerHTML = '<p class="no-data">Aucune donnée disponible</p>';
            return;
        }

        this.createChart(container, chartData);
    }

    prepareData() {
        const conditions = ['simple_non_ambiguous', 'complex_non_ambiguous', 'simple_ambiguous', 'complex_ambiguous'];
        const labels = {
            'simple_non_ambiguous': 'Simple',
            'complex_non_ambiguous': 'Complexe',
            'simple_ambiguous': 'Amb. simple',
            'complex_ambiguous': 'Amb. complexe'
        };
        return conditions.map(condition => {
            const conditionData = this.data.filter(d => d.condition === condition);
            const accuracy = conditionData.length > 0 
                ? (conditionData.filter(d => d.correct).length / conditionData.length) * 100 
                : 0;
            return {
                condition: labels[condition] || condition,
                accuracy: accuracy,
                trials: conditionData.length
            };
        });
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

        // Préparer les données pour Chart.js
        const labels = chartData.map(d => d.condition);
        const accuracies = chartData.map(d => d.accuracy);
        const trials = chartData.map(d => d.trials);

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
                        borderWidth: 2,
                        borderRadius: 4,
                        borderSkipped: false
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
                        top: 20,
                        bottom: 20
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance par condition',
                        font: { size: 18, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                return `Essais: ${trials[context.dataIndex]}`;
                            }
                        }
                    },
                    legend: { display: false }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Conditions expérimentales',
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
                            text: 'Précision (%)',
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
                }
            }
        });
    }
} 