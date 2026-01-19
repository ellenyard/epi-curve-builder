// Export Module
// Handles PNG, SVG, and CSV exports

class ExportManager {
    constructor(chart, dataManager) {
        this.chart = chart;
        this.dataManager = dataManager;
    }

    // Export chart as PNG
    async exportPNG(filename = 'epi-curve.png') {
        const svgElement = this.chart.getSVGElement();
        if (!svgElement || !svgElement.classList.contains('visible')) {
            alert('No chart to export. Please add some case data first.');
            return;
        }

        try {
            // Get SVG dimensions
            const svgRect = svgElement.getBoundingClientRect();
            const width = svgRect.width || 800;
            const height = svgRect.height || 500;

            // Create canvas
            const canvas = document.createElement('canvas');
            const scale = 2; // For higher resolution
            canvas.width = width * scale;
            canvas.height = height * scale;

            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);

            // Get SVG string
            const svgString = this.chart.getSVGString();

            // Create image from SVG
            const img = new Image();
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            return new Promise((resolve, reject) => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, width, height);
                    URL.revokeObjectURL(url);

                    // Download
                    canvas.toBlob((blob) => {
                        if (blob) {
                            this.downloadBlob(blob, filename);
                            resolve();
                        } else {
                            reject(new Error('Failed to create PNG blob'));
                        }
                    }, 'image/png');
                };

                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error('Failed to load SVG image'));
                };

                img.src = url;
            });
        } catch (error) {
            console.error('PNG export error:', error);
            alert('Failed to export PNG. Please try again.');
        }
    }

    // Export chart as SVG
    exportSVG(filename = 'epi-curve.svg') {
        const svgElement = this.chart.getSVGElement();
        if (!svgElement || !svgElement.classList.contains('visible')) {
            alert('No chart to export. Please add some case data first.');
            return;
        }

        try {
            const svgString = this.chart.getSVGString();
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            this.downloadBlob(blob, filename);
        } catch (error) {
            console.error('SVG export error:', error);
            alert('Failed to export SVG. Please try again.');
        }
    }

    // Export case data as CSV
    exportCSV(filename = 'case-data.csv') {
        const csvContent = this.dataManager.exportToCSV();

        if (!csvContent) {
            alert('No data to export. Please add some cases first.');
            return;
        }

        try {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            this.downloadBlob(blob, filename);
        } catch (error) {
            console.error('CSV export error:', error);
            alert('Failed to export CSV. Please try again.');
        }
    }

    // Download a CSV template
    downloadTemplate(filename = 'epi-curve-template.csv') {
        const template = window.generateCSVTemplate();
        const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
        this.downloadBlob(blob, filename);
    }

    // Helper function to trigger download
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Generate filename with date
    generateFilename(base, extension) {
        const date = new Date().toISOString().split('T')[0];
        return `${base}-${date}.${extension}`;
    }
}

// Export for use in other modules
window.ExportManager = ExportManager;
