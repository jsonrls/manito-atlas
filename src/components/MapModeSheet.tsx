import {
  Building2,
  Check,
  Gauge,
  Map as MapIcon,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { mapModes } from '../data/barangays'
import type { MapMode } from '../types'

interface MapModeSheetProps {
  mode: MapMode
  onModeChange: (mode: MapMode) => void
  onClose: () => void
}

const modeIcons: Record<MapMode, LucideIcon> = {
  default: MapIcon,
  population: Users,
  classification: Building2,
  density: Gauge,
}

const modeSummaries: Record<MapMode, string> = {
  default: 'Administrative boundaries.',
  population: '2024 population totals.',
  classification: 'Urban and rural class.',
  density: 'People per square kilometre.',
}

const DISMISS_DISTANCE = 92

export function MapModeSheet({
  mode,
  onModeChange,
  onClose,
}: MapModeSheetProps) {
  const sheetRef = useRef<HTMLElement>(null)
  const initialFocusRef = useRef<HTMLButtonElement>(null)
  const dragStartRef = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    window.requestAnimationFrame(() => initialFocusRef.current?.focus())

    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !sheetRef.current) return
      const controls = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>('button:not([disabled])'),
      )
      if (controls.length === 0) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', keepFocusInside)
    return () => {
      document.removeEventListener('keydown', keepFocusInside)
      previousFocus?.focus()
    }
  }, [])

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = event.clientY
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return
    setDragOffset(Math.max(0, event.clientY - dragStartRef.current))
  }

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const finalOffset = dragStartRef.current === null
      ? dragOffset
      : Math.max(0, event.clientY - dragStartRef.current)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragStartRef.current = null
    setIsDragging(false)
    if (finalOffset >= DISMISS_DISTANCE) onClose()
    else setDragOffset(0)
  }

  return (
    <div className="map-mode-sheet-layer">
      <button
        className="map-mode-sheet__backdrop"
        type="button"
        aria-label="Close map filters"
        onClick={onClose}
      />
      <section
        ref={sheetRef}
        className="map-mode-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-mode-sheet-title"
      >
        <div
          className={`map-mode-sheet__surface${isDragging ? ' is-dragging' : ''}`}
          style={{ '--sheet-drag': `${dragOffset}px` } as CSSProperties}
        >
          <div
            className="map-mode-sheet__drag-zone"
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
          >
            <span aria-hidden="true" />
          </div>

          <div className="map-mode-sheet__header">
            <div>
              <span>Data lens · civic atlas</span>
              <h2 id="map-mode-sheet-title">Color the map</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close map filters">
              <X size={19} strokeWidth={1.7} aria-hidden="true" />
            </button>
          </div>

          <div className="map-mode-sheet__section">
            <div className="map-mode-sheet__section-heading">
              <span>Indicator</span>
              <small>Choose one barangay layer</small>
            </div>
            <div className="map-mode-sheet__options" role="radiogroup" aria-label="Data lens">
              {mapModes.map((item) => {
                const Icon = modeIcons[item.id]
                const isActive = mode === item.id
                return (
                  <button
                    key={item.id}
                    ref={isActive ? initialFocusRef : undefined}
                    type="button"
                    className={isActive ? 'is-active' : ''}
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => {
                      onModeChange(item.id)
                      onClose()
                    }}
                  >
                    <span className="map-mode-sheet__option-icon">
                      <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{modeSummaries[item.id]}</small>
                    </span>
                    {isActive ? <Check size={16} strokeWidth={2} aria-hidden="true" /> : null}
                  </button>
                )
              })}
            </div>
          </div>

          <p className="map-mode-sheet__hint">Tap a lens to apply · swipe down to dismiss</p>
        </div>
      </section>
    </div>
  )
}
