// Graphique de matrice de confusion avec Chart.js
class ConfusionMatrixChart {
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

        // Créer la matrice de confusion
        const matrix = [];
        const labels = Object.values(conditionLabels);

        conditions.forEach((condition, i) => {
            const conditionData = this.data.filter(d => d.condition === condition);
            const row = [];

            conditions.forEach((targetCondition, j) => {
                // Compter les réponses correctes vs incorrectes
                const correct = conditionData.filter(d => d.correct).length;
                const incorrect = conditionData.filter(d => !d.correct).length;
                
                // Pour la diagonale (réponses correctes)
                if (i === j) {
                    row.push(correct);
                } else {
                    // Hors diagonale (erreurs)
                    row.push(incorrect);
                }
            });

            matrix.push(row);
        });

        // Créer les données pour Chart.js
        const datasets = [];
        const colors = [
            'rgba(72, 187, 120, 0.8)',  // Vert pour les corrects
            'rgba(245, 101, 101, 0.8)', // Rouge pour les erreurs
            'rgba(237, 137, 54, 0.8)',  // Orange
            'rgba(66, 153, 225, 0.8)'   // Bleu
        ];

        matrix.forEach((row, i) => {
            row.forEach((value, j) => {
                const isCorrect = i === j;
                const color = isCorrect ? colors[0] : colors[1];
                
                datasets.push({
                    label: `${labels[i]} → ${labels[j]}`,
                    data: [{
                        x: labels[j],
                        y: labels[i],
                        v: value
                    }],
                    backgroundColor: color,
                    borderColor: color.replace('0.8', '1'),
                    borderWidth: 1,
                    borderRadius: 4
                });
            });
        });

        return {
            labels: labels,
            datasets: datasets
        };
    }

    createChart(container, chartData) {
        if (chartData.datasets.length === 0) {
            container.innerHTML = '<p>Aucune donnée disponible pour la matrice de confusion.</p>';
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
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#4299e1',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            title: function(context) {
                                return context[0].raw.x + ' → ' + context[0].raw.y;
                            },
                            label: function(context) {
                                return `Nombre: ${context.raw.v}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        position: 'bottom',
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
                            text: 'Réponse donnée',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#4a5568'
                        }
                    },
                    y: {
                        type: 'category',
                        position: 'left',
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
                            text: 'Condition réelle',
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
