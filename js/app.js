// Main Application Module
// Initializes and coordinates all components

document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    const dataManager = new CaseDataManager();
    const csvParser = new CSVParser();
    const chart = new EpiCurveChart('chart-container', 'epi-curve');
    const exportManager = new ExportManager(chart, dataManager);

    // State
    let csvData = null;
    let pasteData = null;

    // Subscribe to data changes
    dataManager.subscribe((cases) => {
        updateCaseList(cases);
        updateCaseCount(cases.length);
        chart.setData(cases);
        chart.render();
        updateExportButtons(cases.length > 0);
    });

    // ===== Tab Navigation =====
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            // Update button states
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update content visibility
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // ===== Manual Case Entry =====
    document.getElementById('case-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const caseData = {
            id: document.getElementById('case-id').value || null,
            onsetDate: document.getElementById('onset-date').value,
            onsetTime: document.getElementById('onset-time').value || null,
            classification: document.getElementById('classification').value,
            age: document.getElementById('age').value || null,
            ageGroup: document.getElementById('age-group').value || null,
            sex: document.getElementById('sex').value || null,
            outcome: document.getElementById('outcome').value || null,
            custom: document.getElementById('custom-field').value || null
        };

        if (!caseData.onsetDate) {
            alert('Onset date is required');
            return;
        }

        dataManager.addCase(caseData);

        // Reset form
        e.target.reset();
        document.getElementById('onset-date').focus();
    });

    // ===== CSV Upload =====
    const csvDropZone = document.getElementById('csv-drop-zone');
    const csvFileInput = document.getElementById('csv-file');

    // Drag and drop
    csvDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        csvDropZone.classList.add('drag-over');
    });

    csvDropZone.addEventListener('dragleave', () => {
        csvDropZone.classList.remove('drag-over');
    });

    csvDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        csvDropZone.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            handleCSVFile(file);
        } else {
            alert('Please upload a CSV file');
        }
    });

    // File input
    csvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleCSVFile(file);
        }
    });

    function handleCSVFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = csvParser.parse(e.target.result);

            if (result.error && result.data.length === 0) {
                alert(result.error);
                return;
            }

            csvData = result;
            showColumnMapping('csv', result.headers, result.data);
        };
        reader.readAsText(file);
    }

    // Download template
    document.getElementById('download-template').addEventListener('click', () => {
        exportManager.downloadTemplate();
    });

    // Import CSV button
    document.getElementById('import-csv-btn').addEventListener('click', () => {
        if (!csvData) return;

        const mappings = getColumnMappings('csv');
        const cases = csvParser.convertToCases(csvData.data, mappings);

        if (cases.length === 0) {
            alert('No valid cases found. Please check your date column.');
            return;
        }

        dataManager.addCases(cases);
        document.getElementById('csv-mapping').style.display = 'none';
        csvData = null;
    });

    // ===== Paste Data =====
    document.getElementById('parse-paste-btn').addEventListener('click', () => {
        const text = document.getElementById('paste-area').value.trim();
        if (!text) {
            alert('Please paste some data first');
            return;
        }

        const result = csvParser.parse(text);

        if (result.error && result.data.length === 0) {
            alert(result.error);
            return;
        }

        pasteData = result;
        showColumnMapping('paste', result.headers, result.data);
    });

    // Import paste button
    document.getElementById('import-paste-btn').addEventListener('click', () => {
        if (!pasteData) return;

        const mappings = getColumnMappings('paste');
        const cases = csvParser.convertToCases(pasteData.data, mappings);

        if (cases.length === 0) {
            alert('No valid cases found. Please check your date column.');
            return;
        }

        dataManager.addCases(cases);
        document.getElementById('paste-mapping').style.display = 'none';
        document.getElementById('paste-area').value = '';
        pasteData = null;
    });

    // ===== Column Mapping UI =====
    function showColumnMapping(type, headers, data) {
        const container = document.getElementById(`${type}-column-mapping`);
        const panel = document.getElementById(`${type}-mapping`);
        container.innerHTML = '';

        const autoMappings = csvParser.detectMappings(headers);

        const fields = [
            { key: 'id', label: 'Case ID' },
            { key: 'onsetDate', label: 'Onset Date *', required: true },
            { key: 'onsetTime', label: 'Onset Time' },
            { key: 'classification', label: 'Classification' },
            { key: 'age', label: 'Age' },
            { key: 'ageGroup', label: 'Age Group' },
            { key: 'sex', label: 'Sex' },
            { key: 'outcome', label: 'Outcome' },
            { key: 'custom', label: 'Custom' }
        ];

        fields.forEach(field => {
            const row = document.createElement('div');
            row.className = 'mapping-row';

            const label = document.createElement('span');
            label.textContent = field.label;

            const select = document.createElement('select');
            select.id = `${type}-map-${field.key}`;

            // Add empty option
            const emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = '-- Skip --';
            select.appendChild(emptyOpt);

            // Add column options
            headers.forEach(header => {
                const opt = document.createElement('option');
                opt.value = header;
                opt.textContent = header;

                // Auto-select if detected
                if (autoMappings[header] === field.key) {
                    opt.selected = true;
                }

                select.appendChild(opt);
            });

            row.appendChild(label);
            row.appendChild(select);
            container.appendChild(row);
        });

        // Show preview
        const preview = document.createElement('div');
        preview.className = 'text-muted';
        preview.style.marginTop = '0.75rem';
        preview.textContent = `Found ${data.length} rows`;
        container.appendChild(preview);

        panel.style.display = 'block';
    }

    function getColumnMappings(type) {
        const mappings = {};
        const fields = ['id', 'onsetDate', 'onsetTime', 'classification', 'age', 'ageGroup', 'sex', 'outcome', 'custom'];

        fields.forEach(field => {
            const select = document.getElementById(`${type}-map-${field}`);
            if (select && select.value) {
                mappings[select.value] = field;
            }
        });

        return mappings;
    }

    // ===== Case List Management =====
    function updateCaseList(cases) {
        const container = document.getElementById('case-list');

        if (cases.length === 0) {
            container.innerHTML = '<p class="empty-state">No cases added yet</p>';
            return;
        }

        container.innerHTML = cases.map(c => `
            <div class="case-item" data-id="${c.id}">
                <div class="case-info">
                    <span class="case-id">${c.id}</span>
                    <span class="case-date">${formatCaseDate(c)}</span>
                    <div class="case-badges">
                        <span class="badge badge-${c.classification}">${c.classification}</span>
                        ${c.sex ? `<span class="badge">${c.sex}</span>` : ''}
                        ${c.ageGroup ? `<span class="badge">${c.ageGroup}</span>` : ''}
                    </div>
                </div>
                <div class="case-actions">
                    <button class="case-action-btn delete-case" data-id="${c.id}" title="Delete">&#x2715;</button>
                </div>
            </div>
        `).join('');

        // Add delete handlers
        container.querySelectorAll('.delete-case').forEach(btn => {
            btn.addEventListener('click', () => {
                dataManager.removeCase(btn.dataset.id);
            });
        });
    }

    function formatCaseDate(c) {
        const date = c.onsetDate;
        const time = c.onsetTime ? ` ${c.onsetTime}` : '';
        return `${date}${time}`;
    }

    function updateCaseCount(count) {
        document.getElementById('case-count').textContent = `${count} case${count !== 1 ? 's' : ''}`;
        document.getElementById('clear-all-btn').disabled = count === 0;
    }

    // Clear all button
    document.getElementById('clear-all-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all cases?')) {
            dataManager.clearAll();
        }
    });

    // ===== Chart Settings =====
    document.getElementById('bin-size').addEventListener('change', (e) => {
        chart.updateConfig({ binSize: e.target.value });
        chart.render();
    });

    document.getElementById('stratify-by').addEventListener('change', (e) => {
        chart.updateConfig({ stratifyBy: e.target.value });
        chart.render();
    });

    document.getElementById('chart-title').addEventListener('input', (e) => {
        chart.updateConfig({ title: e.target.value });
        chart.render();
    });

    document.getElementById('show-grid').addEventListener('change', (e) => {
        chart.updateConfig({ showGrid: e.target.checked });
        chart.render();
    });

    document.getElementById('show-counts').addEventListener('change', (e) => {
        chart.updateConfig({ showCounts: e.target.checked });
        chart.render();
    });

    document.getElementById('color-scheme').addEventListener('change', (e) => {
        chart.updateConfig({ colorScheme: e.target.value });
        chart.render();
    });

    document.getElementById('x-axis-label').addEventListener('input', (e) => {
        chart.updateConfig({ xAxisLabel: e.target.value });
        chart.render();
    });

    document.getElementById('y-axis-label').addEventListener('input', (e) => {
        chart.updateConfig({ yAxisLabel: e.target.value });
        chart.render();
    });

    // ===== Annotations =====

    // First case
    document.getElementById('show-first-case').addEventListener('change', (e) => {
        chart.updateConfig({ showFirstCase: e.target.checked });
        chart.render();
    });

    // Exposure
    document.getElementById('show-exposure').addEventListener('change', (e) => {
        document.getElementById('exposure-fields').style.display = e.target.checked ? 'block' : 'none';
        updateExposureConfig();
    });

    ['exposure-date', 'exposure-time', 'exposure-label'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateExposureConfig);
        document.getElementById(id).addEventListener('input', updateExposureConfig);
    });

    function updateExposureConfig() {
        const showExposure = document.getElementById('show-exposure').checked;
        if (!showExposure) {
            chart.updateConfig({ exposure: null });
        } else {
            chart.updateConfig({
                exposure: {
                    date: document.getElementById('exposure-date').value,
                    time: document.getElementById('exposure-time').value,
                    label: document.getElementById('exposure-label').value
                }
            });
        }
        chart.render();
    }

    // Interventions
    document.getElementById('show-interventions').addEventListener('change', (e) => {
        document.getElementById('intervention-fields').style.display = e.target.checked ? 'block' : 'none';
        if (!e.target.checked) {
            chart.updateConfig({ interventions: [] });
            chart.render();
        }
    });

    document.getElementById('add-intervention-btn').addEventListener('click', () => {
        addInterventionItem();
    });

    function addInterventionItem() {
        const template = document.getElementById('intervention-template');
        const clone = template.content.cloneNode(true);
        const container = document.getElementById('intervention-list');
        container.appendChild(clone);

        // Add event listeners to the new item
        const items = container.querySelectorAll('.intervention-item');
        const newItem = items[items.length - 1];

        newItem.querySelector('.remove-intervention').addEventListener('click', () => {
            newItem.remove();
            updateInterventionsConfig();
        });

        newItem.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', updateInterventionsConfig);
            input.addEventListener('input', updateInterventionsConfig);
        });
    }

    function updateInterventionsConfig() {
        const items = document.querySelectorAll('.intervention-item');
        const interventions = Array.from(items).map(item => ({
            date: item.querySelector('.intervention-date').value,
            time: item.querySelector('.intervention-time').value,
            label: item.querySelector('.intervention-label').value
        })).filter(i => i.date);

        chart.updateConfig({ interventions });
        chart.render();
    }

    // Incubation Period
    document.getElementById('show-incubation').addEventListener('change', (e) => {
        document.getElementById('incubation-fields').style.display = e.target.checked ? 'block' : 'none';
        updateIncubationConfig();
    });

    document.getElementById('pathogen-select').addEventListener('change', (e) => {
        const pathogenKey = e.target.value;

        if (pathogenKey && PATHOGENS[pathogenKey]) {
            const pathogen = PATHOGENS[pathogenKey];
            document.getElementById('incubation-min').value = pathogen.incubationMin;
            document.getElementById('incubation-max').value = pathogen.incubationMax;

            // Update suggested bin
            const suggestedBin = getBinSizeName(pathogen.suggestedBin);
            document.getElementById('suggested-bin').textContent = suggestedBin;

            updateIncubationConfig();
        }
    });

    ['incubation-min', 'incubation-max'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            updateIncubationConfig();
            updateSuggestedBin();
        });
        document.getElementById(id).addEventListener('input', () => {
            updateIncubationConfig();
            updateSuggestedBin();
        });
    });

    function updateIncubationConfig() {
        const showIncubation = document.getElementById('show-incubation').checked;
        if (!showIncubation) {
            chart.updateConfig({ incubation: null });
        } else {
            const min = parseFloat(document.getElementById('incubation-min').value);
            const max = parseFloat(document.getElementById('incubation-max').value);

            if (!isNaN(min) && !isNaN(max)) {
                chart.updateConfig({
                    incubation: { min, max }
                });
            }
        }
        chart.render();
    }

    function updateSuggestedBin() {
        const min = parseFloat(document.getElementById('incubation-min').value);
        if (!isNaN(min) && min > 0) {
            const suggested = calculateSuggestedBin(min);
            document.getElementById('suggested-bin').textContent = getBinSizeName(suggested);
        }
    }

    // ===== Pathogen Reference Panel =====
    initPathogenReference();

    function initPathogenReference() {
        const container = document.getElementById('pathogen-list');
        const searchInput = document.getElementById('pathogen-search');

        renderPathogenList(Object.values(PATHOGENS).map((p, i) => ({
            key: Object.keys(PATHOGENS)[i],
            ...p
        })));

        searchInput.addEventListener('input', (e) => {
            const results = searchPathogens(e.target.value);
            renderPathogenList(results);
        });

        function renderPathogenList(pathogens) {
            container.innerHTML = pathogens.map(p => `
                <div class="pathogen-item" data-key="${p.key}">
                    <div class="pathogen-name">${p.name}</div>
                    <div class="pathogen-incubation">${p.display}</div>
                </div>
            `).join('');

            // Add click handlers
            container.querySelectorAll('.pathogen-item').forEach(item => {
                item.addEventListener('click', () => {
                    const key = item.dataset.key;
                    document.getElementById('pathogen-select').value = key;
                    document.getElementById('pathogen-select').dispatchEvent(new Event('change'));

                    // Show incubation fields if not already shown
                    document.getElementById('show-incubation').checked = true;
                    document.getElementById('incubation-fields').style.display = 'block';
                });
            });
        }
    }

    // Collapsible panel
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            header.closest('.collapsible').classList.toggle('collapsed');
        });
    });

    // ===== Export Buttons =====
    document.getElementById('export-png').addEventListener('click', () => {
        const filename = exportManager.generateFilename('epi-curve', 'png');
        exportManager.exportPNG(filename);
    });

    document.getElementById('export-svg').addEventListener('click', () => {
        const filename = exportManager.generateFilename('epi-curve', 'svg');
        exportManager.exportSVG(filename);
    });

    document.getElementById('export-csv').addEventListener('click', () => {
        const filename = exportManager.generateFilename('case-data', 'csv');
        exportManager.exportCSV(filename);
    });

    function updateExportButtons(enabled) {
        document.getElementById('export-png').disabled = !enabled;
        document.getElementById('export-svg').disabled = !enabled;
        document.getElementById('export-csv').disabled = !enabled;
    }

    // ===== Initialize =====
    updateExportButtons(false);

    // Log initialization
    console.log('Epi Curve Builder initialized');
});
