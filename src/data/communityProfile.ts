import { barangays, municipalityStats } from './barangays'

export const PSA_ALBAY_PSGC_URL =
  'https://psa.gov.ph/classification/psgc/citimuni/0500500000'

export const PSA_ALBAY_DEMOGRAPHICS_URL =
  'https://rsso05.psa.gov.ph/content/men-and-women-statistics-albay-2026'

export const PSA_BICOL_RSET_URL =
  'https://rsso05.psa.gov.ph/system/files/publication/2025RSET5.pdf'

export const BLGF_LOCAL_REVENUE_URL =
  'https://blgf.gov.ph/wp-content/uploads/2021/04/2021-SGLG-Average-Growth-on-LSR_Municipality.pdf'

export const DOE_GEOTHERMAL_URL =
  'https://legacy.doe.gov.ph/sites/default/files/pdf/renewable_energy/Awarded%20Geothermal%20as%20of%20Dec.%202024.pdf'

export const PSA_CBMS_TURNOVER_URL =
  'https://rsso05.psa.gov.ph/content/2024-community-based-monitoring-system-data-turnover-ceremony-manito-albay'

const population2020 = 26_162
const urbanPopulation = barangays
  .filter((barangay) => barangay.classification === 'Urban')
  .reduce((total, barangay) => total + barangay.population, 0)

export const populationTrend = [
  { year: 2010, population: 22_819 },
  { year: 2015, population: 24_707 },
  { year: 2020, population: population2020 },
  { year: 2024, population: municipalityStats.population },
]

export const demographicProfile = {
  population2020,
  populationChangeSince2020: municipalityStats.population - population2020,
  populationChangePercent:
    ((municipalityStats.population / population2020) - 1) * 100,
  sexRatio: 105,
  dependencyRatio: 67,
  urbanPopulation,
  urbanPopulationShare: (urbanPopulation / municipalityStats.population) * 100,
  ruralPopulationShare:
    ((municipalityStats.population - urbanPopulation) / municipalityStats.population) * 100,
}

export const locallySourcedRevenue = [
  { year: 2017, amount: 20_076_309.01 },
  { year: 2018, amount: 23_610_985.91 },
  { year: 2019, amount: 23_898_541.82 },
]

export const economyProfile = {
  incomeClass: '2nd',
  averageRevenueGrowth: 9,
  latestRevenueYear: 2019,
  latestLocallySourcedRevenue: locallySourcedRevenue.at(-1)?.amount ?? 0,
  geothermalProject: 'Bacon–Manito geothermal',
  geothermalStatus: 'Commercial operation',
  geothermalReferenceYear: 2024,
}

export const formatPesoCompact = (value: number) =>
  `₱${new Intl.NumberFormat('en-PH', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)}`
