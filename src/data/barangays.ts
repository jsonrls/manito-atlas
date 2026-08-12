import type { BarangayRecord, MapMode } from '../types'

export const PSA_MANITO_URL =
  'https://psa.gov.ph/classification/psgc/barangays/0500511000'

export const GADM_MANITO_URL =
  'https://gadm.org/maps/PHL/albay/manito_3.html'

const common = {
  populationYear: 2024 as const,
  municipality: 'Manito' as const,
  province: 'Albay' as const,
  region: 'Region V (Bicol Region)' as const,
  dataSource: 'Philippine Statistics Authority — PSGC' as const,
  sourceUrl: PSA_MANITO_URL,
}

export const barangays: BarangayRecord[] = [
  { name: 'Balabagon', psgcCode: '0500511001', correspondenceCode: '050511001', classification: 'Rural', population: 735, ...common },
  { name: 'Balasbas', psgcCode: '0500511002', correspondenceCode: '050511002', classification: 'Rural', population: 1528, ...common },
  { name: 'Bamban', psgcCode: '0500511003', correspondenceCode: '050511003', classification: 'Rural', population: 1349, ...common },
  { name: 'Buyo', psgcCode: '0500511004', correspondenceCode: '050511004', classification: 'Rural', population: 4132, ...common },
  { name: 'Cabacongan', psgcCode: '0500511005', correspondenceCode: '050511005', classification: 'Rural', population: 1246, ...common },
  { name: 'Cabit', psgcCode: '0500511006', correspondenceCode: '050511006', classification: 'Rural', population: 1279, ...common },
  { name: 'Cawayan', psgcCode: '0500511007', correspondenceCode: '050511007', classification: 'Rural', population: 1523, ...common },
  { name: 'Cawit', psgcCode: '0500511008', correspondenceCode: '050511008', classification: 'Rural', population: 613, ...common },
  { name: 'Holugan', psgcCode: '0500511009', correspondenceCode: '050511009', classification: 'Rural', population: 1168, ...common },
  { name: 'It-Ba', psgcCode: '0500511010', correspondenceCode: '050511010', classification: 'Rural', civicRole: 'Poblacion', population: 3819, ...common },
  { name: 'Malobago', psgcCode: '0500511011', correspondenceCode: '050511011', classification: 'Rural', population: 772, ...common },
  { name: 'Manumbalay', psgcCode: '0500511012', correspondenceCode: '050511012', classification: 'Rural', population: 1053, ...common },
  { name: 'Nagotgot', psgcCode: '0500511013', correspondenceCode: '050511013', classification: 'Urban', population: 2352, ...common },
  { name: 'Pawa', psgcCode: '0500511015', correspondenceCode: '050511015', classification: 'Rural', population: 3595, ...common },
  { name: 'Tinapian', psgcCode: '0500511018', correspondenceCode: '050511018', classification: 'Rural', population: 1261, ...common },
]

export const barangayByCode = new Map(
  barangays.map((barangay) => [barangay.psgcCode, barangay]),
)

export const municipalityStats = {
  name: 'Manito',
  psgcCode: '0500511000',
  correspondenceCode: '050511000',
  barangayCount: barangays.length,
  population: barangays.reduce((total, barangay) => total + barangay.population, 0),
  urbanCount: barangays.filter((barangay) => barangay.classification === 'Urban').length,
  ruralCount: barangays.filter((barangay) => barangay.classification === 'Rural').length,
  populationYear: 2024,
  releaseLabel: '2024 POPCEN',
}

export const mapModes: Array<{
  id: MapMode
  label: string
  shortLabel: string
  description: string
}> = [
  {
    id: 'default',
    label: 'Boundaries',
    shortLabel: 'Map',
    description: 'Administrative boundaries with a quiet civic base layer.',
  },
  {
    id: 'population',
    label: 'Population',
    shortLabel: 'Population',
    description: 'Darker barangays have a larger 2024 POPCEN population.',
  },
  {
    id: 'classification',
    label: 'Urban / rural',
    shortLabel: 'Class',
    description: 'Nagotgot is urban; the other 14 barangays are rural.',
  },
  {
    id: 'density',
    label: 'Density',
    shortLabel: 'Density',
    description: 'Population per square kilometre using boundary-derived area.',
  },
]

export const formatPopulation = (population: number) =>
  new Intl.NumberFormat('en-PH').format(population)

export const formatDensity = (population: number, areaSqKm: number) =>
  Math.round(population / areaSqKm).toLocaleString('en-PH')
