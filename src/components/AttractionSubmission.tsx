import {
  Check,
  CheckCircle2,
  MapPinned,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { attractionTags } from '../data/attractionTags'
import { barangays } from '../data/barangays'
import { submitAttraction } from '../data/attractions'
import { isSupabaseConfigured } from '../lib/supabase'
import type { AttractionTag } from '../types'

type FormStatus =
  | { kind: 'idle'; message: string }
  | { kind: 'submitting'; message: string }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

const initialStatus: FormStatus = { kind: 'idle', message: '' }

export function AttractionSubmission() {
  const [selectedTags, setSelectedTags] = useState<AttractionTag[]>([])
  const [status, setStatus] = useState<FormStatus>(initialStatus)

  const toggleTag = (tag: AttractionTag) => {
    setStatus(initialStatus)
    setSelectedTags((current) => {
      if (current.includes(tag)) return current.filter((item) => item !== tag)
      if (current.length === 3) return current
      return [...current, tag]
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status.kind === 'submitting') return

    const form = event.currentTarget
    const values = new FormData(form)
    if (selectedTags.length === 0) {
      setStatus({ kind: 'error', message: 'Choose at least one place tag.' })
      document.querySelector<HTMLElement>('.attraction-tag-picker button')?.focus()
      return
    }

    if (String(values.get('website') ?? '').trim()) {
      setStatus({ kind: 'success', message: 'Salamat! Your place is now in the review queue.' })
      form.reset()
      setSelectedTags([])
      return
    }

    setStatus({ kind: 'submitting', message: 'Sending your field note…' })

    try {
      const mapsUrl = String(values.get('maps_url') ?? '').trim()
      const submittedByName = String(values.get('submitted_by_name') ?? '').trim()
      const customTag = String(values.get('custom_tag') ?? '').trim()
      await submitAttraction({
        place_name: String(values.get('place_name') ?? '').trim(),
        tags: selectedTags,
        custom_tag: selectedTags.includes('custom') ? customTag : null,
        barangay: String(values.get('barangay') ?? ''),
        description: String(values.get('description') ?? '').trim(),
        location_details: String(values.get('location_details') ?? '').trim(),
        maps_url: mapsUrl || null,
        submitted_by_name: submittedByName || null,
        contact_details: String(values.get('contact_details') ?? '').trim(),
        resident_confirmation: true,
      })
      form.reset()
      setSelectedTags([])
      setStatus({
        kind: 'success',
        message: 'Salamat! Your place is in the review queue. It will appear on the map after verification.',
      })
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error
          ? error.message
          : 'We could not send this place. Please try again.',
      })
    }
  }

  return (
    <section className="landing-contribute" id="contribute" aria-labelledby="contribute-heading">
      <div className="landing-shell contribution-layout">
        <div className="contribution-intro">
          <p className="landing-kicker">04 · Community field notes</p>
          <h2 id="contribute-heading">
            Know a place worth
            <span>putting on the map?</span>
          </h2>
          <p>
            Manito residents can nominate a local restaurant, beach, resort,
            landmark, shop, or experience. A human review keeps the atlas useful
            and protects private contact details.
          </p>

          <ol className="contribution-steps">
            <li><span>01</span><p><strong>Send a field note</strong>Tell us what the place is and where to find it.</p></li>
            <li><span>02</span><p><strong>Local review</strong>We verify the name, location, and best-fit tags.</p></li>
            <li><span>03</span><p><strong>Map publication</strong>Approved places join the attractions layer.</p></li>
          </ol>

          <div className="contribution-privacy">
            <ShieldCheck size={20} strokeWidth={1.7} aria-hidden="true" />
            <p><strong>Your contact stays private.</strong> It is used only if the atlas team needs to verify the submission.</p>
          </div>
        </div>

        <form className="attraction-form" onSubmit={handleSubmit} aria-describedby="submission-note">
          <div className="attraction-form__header">
            <span><MapPinned size={18} strokeWidth={1.7} aria-hidden="true" />New place record</span>
            <small>Manito · Albay</small>
          </div>

          <div className="attraction-form__body">
            <label className="form-field form-field--wide">
              <span>Place name <b>*</b></span>
              <input name="place_name" required minLength={2} maxLength={120} placeholder="e.g. Nanay Lita’s Kitchen" autoComplete="organization" />
            </label>

            <fieldset className="form-field form-field--wide attraction-tag-fieldset">
              <legend>Attraction tags <b>*</b> <small>Choose up to 3</small></legend>
              <div className="attraction-tag-picker">
                {attractionTags.map(({ id, label, description, icon: Icon }) => {
                  const selected = selectedTags.includes(id)
                  const disabled = !selected && selectedTags.length === 3
                  return (
                    <button
                      key={id}
                      type="button"
                      className={selected ? 'is-selected' : ''}
                      onClick={() => toggleTag(id)}
                      aria-pressed={selected}
                      disabled={disabled}
                      title={description}
                    >
                      <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                      <span>{label}</span>
                      {selected ? <Check size={13} strokeWidth={2.2} aria-hidden="true" /> : null}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {selectedTags.includes('custom') ? (
              <label className="form-field form-field--wide custom-tag-field">
                <span>Custom tag <b>*</b> <small>Describe the place type</small></span>
                <input
                  name="custom_tag"
                  required
                  minLength={2}
                  maxLength={40}
                  placeholder="e.g. Farm tour, bakery, diving spot"
                  autoFocus
                />
              </label>
            ) : null}

            <label className="form-field">
              <span>Barangay <b>*</b></span>
              <select name="barangay" required defaultValue="">
                <option value="" disabled>Select barangay</option>
                {barangays.map((barangay) => (
                  <option key={barangay.psgcCode} value={barangay.name}>{barangay.name}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Google Maps link <small>Optional</small></span>
              <input name="maps_url" type="url" maxLength={500} placeholder="https://maps.app.goo.gl/…" inputMode="url" />
            </label>

            <label className="form-field form-field--wide">
              <span>How do we find it? <b>*</b></span>
              <input name="location_details" required minLength={5} maxLength={300} placeholder="Street, sitio, nearby landmark, or directions" />
            </label>

            <label className="form-field form-field--wide">
              <span>Why should people visit? <b>*</b></span>
              <textarea name="description" required minLength={20} maxLength={700} rows={4} placeholder="Share what makes the place special, what to try, and useful visitor details." />
            </label>

            <label className="form-field">
              <span>Your name <small>Optional</small></span>
              <input name="submitted_by_name" minLength={2} maxLength={100} autoComplete="name" placeholder="Name or nickname" />
            </label>

            <label className="form-field">
              <span>Phone or email <b>*</b></span>
              <input name="contact_details" required minLength={5} maxLength={180} autoComplete="email" placeholder="For private verification only" />
            </label>

            <label className="form-honeypot" aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>

            <label className="resident-check form-field--wide">
              <input name="resident_confirmation" type="checkbox" required />
              <span>I live or work in Manito and confirm that this information is accurate to the best of my knowledge.</span>
            </label>
          </div>

          <div className="attraction-form__footer">
            <p
              id="submission-note"
              className={`submission-status submission-status--${status.kind}`}
              role={status.kind === 'error' ? 'alert' : 'status'}
              aria-live="polite"
            >
              {status.kind === 'success' ? <CheckCircle2 size={17} strokeWidth={1.8} aria-hidden="true" /> : null}
              {status.message || 'Submissions are reviewed before appearing publicly.'}
            </p>
            <button className="submission-button" type="submit" disabled={status.kind === 'submitting' || !isSupabaseConfigured}>
              {status.kind === 'submitting' ? 'Sending…' : isSupabaseConfigured ? 'Submit place' : 'Setup required'}
              <Send size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
