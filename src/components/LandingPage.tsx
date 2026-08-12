import {
  ArrowUpRight,
  Database,
  ExternalLink,
  Layers3,
  MapPinned,
  Search,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import type { Geometry, Position } from 'geojson'
import {
  barangayByCode,
  barangays,
  formatPopulation,
  GADM_MANITO_URL,
  municipalityStats,
  PSA_MANITO_URL,
} from '../data/barangays'
import {
  BLGF_LOCAL_REVENUE_URL,
  demographicProfile,
  DOE_GEOTHERMAL_URL,
  economyProfile,
  formatPesoCompact,
} from '../data/communityProfile'
import type { ManitoBoundaryCollection } from '../types'

interface LandingPageProps {
  onOpenMap: (barangayCode?: string) => void
  onPrefetchMap?: () => void
}

interface AtlasShape {
  code: string
  name: string
  path: string
  populationRatio: number
  classification: 'Urban' | 'Rural'
}

const ATLAS_WIDTH = 320
const ATLAS_HEIGHT = 238
const ATLAS_PADDING = 18
const MAX_BARANGAY_POPULATION = Math.max(
  ...barangays.map(({ population }) => population),
)

function geometryRings(geometry: Geometry): Position[][] {
  if (geometry.type === 'Polygon') return geometry.coordinates
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat()
  return []
}

function projectAtlas(collection: ManitoBoundaryCollection): AtlasShape[] {
  const points = collection.features.flatMap((feature) =>
    geometryRings(feature.geometry).flat(),
  )
  if (points.length === 0) return []

  const longitudes = points.map(([longitude]) => longitude)
  const latitudes = points.map(([, latitude]) => latitude)
  const minLongitude = Math.min(...longitudes)
  const maxLongitude = Math.max(...longitudes)
  const minLatitude = Math.min(...latitudes)
  const maxLatitude = Math.max(...latitudes)
  const scale = Math.min(
    (ATLAS_WIDTH - ATLAS_PADDING * 2) / (maxLongitude - minLongitude),
    (ATLAS_HEIGHT - ATLAS_PADDING * 2) / (maxLatitude - minLatitude),
  )
  const projectedWidth = (maxLongitude - minLongitude) * scale
  const projectedHeight = (maxLatitude - minLatitude) * scale
  const offsetX = (ATLAS_WIDTH - projectedWidth) / 2
  const offsetY = (ATLAS_HEIGHT - projectedHeight) / 2
  const project = ([longitude, latitude]: Position) => [
    offsetX + (longitude - minLongitude) * scale,
    offsetY + (maxLatitude - latitude) * scale,
  ]

  return collection.features.flatMap((feature) => {
    const record = barangayByCode.get(feature.properties.psgcCode)
    if (!record) return []

    const path = geometryRings(feature.geometry)
      .map((ring) =>
        ring
          .map((position, index) => {
            const [x, y] = project(position)
            return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
          })
          .join(' ') + ' Z',
      )
      .join(' ')

    return [{
      code: record.psgcCode,
      name: record.name,
      path,
      populationRatio: record.population / MAX_BARANGAY_POPULATION,
      classification: record.classification,
    }]
  })
}

const methods = [
  {
    index: '01',
    title: 'Find a barangay',
    copy: 'Search by name, open the directory, or select a polygon. Keyboard users can jump with ⌘K or Ctrl+K.',
    icon: Search,
  },
  {
    index: '02',
    title: 'Change the lens',
    copy: 'Switch among boundaries, 2024 population, urban/rural class, and boundary-derived density.',
    icon: Layers3,
  },
  {
    index: '03',
    title: 'Read the record',
    copy: 'Each barangay opens as a civic file: population rank, classification, PSGC, and neighbouring places.',
    icon: MapPinned,
  },
  {
    index: '04',
    title: 'Check the source',
    copy: 'Every figure keeps its agency and reference year visible. Boundaries stay labelled as indicative, not cadastral.',
    icon: Database,
  },
] as const

const figures = [
  {
    label: 'Population',
    value: formatPopulation(municipalityStats.population),
    note: municipalityStats.releaseLabel,
  },
  {
    label: 'Barangays',
    value: String(municipalityStats.barangayCount),
    note: `${municipalityStats.ruralCount} rural · ${municipalityStats.urbanCount} urban`,
  },
  {
    label: 'Change since 2020',
    value: `+${formatPopulation(demographicProfile.populationChangeSince2020)}`,
    note: `${demographicProfile.populationChangePercent.toFixed(1)}% over four years`,
  },
  {
    label: 'Income class',
    value: `${economyProfile.incomeClass} class`,
    note: `${formatPesoCompact(economyProfile.latestLocallySourcedRevenue)} locally sourced, ${economyProfile.latestRevenueYear}`,
  },
] as const

const sources = [
  {
    agency: 'PSA',
    detail: 'PSGC codes, 2024 POPCEN counts, urban/rural class, and Albay demographic ratios.',
    url: PSA_MANITO_URL,
  },
  {
    agency: 'GADM 3.6',
    detail: 'Indicative barangay geometry. Not a legal survey or cadastral line.',
    url: GADM_MANITO_URL,
  },
  {
    agency: 'BLGF',
    detail: `Locally sourced revenue through ${economyProfile.latestRevenueYear}, used as fiscal context only.`,
    url: BLGF_LOCAL_REVENUE_URL,
  },
  {
    agency: 'DOE',
    detail: `${economyProfile.geothermalProject}, listed in commercial operation as of ${economyProfile.geothermalReferenceYear}.`,
    url: DOE_GEOTHERMAL_URL,
  },
] as const

export function LandingPage({ onOpenMap, onPrefetchMap }: LandingPageProps) {
  const [atlasShapes, setAtlasShapes] = useState<AtlasShape[]>([])
  const [activeBarangay, setActiveBarangay] = useState<string | null>(null)
  const activeRecord = activeBarangay
    ? barangayByCode.get(activeBarangay) ?? null
    : null
  const activeRecordIndex = activeRecord
    ? barangays.findIndex(({ psgcCode }) => psgcCode === activeRecord.psgcCode) + 1
    : null

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}data/manito-barangays.geojson`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Atlas preview unavailable')
        return response.json() as Promise<ManitoBoundaryCollection>
      })
      .then((collection) => setAtlasShapes(projectAtlas(collection)))
      .catch(() => {
        if (!controller.signal.aborted) setAtlasShapes([])
      })
    return () => controller.abort()
  }, [])

  return (
    <div className="landing">
      <a className="skip-link" href="#landing-main">
        Skip to content
      </a>

      <header className="landing-nav">
        <div className="landing-nav__inner">
          <a className="brand-lockup landing-brand" href="#intro">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark__ring" />
              <span className="brand-mark__dot" />
            </span>
            <span className="brand-copy">
              <strong>Manito, Albay</strong>
              <span>Barangay Intelligence Map</span>
            </span>
          </a>

          <nav className="landing-nav__links" aria-label="Landing">
            <a href="#figures">Figures</a>
            <a href="#method">Method</a>
            <a href="#sources">Sources</a>
          </nav>

          <button
            className="landing-cta landing-cta--nav"
            type="button"
            onClick={() => onOpenMap()}
            onPointerEnter={onPrefetchMap}
            onFocus={onPrefetchMap}
          >
            Open the map
            <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main id="landing-main">
        <section className="landing-hero" id="intro" aria-labelledby="landing-hero-heading">
          <div className="landing-shell landing-hero__grid">
            <div className="landing-hero__copy">
              <p className="landing-kicker">
                Folio 05—11
                <span aria-hidden="true">·</span>
                Municipality of Manito
                <span aria-hidden="true">·</span>
                Bicol Region
              </p>
              <h1 id="landing-hero-heading">
                Fifteen barangays.
                <span>One civic map.</span>
              </h1>
              <p className="landing-lede">
                A map-first reading of Manito: 2024 POPCEN counts joined to GADM
                boundaries, so each community can be found as a record instead of
                a poster.
              </p>
              <div className="landing-hero__actions">
                <button
                  className="landing-cta"
                  type="button"
                  onClick={() => onOpenMap()}
                  onPointerEnter={onPrefetchMap}
                  onFocus={onPrefetchMap}
                >
                  Open the map
                  <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>
                <a className="landing-ghost" href="#method">
                  How to read it
                </a>
              </div>
              <dl className="landing-hero__meta">
                <div>
                  <dt>PSGC</dt>
                  <dd>{municipalityStats.psgcCode}</dd>
                </div>
                <div>
                  <dt>Coverage</dt>
                  <dd>15 matched polygons</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>Independent prototype</dd>
                </div>
              </dl>
            </div>

            <aside className="atlas-plate" aria-label="Barangay index plate">
              <div
                className={`atlas-plate__field${activeRecord ? ' has-active-record' : ''}`}
                aria-hidden="true"
              >
                <span className="atlas-plate__grid" />
                {atlasShapes.length > 0 ? (
                  <svg
                    className="atlas-map"
                    viewBox={`0 0 ${ATLAS_WIDTH} ${ATLAS_HEIGHT}`}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {atlasShapes.map((shape, index) => (
                      <path
                        key={shape.code}
                        className={`atlas-map__shape${
                          shape.classification === 'Urban' ? ' atlas-map__shape--urban' : ''
                        }${activeBarangay === shape.code ? ' is-active' : ''}`}
                        d={shape.path}
                        style={{
                          '--atlas-alpha': 0.42 + shape.populationRatio * 0.46,
                          '--shape-index': index,
                        } as CSSProperties}
                      />
                    ))}
                  </svg>
                ) : (
                  <span className="atlas-plate__land" />
                )}
                <span className="atlas-plate__coord">13.12°N · 123.87°E</span>
                <span className="atlas-plate__folio">Folio 05—11 · GADM 3.6</span>
                <span className={`atlas-plate__inspector${activeRecord ? ' is-active' : ''}`}>
                  <small>
                    {activeRecord
                      ? `Record ${String(activeRecordIndex).padStart(2, '0')} · ${[
                          activeRecord.classification,
                          activeRecord.civicRole,
                        ].filter(Boolean).join(' · ')}`
                      : 'Municipal total'}
                  </small>
                  <strong>{activeRecord?.name ?? municipalityStats.name}</strong>
                  <span>
                    {activeRecord
                      ? `${formatPopulation(activeRecord.population)} people · ${(
                          (activeRecord.population / municipalityStats.population) * 100
                        ).toFixed(1)}% of Manito`
                      : `${formatPopulation(municipalityStats.population)} people · ${municipalityStats.barangayCount} barangays`}
                  </span>
                </span>
                <span className="atlas-plate__legend">
                  <i /><i /><i />
                  Population · 2024
                </span>
              </div>
              <div className="atlas-plate__index">
                <div className="atlas-plate__index-head">
                  <span>
                    Barangay register
                    <small>{municipalityStats.barangayCount} records · A—Z</small>
                  </span>
                  <span>
                    Population
                    <small>{municipalityStats.releaseLabel}</small>
                  </span>
                </div>
                <ol aria-label="Barangays in alphabetical order">
                  {barangays.map((barangay, index) => (
                    <li
                      key={barangay.psgcCode}
                      onMouseEnter={() => setActiveBarangay(barangay.psgcCode)}
                      onMouseLeave={() => setActiveBarangay(null)}
                    >
                      <button
                        type="button"
                        className={activeBarangay === barangay.psgcCode ? 'is-active' : ''}
                        style={{
                          '--population-share': `${
                            (barangay.population / MAX_BARANGAY_POPULATION) * 100
                          }%`,
                        } as CSSProperties}
                        onClick={() => onOpenMap(barangay.psgcCode)}
                        onFocus={() => {
                          setActiveBarangay(barangay.psgcCode)
                          onPrefetchMap?.()
                        }}
                        onBlur={() => setActiveBarangay(null)}
                        aria-label={`Open ${barangay.name} in the map, population ${formatPopulation(barangay.population)}`}
                      >
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>
                          {barangay.name}
                          {barangay.classification === 'Urban' ? (
                            <em className="is-urban">Urban</em>
                          ) : null}
                          {barangay.civicRole ? (
                            <em className="is-poblacion">{barangay.civicRole}</em>
                          ) : null}
                        </strong>
                        <b>{formatPopulation(barangay.population)}</b>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="atlas-plate__footer">
                <span className="atlas-class-key">
                  <span><i className="is-rural" />{municipalityStats.ruralCount} rural</span>
                  <span><i className="is-urban" />{municipalityStats.urbanCount} urban</span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenMap()}
                  onPointerEnter={onPrefetchMap}
                  onFocus={onPrefetchMap}
                >
                  Open full atlas
                  <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="landing-figures" id="figures" aria-labelledby="figures-heading">
          <div className="landing-shell">
            <div className="landing-section-head">
              <p className="landing-kicker">02 · Municipal snapshot</p>
              <h2 id="figures-heading">The municipality in four figures.</h2>
              <p>
                These are the same counts the map carries. They are not estimates
                invented for this page.
              </p>
            </div>

            <ul className="figure-grid">
              {figures.map((figure) => (
                <li key={figure.label}>
                  <span>{figure.label}</span>
                  <strong>{figure.value}</strong>
                  <small>{figure.note}</small>
                </li>
              ))}
            </ul>

            <p className="figure-footnote">
              Sex ratio {demographicProfile.sexRatio} men per 100 women ·
              dependency ratio {demographicProfile.dependencyRatio} ·{' '}
              {economyProfile.geothermalProject} in {economyProfile.geothermalStatus.toLowerCase()}.
            </p>
          </div>
        </section>

        <section className="landing-method" id="method" aria-labelledby="method-heading">
          <div className="landing-shell">
            <div className="landing-section-head">
              <p className="landing-kicker">03 · Method</p>
              <h2 id="method-heading">How to read the map.</h2>
              <p>
                The workspace is built for looking up a place, then checking what
                the number is and where it came from.
              </p>
            </div>

            <ol className="method-grid">
              {methods.map(({ index, title, copy, icon: Icon }) => (
                <li key={index}>
                  <span className="method-grid__index">{index}</span>
                  <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="landing-sources" id="sources" aria-labelledby="sources-heading">
          <div className="landing-shell landing-sources__grid">
            <div>
              <p className="landing-kicker landing-kicker--on-ink">04 · Sources</p>
              <h2 id="sources-heading">Open the folio, then read the footnotes.</h2>
              <p>
                This is an independent civic interface. It is not an official
                Philippine government website. Barangay boundaries are indicative
                and must not be used as legal property lines.
              </p>
              <button
                className="landing-cta landing-cta--on-ink"
                type="button"
                onClick={() => onOpenMap()}
                onPointerEnter={onPrefetchMap}
                onFocus={onPrefetchMap}
              >
                Enter the map
                <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>

            <ul className="source-ledger">
              {sources.map((source) => (
                <li key={source.agency}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    <strong>{source.agency}</strong>
                    <span>{source.detail}</span>
                    <ExternalLink size={15} strokeWidth={1.7} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <footer className="landing-footer">
            <div className="landing-shell landing-footer__inner">
              <span>Manito · Albay · Bicol Region · PH</span>
              <span>GADM academic / non-commercial geometry · PSA public statistics</span>
            </div>
          </footer>
        </section>
      </main>
    </div>
  )
}
