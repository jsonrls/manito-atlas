import { ExternalLink, ShieldCheck, X } from 'lucide-react'
import { GADM_MANITO_URL, PSA_MANITO_URL } from '../data/barangays'
import {
  BLGF_LOCAL_REVENUE_URL,
  DOE_GEOTHERMAL_URL,
  PSA_ALBAY_DEMOGRAPHICS_URL,
  PSA_ALBAY_PSGC_URL,
  PSA_BICOL_RSET_URL,
} from '../data/communityProfile'

const MAPLIBRE_URL = 'https://maplibre.org/maplibre-gl-js/docs/'
const EOX_LICENSE_URL = 'https://cloudless.eox.at/documentation/license'
const MAPTERHORN_URL = 'https://mapterhorn.com/attribution/'

interface SourcePanelProps {
  onClose: () => void
}

export function SourcePanel({ onClose }: SourcePanelProps) {
  return (
    <aside className="source-panel" role="dialog" aria-modal="false" aria-labelledby="source-title">
      <div className="sheet-handle" aria-hidden="true" />
      <div className="panel-topbar">
        <div>
          <span>Provenance & limitations</span>
          <h2 id="source-title">About the data</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close data information">
          <X size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <div className="source-status">
        <ShieldCheck size={22} strokeWidth={1.6} aria-hidden="true" />
        <div>
          <strong>GADM boundaries linked by 10-digit PSGC</strong>
          <span>15 of 15 barangay polygons matched</span>
        </div>
      </div>

      <section className="source-section">
        <div className="source-section__number">01</div>
        <div>
          <span className="field-label">Population & classification</span>
          <h3>Philippine Statistics Authority</h3>
          <p>Barangay population, urban/rural classification, PSGC codes, and correspondence codes come from the PSA PSGC record for Manito. Historical population, sex ratio, and dependency ratio use PSA census publications.</p>
          <dl>
            <div><dt>Population release</dt><dd>2024 POPCEN</dd></div>
            <div><dt>Municipal total</dt><dd>26,425</dd></div>
            <div><dt>Barangay records</dt><dd>15</dd></div>
          </dl>
          <div className="source-links">
            <a href={PSA_MANITO_URL} target="_blank" rel="noreferrer">
              2024 POPCEN <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a href={PSA_ALBAY_DEMOGRAPHICS_URL} target="_blank" rel="noreferrer">
              Demographic ratios <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a href={PSA_BICOL_RSET_URL} target="_blank" rel="noreferrer">
              Census trend <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="source-section">
        <div className="source-section__number">02</div>
        <div>
          <span className="field-label">Boundary geometry</span>
          <h3>GADM 3.6 barangay boundaries</h3>
          <p>The local GeoJSON is extracted from GADM&apos;s archived third-level Philippines layer. It matches the geometry shown on the supplied 2018 GADM map and is joined by barangay name to current PSGC identifiers.</p>
          <dl>
            <div><dt>Boundary release</dt><dd>GADM 3.6 · 2018</dd></div>
            <div><dt>Coordinate system</dt><dd>WGS 84</dd></div>
            <div><dt>Coverage</dt><dd>15 polygons</dd></div>
          </dl>
          <a href={GADM_MANITO_URL} target="_blank" rel="noreferrer">
            View GADM reference map <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="source-section">
        <div className="source-section__number">03</div>
        <div>
          <span className="field-label">Map imagery & elevation</span>
          <h3>MapLibre satellite and 3D terrain</h3>
          <p>MapLibre GL JS renders every view. The satellite options use EOxCloudless 2020 imagery, while the 3D option drapes that imagery over Mapterhorn elevation tiles.</p>
          <dl>
            <div><dt>Map renderer</dt><dd>MapLibre GL JS</dd></div>
            <div><dt>Satellite imagery</dt><dd>EOxCloudless · 2020</dd></div>
            <div><dt>Elevation terrain</dt><dd>Mapterhorn</dd></div>
          </dl>
          <div className="source-links">
            <a href={MAPLIBRE_URL} target="_blank" rel="noreferrer">
              MapLibre docs <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a href={EOX_LICENSE_URL} target="_blank" rel="noreferrer">
              Imagery terms <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a href={MAPTERHORN_URL} target="_blank" rel="noreferrer">
              Terrain credits <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="source-section">
        <div className="source-section__number">04</div>
        <div>
          <span className="field-label">Economic context</span>
          <h3>PSA, BLGF, and Department of Energy</h3>
          <p>The economy view combines Manito&apos;s current PSA income class with BLGF&apos;s published 2017–2019 locally sourced revenue series and the DOE&apos;s December 2024 geothermal project status.</p>
          <dl>
            <div><dt>Income class</dt><dd>2nd · current listing</dd></div>
            <div><dt>Fiscal series</dt><dd>BLGF · 2017–2019</dd></div>
            <div><dt>Energy reference</dt><dd>DOE · Dec 2024</dd></div>
          </dl>
          <div className="source-links">
            <a href={PSA_ALBAY_PSGC_URL} target="_blank" rel="noreferrer">
              PSA classification <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a href={BLGF_LOCAL_REVENUE_URL} target="_blank" rel="noreferrer">
              BLGF fiscal data <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a href={DOE_GEOTHERMAL_URL} target="_blank" rel="noreferrer">
              DOE project list <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <div className="source-disclaimer">
        <strong>Boundary and licensing note</strong>
        <p>GADM polygons are indicative administrative boundaries, not legal survey or cadastral lines. Area and density values shown here are calculated from the GADM geometry. GADM and EOxCloudless require separate licensing for commercial use.</p>
      </div>

      <p className="independence-note">
        This is an independent civic interface prototype. It is not an official website of the Municipality of Manito or the Philippine government.
      </p>
    </aside>
  )
}
