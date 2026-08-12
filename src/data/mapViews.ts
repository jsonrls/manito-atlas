import { Map as MapIcon, Mountain, Satellite, type LucideIcon } from 'lucide-react'
import type { MapViewMode } from '../types'

export interface MapViewOption {
  id: MapViewMode
  label: string
  shortLabel: string
  description: string
  sheetSummary: string
  icon: LucideIcon
}

export const mapViewOptions: MapViewOption[] = [
  {
    id: 'map',
    label: 'Map',
    shortLabel: 'Map',
    description: 'Civic basemap with administrative context.',
    sheetSummary: 'Civic',
    icon: MapIcon,
  },
  {
    id: 'satellite',
    label: 'Satellite',
    shortLabel: 'Satellite',
    description: 'Satellite imagery with the GADM barangay boundaries.',
    sheetSummary: 'Imagery',
    icon: Satellite,
  },
  {
    id: 'satellite-3d',
    label: '3D satellite',
    shortLabel: '3D',
    description: 'Satellite imagery draped over interactive elevation terrain.',
    sheetSummary: 'Terrain',
    icon: Mountain,
  },
]
