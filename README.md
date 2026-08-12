# Manito Atlas

A map-first civic atlas for the 15 barangays of Manito, Albay. It joins GADM 3.6 barangay geometry to Philippine Statistics Authority records using the 10-digit Philippine Standard Geographic Code (PSGC), with standard map, satellite, and 3D satellite terrain views rendered by MapLibre GL JS.

## Tech Stack

- **React 19.2.8** - UI framework
- **TypeScript 7.0.2** - Type safety and development experience
- **Vite 8.2.1** - Build tool and development server
- **MapLibre GL JS 6.3.0** - Interactive map rendering
- **Lucide React** - Icon library

## Development

### Setup

```bash
npm install
npm run dev
```

The development server will start at `http://localhost:5173`

### Build

```bash
npm run build
```

This compiles TypeScript and bundles the application for production.

### Type Checking

```bash
npm run lint
```

Runs TypeScript compiler in lint mode to check for type errors.

### Preview Production Build

```bash
npm run preview
```

Preview the production build locally.

## Project Structure

```
manito/
├── public/
│   └── data/
│       └── manito-barangays.geojson    # GADM 3.6 boundary geometry
├── src/
│   ├── components/
│   │   ├── BarangayDirectory.tsx       # List view of all barangays
│   │   ├── CivicHeader.tsx             # Navigation header
│   │   ├── DetailPanel.tsx              # Individual barangay details
│   │   ├── LandingPage.tsx              # Public civic-folio landing page
│   │   ├── MapView.tsx                  # Interactive map component
│   │   ├── OverviewPanel.tsx            # Main overview controls
│   │   ├── SearchControl.tsx           # Search functionality
│   │   ├── SourcePanel.tsx              # Data sources and attribution
│   │   └── StatisticsPanel.tsx          # Demographics and economy insights
│   ├── data/
│   │   ├── barangays.ts                # PSA PSGC + 2024 POPCEN data
│   │   └── communityProfile.ts         # Demographics and economy indicators
│   ├── App.tsx                          # Main application component
│   ├── Root.tsx                         # Landing/map routing and lazy loading
│   ├── main.tsx                         # Application entry point
│   └── types.ts                         # TypeScript type definitions
├── index.html                           # HTML template
├── package.json                         # Dependencies and scripts
├── tsconfig.json                        # TypeScript configuration
└── vite.config.ts                       # Vite build configuration
```

## Data Architecture

```text
public/data/manito-barangays.geojson
        ↓ psgcCode
src/data/barangays.ts (PSA PSGC + 2024 POPCEN)
src/data/communityProfile.ts (PSA + BLGF + DOE indicators)
        ↓
interactive map / barangay record / demographic and economy insights
```

- Population, urban/rural classification, PSGC, and correspondence codes: [Philippine Statistics Authority — Municipality of Manito](https://psa.gov.ph/classification/psgc/barangays/0500511000)
- Demographic trend, sex ratio, and dependency ratio: PSA census and [Albay demographic releases](https://rsso05.psa.gov.ph/content/men-and-women-statistics-albay-2026)
- Economic context: current PSA income class, [BLGF locally sourced revenue](https://blgf.gov.ph/wp-content/uploads/2021/04/2021-SGLG-Average-Growth-on-LSR_Municipality.pdf), and the [DOE geothermal project list](https://legacy.doe.gov.ph/sites/default/files/pdf/renewable_energy/Awarded%20Geothermal%20as%20of%20Dec.%202024.pdf)
- Boundary geometry: the Manito extract from GADM 3.6, matching the supplied [GADM barangay reference map](https://gadm.org/maps/PHL/albay/manito_3.html)
- Basemap: OpenStreetMap and CARTO, attributed in-map
- Satellite imagery: [EOxCloudless 2020](https://cloudless.eox.at/) by EOX IT Services GmbH, containing modified Copernicus Sentinel data 2020
- 3D elevation: [Mapterhorn terrain tiles](https://mapterhorn.com/attribution/)
- Map renderer: [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)

Barangay boundaries are indicative, not legal survey or cadastral lines. Geometry-derived area and density values are labeled accordingly in the interface. GADM permits academic and other non-commercial use; redistribution or commercial use requires prior permission. EOxCloudless also requires visible attribution and a separate EOX license for commercial use.

## Features

### Map Views
- **Standard Map**: Civic basemap with administrative context using OpenStreetMap and CARTO
- **Satellite**: High-resolution satellite imagery from EOxCloudless 2020
- **3D Satellite**: Interactive terrain visualization with elevation data from Mapterhorn

### Data Layers
- **Boundaries**: Administrative barangay boundaries with quiet civic styling
- **Population**: Thematic coloring based on 2024 POPCEN population data
- **Classification**: Urban/rural classification distinction
- **Density**: Population density calculated from boundary-derived area

### Interactive Elements
- **Civic landing page**: Real boundary preview, municipal snapshot, methodology, and linked provenance ledger
- **Deep map entry**: Open the full workspace or jump directly from the landing-page index to a barangay record
- **Barangay Selection**: Click, tap, or keyboard navigation to select barangays
- **Search**: Quick search functionality with keyboard shortcut (Cmd/Ctrl+K)
- **Detail Panels**: Comprehensive barangay records with population ranking and demographics
- **Statistics**: Demographic trends, sex ratio, dependency ratio, and economic indicators
- **Directory**: Complete list view as an alternative to map navigation

### Accessibility
- Reduced motion support
- Visible focus indicators
- Keyboard navigation throughout
- ARIA labels and roles
- Screen reader compatible map controls
- Mobile-responsive design with bottom-sheet treatment

## Usage

- Hover or focus a polygon for a compact annotation
- Click, tap, or press Enter/Space on a polygon for the persistent record
- Search and keyboard-select any barangay (Cmd/Ctrl+K for search focus)
- Use the complete list view as a non-map navigation alternative
- Switch among standard map, satellite, and pitched 3D satellite terrain views
- Switch among boundary, population, classification, and calculated-density lenses
- Explore Population, Demographics, and Economy tabs with source-linked indicators and visible reference years
- Desktop drawer and mobile bottom-sheet detail treatments

This project is an independent civic interface prototype and is not an official Philippine government website.
