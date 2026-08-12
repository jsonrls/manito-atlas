import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { LandingPage } from './components/LandingPage'

type Experience = 'landing' | 'map'

const loadMapApplication = () => import('./App')
const MapApplication = lazy(loadMapApplication)

function experienceFromLocation(): Experience {
  return new URLSearchParams(window.location.search).get('view') === 'map'
    ? 'map'
    : 'landing'
}

export default function Root() {
  const [experience, setExperience] = useState<Experience>(experienceFromLocation)

  useEffect(() => {
    const handlePopState = () => setExperience(experienceFromLocation())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const isMap = experience === 'map'
    document.documentElement.classList.toggle('is-map', isMap)
    document.title = isMap
      ? 'Explore Manito · Barangay Intelligence Map'
      : 'Manito · Barangay Intelligence Map'

    if (!isMap) {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0 }))
    }

    return () => document.documentElement.classList.remove('is-map')
  }, [experience])

  const navigate = useCallback((nextExperience: Experience, barangayCode?: string) => {
    const url = new URL(window.location.href)
    if (nextExperience === 'map') {
      url.searchParams.set('view', 'map')
      if (barangayCode) {
        url.searchParams.set('barangay', barangayCode)
      } else {
        url.searchParams.delete('barangay')
      }
    } else {
      url.searchParams.delete('view')
      url.searchParams.delete('barangay')
    }
    url.hash = ''

    window.history.pushState(
      { experience: nextExperience },
      '',
      `${url.pathname}${url.search}`,
    )
    setExperience(nextExperience)
  }, [])

  if (experience === 'landing') {
    return (
      <LandingPage
        onOpenMap={(barangayCode) => navigate('map', barangayCode)}
        onPrefetchMap={loadMapApplication}
      />
    )
  }

  return (
    <Suspense fallback={<MapLaunchScreen />}>
      <MapApplication
        initialBarangayCode={new URLSearchParams(window.location.search).get('barangay')}
        onOpenLanding={() => navigate('landing')}
      />
    </Suspense>
  )
}

function MapLaunchScreen() {
  return (
    <main className="map-launch" aria-busy="true" aria-live="polite">
      <div className="map-launch__grid" aria-hidden="true" />
      <span className="loading-orbit" aria-hidden="true" />
      <span>
        <small>Opening municipal atlas</small>
        <strong>Preparing the map workspace…</strong>
      </span>
    </main>
  )
}
