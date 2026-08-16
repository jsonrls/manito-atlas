import {
  BedDouble,
  Bike,
  Binoculars,
  Flame,
  Landmark,
  ShoppingBag,
  Tag,
  Trees,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import type { AttractionTag } from '../types'

export const attractionTags: Array<{
  id: AttractionTag
  label: string
  description: string
  icon: LucideIcon
}> = [
  { id: 'resto', label: 'Resto', description: 'Restaurant, carinderia, café, or food stop', icon: UtensilsCrossed },
  { id: 'beach', label: 'Beach', description: 'Beach, cove, or coastal destination', icon: Waves },
  { id: 'nature', label: 'Nature', description: 'Forest, mangrove, lake, or natural site', icon: Trees },
  { id: 'hot-spring', label: 'Hot spring', description: 'Geothermal spring, geyser, or mud pool', icon: Flame },
  { id: 'heritage', label: 'Heritage', description: 'Church, landmark, or cultural place', icon: Landmark },
  { id: 'stay', label: 'Stay', description: 'Resort, homestay, or accommodation', icon: BedDouble },
  { id: 'shop', label: 'Shop', description: 'Local product, market, or pasalubong stop', icon: ShoppingBag },
  { id: 'activity', label: 'Activity', description: 'Trail, tour, watersport, or experience', icon: Bike },
  { id: 'viewpoint', label: 'Viewpoint', description: 'Scenic lookout or photo stop', icon: Binoculars },
  { id: 'custom', label: 'Custom', description: 'Add a place type that is not listed', icon: Tag },
]

export const attractionTagById = new Map(
  attractionTags.map((tag) => [tag.id, tag]),
)
