// Graphique de comparaison entre participants
class ParticipantComparisonChart {
    constructor(containerId, importedData) {
        this.containerId = containerId;
        this.importedData = importedData;
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const chartData = this.prepareData();
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
        if (Object.keys(chartData).length === 0) {
            container.innerHTML = '<p>Aucune donnée de participant disponible pour la comparaison.</p>';
            return;
        }

        if (Object.keys(chartData).length === 1) {
            container.innerHTML = '<p>Un seul participant disponible. La comparaison nécessite au moins 2 participants.</p>';
            return;
        }

        // Debug: afficher les données
        console.log('Données du graphique de comparaison:', chartData);

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
        const maxTrials = Math.max(...Object.values(chartData).map(p => p.totalTrials));
        const xScale = chartWidth / (maxTrials - 1);
        const yScale = chartHeight / 100; // Précision de 0 à 100%

        // Couleurs par groupe linguistique
        const colors = {
            'LF': '#4299e1',
            'LP': '#48bb78'
        };

        // Dessiner les courbes pour chaque participant (AVANT les points)
        Object.entries(chartData).forEach(([participantId, participantData]) => {
            const color = colors[participantData.languageGroup] || '#718096';

            // Dessiner la ligne en premier
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();

            participantData.timePoints.forEach((point, index) => {
                const x = margin + (point.trialNumber - 1) * xScale;
                const y = canvas.height - margin - point.accuracy * yScale;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        });

        // Maintenant dessiner les points par-dessus les lignes
        Object.entries(chartData).forEach(([participantId, participantData]) => {
            const color = colors[participantData.languageGroup] || '#718096';

            participantData.timePoints.forEach((point, index) => {
                const x = margin + (point.trialNumber - 1) * xScale;
                const y = canvas.height - margin - point.accuracy * yScale;

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

            // Label du participant à la fin de sa courbe
            const lastPoint = participantData.timePoints[participantData.timePoints.length - 1];
            const x = margin + (lastPoint.trialNumber - 1) * xScale;
            const y = canvas.height - margin - lastPoint.accuracy * yScale;

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
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = canvas.height - margin - (i / ySteps) * chartHeight;
            const value = (i / ySteps) * 100; // Échelle fixe de 0 à 100%
            
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(margin - 5, y);
            ctx.lineTo(margin + 5, y);
            ctx.stroke();

            ctx.fillStyle = '#718096';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${value.toFixed(0)}%`, margin - 10, y + 3);
        }

        // Légende
        const legendY = 30;
        Object.entries(colors).forEach(([group, color], index) => {
            const legendX = canvas.width - 150 + index * 60;
            
            // Point de la légende
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(legendX, legendY, 6, 0, 2 * Math.PI);
            ctx.fill();

            // Bordure blanche
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Bordure de couleur
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Texte de la légende
            ctx.fillStyle = '#2d3748';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(group, legendX + 12, legendY + 4);
        });

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
        ctx.fillText('Évolution de la performance par participant', canvas.width / 2, 20);
    }
} 