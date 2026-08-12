import { ArrowLeft, ArrowRight, ExternalLink, Landmark, MapPin, X } from 'lucide-react'
import { barangays, formatDensity, formatPopulation } from '../data/barangays'
import type { BarangayRecord } from '../types'

interface DetailPanelProps {
  barangay: BarangayRecord
  areaSqKm?: number
  onClose: () => void
  onSelect: (code: string) => void
}

export function DetailPanel({ barangay, areaSqKm, onClose, onSelect }: DetailPanelProps) {
  const index = barangays.findIndex((item) => item.psgcCode === barangay.psgcCode)
  const previous = barangays[(index - 1 + barangays.length) % barangays.length]
  const next = barangays[(index + 1) % barangays.length]
  const rank = [...barangays]
    .sort((a, b) => b.population - a.population)
    .findIndex((item) => item.psgcCode === barangay.psgcCode) + 1
  const municipalityTotal = barangays.reduce((sum, item) => sum + item.population, 0)
  const share = (barangay.population / municipalityTotal) * 100

  return (
    <aside className="detail-panel" role="dialog" aria-modal="false" aria-labelledby="detail-title">
      <div className="sheet-handle" aria-hidden="true" />
      <div className="detail-panel__topbar">
        <span>Barangay record · {String(index + 1).padStart(2, '0')} / 15</span>
        <button type="button" onClick={onClose} aria-label="Close barangay details">
          <X size={19} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <div className="detail-panel__identity">
        <div className="record-stamps">
          <div className={`classification-stamp classification-stamp--${barangay.classification.toLowerCase()}`}>
            <span aria-hidden="true" />
            {barangay.classification}
          </div>
          {barangay.civicRole ? (
            <div className="civic-role-stamp">
              <Landmark size={11} strokeWidth={1.8} aria-hidden="true" />
              {barangay.civicRole}
            </div>
          ) : null}
        </div>
        <h2 id="detail-title">{barangay.name}</h2>
        <p><MapPin size={14} aria-hidden="true" /> Barangay · Manito, Albay</p>
      </div>

      <div className="population-feature">
        <div>
          <span className="field-label">2024 population</span>
          <strong>{formatPopulation(barangay.population)}</strong>
        </div>
        <div className="population-rank">
          <span>#{rank}</span>
          <small>of 15 by population</small>
        </div>
        <div className="population-share" aria-label={`${share.toFixed(1)} percent of Manito population`}>
          <span style={{ width: `${share}%` }} />
        </div>
        <small>{share.toFixed(1)}% of Manito’s 2024 population</small>
      </div>

      <dl className="detail-fields">
        <div>
          <dt>PSGC code</dt>
          <dd>{barangay.psgcCode}</dd>
        </div>
        <div>
          <dt>Correspondence</dt>
          <dd>{barangay.correspondenceCode}</dd>
        </div>
        <div>
          <dt>PSA classification</dt>
          <dd>{barangay.classification}</dd>
        </div>
        <div>
          <dt>Boundary area</dt>
          <dd>{areaSqKm ? `${areaSqKm.toFixed(2)} km²` : 'Data unavailable'}</dd>
        </div>
        <div>
          <dt>Approx. density</dt>
          <dd>{areaSqKm ? `${formatDensity(barangay.population, areaSqKm)} / km²` : 'Data unavailable'}</dd>
        </div>
        <div>
          <dt>Population source</dt>
          <dd>2024 POPCEN</dd>
        </div>
      </dl>

      <div className="detail-panel__notice">
        Boundary area and density are calculated from indicative geometry and are not PSA-published barangay area figures.
      </div>

      <a className="source-card" href={barangay.sourceUrl} target="_blank" rel="noreferrer">
        <span>
          <small>Authoritative population source</small>
          <strong>Philippine Statistics Authority</strong>
          <span>PSGC · 2024 POPCEN</span>
        </span>
        <ExternalLink size={18} strokeWidth={1.7} aria-hidden="true" />
      </a>

      <div className="detail-panel__pager" aria-label="Browse barangays">
        <button type="button" onClick={() => onSelect(previous.psgcCode)}>
          <ArrowLeft size={17} aria-hidden="true" />
          <span><small>Previous</small>{previous.name}</span>
        </button>
        <button type="button" onClick={() => onSelect(next.psgcCode)}>
          <span><small>Next</small>{next.name}</span>
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
