import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { setPageMeta } from '../utils/setPageMeta'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-charcoal mb-4">{title}</h2>
      <div className="text-sm text-muted leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

export default function PrivacyPolicy() {
  useEffect(() => {
    setPageMeta({
      title: 'Privacy Policy — FuneralFair',
      description: 'FuneralFair privacy policy — how we collect, use and protect your personal data.',
      path: '/privacy',
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-12 sm:py-16">

        <div className="mb-10">
          <span className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-sage-light border border-sage-border text-sage text-xs font-semibold tracking-widest uppercase">
            Legal
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">Privacy Policy</h1>
          <p className="text-muted text-sm">Last updated: May 2026</p>
        </div>

        <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-7 py-8">

          <Section title="Who we are">
            <p>FuneralFair is a UK funeral price comparison service operated by Adam Jones. Our website is <strong className="text-charcoal">funeralfair.co.uk</strong>.</p>
            <p>You can contact us at <a href="mailto:hello@funeralfair.co.uk" className="text-sage underline">hello@funeralfair.co.uk</a> with any questions about this policy or how we handle your data.</p>
          </Section>

          <Section title="What data we collect">
            <p><strong className="text-charcoal">Enquiry form:</strong> When you send an enquiry to a funeral director, we collect your name, email address, phone number (optional), and message. This is forwarded to the funeral director and to us for quality purposes.</p>
            <p><strong className="text-charcoal">Analytics:</strong> With your consent, we use Google Analytics to understand how visitors use our site. This may collect your approximate location (country/city level), device type, browser, and pages visited. No personally identifiable information is collected through analytics.</p>
            <p><strong className="text-charcoal">Funeral directors:</strong> If you are a funeral director claiming or updating your listing, we collect your business name, contact details, and pricing information. This information is displayed publicly on your listing.</p>
            <p><strong className="text-charcoal">Cookies:</strong> We use a cookie to remember your analytics consent preference. If you accept analytics, Google Analytics will set additional cookies (see Google's cookie policy for details).</p>
          </Section>

          <Section title="How we use your data">
            <p><strong className="text-charcoal">Enquiries:</strong> We forward your enquiry to the funeral director you contacted. We may retain a copy for a short period to handle any follow-up issues, then delete it.</p>
            <p><strong className="text-charcoal">Analytics:</strong> We use aggregated analytics data to improve the website — understanding which pages are popular, where visitors come from, and how the search tool is used. We never sell this data.</p>
            <p><strong className="text-charcoal">Director listings:</strong> Business information provided by funeral directors is displayed on their public listing page. We do not share this data with third parties beyond displaying it on our website.</p>
          </Section>

          <Section title="Legal basis for processing">
            <p>We process your data on the following legal bases under UK GDPR:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-charcoal">Consent</strong> — for analytics cookies (you can withdraw consent at any time)</li>
              <li><strong className="text-charcoal">Legitimate interests</strong> — for forwarding enquiries to funeral directors and maintaining the accuracy of listings</li>
              <li><strong className="text-charcoal">Contract</strong> — for funeral directors who have agreed to list their business</li>
            </ul>
          </Section>

          <Section title="Who we share data with">
            <p>We share data with the following third parties only where necessary to operate the service:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-charcoal">Funeral directors</strong> — receive enquiries sent to them via our form</li>
              <li><strong className="text-charcoal">Resend</strong> — transactional email provider, used to forward enquiries</li>
              <li><strong className="text-charcoal">Brevo</strong> — email provider, used to send listing-related emails to funeral directors</li>
              <li><strong className="text-charcoal">Supabase</strong> — database provider, stores listing data (hosted in the EU)</li>
              <li><strong className="text-charcoal">Google Analytics</strong> — with your consent only</li>
              <li><strong className="text-charcoal">Cloudflare</strong> — website hosting and security</li>
            </ul>
            <p>We do not sell personal data to any third party.</p>
          </Section>

          <Section title="How long we keep data">
            <p>Enquiry data is retained for up to 30 days and then deleted. Funeral director listing data is retained for as long as the listing is active. Analytics data is retained for 14 months as per Google Analytics defaults.</p>
          </Section>

          <Section title="Your rights">
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for analytics at any time (use the cookie settings link in the footer)</li>
              <li>Object to processing based on legitimate interests</li>
            </ul>
            <p>To exercise any of these rights, email us at <a href="mailto:hello@funeralfair.co.uk" className="text-sage underline">hello@funeralfair.co.uk</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="Cookies">
            <p>We use the following cookies:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-charcoal">ff_cookie_consent</strong> — stores your analytics consent choice. Expires after 1 year.</li>
              <li><strong className="text-charcoal">_ga, _ga_*</strong> — Google Analytics cookies, only set if you have accepted analytics. See <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-sage underline">Google's cookie policy</a>.</li>
            </ul>
            <p>You can change your cookie preference at any time using the link at the bottom of any page.</p>
          </Section>

          <Section title="Changes to this policy">
            <p>We may update this policy from time to time. The date at the top of this page shows when it was last updated. Continued use of the site after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="Contact">
            <p>For any privacy questions or requests, contact us at <a href="mailto:hello@funeralfair.co.uk" className="text-sage underline">hello@funeralfair.co.uk</a>.</p>
          </Section>

        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-muted hover:text-charcoal underline underline-offset-2 transition-colors">← Back to FuneralFair</Link>
        </div>

      </main>

      <Footer />
    </div>
  )
}
