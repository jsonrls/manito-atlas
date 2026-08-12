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

export type ManitoBoundaryCollection = FeatureCollection<Geometry, BoundaryProperties>

export interface SelectionRequest {
  code: string
  focus: boolean
  nonce: number
}
