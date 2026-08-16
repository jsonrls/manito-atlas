import { AlertTriangle, ChevronUp, Database, Layers3, List, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { BarangayDirectory } from './components/BarangayDirectory'
import { CivicHeader } from './components/CivicHeader'
import { DetailPanel } from './components/DetailPanel'
import { MapView } from './components/MapView'
import { MapModeSheet } from './components/MapModeSheet'
import { OverviewPanel } from './components/OverviewPanel'
import { SearchControl } from './components/SearchControl'
import { SourcePanel } from './components/SourcePanel'
import { StatisticsPanel } from './components/StatisticsPanel'
import { barangayByCode, mapModes } from './data/barangays'
import type {
  InsightSection,
  ManitoBoundaryCollection,
  MapMode,
  MapViewMode,
  SelectionRequest,
} from './types'

type ActivePanel = 'overview' | 'barangays' | 'statistics' | 'data'
type BoundaryState =
  | { status: 'loading'; data: null; message: string }
  | { status: 'ready'; data: ManitoBoundaryCollection; message: string }
  | { status: 'error'; data: null; message: string }

interface AppProps {
  initialBarangayCode?: string | null
  onOpenLanding: () => void
}

function App({ initialBarangayCode, onOpenLanding }: AppProps) {
  const initialSelection =
    initialBarangayCode && barangayByCode.has(initialBarangayCode)
      ? initialBarangayCode
      : null
  const [boundaryState, setBoundaryState] = useState<BoundaryState>({
    status: 'loading',
    data: null,
    message: 'Loading barangay boundaries…',
  })
  const [activePanel, setActivePanel] = useState<ActivePanel>('overview')
  const [selectedCode, setSelectedCode] = useState<string | null>(initialSelection)
  const [focusRequest, setFocusRequest] = useState<SelectionRequest | null>(
    initialSelection
      ? { code: initialSelection, focus: true, nonce: 1 }
      : null,
  )
  const [fitRequest, setFitRequest] = useState(0)
  const [mode, setMode] = useState<MapMode>('default')
  const [view, setView] = useState<MapViewMode>('satellite')
  const [insightSection, setInsightSection] = useState<InsightSection>('population')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isMobileModeSheetOpen, setIsMobileModeSheetOpen] = useState(false)

  const refitMapAfterLayout = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setFitRequest((request) => request + 1)
      })
    })
  }

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}data/manito-barangays.geojson`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Boundary request failed (${response.status})`)
        return response.json() as Promise<ManitoBoundaryCollection>
      })
      .then((data) => {
        const validFeatures = data.features.filter((feature) =>
          barangayByCode.has(feature.properties.psgcCode),
        )
        if (validFeatures.length !== 15) {
          throw new Error(`Expected 15 PSGC-matched polygons; received ${validFeatures.length}`)
        }
        setBoundaryState({
          status: 'ready',
          data: { ...data, features: validFeatures },
          message: '15 barangay boundaries loaded',
        })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setBoundaryState({
          status: 'error',
          data: null,
          message: error instanceof Error ? error.message : 'Barangay boundaries are unavailable.',
        })
        setActivePanel('barangays')
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setActivePanel('overview')
        setIsMobileSearchOpen(true)
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
          document.querySelector<HTMLInputElement>('#barangay-search-input')?.focus()
        }))
      }
      if (event.key === 'Escape') {
        if (isMobileModeSheetOpen) {
          setIsMobileModeSheetOpen(false)
        } else if (isMobileSearchOpen) {
          setIsMobileSearchOpen(false)
          refitMapAfterLayout()
        } else if (selectedCode) {
          setSelectedCode(null)
        }
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [isMobileModeSheetOpen, isMobileSearchOpen, selectedCode])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (selectedCode) {
      url.searchParams.set('barangay', selectedCode)
    } else {
      url.searchParams.delete('barangay')
    }
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    )
  }, [selectedCode])

  const selectedBarangay = selectedCode ? barangayByCode.get(selectedCode) ?? null : null
  const selectedArea = useMemo(() => {
    if (!selectedCode || boundaryState.status !== 'ready') return undefined
    return boundaryState.data.features.find(
      (feature) => feature.properties.psgcCode === selectedCode,
    )?.properties.areaSqKm
  }, [boundaryState, selectedCode])

  const selectBarangay = (code: string, focus: boolean) => {
    setIsMobileModeSheetOpen(false)
    setIsMobileSearchOpen(false)
    setSelectedCode(code)
    setActivePanel('overview')
    setFocusRequest((request) => ({
      code,
      focus,
      nonce: (request?.nonce ?? 0) + 1,
    }))
  }

  const openOverview = () => {
    setIsMobileModeSheetOpen(false)
    setIsMobileSearchOpen(false)
    setActivePanel('overview')
    setSelectedCode(null)
    setFitRequest((request) => request + 1)
  }

  const openPanel = (panel: Exclude<ActivePanel, 'overview'>) => {
    setIsMobileModeSheetOpen(false)
    setIsMobileSearchOpen(false)
    setActivePanel(panel)
    setSelectedCode(null)
  }

  const openInsights = (section: InsightSection) => {
    setIsMobileModeSheetOpen(false)
    setIsMobileSearchOpen(false)
    setInsightSection(section)
    setActivePanel('statistics')
    setSelectedCode(null)
    if (section !== 'economy' && mode === 'default') setMode('population')
  }

  const toggleMobileSearch = () => {
    const nextOpen = activePanel !== 'overview' || !isMobileSearchOpen
    setActivePanel('overview')
    setIsMobileModeSheetOpen(false)
    setIsMobileSearchOpen(nextOpen)

    if (!selectedCode) refitMapAfterLayout()
    if (nextOpen) {
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        document.querySelector<HTMLInputElement>('#barangay-search-input')?.focus()
      }))
    }
  }

  const activeMode = mapModes.find((item) => item.id === mode) ?? mapModes[0]

  const openMobileModeSheet = () => {
    setIsMobileSearchOpen(false)
    setIsMobileModeSheetOpen(true)
    if (isMobileSearchOpen && !selectedCode) refitMapAfterLayout()
  }

  return (
    <main className="app-shell">
      <CivicHeader
        activePanel={activePanel}
        isMobileSearchOpen={isMobileSearchOpen}
        onOpenLanding={onOpenLanding}
        onSearch={toggleMobileSearch}
        onOverview={openOverview}
        onBarangays={() => openPanel('barangays')}
        onInsights={() => openInsights(insightSection)}
        onAboutData={() => openPanel('data')}
      />

      <section className="map-workspace" aria-label="Manito Atlas workspace">
        {boundaryState.status === 'ready' ? (
          <MapView
            boundaries={boundaryState.data}
            selectedCode={selectedCode}
            focusRequest={focusRequest}
            fitRequest={fitRequest}
            mode={mode}
            view={view}
            onViewChange={setView}
            onSelect={(code) => selectBarangay(code, false)}
          />
        ) : (
          <MapState status={boundaryState.status} message={boundaryState.message} onDirectory={() => openPanel('barangays')} />
        )}

        {activePanel === 'overview' && !selectedBarangay && (
          <div className={`left-stack${isMobileSearchOpen ? ' has-mobile-search' : ''}`}>
            <SearchControl
              mobileVisible={isMobileSearchOpen}
              onSelect={(code) => selectBarangay(code, true)}
            />
            <OverviewPanel
              onOpenDirectory={() => openPanel('barangays')}
              onOpenDemographics={() => openInsights('demographics')}
              onOpenEconomy={() => openInsights('economy')}
              onLayoutChange={refitMapAfterLayout}
            />
          </div>
        )}

        {activePanel === 'overview' && selectedBarangay && (
          <div className={`search-only${isMobileSearchOpen ? ' has-mobile-search' : ''}`}>
            <SearchControl
              mobileVisible={isMobileSearchOpen}
              onSelect={(code) => selectBarangay(code, true)}
            />
          </div>
        )}

        {boundaryState.status === 'ready' && (
          <>
            <div className="map-mode-switch" role="group" aria-label="Map display mode">
              <span className="map-mode-switch__icon" aria-hidden="true"><Layers3 size={16} strokeWidth={1.8} /></span>
              {mapModes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={mode === item.id ? 'is-active' : ''}
                  onClick={() => setMode(item.id)}
                  title={item.description}
                  aria-pressed={mode === item.id}
                >
                  <span className="mode-label-long">{item.label}</span>
                  <span className="mode-label-short">{item.shortLabel}</span>
                </button>
              ))}
            </div>

            <button
              className="mobile-mode-trigger"
              type="button"
              onClick={openMobileModeSheet}
              aria-label={`Open data lens filters. Current lens: ${activeMode.label}.`}
              aria-haspopup="dialog"
              aria-expanded={isMobileModeSheetOpen}
            >
              <SlidersHorizontal size={17} strokeWidth={1.8} aria-hidden="true" />
              <span><small>Data lens</small><strong>{activeMode.label}</strong></span>
              <ChevronUp size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </>
        )}

        {isMobileModeSheetOpen && (
          <MapModeSheet
            mode={mode}
            onModeChange={setMode}
            onClose={() => setIsMobileModeSheetOpen(false)}
          />
        )}

        {activePanel === 'barangays' && (
          <BarangayDirectory
            onClose={() => setActivePanel('overview')}
            onSelect={(code) => selectBarangay(code, true)}
          />
        )}

        {activePanel === 'statistics' && (
          <StatisticsPanel
            section={insightSection}
            onSectionChange={setInsightSection}
            mode={mode}
            onModeChange={setMode}
            onSelect={(code) => selectBarangay(code, true)}
            onClose={() => setActivePanel('overview')}
          />
        )}

        {activePanel === 'data' && (
          <SourcePanel onClose={() => setActivePanel('overview')} />
        )}

        {selectedBarangay && (
          <DetailPanel
            barangay={selectedBarangay}
            areaSqKm={selectedArea}
            onClose={() => setSelectedCode(null)}
            onSelect={(code) => selectBarangay(code, true)}
          />
        )}

        {activePanel === 'overview' && !selectedBarangay && (
          <button
            className="provenance-chip"
            type="button"
            onClick={() => openPanel('data')}
            title="About data and sources"
          >
            <Database size={15} strokeWidth={1.8} aria-hidden="true" />
            <span><strong>PSA + GADM</strong><small>GADM 3.6 boundaries · 2018</small></span>
          </button>
        )}
      </section>
    </main>
  )
}

function MapState({
  status,
  message,
  onDirectory,
}: {
  status: 'loading' | 'error'
  message: string
  onDirectory: () => void
}) {
  return (
    <div className={`map-state map-state--${status}`}>
      <div className="map-state__grid" aria-hidden="true" />
      <div className="map-state__shape" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
      <div className="map-state__message" role={status === 'error' ? 'alert' : 'status'}>
        {status === 'error' ? <AlertTriangle size={22} aria-hidden="true" /> : <span className="loading-orbit" aria-hidden="true" />}
        <span>
          <small>{status === 'error' ? 'Map unavailable' : 'Preparing Manito Atlas'}</small>
          <strong>{status === 'error' ? 'Boundary layer could not be loaded.' : message}</strong>
          {status === 'loading' && <em>Loading PSA data by 10-digit PSGC…</em>}
          {status === 'error' && <em>{message}</em>}
        </span>
        {status === 'error' && (
          <button type="button" onClick={onDirectory}>
            <List size={16} aria-hidden="true" /> Open barangay directory
          </button>
        )}
      </div>
    </div>
  )
}

export default App
