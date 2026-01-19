// Pathogen Reference Library with Incubation Periods
// All times stored in hours for consistency

const PATHOGENS = {
    // Bacterial
    salmonella: {
        name: 'Salmonella',
        category: 'Bacterial',
        incubationMin: 6,
        incubationMax: 72,
        incubationTypical: '12-36 hours',
        display: '6-72 hours',
        suggestedBin: 'hour' // ~1/4 of min incubation
    },
    ecoli: {
        name: 'E. coli O157:H7',
        category: 'Bacterial',
        incubationMin: 24,
        incubationMax: 240, // 10 days
        incubationTypical: '3-4 days',
        display: '1-10 days',
        suggestedBin: '6hour'
    },
    campylobacter: {
        name: 'Campylobacter',
        category: 'Bacterial',
        incubationMin: 48,
        incubationMax: 120, // 5 days
        incubationTypical: '2-5 days',
        display: '2-5 days',
        suggestedBin: '12hour'
    },
    shigella: {
        name: 'Shigella',
        category: 'Bacterial',
        incubationMin: 24,
        incubationMax: 72,
        incubationTypical: '1-2 days',
        display: '1-3 days',
        suggestedBin: '6hour'
    },
    listeria: {
        name: 'Listeria monocytogenes',
        category: 'Bacterial',
        incubationMin: 72, // 3 days
        incubationMax: 1680, // 70 days
        incubationTypical: '1-4 weeks',
        display: '3-70 days',
        suggestedBin: 'day'
    },
    cholera: {
        name: 'Vibrio cholerae (Cholera)',
        category: 'Bacterial',
        incubationMin: 2,
        incubationMax: 120, // 5 days
        incubationTypical: '1-3 days',
        display: 'Few hours - 5 days',
        suggestedBin: 'hour'
    },
    typhoid: {
        name: 'Salmonella Typhi (Typhoid)',
        category: 'Bacterial',
        incubationMin: 144, // 6 days
        incubationMax: 720, // 30 days
        incubationTypical: '8-14 days',
        display: '6-30 days',
        suggestedBin: 'day'
    },
    legionella: {
        name: 'Legionella (Legionnaires\')',
        category: 'Bacterial',
        incubationMin: 48, // 2 days
        incubationMax: 240, // 10 days
        incubationTypical: '5-6 days',
        display: '2-10 days',
        suggestedBin: '12hour'
    },
    pertussis: {
        name: 'Bordetella pertussis (Whooping Cough)',
        category: 'Bacterial',
        incubationMin: 168, // 7 days
        incubationMax: 504, // 21 days
        incubationTypical: '7-10 days',
        display: '7-21 days',
        suggestedBin: 'day'
    },
    leptospirosis: {
        name: 'Leptospira (Leptospirosis)',
        category: 'Bacterial',
        incubationMin: 48, // 2 days
        incubationMax: 720, // 30 days
        incubationTypical: '5-14 days',
        display: '2-30 days',
        suggestedBin: 'day'
    },
    meningococcal: {
        name: 'Neisseria meningitidis (Meningococcal)',
        category: 'Bacterial',
        incubationMin: 48, // 2 days
        incubationMax: 240, // 10 days
        incubationTypical: '3-4 days',
        display: '2-10 days',
        suggestedBin: '12hour'
    },

    // Viral
    norovirus: {
        name: 'Norovirus',
        category: 'Viral',
        incubationMin: 12,
        incubationMax: 48,
        incubationTypical: '24-48 hours',
        display: '12-48 hours',
        suggestedBin: 'hour'
    },
    rotavirus: {
        name: 'Rotavirus',
        category: 'Viral',
        incubationMin: 24,
        incubationMax: 72,
        incubationTypical: '1-3 days',
        display: '1-3 days',
        suggestedBin: '6hour'
    },
    hepatitisA: {
        name: 'Hepatitis A',
        category: 'Viral',
        incubationMin: 360, // 15 days
        incubationMax: 1200, // 50 days
        incubationTypical: '28-30 days',
        display: '15-50 days',
        suggestedBin: 'week-cdc'
    },
    hepatitisE: {
        name: 'Hepatitis E',
        category: 'Viral',
        incubationMin: 360, // 15 days
        incubationMax: 1536, // 64 days
        incubationTypical: '26-42 days',
        display: '15-64 days',
        suggestedBin: 'week-cdc'
    },
    influenza: {
        name: 'Influenza',
        category: 'Viral',
        incubationMin: 24,
        incubationMax: 96, // 4 days
        incubationTypical: '1-2 days',
        display: '1-4 days',
        suggestedBin: '6hour'
    },
    covid19: {
        name: 'SARS-CoV-2 (COVID-19)',
        category: 'Viral',
        incubationMin: 48, // 2 days
        incubationMax: 336, // 14 days
        incubationTypical: '5-6 days',
        display: '2-14 days',
        suggestedBin: 'day'
    },
    measles: {
        name: 'Measles',
        category: 'Viral',
        incubationMin: 168, // 7 days
        incubationMax: 504, // 21 days
        incubationTypical: '10-12 days',
        display: '7-21 days',
        suggestedBin: 'day'
    },
    mumps: {
        name: 'Mumps',
        category: 'Viral',
        incubationMin: 288, // 12 days
        incubationMax: 600, // 25 days
        incubationTypical: '16-18 days',
        display: '12-25 days',
        suggestedBin: 'day'
    },
    rubella: {
        name: 'Rubella',
        category: 'Viral',
        incubationMin: 336, // 14 days
        incubationMax: 504, // 21 days
        incubationTypical: '14-17 days',
        display: '14-21 days',
        suggestedBin: 'day'
    },
    varicella: {
        name: 'Varicella (Chickenpox)',
        category: 'Viral',
        incubationMin: 240, // 10 days
        incubationMax: 504, // 21 days
        incubationTypical: '14-16 days',
        display: '10-21 days',
        suggestedBin: 'day'
    },
    dengue: {
        name: 'Dengue',
        category: 'Viral',
        incubationMin: 72, // 3 days
        incubationMax: 336, // 14 days
        incubationTypical: '4-7 days',
        display: '3-14 days',
        suggestedBin: 'day'
    },
    ebola: {
        name: 'Ebola Virus Disease',
        category: 'Viral',
        incubationMin: 48, // 2 days
        incubationMax: 504, // 21 days
        incubationTypical: '8-10 days',
        display: '2-21 days',
        suggestedBin: 'day'
    },
    zika: {
        name: 'Zika Virus',
        category: 'Viral',
        incubationMin: 72, // 3 days
        incubationMax: 336, // 14 days
        incubationTypical: '3-12 days',
        display: '3-14 days',
        suggestedBin: 'day'
    },
    chikungunya: {
        name: 'Chikungunya',
        category: 'Viral',
        incubationMin: 48, // 2 days
        incubationMax: 288, // 12 days
        incubationTypical: '3-7 days',
        display: '2-12 days',
        suggestedBin: 'day'
    },
    rabies: {
        name: 'Rabies',
        category: 'Viral',
        incubationMin: 504, // 3 weeks
        incubationMax: 2160, // 90 days (typically)
        incubationTypical: '1-3 months',
        display: '3 weeks - 3 months',
        suggestedBin: 'week-cdc'
    },
    polio: {
        name: 'Poliovirus',
        category: 'Viral',
        incubationMin: 72, // 3 days
        incubationMax: 840, // 35 days
        incubationTypical: '7-14 days',
        display: '3-35 days',
        suggestedBin: 'day'
    },

    // Parasitic
    giardia: {
        name: 'Giardia lamblia',
        category: 'Parasitic',
        incubationMin: 168, // 1 week
        incubationMax: 504, // 3 weeks
        incubationTypical: '1-2 weeks',
        display: '1-3 weeks',
        suggestedBin: 'day'
    },
    cryptosporidium: {
        name: 'Cryptosporidium',
        category: 'Parasitic',
        incubationMin: 48, // 2 days
        incubationMax: 240, // 10 days
        incubationTypical: '7 days',
        display: '2-10 days',
        suggestedBin: '12hour'
    },
    cyclospora: {
        name: 'Cyclospora cayetanensis',
        category: 'Parasitic',
        incubationMin: 168, // 1 week
        incubationMax: 336, // 2 weeks
        incubationTypical: '7 days',
        display: '1-2 weeks',
        suggestedBin: 'day'
    },
    trichinella: {
        name: 'Trichinella (Trichinosis)',
        category: 'Parasitic',
        incubationMin: 24, // 1 day
        incubationMax: 1080, // 45 days
        incubationTypical: '1-2 weeks',
        display: '1-45 days',
        suggestedBin: 'day'
    },
    toxoplasma: {
        name: 'Toxoplasma gondii',
        category: 'Parasitic',
        incubationMin: 120, // 5 days
        incubationMax: 504, // 21 days
        incubationTypical: '10-14 days',
        display: '5-21 days',
        suggestedBin: 'day'
    },
    malaria: {
        name: 'Plasmodium (Malaria)',
        category: 'Parasitic',
        incubationMin: 168, // 7 days
        incubationMax: 720, // 30 days
        incubationTypical: '10-15 days',
        display: '7-30 days',
        suggestedBin: 'day'
    },

    // Toxins
    staph: {
        name: 'Staphylococcal enterotoxin',
        category: 'Toxin',
        incubationMin: 0.5, // 30 minutes
        incubationMax: 8,
        incubationTypical: '2-4 hours',
        display: '30 min - 8 hours',
        suggestedBin: 'hour'
    },
    bacillus: {
        name: 'Bacillus cereus toxin',
        category: 'Toxin',
        incubationMin: 1,
        incubationMax: 16,
        incubationTypical: 'Emetic: 1-6h, Diarrheal: 6-16h',
        display: '1-16 hours',
        suggestedBin: 'hour'
    },
    ciguatera: {
        name: 'Ciguatera fish poisoning',
        category: 'Toxin',
        incubationMin: 1,
        incubationMax: 24,
        incubationTypical: '1-6 hours',
        display: '1-24 hours',
        suggestedBin: 'hour'
    },
    scombroid: {
        name: 'Scombroid fish poisoning',
        category: 'Toxin',
        incubationMin: 0.1, // few minutes
        incubationMax: 2,
        incubationTypical: '10-90 minutes',
        display: 'Minutes - 2 hours',
        suggestedBin: 'hour'
    },
    botulism: {
        name: 'Clostridium botulinum (Botulism)',
        category: 'Toxin',
        incubationMin: 12,
        incubationMax: 72,
        incubationTypical: '12-36 hours',
        display: '12-72 hours',
        suggestedBin: 'hour'
    },
    cPerfringens: {
        name: 'Clostridium perfringens',
        category: 'Toxin',
        incubationMin: 6,
        incubationMax: 24,
        incubationTypical: '8-12 hours',
        display: '6-24 hours',
        suggestedBin: 'hour'
    }
};

// Helper function to get all pathogens sorted by category
function getPathogensByCategory() {
    const byCategory = {};
    for (const [key, pathogen] of Object.entries(PATHOGENS)) {
        if (!byCategory[pathogen.category]) {
            byCategory[pathogen.category] = [];
        }
        byCategory[pathogen.category].push({ key, ...pathogen });
    }
    return byCategory;
}

// Helper function to search pathogens
function searchPathogens(query) {
    const lowerQuery = query.toLowerCase();
    return Object.entries(PATHOGENS)
        .filter(([key, pathogen]) =>
            pathogen.name.toLowerCase().includes(lowerQuery) ||
            pathogen.category.toLowerCase().includes(lowerQuery)
        )
        .map(([key, pathogen]) => ({ key, ...pathogen }));
}

// Helper function to calculate suggested bin size based on incubation period
function calculateSuggestedBin(incubationMinHours) {
    // Bin size should be approximately 1/4 of the minimum incubation period
    const quarterIncubation = incubationMinHours / 4;

    if (quarterIncubation <= 1) return 'hour';
    if (quarterIncubation <= 6) return '6hour';
    if (quarterIncubation <= 12) return '12hour';
    if (quarterIncubation <= 24) return 'day';
    return 'week-cdc';
}

// Get human-readable bin size name
function getBinSizeName(bin) {
    const names = {
        'hour': 'Hourly',
        '6hour': '6-hour',
        '12hour': '12-hour',
        'day': 'Daily',
        'week-cdc': 'Weekly (CDC)',
        'week-iso': 'Weekly (ISO)'
    };
    return names[bin] || bin;
}

// Export for use in other modules
window.PATHOGENS = PATHOGENS;
window.getPathogensByCategory = getPathogensByCategory;
window.searchPathogens = searchPathogens;
window.calculateSuggestedBin = calculateSuggestedBin;
window.getBinSizeName = getBinSizeName;
