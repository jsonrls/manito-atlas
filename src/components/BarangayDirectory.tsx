import { Search, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { barangays, formatPopulation } from '../data/barangays'

interface BarangayDirectoryProps {
  onClose: () => void
  onSelect: (code: string) => void
}

type SortMode = 'name' | 'population'

export function BarangayDirectory({ onClose, onSelect }: BarangayDirectoryProps) {
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('name')
  const closeRef = useRef<HTMLButtonElement>(null)
  const maximum = Math.max(...barangays.map((barangay) => barangay.population))

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return barangays
      .filter((barangay) => barangay.name.toLowerCase().includes(needle))
      .sort((a, b) => sortMode === 'name'
        ? a.name.localeCompare(b.name)
        : b.population - a.population)
  }, [query, sortMode])

  return (
    <aside
      className="directory-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="directory-title"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
    >
      <div className="sheet-handle" aria-hidden="true" />
      <div className="panel-topbar">
        <div>
          <span>Accessible map alternative</span>
          <h2 id="directory-title">All barangays <small>· 15</small></h2>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close barangay directory">
          <X size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <div className="directory-search">
        <Search size={17} strokeWidth={1.8} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter 15 barangays…"
          aria-label="Filter barangay directory"
        />
      </div>

      <div className="directory-tools">
        <span>{visible.length} records · 2024 POPCEN</span>
        <div className="sort-switch" aria-label="Sort barangays">
          <button
            type="button"
            className={sortMode === 'name' ? 'is-active' : ''}
            onClick={() => setSortMode('name')}
          >A–Z</button>
          <button
            type="button"
            className={sortMode === 'population' ? 'is-active' : ''}
            onClick={() => setSortMode('population')}
          >Population</button>
        </div>
      </div>

      <div className="directory-list">
        {visible.map((barangay, index) => (
          <button
            className="directory-row"
            type="button"
            key={barangay.psgcCode}
            onClick={() => onSelect(barangay.psgcCode)}
          >
            <span className="directory-row__index">{String(index + 1).padStart(2, '0')}</span>
            <span className="directory-row__main">
              <span>
                <strong>{barangay.name}</strong>
                <small>
                  {[barangay.classification, barangay.civicRole, barangay.psgcCode]
                    .filter(Boolean)
                    .join(' · ')}
                </small>
              </span>
              <span className="directory-row__bar" aria-hidden="true">
                <span style={{ width: `${(barangay.population / maximum) * 100}%` }} />
              </span>
            </span>
            <span className="directory-row__population">
              {formatPopulation(barangay.population)}
              <small>people</small>
            </span>
          </button>
        ))}
        {!visible.length && <p className="directory-empty">No barangays match this filter.</p>}
      </div>
    </aside>
  )
}
