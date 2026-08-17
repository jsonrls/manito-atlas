import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react'
import { CookieConsent, type CookieConsentChoice } from './components/CookieConsent'
import { LandingPage } from './components/LandingPage'
import { LegalPage, type LegalDocument } from './components/LegalPage'
import { clearWebsiteAnalyticsIdentity, recordWebsiteVisit } from './data/websiteAnalytics'

type Experience = 'landing' | 'map' | LegalDocument

const consentStorageKey = 'manito-atlas-cookie-consent-v1'

const loadMapApplication = () => import('./App')
const MapApplication = lazy(loadMapApplication)

function experienceFromLocation(): Experience {
  const search = new URLSearchParams(window.location.search)
  const document = search.get('page')
  if (document === 'privacy' || document === 'terms') return document
  return search.get('view') === 'map' ? 'map' : 'landing'
}

function consentFromStorage(): CookieConsentChoice | null {
  try {
    const storedChoice = window.localStorage.getItem(consentStorageKey)
    return storedChoice === 'accepted' || storedChoice === 'declined'
      ? storedChoice
      : null
  } catch {
    return null
  }
}

export default function Root() {
  const [experience, setExperience] = useState<Experience>(experienceFromLocation)
  const [cookieConsent, setCookieConsent] = useState<CookieConsentChoice | null>(consentFromStorage)
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(cookieConsent === null)

  useEffect(() => {
    if (cookieConsent === 'accepted') void recordWebsiteVisit()
  }, [cookieConsent])

  useEffect(() => {
    const handlePopState = () => setExperience(experienceFromLocation())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const isMap = experience === 'map'
    document.documentElement.classList.toggle('is-map', isMap)
    document.title = experience === 'privacy'
      ? 'Privacy Policy · Manito Atlas'
      : experience === 'terms'
        ? 'Terms & Conditions · Manito Atlas'
        : isMap
          ? 'Explore · Manito Atlas'
          : 'Manito Atlas · Barangay Intelligence Map'

    if (!isMap) {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0 }))
    }

    return () => document.documentElement.classList.remove('is-map')
  }, [experience])

  const navigate = useCallback((nextExperience: Experience, barangayCode?: string) => {
    const url = new URL(window.location.href)
    url.searchParams.delete('page')
    if (nextExperience === 'map') {
      url.searchParams.set('view', 'map')
      if (barangayCode) {
        url.searchParams.set('barangay', barangayCode)
      } else {
        url.searchParams.delete('barangay')
      }
    } else if (nextExperience === 'landing') {
      url.searchParams.delete('view')
      url.searchParams.delete('barangay')
    } else {
      url.searchParams.delete('view')
      url.searchParams.delete('barangay')
      url.searchParams.set('page', nextExperience)
    }
    url.hash = ''

    window.history.pushState(
      { experience: nextExperience },
      '',
      `${url.pathname}${url.search}`,
    )
    setExperience(nextExperience)
  }, [])

  const saveCookieConsent = (choice: CookieConsentChoice) => {
    try {
      window.localStorage.setItem(consentStorageKey, choice)
    } catch {
      // The in-memory choice still applies for this visit.
    }
    if (choice === 'declined') {
      clearWebsiteAnalyticsIdentity()
      window.va?.('beforeSend', () => null)
    } else {
      window.va?.('beforeSend', (event: BeforeSendEvent) => event)
    }
    setCookieConsent(choice)
    setIsCookieSettingsOpen(false)
  }

  let content
  if (experience === 'landing') {
    content = (
      <LandingPage
        onOpenMap={(barangayCode) => navigate('map', barangayCode)}
        onPrefetchMap={loadMapApplication}
        onOpenPrivacy={() => navigate('privacy')}
        onOpenTerms={() => navigate('terms')}
        onOpenCookieSettings={() => setIsCookieSettingsOpen(true)}
      />
    )
  } else if (experience === 'privacy' || experience === 'terms') {
    content = (
      <LegalPage
        document={experience}
        onOpenHome={() => navigate('landing')}
        onOpenMap={() => navigate('map')}
        onOpenLegal={(document) => navigate(document)}
        onOpenCookieSettings={() => setIsCookieSettingsOpen(true)}
      />
    )
  } else {
    content = (
      <Suspense fallback={<MapLaunchScreen />}>
        <MapApplication
          initialBarangayCode={new URLSearchParams(window.location.search).get('barangay')}
          onOpenLanding={() => navigate('landing')}
        />
      </Suspense>
    )
  }

  return (
    <>
      {content}
      <CookieConsent
        currentChoice={cookieConsent}
        isOpen={isCookieSettingsOpen}
        onAccept={() => saveCookieConsent('accepted')}
        onDecline={() => saveCookieConsent('declined')}
        onClose={() => setIsCookieSettingsOpen(false)}
        onOpenPrivacy={() => navigate('privacy')}
      />
      {cookieConsent === 'accepted' ? <Analytics /> : null}
    </>
  )
}

function MapLaunchScreen() {
  return (
    <main className="map-launch" aria-busy="true" aria-live="polite">
      <div className="map-launch__grid" aria-hidden="true" />
      <span className="loading-orbit" aria-hidden="true" />
      <span>
        <small>Opening Manito Atlas</small>
        <strong>Preparing the map workspace…</strong>
      </span>
    </main>
  )
}
