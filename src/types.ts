import type { FeatureCollection, Geometry } from 'geojson'

export type BarangayClassification = 'Urban' | 'Rural'

export type MapMode = 'default' | 'population' | 'classification' | 'density'

export type MapViewMode = 'map' | 'satellite' | 'satellite-3d'

export type InsightSection = 'population' | 'demographics' | 'economy'

export interface BarangayRecord {
  name: string
  psgcCode: string
  correspondenceCode: string
  classification: BarangayClassification
  civicRole?: 'Poblacion'
  population: number
  populationYear: 2024
  municipality: 'Manito'
  province: 'Albay'
  region: 'Region V (Bicol Region)'
  dataSource: 'Philippine Statistics Authority — PSGC'
  sourceUrl: string
}

export interface BoundaryProperties {
  name: string
  psgcCode: string
  areaSqKm: number
  boundarySource: string
  boundaryVersion: string
  gadmId: string
}

export type AttractionTag =
  | 'resto'
  | 'beach'
  | 'nature'
  | 'hot-spring'
  | 'heritage'
  | 'stay'
  | 'shop'
  | 'activity'
  | 'viewpoint'
  | 'custom'

export interface TouristAttraction {
  id: string
  name: string
  tags: AttractionTag[]
  customTag?: string
  barangay: string
  description: string
  locationDetails?: string
  latitude: number
  longitude: number
  coordinateAccuracy: 'verified' | 'approximate' | 'provisional'
  coordinateNote: string
  sourceLabel: string
  sourceUrl: string
}

export type ManitoBoundaryCollection = FeatureCollection<Geometry, BoundaryProperties>

export interface SelectionRequest {
  code: string
  focus: boolean
  nonce: number
}
