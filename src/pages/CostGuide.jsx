import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { setPageMeta } from '../utils/setPageMeta'
import { FEATURED_CITIES } from '../data/featuredCities'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOC = [
  { id: 'average-costs',      label: 'Average costs by funeral type' },
  { id: 'comparison',         label: 'Side-by-side comparison' },
  { id: 'whats-included',     label: "What's included in the price" },
  { id: 'cost-drivers',       label: 'What pushes costs higher' },
  { id: 'regional',           label: 'How prices vary across the UK' },
  { id: 'save-money',         label: '7 ways to reduce the cost' },
  { id: 'government-help',    label: 'Government help you may not know about' },
  { id: 'faq',                label: 'Common questions answered' },
]

const STATS = [
  {
    amount: '£1,695',
    label: 'Direct cremation',
    note: 'UK average, latest available data',
    highlight: false,
  },
  {
    amount: '£4,400',
    label: 'Attended funeral',
    note: 'National average, latest available data',
    highlight: true,
  },
  {
    amount: '£5,700+',
    label: 'Burial',
    note: 'Average — varies significantly by region',
    highlight: false,
  },
]

const TABLE = {
  cols: ['Direct cremation', 'Attended funeral', 'Burial'],
  rows: [
    { label: 'Typical cost',       vals: ['From £1,695', 'From £4,400', 'From £5,700'] },
    { label: 'Family can attend',  vals: ['Optional',    'Yes',         'Yes'] },
    { label: 'Full ceremony',      vals: ['No',          'Yes',         'Yes'] },
    { label: 'Remains returned',   vals: ['Ashes',       'Ashes or grave', 'Grave site'] },
    { label: 'Headstone needed',   vals: ['No',          'No',          'Usually (+cost)'] },
    { label: 'Eco-friendlier option', vals: ['✓',        '—',           'Woodland burial'] },
    { label: 'Typical wait',       vals: ['2–4 weeks',  '1–2 weeks',   '1–2 weeks'] },
    { label: 'Best for',           vals: [
      'Budget priority, or a separate memorial',
      'Traditional ceremony with family',
      'Religious tradition or land burial preference',
    ]},
  ],
}

const INCLUDED = [
  'Collection and care of the deceased',
  'A basic coffin',
  'Transportation to the crematorium or burial site',
  'Funeral director\'s professional fees',
  'Help with paperwork and the death certificate',
  'Cremation or burial fee (usually)',
]

const NOT_INCLUDED = [
  'Flowers and floral tributes',
  'Printed orders of service',
  'Death notices in newspapers',
  'Catering for a wake or reception',
  'Headstone or memorial plaque (burial)',
  'Celebrant or officiant fees (if not religious)',
  'Additional limousines beyond the hearse',
  'Embalming (charged separately by most directors)',
]

const COST_DRIVERS = [
  {
    title: 'The coffin',
    desc: 'This is one of the biggest variables. A simple cardboard or wicker eco-coffin can cost £300–£600. A solid mahogany or oak casket can exceed £5,000. Most families choose something in between.',
  },
  {
    title: 'Headstone or memorial',
    desc: 'For a burial, a headstone typically costs £600–£3,000 depending on the material, size, and engraving. This is charged separately by a stonemason, not the funeral director.',
  },
  {
    title: 'Burial plot',
    desc: "Burial plots vary enormously. In parts of London they can exceed £15,000. In rural areas they may be £500–£1,500. This is the single biggest reason burial costs more than cremation.",
  },
  {
    title: 'Flowers and tributes',
    desc: 'A simple floral arrangement starts around £50. An elaborate display can run to several hundred pounds. This is always optional — many families ask for charitable donations instead.',
  },
  {
    title: 'Catering and the wake',
    desc: 'A gathering after the service adds cost — typically £10–£30 per head, or more at a venue. Simple sandwiches at home are just as meaningful.',
  },
  {
    title: 'Distance and travel',
    desc: "If the funeral home needs to collect the deceased from far away, or if the crematorium or cemetery is not nearby, travel costs may be added. Ask about this upfront.",
  },
  {
    title: 'Weekends and peak times',
    desc: "Some funeral directors charge a premium for weekend services. Choosing a weekday, especially mid-week, can sometimes reduce the cost.",
  },
]

const REGIONS = [
  {
    region: 'London and South East',
    note: "The most expensive area in the UK. Burial plots alone can exceed £15,000 in some London boroughs. Expect to pay well above the national average for all services.",
    citySlug: 'london',
    cityLabel: 'Compare prices in London',
  },
  {
    region: 'Midlands and East of England',
    note: 'Costs tend to be closer to the national average. There is reasonable competition between funeral directors in urban areas.',
    citySlug: 'birmingham',
    cityLabel: 'Compare prices in Birmingham',
  },
  {
    region: 'North of England',
    note: "Generally slightly below the national average. Yorkshire, Lancashire, and the North East often have more affordable options.",
    citySlug: 'manchester',
    cityLabel: 'Compare prices in Manchester',
  },
  {
    region: 'Scotland',
    note: 'Funeral costs in Scotland are typically lower than the UK average. The Scottish Government also has a separate Funeral Support Payment scheme.',
    citySlug: 'glasgow',
    cityLabel: 'Compare prices in Glasgow',
  },
  {
    region: 'Wales and Northern Ireland',
    note: 'Generally among the more affordable regions. Rural areas may have fewer directors to compare, but costs tend to be lower than England.',
    citySlug: 'cardiff',
    cityLabel: 'Compare prices in Cardiff',
  },
]

const FAQS = [
  {
    q: 'How much does a funeral cost in the UK in 2026?',
    a: 'The average cost of an attended funeral in the UK is around £4,400. Direct cremation is cheaper, averaging £1,695. Burial typically costs £5,700 or more due to the cost of a plot. Prices vary considerably by region and provider — comparing local quotes is always worthwhile.',
  },
  {
    q: 'What is the cheapest type of funeral?',
    a: "Direct cremation is the most affordable option, with some providers offering it from under £1,000. The cremation takes place without a ceremony, but you can still hold a separate memorial service whenever and wherever feels right for your family.",
  },
  {
    q: "What does a funeral director's price include?",
    a: "Most quotes include collection and care of the deceased, a basic coffin, transportation, the funeral director's professional fees, help with paperwork, and the cremation or burial fee. Extras like flowers, catering, headstones, and printed orders of service are usually charged separately.",
  },
  {
    q: 'Can I get government help with funeral costs?',
    a: "Yes. If you're receiving certain benefits — including Universal Credit, Housing Benefit, or Pension Credit — you may qualify for a Funeral Expenses Payment from the DWP. This is a grant, not a loan, and covers cremation or burial fees plus up to £1,000 for other costs. You can apply up to 6 months after the funeral date.",
  },
  {
    q: 'Do funeral prices vary across the UK?',
    a: 'Significantly. London and the South East are the most expensive, with burial plots in some boroughs exceeding £15,000. The North of England and Scotland tend to be below the national average. Prices also vary considerably between funeral directors in the same town — comparing quotes before deciding is always worthwhile.',
  },
]

const TIPS = [
  {
    title: 'Get at least three quotes',
    body: "Funeral directors are legally required to display their prices, but there can be huge variation between providers in the same area. Comparing prices is not disrespectful — it's practical. Use FuneralFair to compare local directors instantly.",
  },
  {
    title: 'Consider a direct cremation',
    body: 'At around £1,695 on average, a direct cremation is the most affordable option. It doesn\'t mean you can\'t celebrate a life — many families hold a separate memorial service at a location meaningful to them, with no time pressure.',
  },
  {
    title: 'Ask for an itemised price list',
    body: 'Since 2021, all funeral directors in England and Wales must give you a Standardised Price List by law. This shows exactly what each service costs. Always ask for it before making a decision.',
  },
  {
    title: "Choose a simpler coffin",
    body: "The coffin is one of the most significant cost variables. A wicker, cardboard, or reclaimed wood eco-coffin costs a fraction of a traditional polished hardwood coffin and can be just as dignified and meaningful.",
  },
  {
    title: 'Hold the service at the crematorium',
    body: 'Hiring a church or separate venue adds cost. Many crematoria have chapels and rooms that can accommodate a meaningful service without additional venue hire.',
  },
  {
    title: 'Ask about weekday pricing',
    body: "Some funeral directors offer lower rates for mid-week slots. It's worth asking — particularly for smaller, simpler services.",
  },
  {
    title: 'Look into woodland or natural burial',
    body: 'A natural burial in a woodland or meadow site can be significantly cheaper than a traditional cemetery plot. It also tends to be more environmentally gentle. The Natural Death Centre has a directory of sites.',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ id, eyebrow, children }) {
  return (
    <div id={id} className="scroll-mt-24 mb-6">
      {eyebrow && (
        <p className="text-xs font-semibold text-sage uppercase tracking-widest mb-2">{eyebrow}</p>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold text-charcoal leading-snug">{children}</h2>
    </div>
  )
}

function Callout({ icon, children, variant = 'sage' }) {
  const styles = {
    sage:   'bg-sage-light border-sage-border',
    warm:   'bg-amber-50 border-amber-200',
    neutral: 'bg-white border-warm-border',
  }
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-5 py-4 ${styles[variant]}`}>
      {icon && <span className="text-sage shrink-0 mt-0.5">{icon}</span>}
      <p className="text-sm text-charcoal leading-relaxed">{children}</p>
    </div>
  )
}

function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-3 text-sm text-charcoal leading-relaxed">
      <svg className="w-4 h-4 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {children}
    </li>
  )
}

function CrossItem({ children }) {
  return (
    <li className="flex items-start gap-3 text-sm text-muted leading-relaxed">
      <svg className="w-4 h-4 text-muted shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      {children}
    </li>
  )
}

function Divider() {
  return <div className="border-t border-warm-border my-12" />
}

const INFO_ICON = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
)

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CostGuide() {
  useEffect(() => {
    setPageMeta({
      title: 'UK Funeral Costs 2026 — Average Prices Explained | FuneralFair',
      description: 'How much does a funeral cost in the UK in 2026? Average prices for direct cremation (£1,695), attended cremation (£4,400), and burial — plus 7 ways to reduce costs.',
      path: '/funeral-costs/uk',
    })

    const articleEl = document.createElement('script')
    articleEl.id   = 'cost-guide-article-schema'
    articleEl.type = 'application/ld+json'
    articleEl.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type':    'Article',
      headline:   'How much does a funeral cost in the UK? (2026 guide)',
      description: 'Average UK funeral costs in 2026: direct cremation £1,695, attended funeral £4,400, burial £5,700+. What\'s included, regional differences, and 7 ways to reduce costs.',
      datePublished: '2026-01-15',
      dateModified:  '2026-06-07',
      url: 'https://funeralfair.co.uk/funeral-costs/uk',
      publisher: { '@type': 'Organization', name: 'FuneralFair', url: 'https://funeralfair.co.uk' },
    })
    document.head.appendChild(articleEl)

    const faqEl  = document.createElement('script')
    faqEl.id   = 'cost-guide-faq-schema'
    faqEl.type = 'application/ld+json'
    faqEl.text = JSON.stringify({
      '@context':   'https://schema.org',
      '@type':      'FAQPage',
      mainEntity: FAQS.map(({ q, a }) => ({
        '@type': 'Question',
        name:    q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    })
    document.head.appendChild(faqEl)

    return () => {
      document.getElementById('cost-guide-article-schema')?.remove()
      document.getElementById('cost-guide-faq-schema')?.remove()
    }
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      {/* ── Article header ── */}
      <div className="border-b border-warm-border bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-2 mb-5">
            <Link to="/" className="text-xs text-muted hover:text-charcoal transition-colors">Home</Link>
            <span className="text-muted text-xs">›</span>
            <span className="text-xs text-sage font-medium">Cost Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal leading-tight mb-5">
            How much does a funeral cost in the UK?
            <span className="block text-sage mt-1">(2026 guide)</span>
          </h1>
          <p className="text-base sm:text-lg text-muted leading-relaxed mb-6">
            Thinking about funeral costs while you're grieving is genuinely hard. It's okay not to know where to start.
            This guide explains everything clearly and honestly, so you can make informed decisions at your own pace.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span>Updated January 2026</span>
            <span>·</span>
            <span>8 min read</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">

        {/* ── Table of contents ── */}
        <nav className="bg-white border border-warm-border rounded-2xl px-6 py-6 mb-12">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">In this guide</p>
          <ol className="flex flex-col gap-2.5">
            {TOC.map(({ id, label }, i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex items-center gap-3 text-sm text-charcoal hover:text-sage transition-colors duration-150 group"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sage-light text-sage text-xs font-semibold shrink-0 group-hover:bg-sage group-hover:text-white transition-colors duration-150">
                    {i + 1}
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Section 1: Average costs ── */}
        <section>
          <SectionHeading id="average-costs" eyebrow="Section 1">
            Average costs by funeral type
          </SectionHeading>
          <p className="text-muted leading-relaxed mb-8">
            Funeral costs in the UK vary enormously depending on the type of service you choose, where you live,
            and the funeral director you use. These are the latest national averages as a starting point:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {STATS.map(({ amount, label, note, highlight }) => (
              <div
                key={label}
                className={`rounded-2xl border p-5 text-center ${
                  highlight
                    ? 'bg-sage-light border-sage-border'
                    : 'bg-white border-warm-border'
                }`}
              >
                <p className={`text-3xl font-bold mb-1 ${highlight ? 'text-sage' : 'text-charcoal'}`}>
                  {amount}
                </p>
                <p className="font-semibold text-charcoal text-sm mb-1">{label}</p>
                <p className="text-xs text-muted">{note}</p>
              </div>
            ))}
          </div>

          <Callout icon={INFO_ICON}>
            These are averages — the actual cost can be significantly lower or higher depending on your choices and your location.
            The cheapest direct cremation providers charge under £1,000; some attended funerals in London cost over £10,000.
          </Callout>
        </section>

        <Divider />

        {/* ── Section 2: Comparison table ── */}
        <section>
          <SectionHeading id="comparison" eyebrow="Section 2">
            Side-by-side comparison
          </SectionHeading>
          <p className="text-muted leading-relaxed mb-7">
            Not sure which type of funeral is right for your situation? Here's how they compare:
          </p>

          <div className="overflow-x-auto rounded-2xl border border-warm-border bg-white">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-warm-border">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-muted uppercase tracking-wide w-36"></th>
                  {TABLE.cols.map((col, i) => (
                    <th key={col} className={`text-left px-5 py-4 font-semibold text-charcoal text-sm ${i === 1 ? 'bg-sage-light' : ''}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE.rows.map(({ label, vals }, ri) => (
                  <tr key={label} className={`border-b border-warm-border last:border-0 ${ri % 2 === 0 ? '' : 'bg-cream/60'}`}>
                    <td className="px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-wide leading-tight">{label}</td>
                    {vals.map((v, ci) => (
                      <td key={ci} className={`px-5 py-3.5 text-charcoal leading-snug ${ci === 1 ? 'bg-sage-light/40' : ''}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted mt-3 leading-relaxed">
            There is no right or wrong choice. What matters is that it feels right for your family and for the person who died.
          </p>
        </section>

        <Divider />

        {/* ── Section 3: What's included ── */}
        <section>
          <SectionHeading id="whats-included" eyebrow="Section 3">
            What's included in the price
          </SectionHeading>
          <p className="text-muted leading-relaxed mb-7">
            Funeral prices can look confusing because what's bundled in varies between providers.
            Here's what you should typically expect to be included — and what's usually charged on top:
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-2xl border border-warm-border p-6">
              <p className="text-xs font-semibold text-sage uppercase tracking-widest mb-4">Usually included</p>
              <ul className="flex flex-col gap-3">
                {INCLUDED.map(item => <CheckItem key={item}>{item}</CheckItem>)}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-warm-border p-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Often charged extra</p>
              <ul className="flex flex-col gap-3">
                {NOT_INCLUDED.map(item => <CrossItem key={item}>{item}</CrossItem>)}
              </ul>
            </div>
          </div>

          <Callout icon={INFO_ICON}>
            <strong>Ask for the Standardised Price List.</strong> Since 2021, every funeral director in England and Wales is legally required to give you an itemised price list. If one is reluctant to share it, that's a red flag.
          </Callout>
        </section>

        <Divider />

        {/* ── Section 4: Cost drivers ── */}
        <section>
          <SectionHeading id="cost-drivers" eyebrow="Section 4">
            What pushes costs higher
          </SectionHeading>
          <p className="text-muted leading-relaxed mb-7">
            Beyond the base price, several decisions can significantly increase what you pay.
            None of these extras are obligatory — knowing about them helps you make choices that feel right for your budget.
          </p>

          <div className="flex flex-col gap-4">
            {COST_DRIVERS.map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-warm-border px-6 py-5">
                <h3 className="font-semibold text-charcoal mb-1.5">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Section 5: Regional differences ── */}
        <section>
          <SectionHeading id="regional" eyebrow="Section 5">
            How prices vary across the UK
          </SectionHeading>
          <p className="text-muted leading-relaxed mb-7">
            Where you live has a significant effect on funeral costs — especially for burial, where land costs vary enormously.
          </p>

          <div className="flex flex-col gap-3 mb-7">
            {REGIONS.map(({ region, note, citySlug, cityLabel }) => (
              <div key={region} className="flex items-start gap-4 bg-white rounded-xl border border-warm-border px-5 py-4">
                <div className="w-2 h-2 rounded-full bg-sage shrink-0 mt-1.5" />
                <div>
                  <p className="font-semibold text-charcoal text-sm mb-0.5">{region}</p>
                  <p className="text-sm text-muted leading-relaxed">{note}</p>
                  {citySlug && (
                    <Link to={`/funeral-directors/${citySlug}`} className="inline-block mt-2 text-xs font-semibold text-sage hover:underline">
                      {cityLabel} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Callout icon={INFO_ICON}>
            Regional averages only tell part of the story — prices within a single city can vary by thousands of pounds between funeral directors.
            The best thing you can do is <Link to="/search" className="text-sage font-medium hover:underline">compare local prices directly</Link>.
          </Callout>
        </section>

        <Divider />

        {/* ── Section 6: How to save money ── */}
        <section>
          <SectionHeading id="save-money" eyebrow="Section 6">
            7 ways to reduce the cost
          </SectionHeading>
          <p className="text-muted leading-relaxed mb-7">
            Wanting to keep costs manageable isn't something to feel guilty about.
            It's a practical reality for many families, and there are genuine ways to reduce what you spend without reducing the meaning of the farewell.
          </p>

          <div className="flex flex-col gap-4">
            {TIPS.map(({ title, body }, i) => (
              <div key={title} className="flex items-start gap-4 bg-white rounded-xl border border-warm-border px-6 py-5">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sage-light border border-sage-border text-sage text-sm font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-charcoal mb-1">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Section 7: Government help ── */}
        <section>
          <SectionHeading id="government-help" eyebrow="Section 7">
            Government help you may not know about
          </SectionHeading>
          <p className="text-muted leading-relaxed mb-7">
            Many people don't realise the government offers financial support for funeral costs.
            If you're receiving certain benefits, you may be entitled to a grant that covers a significant portion of the bill.
          </p>

          <div className="bg-sage-light border border-sage-border rounded-2xl px-7 py-7 mb-6">
            <h3 className="font-bold text-charcoal text-xl mb-3">Funeral Expenses Payment</h3>
            <p className="text-sm text-muted leading-relaxed mb-5">
              This is a grant from the Department for Work and Pensions (DWP). It's not a loan — you don't pay it back.
              It can cover cremation or burial fees, up to £1,000 for other funeral costs, and travel expenses.
            </p>

            <h4 className="font-semibold text-charcoal text-sm mb-3">You may qualify if you are receiving:</h4>
            <ul className="flex flex-col gap-2 mb-6">
              {['Universal Credit', 'Housing Benefit', 'Income Support', 'Employment and Support Allowance (ESA)', 'Pension Credit'].map(b => (
                <CheckItem key={b}>{b}</CheckItem>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/government-grants"
                className="flex-1 block text-center py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm text-sm"
              >
                Check your eligibility →
              </Link>
              <a
                href="https://www.gov.uk/funeral-payments"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 block text-center py-3 bg-white hover:bg-cream border-2 border-sage text-sage font-semibold rounded-xl transition-colors duration-150 text-sm"
              >
                Apply on GOV.UK
              </a>
            </div>
          </div>

          <div className="bg-white border border-warm-border rounded-2xl px-7 py-6 mb-4">
            <h3 className="font-semibold text-charcoal mb-2">Funeral Support Payment (Scotland)</h3>
            <p className="text-sm text-muted leading-relaxed">
              If you live in Scotland, there is a separate Funeral Support Payment administered by Social Security Scotland.
              It's broadly similar to the DWP scheme and also covers people on qualifying benefits.
            </p>
          </div>

          <Callout icon={INFO_ICON}>
            You can apply for Funeral Expenses Payment even if you've already paid for the funeral,
            as long as you apply <strong>within 6 months</strong> of the funeral date.
          </Callout>
        </section>

        <Divider />

        {/* ── FAQ section ── */}
        <section>
          <SectionHeading id="faq" eyebrow="Section 8">
            Common questions answered
          </SectionHeading>
          <p className="text-muted leading-relaxed mb-7">
            Answers to the questions families most often ask when they start researching funeral costs.
          </p>
          <div className="flex flex-col gap-3">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group bg-white rounded-xl border border-warm-border px-6 py-5 cursor-pointer">
                <summary className="font-semibold text-charcoal text-sm leading-snug list-none flex items-center justify-between gap-3">
                  {q}
                  <svg className="w-4 h-4 text-muted shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-sm text-muted leading-relaxed mt-3 pt-3 border-t border-warm-border">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Browse by city ── */}
        <section>
          <h2 className="text-lg font-bold text-charcoal mb-4">Browse funeral directors by city</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FEATURED_CITIES.map(([slug, name]) => (
              <Link
                key={slug}
                to={`/funeral-directors/${slug}`}
                className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-warm-border hover:border-sage hover:shadow-sm transition-all text-sm font-medium text-charcoal"
              >
                <svg className="w-3.5 h-3.5 text-sage shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
                </svg>
                {name}
              </Link>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Bottom CTA ── */}
        <section className="bg-white rounded-2xl border border-warm-border px-7 py-8 text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-3">Ready to compare prices near you?</h2>
          <p className="text-muted text-sm leading-relaxed max-w-sm mx-auto mb-7">
            Enter your postcode or town to see attended funeral and direct cremation prices from local funeral directors side by side.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/search"
              className="px-8 py-3.5 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm text-base"
            >
              Compare local prices
            </Link>
            <Link
              to="/government-grants"
              className="px-8 py-3.5 bg-cream hover:bg-sage-light border-2 border-warm-border hover:border-sage-border text-charcoal font-semibold rounded-xl transition-colors duration-150 text-base"
            >
              Check grant eligibility
            </Link>
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted mt-8 leading-relaxed max-w-lg mx-auto">
          Prices quoted are national averages sourced from industry reports and are for guidance only.
          Actual costs vary by provider and location. FuneralFair is not a funeral director and does not receive commission.
        </p>

      </main>

      <Footer />
    </div>
  )
}
