import { BarChart3, Database, List, MapPinned, Search } from 'lucide-react'

interface CivicHeaderProps {
  activePanel: 'overview' | 'barangays' | 'statistics' | 'data'
  isMobileSearchOpen: boolean
  onOpenLanding: () => void
  onSearch: () => void
  onOverview: () => void
  onBarangays: () => void
  onInsights: () => void
  onAboutData: () => void
}

export function CivicHeader({
  activePanel,
  isMobileSearchOpen,
  onOpenLanding,
  onSearch,
  onOverview,
  onBarangays,
  onInsights,
  onAboutData,
}: CivicHeaderProps) {
  const items = [
    { id: 'overview' as const, label: 'Overview', icon: MapPinned, onClick: onOverview },
    { id: 'barangays' as const, label: 'Barangays', icon: List, onClick: onBarangays },
    { id: 'statistics' as const, label: 'Insights', icon: BarChart3, onClick: onInsights },
    { id: 'data' as const, label: 'About data', icon: Database, onClick: onAboutData },
  ]

  return (
    <header className="civic-header">
      <button
        className="brand-lockup"
        type="button"
        onClick={onOpenLanding}
        aria-label="Return to the Manito landing page"
        title="Return to landing page"
      >
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-mark__ring" />
          <span className="brand-mark__dot" />
        </span>
        <span className="brand-copy">
          <strong>Manito, Albay</strong>
          <span>Barangay Intelligence Map</span>
        </span>
      </button>

      <nav className="header-nav" aria-label="Primary navigation">
        {items.map(({ id, label, onClick }) => (
          <button
            key={id}
            type="button"
            className={activePanel === id ? 'is-active' : ''}
            onClick={onClick}
            aria-current={activePanel === id ? 'page' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="header-context" aria-label="Location context">
        <span className="context-dot" aria-hidden="true" />
        <span>Albay</span>
        <span className="context-separator">·</span>
        <span>Bicol Region</span>
        <span className="context-separator">·</span>
        <span>PH</span>
      </div>

      <div className="mobile-header-actions">
        <button
          className={`mobile-search-button${isMobileSearchOpen ? ' is-active' : ''}`}
          type="button"
          onClick={onSearch}
          aria-label={isMobileSearchOpen ? 'Close barangay search' : 'Search barangays'}
          aria-expanded={isMobileSearchOpen}
          title="Search barangays"
        >
          <Search size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <button
          className="mobile-directory-button"
          type="button"
          onClick={onBarangays}
          aria-label="Open barangay directory"
          title="Open barangay directory"
        >
          <List size={17} strokeWidth={1.8} aria-hidden="true" />
          <span>15 barangays</span>
        </button>
      </div>
    </header>
  )
}
