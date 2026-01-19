// Data Management Module
// Handles case data storage, CSV parsing, and data transformations

class CaseDataManager {
    constructor() {
        this.cases = [];
        this.nextId = 1;
        this.listeners = [];
    }

    // Subscribe to data changes
    subscribe(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners of data changes
    notify() {
        this.listeners.forEach(cb => cb(this.cases));
    }

    // Add a single case
    addCase(caseData) {
        const newCase = {
            id: caseData.id || `CASE-${String(this.nextId++).padStart(4, '0')}`,
            onsetDate: caseData.onsetDate,
            onsetTime: caseData.onsetTime || null,
            onsetDateTime: this.parseDateTime(caseData.onsetDate, caseData.onsetTime),
            classification: caseData.classification || 'confirmed',
            age: caseData.age || null,
            ageGroup: caseData.ageGroup || this.calculateAgeGroup(caseData.age),
            sex: caseData.sex || null,
            outcome: caseData.outcome || null,
            custom: caseData.custom || null
        };

        this.cases.push(newCase);
        this.cases.sort((a, b) => a.onsetDateTime - b.onsetDateTime);
        this.notify();
        return newCase;
    }

    // Add multiple cases (from CSV/paste)
    addCases(casesArray) {
        casesArray.forEach(c => this.addCase(c));
    }

    // Remove a case by ID
    removeCase(caseId) {
        this.cases = this.cases.filter(c => c.id !== caseId);
        this.notify();
    }

    // Clear all cases
    clearAll() {
        this.cases = [];
        this.nextId = 1;
        this.notify();
    }

    // Get all cases
    getCases() {
        return [...this.cases];
    }

    // Get case count
    getCount() {
        return this.cases.length;
    }

    // Parse date and optional time into a Date object
    parseDateTime(dateStr, timeStr) {
        if (!dateStr) return null;

        let dateTime;
        if (timeStr) {
            dateTime = new Date(`${dateStr}T${timeStr}`);
        } else {
            // Default to noon if no time specified (avoids timezone issues)
            dateTime = new Date(`${dateStr}T12:00:00`);
        }

        return isNaN(dateTime.getTime()) ? null : dateTime;
    }

    // Calculate age group from age
    calculateAgeGroup(age) {
        if (age === null || age === undefined || age === '') return null;
        const numAge = parseInt(age);
        if (isNaN(numAge)) return null;

        if (numAge < 5) return '0-4';
        if (numAge < 15) return '5-14';
        if (numAge < 25) return '15-24';
        if (numAge < 45) return '25-44';
        if (numAge < 65) return '45-64';
        return '65+';
    }

    // Get unique values for a field (for stratification)
    getUniqueValues(field) {
        const values = new Set();
        this.cases.forEach(c => {
            if (c[field]) values.add(c[field]);
        });
        return Array.from(values).sort();
    }

    // Get date range of cases
    getDateRange() {
        if (this.cases.length === 0) return null;

        const dates = this.cases
            .map(c => c.onsetDateTime)
            .filter(d => d !== null);

        if (dates.length === 0) return null;

        return {
            min: new Date(Math.min(...dates)),
            max: new Date(Math.max(...dates))
        };
    }

    // Get first case
    getFirstCase() {
        if (this.cases.length === 0) return null;

        const withDates = this.cases.filter(c => c.onsetDateTime !== null);
        if (withDates.length === 0) return null;

        return withDates.reduce((min, c) =>
            c.onsetDateTime < min.onsetDateTime ? c : min
        );
    }

    // Check if any cases have time data
    hasTimeData() {
        return this.cases.some(c => c.onsetTime !== null);
    }

    // Export cases to CSV format
    exportToCSV() {
        if (this.cases.length === 0) return '';

        const headers = ['id', 'onset_date', 'onset_time', 'classification', 'age', 'age_group', 'sex', 'outcome', 'custom'];
        const rows = [headers.join(',')];

        this.cases.forEach(c => {
            const row = [
                c.id,
                c.onsetDate || '',
                c.onsetTime || '',
                c.classification || '',
                c.age || '',
                c.ageGroup || '',
                c.sex || '',
                c.outcome || '',
                c.custom || ''
            ].map(val => `"${String(val).replace(/"/g, '""')}"`);
            rows.push(row.join(','));
        });

        return rows.join('\n');
    }
}

// CSV Parser
class CSVParser {
    constructor() {
        this.requiredFields = ['onset_date', 'onsetdate', 'date', 'onset'];
        this.fieldMappings = {
            'onset_date': 'onsetDate',
            'onsetdate': 'onsetDate',
            'onset date': 'onsetDate',
            'date': 'onsetDate',
            'date_onset': 'onsetDate',
            'symptom_onset': 'onsetDate',
            'onset': 'onsetDate',

            'onset_time': 'onsetTime',
            'onsettime': 'onsetTime',
            'time': 'onsetTime',

            'case_id': 'id',
            'caseid': 'id',
            'id': 'id',
            'case_no': 'id',

            'classification': 'classification',
            'case_classification': 'classification',
            'status': 'classification',

            'age': 'age',
            'age_years': 'age',

            'age_group': 'ageGroup',
            'agegroup': 'ageGroup',
            'age_category': 'ageGroup',

            'sex': 'sex',
            'gender': 'sex',

            'outcome': 'outcome',
            'status_outcome': 'outcome',
            'vital_status': 'outcome',

            'custom': 'custom',
            'category': 'custom',
            'group': 'custom',
            'notes': 'custom'
        };
    }

    // Parse CSV string into array of objects
    parse(csvString) {
        const lines = csvString.trim().split(/\r?\n/);
        if (lines.length < 2) return { headers: [], data: [], error: 'CSV must have headers and at least one data row' };

        // Parse headers
        const headers = this.parseRow(lines[0]).map(h => h.trim().toLowerCase());

        // Check for date column
        const hasDateColumn = headers.some(h =>
            this.requiredFields.includes(h.replace(/[^a-z_]/g, ''))
        );

        if (!hasDateColumn) {
            return {
                headers: this.parseRow(lines[0]),
                data: [],
                error: 'No onset date column found. Please ensure your CSV has a date column (e.g., onset_date, date, onset)'
            };
        }

        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;

            const values = this.parseRow(lines[i]);
            const row = {};

            headers.forEach((header, idx) => {
                row[header] = values[idx] || '';
            });

            data.push(row);
        }

        return {
            headers: this.parseRow(lines[0]),
            data,
            error: null
        };
    }

    // Parse a single CSV row (handles quoted values)
    parseRow(row) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < row.length; i++) {
            const char = row[i];

            if (char === '"') {
                if (inQuotes && row[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if ((char === ',' || char === '\t') && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    // Auto-detect column mappings
    detectMappings(headers) {
        const mappings = {};

        headers.forEach(header => {
            const normalizedHeader = header.toLowerCase().replace(/[^a-z_]/g, '');

            for (const [pattern, field] of Object.entries(this.fieldMappings)) {
                if (normalizedHeader === pattern.replace(/[^a-z_]/g, '') ||
                    normalizedHeader.includes(pattern.replace(/[^a-z_]/g, ''))) {
                    mappings[header] = field;
                    break;
                }
            }
        });

        return mappings;
    }

    // Convert raw data using mappings to case format
    convertToCases(data, mappings) {
        return data.map(row => {
            const caseData = {};

            for (const [csvHeader, fieldName] of Object.entries(mappings)) {
                let value = row[csvHeader.toLowerCase()];

                // Normalize values
                if (fieldName === 'onsetDate') {
                    value = this.normalizeDate(value);
                } else if (fieldName === 'onsetTime') {
                    value = this.normalizeTime(value);
                } else if (fieldName === 'classification') {
                    value = this.normalizeClassification(value);
                } else if (fieldName === 'sex') {
                    value = this.normalizeSex(value);
                } else if (fieldName === 'outcome') {
                    value = this.normalizeOutcome(value);
                }

                caseData[fieldName] = value;
            }

            return caseData;
        }).filter(c => c.onsetDate); // Only include cases with valid dates
    }

    // Normalize date string to YYYY-MM-DD format
    normalizeDate(dateStr) {
        if (!dateStr) return null;

        // Try various date formats
        const formats = [
            // ISO format
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
            // US format (MM/DD/YYYY)
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
            // European format (DD/MM/YYYY)
            /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
            // Short year formats
            /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/
        ];

        // Try ISO format first
        let match = dateStr.match(formats[0]);
        if (match) {
            return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
        }

        // Try US format (assume MM/DD/YYYY)
        match = dateStr.match(formats[1]);
        if (match) {
            return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
        }

        // Try parsing with Date constructor as fallback
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }

        return null;
    }

    // Normalize time string to HH:MM format
    normalizeTime(timeStr) {
        if (!timeStr) return null;

        // Handle HH:MM:SS
        const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
        if (match) {
            return `${match[1].padStart(2, '0')}:${match[2]}`;
        }

        // Handle AM/PM
        const amPmMatch = timeStr.match(/^(\d{1,2}):?(\d{2})?\s*(am|pm)$/i);
        if (amPmMatch) {
            let hours = parseInt(amPmMatch[1]);
            const minutes = amPmMatch[2] || '00';
            const isPm = amPmMatch[3].toLowerCase() === 'pm';

            if (isPm && hours !== 12) hours += 12;
            if (!isPm && hours === 12) hours = 0;

            return `${String(hours).padStart(2, '0')}:${minutes}`;
        }

        return null;
    }

    // Normalize classification value
    normalizeClassification(value) {
        if (!value) return 'confirmed';

        const lower = value.toLowerCase().trim();

        if (lower.includes('confirm')) return 'confirmed';
        if (lower.includes('prob')) return 'probable';
        if (lower.includes('suspect') || lower.includes('poss')) return 'suspected';

        return 'confirmed';
    }

    // Normalize sex value
    normalizeSex(value) {
        if (!value) return null;

        const lower = value.toLowerCase().trim();

        if (lower === 'm' || lower.includes('male') && !lower.includes('female')) return 'male';
        if (lower === 'f' || lower.includes('female')) return 'female';
        if (lower.includes('other') || lower.includes('non')) return 'other';
        if (lower.includes('unknown') || lower === 'u') return 'unknown';

        return null;
    }

    // Normalize outcome value
    normalizeOutcome(value) {
        if (!value) return null;

        const lower = value.toLowerCase().trim();

        if (lower.includes('alive') || lower.includes('recovered') || lower.includes('survived')) return 'alive';
        if (lower.includes('dead') || lower.includes('deceased') || lower.includes('died') || lower.includes('fatal')) return 'deceased';
        if (lower.includes('unknown') || lower === 'u') return 'unknown';

        return null;
    }
}

// Generate CSV template
function generateCSVTemplate() {
    return `id,onset_date,onset_time,classification,age,age_group,sex,outcome,custom
CASE-0001,2024-01-15,14:30,confirmed,45,45-64,male,alive,Ward A
CASE-0002,2024-01-15,16:00,probable,32,25-44,female,alive,Ward B
CASE-0003,2024-01-16,,suspected,67,65+,male,unknown,Ward A`;
}

// Export for use in other modules
window.CaseDataManager = CaseDataManager;
window.CSVParser = CSVParser;
window.generateCSVTemplate = generateCSVTemplate;
