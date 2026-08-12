import { Search, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { barangays, formatPopulation } from '../data/barangays'

interface SearchControlProps {
  onSelect: (code: string) => void
  mobileVisible?: boolean
}

export function SearchControl({ onSelect, mobileVisible }: SearchControlProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mobileVisible !== false) return
    setOpen(false)
    inputRef.current?.blur()
  }, [mobileVisible])

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    const matches = needle
      ? barangays.filter((barangay) => barangay.name.toLocaleLowerCase().includes(needle))
      : barangays
    return matches.slice(0, 7)
  }, [query])

  const choose = (code: string, name: string) => {
    setQuery(name)
    setOpen(false)
    onSelect(code)
  }

  return (
    <div className={`search-control ${open ? 'is-open' : ''}`}>
      <Search className="search-control__icon" size={19} strokeWidth={1.8} aria-hidden="true" />
      <input
        id="barangay-search-input"
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          setActiveIndex(0)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            setActiveIndex((index) => Math.min(index + 1, results.length - 1))
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActiveIndex((index) => Math.max(index - 1, 0))
          }
          if (event.key === 'Enter' && open && results[activeIndex]) {
            event.preventDefault()
            const result = results[activeIndex]
            choose(result.psgcCode, result.name)
          }
          if (event.key === 'Escape') {
            setOpen(false)
            inputRef.current?.blur()
          }
        }}
        role="combobox"
        aria-label="Search barangays"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        placeholder="Search barangays…"
        autoComplete="off"
      />
      {query ? (
        <button
          className="search-control__clear"
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery('')
            setOpen(true)
            inputRef.current?.focus()
          }}
        >
          <X size={17} aria-hidden="true" />
        </button>
      ) : (
        <span className="search-control__hint" aria-hidden="true">⌘ K</span>
      )}

      {open && (
        <div className="search-results" id={listId} role="listbox" aria-label="Barangay search results">
          <div className="search-results__label">
            <span>{query ? 'Matches' : 'All barangays'}</span>
            <span>{results.length.toString().padStart(2, '0')}</span>
          </div>
          {results.length ? (
            results.map((barangay, index) => (
              <button
                key={barangay.psgcCode}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                className={activeIndex === index ? 'is-active' : ''}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(barangay.psgcCode, barangay.name)}
              >
                <span className="result-name">
                  <strong>{barangay.name}</strong>
                  <small>
                    {[barangay.classification, barangay.civicRole]
                      .filter(Boolean)
                      .join(' · ')} · PSGC {barangay.psgcCode}
                  </small>
                </span>
                <span className="result-population">
                  {formatPopulation(barangay.population)}
                  <small>people</small>
                </span>
              </button>
            ))
          ) : (
            <div className="search-results__empty">No barangay matches “{query}”.</div>
          )}
        </div>
      )}
    </div>
  )
}
