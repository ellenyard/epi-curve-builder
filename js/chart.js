// Epi Curve Chart Module
// D3.js-based epidemiological curve visualization

class EpiCurveChart {
    constructor(containerId, svgId) {
        this.containerId = containerId;
        this.svgId = svgId;
        this.svg = null;
        this.data = [];
        this.config = {
            binSize: 'day',
            stratifyBy: 'none',
            title: '',
            xAxisLabel: 'Date of Symptom Onset',
            yAxisLabel: 'Number of Cases',
            showGrid: true,
            showCounts: true,
            colorScheme: 'default',
            showFirstCase: false,
            exposure: null,
            interventions: [],
            incubation: null
        };
        this.margin = { top: 60, right: 30, bottom: 80, left: 60 };

        // Color palettes
        this.colorPalettes = {
            default: ['#2563eb'],
            classification: {
                confirmed: '#2563eb',
                probable: '#f59e0b',
                suspected: '#94a3b8'
            },
            sex: {
                male: '#3b82f6',
                female: '#ec4899',
                other: '#8b5cf6',
                unknown: '#64748b'
            },
            ageGroup: {
                '0-4': '#ef4444',
                '5-14': '#f97316',
                '15-24': '#eab308',
                '25-44': '#22c55e',
                '45-64': '#3b82f6',
                '65+': '#8b5cf6'
            },
            outcome: {
                alive: '#22c55e',
                deceased: '#ef4444',
                unknown: '#64748b'
            },
            colorblind: ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#F0E442', '#56B4E9'],
            grayscale: ['#333333', '#666666', '#999999', '#CCCCCC']
        };
    }

    // Set case data
    setData(cases) {
        this.data = cases;
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    // Calculate bin intervals based on bin size
    getBinInterval() {
        switch (this.config.binSize) {
            case 'hour':
                return d3.timeHour.every(1);
            case '6hour':
                return d3.timeHour.every(6);
            case '12hour':
                return d3.timeHour.every(12);
            case 'day':
                return d3.timeDay.every(1);
            case 'week-cdc':
                return d3.timeSunday.every(1); // CDC weeks start on Sunday
            case 'week-iso':
                return d3.timeMonday.every(1); // ISO weeks start on Monday
            default:
                return d3.timeDay.every(1);
        }
    }

    // Format date for x-axis based on bin size
    getDateFormat() {
        switch (this.config.binSize) {
            case 'hour':
                return d3.timeFormat('%b %d %H:%M');
            case '6hour':
            case '12hour':
                return d3.timeFormat('%b %d %H:%M');
            case 'day':
                return d3.timeFormat('%b %d');
            case 'week-cdc':
            case 'week-iso':
                return d3.timeFormat('Wk %W');
            default:
                return d3.timeFormat('%b %d');
        }
    }

    // Bin the data
    binData(cases) {
        if (cases.length === 0) return [];

        const validCases = cases.filter(c => c.onsetDateTime);
        if (validCases.length === 0) return [];

        const interval = this.getBinInterval();

        // Get date range with padding
        const dates = validCases.map(c => c.onsetDateTime);
        let minDate = d3.min(dates);
        let maxDate = d3.max(dates);

        // Add padding
        minDate = interval.floor(new Date(minDate.getTime() - interval.step()));
        maxDate = interval.ceil(new Date(maxDate.getTime() + interval.step()));

        // Create bins
        const bins = d3.bin()
            .value(d => d.onsetDateTime)
            .domain([minDate, maxDate])
            .thresholds(interval.range(minDate, maxDate));

        return bins(validCases);
    }

    // Process data for stacked chart
    processStackedData(bins) {
        if (this.config.stratifyBy === 'none') {
            return bins.map(bin => ({
                x0: bin.x0,
                x1: bin.x1,
                total: bin.length,
                stacks: [{ key: 'all', count: bin.length, cases: bin }]
            }));
        }

        const field = this.config.stratifyBy;
        const allCategories = new Set();

        // Collect all unique categories
        bins.forEach(bin => {
            bin.forEach(c => {
                const val = c[field];
                if (val) allCategories.add(val);
            });
        });

        const categories = Array.from(allCategories).sort();

        return bins.map(bin => {
            const stacks = categories.map(cat => ({
                key: cat,
                count: bin.filter(c => c[field] === cat).length,
                cases: bin.filter(c => c[field] === cat)
            }));

            return {
                x0: bin.x0,
                x1: bin.x1,
                total: bin.length,
                stacks: stacks.filter(s => s.count > 0)
            };
        });
    }

    // Get color for a stack category
    getColor(category, index) {
        const scheme = this.config.colorScheme;
        const stratify = this.config.stratifyBy;

        if (scheme === 'default' && stratify === 'none') {
            return this.colorPalettes.default[0];
        }

        if (scheme === 'colorblind') {
            return this.colorPalettes.colorblind[index % this.colorPalettes.colorblind.length];
        }

        if (scheme === 'grayscale') {
            return this.colorPalettes.grayscale[index % this.colorPalettes.grayscale.length];
        }

        // Use field-specific colors
        if (stratify !== 'none' && this.colorPalettes[stratify]) {
            return this.colorPalettes[stratify][category] || this.colorPalettes.colorblind[index];
        }

        return this.colorPalettes.colorblind[index % this.colorPalettes.colorblind.length];
    }

    // Render the chart
    render() {
        const container = document.getElementById(this.containerId);
        const svgElement = document.getElementById(this.svgId);
        const placeholder = container.querySelector('.chart-placeholder');

        if (this.data.length === 0) {
            svgElement.classList.remove('visible');
            if (placeholder) placeholder.style.display = 'block';
            return;
        }

        // Hide placeholder, show SVG
        if (placeholder) placeholder.style.display = 'none';
        svgElement.classList.add('visible');

        // Clear previous chart
        d3.select(`#${this.svgId}`).selectAll('*').remove();

        const containerRect = container.getBoundingClientRect();
        let width = containerRect.width - this.margin.left - this.margin.right - 48; // padding
        const height = 400 - this.margin.top - this.margin.bottom;

        // If container width is not available yet, use a default and re-render later
        if (width <= 0) {
            width = 600; // Fallback width
            requestAnimationFrame(() => this.render());
        }

        // Create SVG
        this.svg = d3.select(`#${this.svgId}`)
            .attr('width', width + this.margin.left + this.margin.right)
            .attr('height', height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Bin and process data
        const bins = this.binData(this.data);
        const processedData = this.processStackedData(bins);

        if (processedData.length === 0) {
            svgElement.classList.remove('visible');
            if (placeholder) placeholder.style.display = 'block';
            return;
        }

        // Get all categories for legend
        const allCategories = new Set();
        processedData.forEach(d => {
            d.stacks.forEach(s => allCategories.add(s.key));
        });
        const categories = Array.from(allCategories).sort();

        // Scales
        const x = d3.scaleBand()
            .domain(processedData.map(d => d.x0.getTime()))
            .range([0, width])
            .padding(0.1);

        const maxY = d3.max(processedData, d => d.total) || 1;
        const y = d3.scaleLinear()
            .domain([0, Math.ceil(maxY * 1.1)])
            .nice()
            .range([height, 0]);

        // Grid lines
        if (this.config.showGrid) {
            this.svg.append('g')
                .attr('class', 'grid')
                .call(d3.axisLeft(y)
                    .tickSize(-width)
                    .tickFormat('')
                );
        }

        // Draw stacked bars
        const dateFormat = this.getDateFormat();

        processedData.forEach((bin, binIndex) => {
            let yOffset = 0;

            bin.stacks.forEach((stack, stackIndex) => {
                const barHeight = height - y(stack.count);
                const categoryIndex = categories.indexOf(stack.key);

                this.svg.append('rect')
                    .attr('class', `bar bar-${stack.key}`)
                    .attr('x', x(bin.x0.getTime()))
                    .attr('y', y(stack.count) - yOffset)
                    .attr('width', x.bandwidth())
                    .attr('height', barHeight)
                    .attr('fill', this.getColor(stack.key, categoryIndex))
                    .append('title')
                    .text(`${dateFormat(bin.x0)}: ${stack.count} ${stack.key}`);

                yOffset += barHeight;
            });

            // Show counts on bars
            if (this.config.showCounts && bin.total > 0) {
                this.svg.append('text')
                    .attr('class', 'bar-label')
                    .attr('x', x(bin.x0.getTime()) + x.bandwidth() / 2)
                    .attr('y', y(bin.total) - 5)
                    .attr('text-anchor', 'middle')
                    .text(bin.total);
            }
        });

        // X-axis
        const xAxis = d3.axisBottom(d3.scaleTime()
            .domain([processedData[0].x0, processedData[processedData.length - 1].x1])
            .range([0, width]));

        this.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis.ticks(this.getTickCount(width)).tickFormat(dateFormat))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        // Y-axis
        this.svg.append('g')
            .attr('class', 'axis y-axis')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')));

        // Axis labels
        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + this.margin.bottom - 10)
            .attr('text-anchor', 'middle')
            .text(this.config.xAxisLabel);

        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -this.margin.left + 15)
            .attr('text-anchor', 'middle')
            .text(this.config.yAxisLabel);

        // Title
        if (this.config.title) {
            this.svg.append('text')
                .attr('class', 'chart-title')
                .attr('x', width / 2)
                .attr('y', -this.margin.top / 2)
                .attr('text-anchor', 'middle')
                .text(this.config.title);
        }

        // Draw annotations
        this.drawAnnotations(processedData, x, y, width, height, dateFormat);

        // Update legend
        this.updateLegend(categories);
    }

    // Get appropriate tick count based on width
    getTickCount(width) {
        if (width < 400) return 4;
        if (width < 600) return 6;
        if (width < 800) return 8;
        return 10;
    }

    // Draw annotation markers
    drawAnnotations(processedData, x, y, width, height, dateFormat) {
        if (processedData.length === 0) return;

        const timeScale = d3.scaleTime()
            .domain([processedData[0].x0, processedData[processedData.length - 1].x1])
            .range([0, width]);

        // First case marker
        if (this.config.showFirstCase) {
            const firstCase = this.data.reduce((min, c) =>
                c.onsetDateTime && (!min || c.onsetDateTime < min.onsetDateTime) ? c : min, null);

            if (firstCase && firstCase.onsetDateTime) {
                const xPos = timeScale(firstCase.onsetDateTime);

                this.svg.append('line')
                    .attr('class', 'annotation-line first-case-marker')
                    .attr('x1', xPos)
                    .attr('x2', xPos)
                    .attr('y1', 0)
                    .attr('y2', height)
                    .attr('stroke', '#22c55e');

                this.svg.append('text')
                    .attr('class', 'annotation-label')
                    .attr('x', xPos + 5)
                    .attr('y', 15)
                    .attr('fill', '#22c55e')
                    .text('First case');
            }
        }

        // Exposure marker
        if (this.config.exposure && this.config.exposure.date) {
            const exposureDate = new Date(this.config.exposure.date);
            if (this.config.exposure.time) {
                const [hours, minutes] = this.config.exposure.time.split(':');
                exposureDate.setHours(parseInt(hours), parseInt(minutes));
            }

            const xPos = timeScale(exposureDate);
            if (xPos >= 0 && xPos <= width) {
                this.svg.append('line')
                    .attr('class', 'annotation-line exposure-marker')
                    .attr('x1', xPos)
                    .attr('x2', xPos)
                    .attr('y1', 0)
                    .attr('y2', height)
                    .attr('stroke', '#ef4444');

                this.svg.append('text')
                    .attr('class', 'annotation-label')
                    .attr('x', xPos + 5)
                    .attr('y', 30)
                    .attr('fill', '#ef4444')
                    .text(this.config.exposure.label || 'Exposure');
            }
        }

        // Intervention markers
        if (this.config.interventions && this.config.interventions.length > 0) {
            this.config.interventions.forEach((intervention, i) => {
                if (!intervention.date) return;

                const intDate = new Date(intervention.date);
                if (intervention.time) {
                    const [hours, minutes] = intervention.time.split(':');
                    intDate.setHours(parseInt(hours), parseInt(minutes));
                }

                const xPos = timeScale(intDate);
                if (xPos >= 0 && xPos <= width) {
                    this.svg.append('line')
                        .attr('class', 'annotation-line intervention-marker')
                        .attr('x1', xPos)
                        .attr('x2', xPos)
                        .attr('y1', 0)
                        .attr('y2', height)
                        .attr('stroke', '#f59e0b');

                    this.svg.append('text')
                        .attr('class', 'annotation-label')
                        .attr('x', xPos + 5)
                        .attr('y', 45 + (i * 15))
                        .attr('fill', '#f59e0b')
                        .text(intervention.label || `Intervention ${i + 1}`);
                }
            });
        }

        // Incubation period visualization
        if (this.config.incubation && this.config.exposure && this.config.exposure.date) {
            const exposureDate = new Date(this.config.exposure.date);
            if (this.config.exposure.time) {
                const [hours, minutes] = this.config.exposure.time.split(':');
                exposureDate.setHours(parseInt(hours), parseInt(minutes));
            }

            const minIncubation = this.config.incubation.min; // in hours
            const maxIncubation = this.config.incubation.max; // in hours

            const startDate = new Date(exposureDate.getTime() + minIncubation * 60 * 60 * 1000);
            const endDate = new Date(exposureDate.getTime() + maxIncubation * 60 * 60 * 1000);

            const x1 = Math.max(0, timeScale(startDate));
            const x2 = Math.min(width, timeScale(endDate));

            if (x2 > x1) {
                this.svg.append('rect')
                    .attr('class', 'incubation-area')
                    .attr('x', x1)
                    .attr('y', 0)
                    .attr('width', x2 - x1)
                    .attr('height', height)
                    .attr('fill', 'rgba(239, 68, 68, 0.1)')
                    .attr('stroke', '#ef4444')
                    .attr('stroke-dasharray', '3,3');

                this.svg.append('text')
                    .attr('class', 'annotation-label')
                    .attr('x', (x1 + x2) / 2)
                    .attr('y', -5)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#ef4444')
                    .text('Expected incubation period');
            }
        }
    }

    // Update legend
    updateLegend(categories) {
        const legendContainer = document.getElementById('chart-legend');
        legendContainer.innerHTML = '';

        if (this.config.stratifyBy === 'none' || categories.length <= 1) {
            return;
        }

        categories.forEach((cat, i) => {
            const item = document.createElement('div');
            item.className = 'legend-item';

            const color = document.createElement('span');
            color.className = 'legend-color';
            color.style.backgroundColor = this.getColor(cat, i);

            const label = document.createElement('span');
            label.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);

            item.appendChild(color);
            item.appendChild(label);
            legendContainer.appendChild(item);
        });
    }

    // Get SVG element for export
    getSVGElement() {
        return document.getElementById(this.svgId);
    }

    // Get SVG string for export
    getSVGString() {
        const svgElement = this.getSVGElement();
        if (!svgElement) return null;

        // Clone the SVG
        const clone = svgElement.cloneNode(true);

        // Add necessary styles inline for export
        const styles = `
            .bar { transition: none; }
            .axis text { font-size: 11px; fill: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .axis line, .axis path { stroke: #e2e8f0; }
            .grid line { stroke: #e2e8f0; stroke-opacity: 0.5; stroke-dasharray: 2, 2; }
            .annotation-line { stroke-width: 2; stroke-dasharray: 5, 3; }
            .annotation-label { font-size: 11px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .chart-title { font-size: 16px; font-weight: 600; fill: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .axis-label { font-size: 12px; fill: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .bar-label { font-size: 10px; fill: #1e293b; text-anchor: middle; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        `;

        const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.textContent = styles;
        clone.insertBefore(styleElement, clone.firstChild);

        // Add white background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', '100%');
        bg.setAttribute('height', '100%');
        bg.setAttribute('fill', 'white');
        clone.insertBefore(bg, clone.firstChild);

        // Serialize
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(clone);

        // Add XML declaration
        svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;

        return svgString;
    }
}

// Export for use in other modules
window.EpiCurveChart = EpiCurveChart;
