import { supabase } from '../lib/supabase'
import type { AttractionTag, TouristAttraction } from '../types'

interface TouristAttractionRow {
  id: string
  name: string
  tags: AttractionTag[]
  custom_tag: string | null
  barangay: string
  description: string
  location_details: string | null
  latitude: number
  longitude: number
  coordinate_accuracy: TouristAttraction['coordinateAccuracy']
  coordinate_note: string
  source_label: string
  source_url: string | null
}

interface ApprovedAttractionRow {
  id: string
  place_name: string
  tags: AttractionTag[]
  custom_tag: string | null
  barangay: string
  description: string
  location_details: string
  maps_url: string | null
  latitude: number
  longitude: number
  coordinate_accuracy: TouristAttraction['coordinateAccuracy']
  coordinate_note: string
  source_label: string
  source_url: string | null
}

export interface AttractionSubmissionInput {
  place_name: string
  tags: AttractionTag[]
  custom_tag: string | null
  barangay: string
  description: string
  location_details: string
  maps_url: string | null
  submitted_by_name: string | null
  contact_details: string
  resident_confirmation: true
}

export async function submitAttraction(input: AttractionSubmissionInput) {
  if (!supabase) throw new Error('Community submissions are not configured yet.')

  const { error } = await supabase
    .from('attraction_submissions')
    .insert(input)

  if (error) throw error
}

export async function fetchAttractions(): Promise<TouristAttraction[]> {
  if (!supabase) return []

  const [curatedResult, communityResult] = await Promise.all([
    supabase
      .from('tourist_attractions')
      .select('id, name, tags, custom_tag, barangay, description, location_details, latitude, longitude, coordinate_accuracy, coordinate_note, source_label, source_url')
      .order('sort_order', { ascending: true }),
    supabase
      .from('attraction_submissions')
      .select('id, place_name, tags, custom_tag, barangay, description, location_details, maps_url, latitude, longitude, coordinate_accuracy, coordinate_note, source_label, source_url')
      .order('created_at', { ascending: true }),
  ])

  if (curatedResult.error) throw curatedResult.error
  if (communityResult.error) throw communityResult.error

  const curated = ((curatedResult.data ?? []) as TouristAttractionRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    tags: row.tags,
    customTag: row.custom_tag ?? undefined,
    barangay: row.barangay,
    description: row.description,
    locationDetails: row.location_details ?? undefined,
    latitude: row.latitude,
    longitude: row.longitude,
    coordinateAccuracy: row.coordinate_accuracy,
    coordinateNote: row.coordinate_note,
    sourceLabel: row.source_label,
    sourceUrl: row.source_url ?? '',
  }))

  const community = ((communityResult.data ?? []) as ApprovedAttractionRow[]).map((row) => ({
    id: `community-${row.id}`,
    name: row.place_name,
    tags: row.tags,
    customTag: row.custom_tag ?? undefined,
    barangay: `Brgy. ${row.barangay}`,
    description: row.description,
    locationDetails: row.location_details,
    latitude: row.latitude,
    longitude: row.longitude,
    coordinateAccuracy: row.coordinate_accuracy,
    coordinateNote: row.coordinate_note,
    sourceLabel: row.source_label,
    sourceUrl: row.source_url ?? row.maps_url ?? '',
  }))

  return [...curated, ...community]
}
