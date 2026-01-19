# Epi Curve Builder

A web-based tool for creating professional epidemiological curves (epi curves) for outbreak investigations. Designed for FETP residents, epidemiologists, and public health professionals.

## Features

### Data Input
- **Manual entry**: Add cases one by one with full details
- **CSV upload**: Import case data from CSV files with automatic column detection
- **Paste from spreadsheet**: Copy and paste data directly from Excel, Google Sheets, etc.

### Case Data Fields
- Case ID (auto-generated or custom)
- Onset date and time
- Case classification (confirmed, probable, suspected)
- Age and age group
- Sex
- Outcome
- Custom category field

### Time Intervals (Bin Sizes)
- Hourly
- 6-hour
- 12-hour
- Daily
- Weekly (CDC/MMWR - Sunday start)
- Weekly (ISO - Monday start)

### Stratification Options
Stack/stratify bars by:
- Case classification
- Sex
- Age group
- Outcome
- Custom category

### Annotations
- **First case marker**: Automatically marks the earliest onset date
- **Exposure/event marker**: Mark suspected exposure with date, time, and label
- **Intervention markers**: Add multiple intervention points (e.g., "Vaccination started")
- **Incubation period visualization**: Shows expected case window based on exposure date

### Pathogen Reference Library
Built-in reference for 40+ pathogens with incubation periods:
- Bacterial (Salmonella, E. coli, Campylobacter, Cholera, etc.)
- Viral (Norovirus, Hepatitis A, Influenza, COVID-19, Measles, etc.)
- Parasitic (Giardia, Cryptosporidium, Malaria, etc.)
- Toxins (Staph toxin, Botulism, Scombroid, etc.)

Automatically suggests appropriate bin size based on ~1/4 of incubation period.

### Display Options
- Grid lines
- Case counts on bars
- Color schemes: Default, Classification-based, Colorblind-friendly, Grayscale
- Customizable axis labels and chart title

### Export
- **PNG**: High-resolution image export
- **SVG**: Vector format for editing in graphics software
- **CSV**: Export case data for further analysis

## Privacy

All data processing happens in your browser. **No data is sent to any server.** This is important for handling sensitive health data.

## Usage

1. Visit the hosted app or open `index.html` locally
2. Add case data using manual entry, CSV upload, or paste
3. Adjust bin size and stratification as needed
4. Add annotations (first case, exposure, interventions)
5. Export your epi curve as PNG or SVG

## Deployment

This is a static web app that can be hosted on GitHub Pages:

1. Push to GitHub repository
2. Go to Settings > Pages
3. Select "Deploy from a branch" and choose `main` branch
4. Your app will be available at `https://[username].github.io/epi-curve-builder/`

## Local Development

Simply open `index.html` in a web browser. No build step or server required.

For development with live reload, you can use any simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js (if you have npx)
npx serve
```

## Technologies

- Vanilla JavaScript (no framework dependencies)
- D3.js v7 for chart rendering
- Pure CSS (no CSS framework)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - Free to use and modify.
