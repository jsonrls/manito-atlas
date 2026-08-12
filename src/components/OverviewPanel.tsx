import { ArrowUpRight, ChevronDown, ChevronUp, Landmark, ListFilter, Users } from 'lucide-react'
import { useState } from 'react'
import { formatPopulation, municipalityStats } from '../data/barangays'

interface OverviewPanelProps {
  onOpenDirectory: () => void
  onOpenDemographics: () => void
  onOpenEconomy: () => void
  onLayoutChange: () => void
}

export function OverviewPanel({
  onOpenDirectory,
  onOpenDemographics,
  onOpenEconomy,
  onLayoutChange,
}: OverviewPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(() =>
    typeof window !== 'undefined'
      && window.matchMedia('(max-width: 480px)').matches,
  )

  const toggleOverview = () => {
    setIsCollapsed((collapsed) => !collapsed)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(onLayoutChange)
    })
  }

  return (
    <section
      className={`overview-panel${isCollapsed ? ' is-collapsed' : ''}`}
      aria-labelledby="municipality-heading"
    >
      <div className="overview-panel__eyebrow">
        <span className="overview-panel__label">Municipality overview</span>
        <span className="overview-panel__compact-summary">
          Manito · {formatPopulation(municipalityStats.population)}
        </span>
        <span className="overview-panel__psgc">PSGC {municipalityStats.psgcCode}</span>
        <button
          className="overview-panel__toggle"
          type="button"
          onClick={toggleOverview}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand municipality overview' : 'Collapse municipality overview'}
        >
          <span>{isCollapsed ? 'Overview' : 'Hide'}</span>
          {isCollapsed
            ? <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
            : <ChevronUp size={14} strokeWidth={1.8} aria-hidden="true" />}
        </button>
      </div>
      <div className="overview-panel__title-row">
        <div>
          <h1 id="municipality-heading">Manito</h1>
          <p>Every community, visible in one civic map.</p>
        </div>
        <span className="municipality-index">05—11</span>
      </div>
      <div className="overview-metrics">
        <div className="overview-metric overview-metric--primary">
          <span>Population</span>
          <strong>{formatPopulation(municipalityStats.population)}</strong>
          <small>{municipalityStats.releaseLabel}</small>
        </div>
        <div className="overview-metric">
          <span>Barangays</span>
          <strong>{municipalityStats.barangayCount}</strong>
          <small>{municipalityStats.ruralCount} rural · {municipalityStats.urbanCount} urban</small>
        </div>
      </div>
      <div className="overview-panel__profiles" aria-label="Community profiles">
        <button type="button" onClick={onOpenDemographics}>
          <Users size={15} strokeWidth={1.7} aria-hidden="true" />
          <span><strong>Demographics</strong><small>People & change</small></span>
          <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <button type="button" onClick={onOpenEconomy}>
          <Landmark size={15} strokeWidth={1.7} aria-hidden="true" />
          <span><strong>Economy</strong><small>Fiscal context</small></span>
          <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <button className="overview-panel__directory" type="button" onClick={onOpenDirectory}>
        <span>
          <ListFilter size={17} strokeWidth={1.8} aria-hidden="true" />
          Open barangay directory
        </span>
        <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </section>
  )
}
