import type { ExpressionSpecification, StyleSpecification } from '@maplibre/maplibre-gl-style-spec'
import { Check, Layers3, Maximize2, Minus, Mountain, Plus, RotateCcw } from 'lucide-react'
import {
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  Popup,
  setWorkerUrl,
  type MapLayerMouseEvent,
} from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { barangayByCode, barangays, formatDensity, formatPopulation } from '../data/barangays'
import { mapViewOptions } from '../data/mapViews'
import type {
  BoundaryProperties,
  ManitoBoundaryCollection,
  MapMode,
  MapViewMode,
  SelectionRequest,
} from '../types'

setWorkerUrl(maplibreWorkerUrl)

interface MapViewProps {
  boundaries: ManitoBoundaryCollection
  selectedCode: string | null
  focusRequest: SelectionRequest | null
  fitRequest: number
  mode: MapMode
  view: MapViewMode
  onViewChange: (view: MapViewMode) => void
  onSelect: (code: string) => void
}

interface MarkerEntry {
  element: HTMLButtonElement
  marker: Marker
}

const palette = {
  ink: '#182522',
  accent: '#c84f35',
  rural: '#8ea894',
  urban: '#c57a4f',
  populationLow: '#e2e7d8',
  populationHigh: '#47776a',
  densityLow: '#eee2c8',
  densityHigh: '#825847',
}

const layerIds = {
  carto: 'carto-basemap',
  satellite: 'satellite-basemap',
  fill: 'barangay-fill',
  outline: 'barangay-outline',
  hover: 'barangay-hover',
  selectedFill: 'barangay-selected-fill',
  selectedOutline: 'barangay-selected-outline',
} as const

const sourceIds = {
  boundaries: 'manito-boundaries',
  terrain: 'terrain-dem',
} as const

const EMPTY_FILTER_CODE = '__no_barangay__'
const TERRAIN_PITCH = 58
const TERRAIN_BEARING = -18

const blendHex = (start: string, end: string, amount: number) => {
  const from = start.replace('#', '')
  const to = end.replace('#', '')
  const channel = (offset: number) => {
    const a = Number.parseInt(from.slice(offset, offset + 2), 16)
    const b = Number.parseInt(to.slice(offset, offset + 2), 16)
    return Math.round(a + (b - a) * amount).toString(16).padStart(2, '0')
  }
  return `#${channel(0)}${channel(2)}${channel(4)}`
}

const escapeMarkup = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character)

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const extendCoordinateTree = (bounds: LngLatBounds, value: unknown) => {
  if (!Array.isArray(value)) return
  if (
    value.length >= 2
    && typeof value[0] === 'number'
    && typeof value[1] === 'number'
  ) {
    bounds.extend([value[0], value[1]])
    return
  }
  value.forEach((child) => extendCoordinateTree(bounds, child))
}

const geometryBounds = (geometry: GeoJSON.Geometry) => {
  const bounds = new LngLatBounds()
  if (geometry.type === 'GeometryCollection') {
    geometry.geometries.forEach((item) => {
      const childBounds = geometryBounds(item)
      bounds.extend(childBounds.getSouthWest())
      bounds.extend(childBounds.getNorthEast())
    })
  } else {
    extendCoordinateTree(bounds, geometry.coordinates)
  }
  return bounds
}

const collectionBounds = (boundaries: ManitoBoundaryCollection) => {
  const bounds = new LngLatBounds()
  boundaries.features.forEach((feature) => {
    const featureBounds = geometryBounds(feature.geometry)
    bounds.extend(featureBounds.getSouthWest())
    bounds.extend(featureBounds.getNorthEast())
  })
  return bounds
}

const expandedBounds = (bounds: LngLatBounds, factor = 1.35) => {
  const longitudePadding = (bounds.getEast() - bounds.getWest()) * factor
  const latitudePadding = (bounds.getNorth() - bounds.getSouth()) * factor
  return new LngLatBounds(
    [bounds.getWest() - longitudePadding, bounds.getSouth() - latitudePadding],
    [bounds.getEast() + longitudePadding, bounds.getNorth() + latitudePadding],
  )
}

const createStyle = (boundaries: ManitoBoundaryCollection): StyleSpecification => ({
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
    satellite: {
      type: 'raster',
      tiles: [
        'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg',
      ],
      tileSize: 256,
      maxzoom: 14,
      attribution: '<a href="https://cloudless.eox.at/">EOxCloudless</a> by <a href="https://eox.at/">EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2020)',
    },
    [sourceIds.terrain]: {
      type: 'raster-dem',
      url: 'https://tiles.mapterhorn.com/tilejson.json',
    },
    [sourceIds.boundaries]: {
      type: 'geojson',
      data: boundaries,
    },
  },
  layers: [
    {
      id: 'map-background',
      type: 'background',
      paint: { 'background-color': '#cbd9d4' },
    },
    {
      id: layerIds.carto,
      type: 'raster',
      source: 'carto',
      paint: {
        'raster-opacity': 0.72,
        'raster-saturation': -0.5,
        'raster-contrast': -0.04,
        'raster-brightness-min': 0.08,
        'raster-brightness-max': 0.98,
      },
    },
    {
      id: layerIds.satellite,
      type: 'raster',
      source: 'satellite',
      layout: { visibility: 'none' },
      paint: {
        'raster-saturation': -0.06,
        'raster-contrast': 0.08,
      },
    },
    {
      id: layerIds.fill,
      type: 'fill',
      source: sourceIds.boundaries,
      paint: {
        'fill-color': palette.rural,
        'fill-opacity': 0.44,
      },
    },
    {
      id: layerIds.outline,
      type: 'line',
      source: sourceIds.boundaries,
      paint: {
        'line-color': palette.ink,
        'line-width': 1.35,
        'line-opacity': 0.86,
      },
    },
    {
      id: layerIds.hover,
      type: 'line',
      source: sourceIds.boundaries,
      filter: ['==', ['get', 'psgcCode'], EMPTY_FILTER_CODE],
      paint: {
        'line-color': palette.ink,
        'line-width': 2.8,
        'line-opacity': 1,
      },
    },
    {
      id: layerIds.selectedFill,
      type: 'fill',
      source: sourceIds.boundaries,
      filter: ['==', ['get', 'psgcCode'], EMPTY_FILTER_CODE],
      paint: {
        'fill-color': palette.accent,
        'fill-opacity': 0.78,
      },
    },
    {
      id: layerIds.selectedOutline,
      type: 'line',
      source: sourceIds.boundaries,
      filter: ['==', ['get', 'psgcCode'], EMPTY_FILTER_CODE],
      paint: {
        'line-color': '#141c1a',
        'line-width': 3.4,
        'line-opacity': 1,
      },
    },
  ],
})

const colorExpression = (
  boundaries: ManitoBoundaryCollection,
  mode: MapMode,
): ExpressionSpecification => {
  const populationValues = barangays.map((barangay) => barangay.population)
  const minPopulation = Math.min(...populationValues)
  const maxPopulation = Math.max(...populationValues)
  const densityValues = boundaries.features.map((feature) => {
    const record = barangayByCode.get(feature.properties.psgcCode)
    return record ? record.population / feature.properties.areaSqKm : 0
  })
  const minDensity = Math.min(...densityValues)
  const maxDensity = Math.max(...densityValues)

  const matches = boundaries.features.flatMap((feature) => {
    const record = barangayByCode.get(feature.properties.psgcCode)
    let color = record?.classification === 'Urban' ? palette.urban : palette.rural

    if (mode === 'population' && record) {
      const normalized = (record.population - minPopulation) / Math.max(maxPopulation - minPopulation, 1)
      color = blendHex(palette.populationLow, palette.populationHigh, normalized)
    }
    if (mode === 'density' && record) {
      const density = record.population / feature.properties.areaSqKm
      const normalized = (density - minDensity) / Math.max(maxDensity - minDensity, 1)
      color = blendHex(palette.densityLow, palette.densityHigh, Math.sqrt(normalized))
    }

    return [feature.properties.psgcCode, color]
  })

  return ['match', ['get', 'psgcCode'], ...matches, palette.rural] as unknown as ExpressionSpecification
}

const fillOpacity = (mode: MapMode, view: MapViewMode) => {
  if (view === 'map') {
    if (mode === 'population' || mode === 'density') return 0.76
    if (mode === 'classification') return 0.62
    return 0.44
  }
  if (mode === 'population' || mode === 'density') return view === 'satellite-3d' ? 0.46 : 0.5
  if (mode === 'classification') return view === 'satellite-3d' ? 0.4 : 0.44
  return view === 'satellite-3d' ? 0.2 : 0.24
}

const applyThematicStyle = (
  map: MapLibreMap,
  boundaries: ManitoBoundaryCollection,
  mode: MapMode,
  view: MapViewMode,
) => {
  if (!map.getLayer(layerIds.fill)) return
  const onImagery = view !== 'map'
  map.setPaintProperty(layerIds.fill, 'fill-color', colorExpression(boundaries, mode))
  map.setPaintProperty(layerIds.fill, 'fill-opacity', fillOpacity(mode, view))
  map.setPaintProperty(layerIds.outline, 'line-color', onImagery ? '#fff7df' : palette.ink)
  map.setPaintProperty(layerIds.outline, 'line-width', onImagery ? 1.7 : 1.35)
  map.setPaintProperty(layerIds.outline, 'line-opacity', onImagery ? 0.94 : 0.86)
  map.setPaintProperty(layerIds.hover, 'line-color', onImagery ? '#ffffff' : palette.ink)
  map.setPaintProperty(layerIds.selectedFill, 'fill-opacity', onImagery ? 0.64 : 0.78)
  map.setPaintProperty(layerIds.selectedOutline, 'line-color', onImagery ? '#fffdf4' : '#141c1a')
}

const applyBaseView = (map: MapLibreMap, view: MapViewMode, animate: boolean) => {
  if (!map.getLayer(layerIds.carto)) return
  const satelliteVisible = view !== 'map'
  const terrainVisible = view === 'satellite-3d'

  map.setLayoutProperty(layerIds.carto, 'visibility', satelliteVisible ? 'none' : 'visible')
  map.setLayoutProperty(layerIds.satellite, 'visibility', satelliteVisible ? 'visible' : 'none')
  map.setTerrain(terrainVisible ? { source: sourceIds.terrain, exaggeration: 1.35 } : null)

  if (terrainVisible) {
    map.dragRotate.enable()
    map.touchZoomRotate.enableRotation()
  } else {
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()
  }

  map.easeTo({
    pitch: terrainVisible ? TERRAIN_PITCH : 0,
    bearing: terrainVisible ? TERRAIN_BEARING : 0,
    duration: animate && !prefersReducedMotion() ? 720 : 0,
    essential: true,
  })
}

const fitMunicipality = (
  map: MapLibreMap,
  bounds: LngLatBounds,
  view: MapViewMode,
  animate: boolean,
) => {
  const container = map.getContainer()
  const compact = container.clientWidth <= 680
  const containerRect = container.getBoundingClientRect()
  const workspace = container.parentElement
  const topOverlay = workspace?.querySelector<HTMLElement>('.left-stack')
  const dockElements = Array.from(
    workspace?.querySelectorAll<HTMLElement>(
      '.map-view-switch, .map-mode-switch, .mobile-mode-trigger',
    ) ?? [],
  ).filter((element) => element.getClientRects().length > 0)

  const topOverlayBottom = topOverlay
    ? topOverlay.getBoundingClientRect().bottom - containerRect.top
    : 58
  const dockTop = dockElements
    .map((element) => element.getBoundingClientRect().top - containerRect.top)
  const bottomDockHeight = dockTop.length > 0
    ? containerRect.height - Math.min(...dockTop)
    : 104

  const compactPadding = {
    top: Math.min(
      Math.max(Math.ceil(topOverlayBottom + 12), 72),
      Math.floor(containerRect.height * 0.48),
    ),
    right: 12,
    bottom: Math.min(
      Math.max(Math.ceil(bottomDockHeight + 10), 96),
      Math.floor(containerRect.height * 0.26),
    ),
    left: 12,
  }

  map.fitBounds(bounds, {
    padding: compact
      ? compactPadding
      : { top: 44, right: 44, bottom: 54, left: 44 },
    pitch: view === 'satellite-3d' ? TERRAIN_PITCH : 0,
    bearing: view === 'satellite-3d' ? TERRAIN_BEARING : 0,
    duration: animate && !prefersReducedMotion() ? 620 : 0,
    maxZoom: 14,
  })
}

const popupMarkup = (
  properties: BoundaryProperties,
  mode: MapMode,
) => {
  const record = barangayByCode.get(properties.psgcCode)
  if (!record) return ''
  const civicContext = [record.classification, record.civicRole]
    .filter(Boolean)
    .join(' · ')
  return `<div class="map-card">
    <div class="map-card__topline"><span>${escapeMarkup(civicContext)}</span><span>2024 POPCEN</span></div>
    <strong>${escapeMarkup(record.name)}</strong>
    <code>PSGC ${record.psgcCode}</code>
    <div class="map-card__stats">
      <span><small>Population</small><b>${formatPopulation(record.population)}</b></span>
      <span><small>${mode === 'density' ? 'Approx. density' : 'Classification'}</small><b>${mode === 'density' ? `${formatDensity(record.population, properties.areaSqKm)} / km²` : escapeMarkup(civicContext)}</b></span>
    </div>
    <div class="map-card__prompt">Click to open barangay record <span>↗</span></div>
  </div>`
}

export function MapView({
  boundaries,
  selectedCode,
  focusRequest,
  fitRequest,
  mode,
  view,
  onViewChange,
  onSelect,
}: MapViewProps) {
  const mapHostRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const popupRef = useRef<Popup | null>(null)
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map())
  const isReadyRef = useRef(false)
  const modeRef = useRef(mode)
  const viewRef = useRef(view)
  const selectedCodeRef = useRef(selectedCode)
  const onSelectRef = useRef(onSelect)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  modeRef.current = mode
  viewRef.current = view
  selectedCodeRef.current = selectedCode
  onSelectRef.current = onSelect

  const municipalBounds = useMemo(() => collectionBounds(boundaries), [boundaries])
  const featureByCode = useMemo(
    () => new Map(boundaries.features.map((feature) => [feature.properties.psgcCode, feature])),
    [boundaries],
  )
  const densityValues = useMemo(
    () => boundaries.features.map((feature) => {
      const record = barangayByCode.get(feature.properties.psgcCode)
      return record ? record.population / feature.properties.areaSqKm : 0
    }),
    [boundaries],
  )
  const minDensity = Math.min(...densityValues)
  const maxDensity = Math.max(...densityValues)

  useEffect(() => {
    const host = mapHostRef.current
    if (!host) return

    let map: MapLibreMap
    try {
      map = new MapLibreMap({
        container: host,
        style: createStyle(boundaries),
        center: [123.86, 13.115],
        zoom: 12,
        minZoom: 10,
        maxZoom: 18,
        maxPitch: 75,
        renderWorldCopies: false,
        maplibreLogo: false,
        attributionControl: {
          compact: true,
          customAttribution: '<a href="https://gadm.org/maps/PHL/albay/manito_3.html">GADM 3.6</a>',
        },
      })
    } catch (error) {
      setMapError(error instanceof Error ? error.message : 'The interactive map could not start.')
      return
    }

    mapRef.current = map
    const popup = new Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'barangay-map-popup',
      maxWidth: '250px',
      offset: 15,
    })
    popupRef.current = popup

    const handleMove = (event: MapLayerMouseEvent) => {
      const properties = event.features?.[0]?.properties as BoundaryProperties | undefined
      if (!properties || !barangayByCode.has(properties.psgcCode)) return
      map.getCanvas().style.cursor = 'pointer'
      setHoveredCode(properties.psgcCode)
      map.setFilter(layerIds.hover, ['==', ['get', 'psgcCode'], properties.psgcCode])
      popup
        .setLngLat(event.lngLat)
        .setHTML(popupMarkup(properties, modeRef.current))
        .addTo(map)
    }

    const handleLeave = () => {
      map.getCanvas().style.cursor = ''
      setHoveredCode(null)
      map.setFilter(layerIds.hover, ['==', ['get', 'psgcCode'], EMPTY_FILTER_CODE])
      popup.remove()
    }

    const handleClick = (event: MapLayerMouseEvent) => {
      const code = event.features?.[0]?.properties?.psgcCode
      if (typeof code === 'string' && barangayByCode.has(code)) onSelectRef.current(code)
    }

    const handleLoad = () => {
      isReadyRef.current = true
      applyThematicStyle(map, boundaries, modeRef.current, viewRef.current)
      applyBaseView(map, viewRef.current, false)
      map.setMaxBounds(expandedBounds(municipalBounds))
      fitMunicipality(map, municipalBounds, viewRef.current, false)

      boundaries.features.forEach((feature) => {
        const record = barangayByCode.get(feature.properties.psgcCode)
        if (!record) return
        const element = document.createElement('button')
        element.type = 'button'
        element.className = 'barangay-map-label'
        element.textContent = record.name
        element.title = `Open ${record.name}`
        element.setAttribute(
          'aria-label',
          `${record.name}, ${formatPopulation(record.population)} people, ${[
            record.classification,
            record.civicRole,
          ].filter(Boolean).join(', ')}. Open barangay details.`,
        )
        element.classList.toggle('is-selected', selectedCodeRef.current === record.psgcCode)
        element.addEventListener('click', (event) => {
          event.stopPropagation()
          onSelectRef.current(record.psgcCode)
        })
        const marker = new Marker({ element, anchor: 'center' })
          .setLngLat(geometryBounds(feature.geometry).getCenter())
          .addTo(map)
        markersRef.current.set(record.psgcCode, { element, marker })
      })

      map.on('mousemove', layerIds.fill, handleMove)
      map.on('mouseleave', layerIds.fill, handleLeave)
      map.on('click', layerIds.fill, handleClick)
    }

    map.once('load', handleLoad)

    return () => {
      isReadyRef.current = false
      popup.remove()
      markersRef.current.forEach(({ marker }) => marker.remove())
      markersRef.current.clear()
      map.remove()
      mapRef.current = null
      popupRef.current = null
    }
  }, [boundaries, municipalBounds])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isReadyRef.current) return
    applyThematicStyle(map, boundaries, mode, view)
  }, [boundaries, mode, view])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isReadyRef.current) return
    applyBaseView(map, view, true)
  }, [view])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isReadyRef.current) return
    const code = selectedCode ?? EMPTY_FILTER_CODE
    map.setFilter(layerIds.selectedFill, ['==', ['get', 'psgcCode'], code])
    map.setFilter(layerIds.selectedOutline, ['==', ['get', 'psgcCode'], code])
    markersRef.current.forEach(({ element }, markerCode) => {
      element.classList.toggle('is-selected', markerCode === selectedCode)
    })
  }, [selectedCode])

  useEffect(() => {
    const map = mapRef.current
    if (!fitRequest || !map || !isReadyRef.current) return
    fitMunicipality(map, municipalBounds, view, true)
  }, [fitRequest, municipalBounds, view])

  useEffect(() => {
    const map = mapRef.current
    if (!focusRequest?.focus || !map || !isReadyRef.current) return
    const feature = featureByCode.get(focusRequest.code)
    if (!feature) return
    const compact = map.getContainer().clientWidth <= 680
    map.fitBounds(geometryBounds(feature.geometry), {
      padding: compact
        ? { top: 58, right: 24, bottom: Math.min(300, map.getContainer().clientHeight * 0.48), left: 24 }
        : { top: 80, right: 420, bottom: 54, left: 42 },
      pitch: view === 'satellite-3d' ? TERRAIN_PITCH : 0,
      bearing: view === 'satellite-3d' ? TERRAIN_BEARING : 0,
      maxZoom: 15,
      duration: prefersReducedMotion() ? 0 : 620,
    })
  }, [featureByCode, focusRequest, view])

  useEffect(() => {
    const update = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
      window.requestAnimationFrame(() => mapRef.current?.resize())
    }
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`map-canvas map-canvas--${view}`}
      aria-label="Interactive map of Manito barangays"
    >
      <div ref={mapHostRef} className="maplibre-map" />

      <div className="map-texture" aria-hidden="true" />

      <div className="map-view-switch" role="group" aria-label="Map view">
        <span className="map-view-switch__label">View</span>
        {mapViewOptions.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={view === item.id ? 'is-active' : ''}
              onClick={() => onViewChange(item.id)}
              title={item.description}
              aria-label={`Use ${item.label} view`}
              aria-pressed={view === item.id}
            >
              <Icon size={15} strokeWidth={1.7} aria-hidden="true" />
              <span className="view-label-long">{item.label}</span>
              <span className="view-label-short">{item.shortLabel}</span>
            </button>
          )
        })}
      </div>

      {view === 'satellite-3d' && (
        <div className="terrain-cue" aria-live="polite">
          <Mountain size={15} strokeWidth={1.7} aria-hidden="true" />
          <span><strong>Terrain active</strong><small>Drag to rotate</small></span>
        </div>
      )}

      <div className="map-controls" aria-label="Map controls">
        <button type="button" onClick={() => mapRef.current?.zoomIn({ duration: 220 })} aria-label="Zoom in" title="Zoom in">
          <Plus size={19} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => mapRef.current?.zoomOut({ duration: 220 })} aria-label="Zoom out" title="Zoom out">
          <Minus size={19} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            const map = mapRef.current
            if (map) fitMunicipality(map, municipalBounds, view, true)
          }}
          aria-label="Fit map to Manito"
          title="Fit Manito and reset orientation"
        >
          <RotateCcw size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={async () => {
            if (document.fullscreenElement) await document.exitFullscreen()
            else await containerRef.current?.requestFullscreen()
          }}
          aria-label={isFullscreen ? 'Exit fullscreen map' : 'Open fullscreen map'}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          <Maximize2 size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <MobileMapViewControl view={view} onChange={onViewChange} />

      {mapError && (
        <div className="map-engine-error" role="alert">
          <strong>Map rendering unavailable</strong>
          <span>{mapError}</span>
        </div>
      )}

      <MapLegend mode={mode} minDensity={minDensity} maxDensity={maxDensity} hoveredCode={hoveredCode} />
    </div>
  )
}

function MobileMapViewControl({
  view,
  onChange,
}: {
  view: MapViewMode
  onChange: (view: MapViewMode) => void
}) {
  const controlRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const activeOptionRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const activeOption = mapViewOptions.find((item) => item.id === view) ?? mapViewOptions[0]

  useEffect(() => {
    if (!isOpen) return

    const focusFrame = window.requestAnimationFrame(() => activeOptionRef.current?.focus())
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !controlRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      setIsOpen(false)
      window.requestAnimationFrame(() => triggerRef.current?.focus())
    }

    document.addEventListener('pointerdown', closeOnOutsidePress, true)
    document.addEventListener('keydown', closeOnEscape, true)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('pointerdown', closeOnOutsidePress, true)
      document.removeEventListener('keydown', closeOnEscape, true)
    }
  }, [isOpen])

  const moveMenuFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const options = Array.from(
      controlRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [],
    )
    if (options.length === 0) return
    event.preventDefault()
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement)
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? options.length - 1
        : event.key === 'ArrowDown'
          ? (currentIndex + 1) % options.length
          : (currentIndex - 1 + options.length) % options.length
    options[nextIndex]?.focus()
  }

  return (
    <div ref={controlRef} className="mobile-map-view-control">
      <button
        ref={triggerRef}
        className={`mobile-map-view-trigger${isOpen ? ' is-open' : ''}`}
        type="button"
        aria-label={`Choose base map. Current view: ${activeOption.label}.`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="mobile-map-view-menu"
        title={`Base map: ${activeOption.label}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Layers3 size={18} strokeWidth={1.8} aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id="mobile-map-view-menu"
          className="mobile-map-view-menu"
          role="menu"
          aria-label="Base map views"
          onKeyDown={moveMenuFocus}
        >
          <div className="mobile-map-view-menu__header">
            <span>Base map</span>
            <small>{activeOption.shortLabel} active</small>
          </div>
          {mapViewOptions.map((item) => {
            const Icon = item.icon
            const isActive = item.id === view
            return (
              <button
                key={item.id}
                ref={isActive ? activeOptionRef : undefined}
                type="button"
                className={isActive ? 'is-active' : ''}
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  onChange(item.id)
                  setIsOpen(false)
                  window.requestAnimationFrame(() => triggerRef.current?.focus())
                }}
              >
                <span className="mobile-map-view-menu__icon">
                  <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.sheetSummary}</small>
                </span>
                {isActive ? <Check size={15} strokeWidth={2} aria-hidden="true" /> : null}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MapLegend({
  mode,
  minDensity,
  maxDensity,
  hoveredCode,
}: {
  mode: MapMode
  minDensity: number
  maxDensity: number
  hoveredCode: string | null
}) {
  const hovered = hoveredCode ? barangayByCode.get(hoveredCode) : null

  return (
    <div className={`map-legend map-legend--${mode}`} aria-live="polite">
      <div className="map-legend__heading">
        <span>{mode === 'default' ? 'Administrative view' : mode === 'classification' ? 'Settlement class' : mode}</span>
        <span>{hovered ? hovered.name : '15 barangays'}</span>
      </div>
      {mode === 'default' && (
        <div className="legend-categories">
          <span><i className="legend-swatch legend-swatch--rural" /> Rural boundary</span>
          <span><i className="legend-swatch legend-swatch--urban" /> Urban boundary</span>
        </div>
      )}
      {mode === 'classification' && (
        <div className="legend-categories">
          <span><i className="legend-swatch legend-swatch--rural" /> Rural · 14</span>
          <span><i className="legend-swatch legend-swatch--urban" /> Urban · 1</span>
        </div>
      )}
      {(mode === 'population' || mode === 'density') && (
        <div className="legend-gradient-wrap">
          <div className={`legend-gradient legend-gradient--${mode}`} />
          <div>
            <span>{mode === 'population' ? '613' : `${Math.round(minDensity)}/km²`}</span>
            <span>{mode === 'population' ? '4,132 people' : `${Math.round(maxDensity).toLocaleString('en-PH')}/km²`}</span>
          </div>
        </div>
      )}
    </div>
  )
}
