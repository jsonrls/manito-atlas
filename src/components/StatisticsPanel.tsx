import { ArrowUpRight, ExternalLink, Landmark, Users, X, Zap } from 'lucide-react'
import {
  BLGF_LOCAL_REVENUE_URL,
  DOE_GEOTHERMAL_URL,
  economyProfile,
  demographicProfile,
  formatPesoCompact,
  locallySourcedRevenue,
  populationTrend,
  PSA_ALBAY_DEMOGRAPHICS_URL,
  PSA_ALBAY_PSGC_URL,
  PSA_BICOL_RSET_URL,
  PSA_CBMS_TURNOVER_URL,
} from '../data/communityProfile'
import { barangays, formatPopulation, mapModes, municipalityStats, PSA_MANITO_URL } from '../data/barangays'
import type { InsightSection, MapMode } from '../types'

interface StatisticsPanelProps {
  section: InsightSection
  onSectionChange: (section: InsightSection) => void
  mode: MapMode
  onModeChange: (mode: MapMode) => void
  onSelect: (code: string) => void
  onClose: () => void
}

const insightTabs: Array<{ id: InsightSection; label: string }> = [
  { id: 'population', label: 'Population' },
  { id: 'demographics', label: 'Demographics' },
  { id: 'economy', label: 'Economy' },
]

const insightTitles: Record<InsightSection, string> = {
  population: 'Population patterns',
  demographics: 'Demographic profile',
  economy: 'Local economy',
}

const formatPercent = (value: number) => `${value.toFixed(1)}%`

export function StatisticsPanel({
  section,
  onSectionChange,
  mode,
  onModeChange,
  onSelect,
  onClose,
}: StatisticsPanelProps) {
  return (
    <aside className="statistics-panel" role="dialog" aria-modal="false" aria-labelledby="statistics-title">
      <div className="sheet-handle" aria-hidden="true" />
      <div className="panel-topbar">
        <div>
          <span>Municipal intelligence</span>
          <h2 id="statistics-title">{insightTitles[section]}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close insights panel">
          <X size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <div className="insight-tabs" role="tablist" aria-label="Community insights">
        {insightTabs.map((tab) => (
          <button
            key={tab.id}
            id={`insight-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={section === tab.id}
            aria-controls={`insight-panel-${tab.id}`}
            className={section === tab.id ? 'is-active' : ''}
            onClick={() => onSectionChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`insight-panel-${section}`}
        className={`insight-view insight-view--${section}`}
        role="tabpanel"
        aria-labelledby={`insight-tab-${section}`}
      >
        {section === 'population' && (
          <PopulationInsights mode={mode} onModeChange={onModeChange} onSelect={onSelect} />
        )}
        {section === 'demographics' && <DemographicInsights />}
        {section === 'economy' && <EconomyInsights />}
      </div>
    </aside>
  )
}

function PopulationInsights({
  mode,
  onModeChange,
  onSelect,
}: Pick<StatisticsPanelProps, 'mode' | 'onModeChange' | 'onSelect'>) {
  const ranked = [...barangays].sort((a, b) => b.population - a.population).slice(0, 5)
  const maximum = ranked[0].population

  return (
    <>
      <div className="statistics-total">
        <span>Total population</span>
        <strong>{formatPopulation(municipalityStats.population)}</strong>
        <small>15 barangays · 2024 POPCEN</small>
      </div>

      <div className="statistics-modes">
        <span className="field-label">Map display</span>
        <div>
          {mapModes.map((item) => (
            <button
              key={item.id}
              type="button"
              className={mode === item.id ? 'is-active' : ''}
              onClick={() => onModeChange(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="ranking-block">
        <div className="ranking-block__heading">
          <span className="field-label">Largest barangays</span>
          <small>Population</small>
        </div>
        {ranked.map((barangay, index) => (
          <button key={barangay.psgcCode} type="button" onClick={() => onSelect(barangay.psgcCode)}>
            <span className="ranking-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="ranking-name">
              <strong>{barangay.name}</strong>
              <span aria-hidden="true"><i style={{ width: `${(barangay.population / maximum) * 100}%` }} /></span>
            </span>
            <span className="ranking-value">{formatPopulation(barangay.population)} <ArrowUpRight size={13} /></span>
          </button>
        ))}
      </div>

      <div className="classification-summary">
        <div><strong>14</strong><span>Rural barangays</span></div>
        <div><strong>01</strong><span>Urban · Nagotgot</span></div>
      </div>
    </>
  )
}

function DemographicInsights() {
  const maximum = Math.max(...populationTrend.map((point) => point.population))

  return (
    <>
      <section className="profile-hero profile-hero--demographics">
        <span>Population · 2024 POPCEN</span>
        <strong>{formatPopulation(municipalityStats.population)}</strong>
        <small>
          +{formatPopulation(demographicProfile.populationChangeSince2020)} people · {formatPercent(demographicProfile.populationChangePercent)} since 2020
        </small>
      </section>

      <section className="profile-metric-grid" aria-label="Demographic indicators">
        <article>
          <span>Sex ratio</span>
          <strong>{demographicProfile.sexRatio}:100</strong>
          <small>Males per 100 females · 2020 CPH</small>
        </article>
        <article>
          <span>Dependency ratio</span>
          <strong>{demographicProfile.dependencyRatio}</strong>
          <small>Dependents per 100 working-age people · 2020</small>
        </article>
        <article>
          <span>Urban barangay share</span>
          <strong>{formatPercent(demographicProfile.urbanPopulationShare)}</strong>
          <small>{formatPopulation(demographicProfile.urbanPopulation)} people in Nagotgot · 2024</small>
        </article>
        <article>
          <span>Rural population share</span>
          <strong>{formatPercent(demographicProfile.ruralPopulationShare)}</strong>
          <small>Across 14 PSA-classified rural barangays</small>
        </article>
      </section>

      <section className="profile-trend" aria-labelledby="population-trend-title">
        <div className="profile-section-heading">
          <div>
            <span className="field-label">Population trend</span>
            <h3 id="population-trend-title">Four census points</h3>
          </div>
          <small>2010—2024</small>
        </div>
        <div className="profile-trend__rows">
          {populationTrend.map((point) => (
            <div className="profile-trend__row" key={point.year}>
              <span>{point.year}</span>
              <i aria-hidden="true"><b style={{ width: `${(point.population / maximum) * 100}%` }} /></i>
              <strong>{formatPopulation(point.population)}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="profile-callout">
        <Users size={20} strokeWidth={1.5} aria-hidden="true" />
        <p><strong>A predominantly rural population.</strong> The urban share is calculated from the current population of Nagotgot, Manito&apos;s only PSA-classified urban barangay.</p>
      </div>

      <div className="insight-source-links" aria-label="Demographic data sources">
        <a href={PSA_MANITO_URL} target="_blank" rel="noreferrer">2024 POPCEN <ExternalLink size={12} /></a>
        <a href={PSA_ALBAY_DEMOGRAPHICS_URL} target="_blank" rel="noreferrer">2020 ratios <ExternalLink size={12} /></a>
        <a href={PSA_BICOL_RSET_URL} target="_blank" rel="noreferrer">Census trend <ExternalLink size={12} /></a>
      </div>
    </>
  )
}

function EconomyInsights() {
  const maximum = Math.max(...locallySourcedRevenue.map((point) => point.amount))

  return (
    <>
      <section className="profile-hero profile-hero--economy">
        <span>Municipal income class</span>
        <strong>{economyProfile.incomeClass}</strong>
        <small>Current PSA PSGC listing · fiscal-capacity classification</small>
      </section>

      <section className="profile-metric-grid" aria-label="Economic indicators">
        <article>
          <span>Locally sourced revenue</span>
          <strong>{formatPesoCompact(economyProfile.latestLocallySourcedRevenue)}</strong>
          <small>BLGF · {economyProfile.latestRevenueYear}</small>
        </article>
        <article>
          <span>Average revenue growth</span>
          <strong>{economyProfile.averageRevenueGrowth}%</strong>
          <small>Locally sourced revenue · 2017–2019</small>
        </article>
        <article>
          <span>Energy anchor</span>
          <strong>Geothermal</strong>
          <small>Bacon–Manito project area</small>
        </article>
        <article>
          <span>Resident context</span>
          <strong>{formatPopulation(municipalityStats.population)}</strong>
          <small>2024 POPCEN population</small>
        </article>
      </section>

      <section className="profile-trend" aria-labelledby="revenue-trend-title">
        <div className="profile-section-heading">
          <div>
            <span className="field-label">Historical fiscal series</span>
            <h3 id="revenue-trend-title">Locally sourced revenue</h3>
          </div>
          <small>BLGF</small>
        </div>
        <div className="profile-trend__rows profile-trend__rows--economy">
          {locallySourcedRevenue.map((point) => (
            <div className="profile-trend__row" key={point.year}>
              <span>{point.year}</span>
              <i aria-hidden="true"><b style={{ width: `${(point.amount / maximum) * 100}%` }} /></i>
              <strong>{formatPesoCompact(point.amount)}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="profile-callout profile-callout--energy">
        <Zap size={21} strokeWidth={1.5} aria-hidden="true" />
        <p><strong>{economyProfile.geothermalProject}.</strong> The DOE&apos;s {economyProfile.geothermalReferenceYear} awarded-project list identifies the Sorsogon–Albay project in {economyProfile.geothermalStatus.toLowerCase()}.</p>
      </div>

      <div className="profile-caveat">
        <Landmark size={17} strokeWidth={1.5} aria-hidden="true" />
        <p>Income class describes LGU fiscal capacity, not household income. Current municipal GDP, employment, and household-income values are not shown because no public Manito-level table was located. The 2024 CBMS dataset has been turned over to the LGU but its indicator tables are not linked here.</p>
      </div>

      <div className="insight-source-links" aria-label="Economic data sources">
        <a href={PSA_ALBAY_PSGC_URL} target="_blank" rel="noreferrer">Income class <ExternalLink size={12} /></a>
        <a href={BLGF_LOCAL_REVENUE_URL} target="_blank" rel="noreferrer">BLGF revenue <ExternalLink size={12} /></a>
        <a href={DOE_GEOTHERMAL_URL} target="_blank" rel="noreferrer">DOE energy <ExternalLink size={12} /></a>
        <a href={PSA_CBMS_TURNOVER_URL} target="_blank" rel="noreferrer">CBMS status <ExternalLink size={12} /></a>
      </div>
    </>
  )
}
