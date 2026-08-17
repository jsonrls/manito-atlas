import { Cookie, X } from 'lucide-react'

export type CookieConsentChoice = 'accepted' | 'declined'

interface CookieConsentProps {
  currentChoice: CookieConsentChoice | null
  isOpen: boolean
  onAccept: () => void
  onClose: () => void
  onDecline: () => void
  onOpenPrivacy: () => void
}

export function CookieConsent({
  currentChoice,
  isOpen,
  onAccept,
  onClose,
  onDecline,
  onOpenPrivacy,
}: CookieConsentProps) {
  if (!isOpen) return null

  return (
    <section
      className="cookie-consent"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="cookie-consent__icon" aria-hidden="true">
        <Cookie size={20} strokeWidth={1.7} />
      </div>

      <div className="cookie-consent__copy">
        <span className="cookie-consent__eyebrow">Privacy field note</span>
        <h2 id="cookie-consent-title">Help us understand visits.</h2>
        <p id="cookie-consent-description">
          With your permission, Manito Atlas uses privacy-minded analytics and a
          random browser ID to count visits. Declining will not limit the map.
          Read our{' '}
          <button type="button" onClick={onOpenPrivacy}>Privacy Policy</button>.
        </p>
      </div>

      <div className="cookie-consent__actions">
        <button className="cookie-consent__decline" type="button" onClick={onDecline}>
          Decline
        </button>
        <button className="cookie-consent__accept" type="button" onClick={onAccept}>
          Allow analytics
        </button>
      </div>

      {currentChoice ? (
        <button
          className="cookie-consent__close"
          type="button"
          onClick={onClose}
          aria-label="Close cookie settings"
        >
          <X size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
      ) : null}
    </section>
  )
}
