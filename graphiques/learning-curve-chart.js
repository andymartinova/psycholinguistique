// Graphique de courbe d'apprentissage
class LearningCurveChart {
    constructor(containerId, data) {
        this.containerId = containerId;
        this.data = data;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const chartData = this.prepareData();
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
        if (Object.keys(chartData).length === 0) return;

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

        // Trouver le nombre maximum d'essais
        const maxTrials = Math.max(...Object.values(chartData).map(trials => trials.length));
        const xScale = chartWidth / (maxTrials - 1);
        const yScale = chartHeight / 100; // Précision de 0 à 100%

        // Couleurs pour les participants
        const colors = ['#4299e1', '#48bb78', '#ed8936', '#f56565', '#9f7aea', '#38b2ac'];
        let colorIndex = 0;

        // Dessiner les lignes pour chaque participant (AVANT les points)
        Object.entries(chartData).forEach(([participantId, trials]) => {
            const color = colors[colorIndex % colors.length];
            colorIndex++;

            // Dessiner la ligne en premier
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();

            trials.forEach((trial, index) => {
                const x = margin + (trial.trialNumber - 1) * xScale;
                const y = canvas.height - margin - trial.accuracy * yScale;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        });

        // Maintenant dessiner les points par-dessus les lignes
        colorIndex = 0;
        Object.entries(chartData).forEach(([participantId, trials]) => {
            const color = colors[colorIndex % colors.length];
            colorIndex++;

            trials.forEach((trial, index) => {
                const x = margin + (trial.trialNumber - 1) * xScale;
                const y = canvas.height - margin - trial.accuracy * yScale;

                // Point avec bordure blanche pour le contraste
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();

                // Bordure blanche pour le contraste
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Bordure de couleur
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Label du participant
            const lastTrial = trials[trials.length - 1];
            const x = margin + (lastTrial.trialNumber - 1) * xScale;
            const y = canvas.height - margin - lastTrial.accuracy * yScale;

            ctx.fillStyle = '#2d3748';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(participantId, x + 10, y);
        });

        // Axe X (Numéro d'essai)
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin, canvas.height - margin);
        ctx.lineTo(canvas.width - margin, canvas.height - margin);
        ctx.stroke();

        // Graduations X
        const xSteps = Math.min(10, maxTrials); // Maximum 10 graduations
        for (let i = 0; i <= xSteps; i++) {
            const x = margin + (i / xSteps) * chartWidth;
            const trialNumber = Math.round((i / xSteps) * maxTrials);
            
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - margin - 5);
            ctx.lineTo(x, canvas.height - margin + 5);
            ctx.stroke();

            ctx.fillStyle = '#718096';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(trialNumber, x, canvas.height - margin + 20);
        }

        // Axe Y (Précision)
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, canvas.height - margin);
        ctx.stroke();

        // Graduations Y
        for (let i = 0; i <= 100; i += 20) {
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
            ctx.fillText(`${i}%`, margin - 10, y + 3);
        }

        // Titres des axes
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Numéro d\'essai', canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(20, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Précision cumulative (%)', 0, 0);
        ctx.restore();

        // Titre principal
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Courbe d\'apprentissage', canvas.width / 2, 20);
    }
} 