import { ArrowLeft, ArrowUpRight } from 'lucide-react'

export type LegalDocument = 'privacy' | 'terms'

interface LegalPageProps {
  document: LegalDocument
  onOpenCookieSettings: () => void
  onOpenHome: () => void
  onOpenMap: () => void
  onOpenLegal: (document: LegalDocument) => void
}

const privacySections = [
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    content: (
      <>
        <p>
          You can browse the public atlas without creating an account. If you
          submit a place for review, we collect the information you enter,
          including the place details, your optional name, and the phone number
          or email address you provide for verification.
        </p>
        <p>
          If you allow analytics, we create a random browser identifier in local
          storage and record a visit at most once per Manila calendar day. We may
          also receive limited technical analytics about how the site is used.
          Manito Atlas does not ask analytics visitors for their name or email
          address.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-information',
    title: 'How we use information',
    content: (
      <ul>
        <li>Review, verify, and publish eligible community place submissions.</li>
        <li>Contact a submitter only when a field note needs verification.</li>
        <li>Measure broad audience activity and improve the atlas experience.</li>
        <li>Protect the service from spam, abuse, and technical failures.</li>
      </ul>
    ),
  },
  {
    id: 'storage-and-sharing',
    title: 'Storage and service providers',
    content: (
      <>
        <p>
          Manito Atlas uses Supabase to store moderated submissions and audience
          counts, and Vercel to host the site and provide optional analytics.
          These providers process information only as needed to operate their
          services. We do not sell personal information.
        </p>
        <p>
          Approved place details may appear publicly on the map. A submitter’s
          name and contact details remain private and are not included in the
          public attraction record.
        </p>
      </>
    ),
  },
  {
    id: 'cookies-and-storage',
    title: 'Cookies and local storage',
    content: (
      <>
        <p>
          The site stores your consent choice so it can remember whether you
          allowed analytics. If you accept, it also stores a random visitor ID
          used for de-duplicated audience counts. Declining analytics does not
          disable any map or directory feature.
        </p>
        <p>
          You can revisit Cookie Settings from the footer at any time. Clearing
          your browser storage will remove the saved choice and visitor ID.
        </p>
      </>
    ),
  },
  {
    id: 'retention-and-security',
    title: 'Retention and security',
    content: (
      <p>
        Information is kept only while it remains useful for moderation,
        publication, audience reporting, legal compliance, or service security.
        Reasonable safeguards and database access controls are used, but no
        internet service can guarantee absolute security.
      </p>
    ),
  },
  {
    id: 'your-choices',
    title: 'Your choices and requests',
    content: (
      <p>
        You may decline or withdraw analytics consent at any time. You may also
        request access to, correction of, or deletion of personal information you
        submitted, subject to applicable law and legitimate record-keeping needs.
        Privacy requests can be sent through the project owner’s contact channel
        on the{' '}
        <a href="https://github.com/jsonrls/manito-atlas" target="_blank" rel="noreferrer">
          Manito Atlas GitHub repository
        </a>.
      </p>
    ),
  },
  {
    id: 'updates',
    title: 'Policy updates',
    content: (
      <p>
        This policy may be updated as the atlas changes. The revision date at the
        top of this page will identify the latest version. Material changes will
        be presented clearly on the site.
      </p>
    ),
  },
] as const

const termsSections = [
  {
    id: 'using-the-atlas',
    title: 'Using the atlas',
    content: (
      <p>
        Manito Atlas is an independent civic information prototype. By using the
        site, you agree to use it lawfully and responsibly. If you do not agree
        with these terms, please stop using the site.
      </p>
    ),
  },
  {
    id: 'not-official-advice',
    title: 'Not an official record or legal survey',
    content: (
      <p>
        This is not an official Philippine government website. Barangay geometry,
        calculated areas, density values, and map positions are indicative. Do
        not use them as cadastral boundaries, proof of ownership, navigation
        instructions, emergency guidance, or a substitute for an official record.
      </p>
    ),
  },
  {
    id: 'data-and-availability',
    title: 'Data accuracy and availability',
    content: (
      <p>
        The atlas aims to present cited public information accurately, but source
        data may be delayed, incomplete, or revised. Features may change, be
        suspended, or become unavailable without notice. Verify important facts
        with the responsible government agency or original source.
      </p>
    ),
  },
  {
    id: 'community-submissions',
    title: 'Community submissions',
    content: (
      <>
        <p>
          When you submit a place, you confirm that the information is accurate
          to the best of your knowledge, that you are entitled to share it, and
          that it does not violate another person’s privacy or rights.
        </p>
        <p>
          You give Manito Atlas permission to review, edit for clarity, map,
          publish, and remove the submitted place information. Submission does
          not guarantee publication, and listings may be corrected or removed at
          any time.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    content: (
      <ul>
        <li>Do not submit false, unlawful, harmful, or misleading information.</li>
        <li>Do not attempt to disrupt, overload, scrape abusively, or bypass site security.</li>
        <li>Do not impersonate another person or expose private contact information.</li>
        <li>Respect source licenses, attribution requirements, and third-party rights.</li>
      </ul>
    ),
  },
  {
    id: 'third-party-services',
    title: 'Third-party data and links',
    content: (
      <p>
        The site uses data, map tiles, imagery, and services from third parties.
        Their own licenses and terms may apply. External links are provided for
        context; Manito Atlas does not control or endorse every third-party page.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Disclaimer and limitation of liability',
    content: (
      <p>
        The atlas is provided “as is” and “as available.” To the fullest extent
        permitted by law, the project owner is not liable for losses resulting
        from reliance on the site, unavailable features, inaccurate source data,
        or third-party services. Rights that cannot lawfully be excluded remain
        unaffected.
      </p>
    ),
  },
  {
    id: 'changes-and-law',
    title: 'Changes and applicable law',
    content: (
      <p>
        These terms may be revised as the project develops. Continued use after
        an update means you accept the revised terms. These terms are governed by
        the laws of the Republic of the Philippines, without limiting rights you
        may have under mandatory law.
      </p>
    ),
  },
] as const

export function LegalPage({
  document,
  onOpenCookieSettings,
  onOpenHome,
  onOpenMap,
  onOpenLegal,
}: LegalPageProps) {
  const isPrivacy = document === 'privacy'
  const title = isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'
  const eyebrow = isPrivacy ? 'How information is handled' : 'Rules for using the atlas'
  const sections = isPrivacy ? privacySections : termsSections

  return (
    <div className="legal-page">
      <a className="skip-link" href="#legal-content">Skip to document</a>

      <header className="landing-nav legal-nav">
        <div className="landing-nav__inner">
          <button className="brand-lockup landing-brand" type="button" onClick={onOpenHome}>
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark__ring" />
              <span className="brand-mark__dot" />
            </span>
            <span className="brand-copy">
              <strong>Manito Atlas</strong>
              <span>Barangay Intelligence Map</span>
            </span>
          </button>

          <button className="legal-nav__back" type="button" onClick={onOpenHome}>
            <ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />
            Back to atlas
          </button>

          <button className="landing-cta landing-cta--nav" type="button" onClick={onOpenMap}>
            Open the map
            <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main id="legal-content" className="legal-main">
        <header className="legal-hero">
          <div className="landing-shell legal-hero__inner">
            <p className="landing-kicker">Legal folio · 01</p>
            <h1>{title}</h1>
            <p>{eyebrow}. Written for people, not just compliance checklists.</p>
            <dl>
              <div><dt>Effective</dt><dd>17 August 2026</dd></div>
              <div><dt>Applies to</dt><dd>Manito Atlas</dd></div>
              <div><dt>Operator</dt><dd>Independent project</dd></div>
            </dl>
          </div>
        </header>

        <div className="landing-shell legal-layout">
          <aside className="legal-index" aria-label={`${title} contents`}>
            <span>In this document</span>
            <ol>
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="legal-article">
            <p className="legal-intro">
              {isPrivacy
                ? 'This policy explains what Manito Atlas collects, why it is used, and the choices available to you.'
                : 'These terms set the practical boundaries for using Manito Atlas and contributing information to it.'}
            </p>
            {sections.map((section, index) => (
              <section key={section.id} id={section.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h2>{section.title}</h2>
                <div>{section.content}</div>
              </section>
            ))}
          </article>
        </div>
      </main>

      <footer className="legal-footer">
        <div className="landing-shell legal-footer__inner">
          <span>Manito Atlas · Independent civic interface</span>
          <nav aria-label="Legal">
            <a
              href="?page=privacy"
              aria-current={isPrivacy ? 'page' : undefined}
              onClick={(event) => { event.preventDefault(); onOpenLegal('privacy') }}
            >
              Privacy Policy
            </a>
            <a
              href="?page=terms"
              aria-current={!isPrivacy ? 'page' : undefined}
              onClick={(event) => { event.preventDefault(); onOpenLegal('terms') }}
            >
              Terms & Conditions
            </a>
            <button type="button" onClick={onOpenCookieSettings}>Cookie Settings</button>
          </nav>
        </div>
      </footer>
    </div>
  )
}
