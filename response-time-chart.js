// Graphique de temps de réponse par condition
class ResponseTimeChart {
    constructor(containerId, data, labels) {
        this.containerId = containerId;
        this.data = data;
        this.labels = labels || {
            'simple_non_ambiguous': 'Simple, non ambiguë',
            'complex_non_ambiguous': 'Complexe, non ambiguë',
            'ambiguous_easy': 'Ambiguë, résolution facile',
            'ambiguous_difficult': 'Ambiguë, résolution difficile'
        };
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
        return conditions.map(condition => {
            const conditionData = this.data.filter(d => d.condition === condition);
            const avgResponseTime = conditionData.length > 0 
                ? conditionData.reduce((sum, d) => sum + (d.responseTime || 0), 0) / conditionData.length 
                : 0;
            return {
                condition: this.labels[condition] || condition,
                avgResponseTime: avgResponseTime,
                trials: conditionData.length
            };
        });
    }

    createChart(container, chartData) {
        if (chartData.length === 0) return;

        // Créer le canvas
        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth;
        canvas.height = 300;
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Configuration du graphique
        const margin = 60;
        const chartWidth = canvas.width - 2 * margin;
        const chartHeight = canvas.height - 2 * margin;
        const barWidth = chartWidth / chartData.length * 0.8;
        const barSpacing = chartWidth / chartData.length * 0.2;

        // Trouver le temps de réponse maximal pour l'échelle
        const maxResponseTime = Math.max(...chartData.map(d => d.avgResponseTime));
        const yScale = chartHeight / Math.max(maxResponseTime, 1000);

        // Couleurs pour les barres
        const colors = ['#4299e1', '#48bb78', '#ed8936', '#f56565'];

        // Dessiner les barres
        chartData.forEach((item, index) => {
            const x = margin + index * (barWidth + barSpacing) + barSpacing / 2;
            const barHeight = item.avgResponseTime * yScale;
            const y = canvas.height - margin - barHeight;

            // Barre
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(x, y, barWidth, barHeight);

            // Bordure
            ctx.strokeStyle = '#2d3748';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, barWidth, barHeight);

            // Valeur de temps de réponse
            ctx.fillStyle = '#2d3748';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${item.avgResponseTime.toFixed(0)}ms`, x + barWidth / 2, y - 10);

            // Nombre d'essais
            ctx.font = '10px Arial';
            ctx.fillText(`(${item.trials} essais)`, x + barWidth / 2, y - 25);

            // Label de condition
            ctx.fillText(item.condition, x + barWidth / 2, canvas.height - margin + 20);
        });

        // Axe X
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin, canvas.height - margin);
        ctx.lineTo(canvas.width - margin, canvas.height - margin);
        ctx.stroke();

        // Axe Y
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, canvas.height - margin);
        ctx.stroke();

        // Graduations Y
        const maxTime = Math.max(...chartData.map(d => d.avgResponseTime));
        const ySteps = Math.ceil(maxTime / 500) * 500;
        for (let i = 0; i <= ySteps; i += 500) {
            const y = canvas.height - margin - i * yScale;
            
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(margin - 5, y);
            ctx.lineTo(margin + 5, y);
            ctx.stroke();

            ctx.fillStyle = '#718096';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${i}ms`, margin - 10, y + 3);
        }

        // Titres des axes
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Conditions expérimentales', canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(20, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Temps de réponse moyen (ms)', 0, -40);
        ctx.restore();
    }
} 