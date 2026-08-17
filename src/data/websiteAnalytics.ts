import { supabase } from '../lib/supabase'

const visitorStorageKey = 'manito-atlas-visitor-id'
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

let visitRecorded = false

function visitorId(): string | null {
  try {
    const storedId = window.localStorage.getItem(visitorStorageKey)
    if (storedId && uuidPattern.test(storedId)) return storedId

    const newId = window.crypto.randomUUID()
    window.localStorage.setItem(visitorStorageKey, newId)
    return newId
  } catch {
    return null
  }
}

export async function recordWebsiteVisit(): Promise<void> {
  if (visitRecorded || !supabase) return
  visitRecorded = true

  const id = visitorId()
  if (!id) return

  const { error } = await supabase.rpc('record_website_visit', { p_visitor_id: id })
  if (error && import.meta.env.DEV) {
    console.warn('Website visit could not be recorded:', error.message)
  }
}

export function clearWebsiteAnalyticsIdentity(): void {
  try {
    window.localStorage.removeItem(visitorStorageKey)
  } catch {
    // Browser storage can be unavailable in restricted privacy modes.
  }
}
