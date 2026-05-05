import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ─── Content ──────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'first-24-hours',
    timeframe: 'First 24 hours',
    label: 'Today',
    color: 'sage',
    intro: "Right now, you don't need to do everything. Only a small number of things genuinely need to happen today — and some of those can wait a few hours. Please be gentle with yourself.",
    items: [
      {
        id: '1-1',
        title: 'If the death was expected — contact the GP or out-of-hours service',
        paragraphs: [
          "If someone died at home or in a care home from an expected illness, a doctor needs to certify the death. They'll issue a Medical Certificate of Cause of Death (MCCD) — you'll need this to register the death later.",
          "Outside GP hours, call 111 or the out-of-hours doctor. There's no need to rush. You don't have to move the person immediately, and you don't have to do anything until you're ready.",
        ],
      },
      {
        id: '1-2',
        title: 'If the death was sudden or unexpected — call 999',
        paragraphs: [
          "If someone collapsed unexpectedly, or if the cause of death is unclear, call 999. The police may attend and the death may be referred to a coroner.",
          "This doesn't mean anything wrong happened — it's a standard legal process. The coroner's office will guide you on next steps. It may take a little longer to register the death in this situation, and that's okay.",
        ],
      },
      {
        id: '1-3',
        title: 'Contact a funeral director when you are ready',
        paragraphs: [
          "A funeral director can collect the person and care for them while you take the time you need. You don't have to decide on a service, a date, or even which director you'll use long-term — many families simply call one to help with collection and choose later.",
          "If you're unsure who to use, that's completely fine. You can compare local funeral directors and prices on FuneralFair before you commit to anything.",
        ],
        link: { label: 'Compare local funeral directors', to: '/search' },
      },
      {
        id: '1-4',
        title: 'Tell the people closest to you',
        paragraphs: [
          "There's no script for this, and there's no right way. If making calls feels like too much, ask someone you trust to let people know on your behalf.",
          "You don't need to tell everyone today. Some news can wait until tomorrow, or the day after. Do only what you can manage right now.",
        ],
      },
      {
        id: '1-5',
        title: 'Take care of yourself — genuinely',
        paragraphs: [
          "You may be in shock, even if the death was expected. Shock doesn't always look dramatic — it can feel like numbness, a strange calm, or complete overwhelm. All of that is normal.",
          "Try to eat something. Drink water. Sit down. Let other people help you. The paperwork can wait a few hours. You are allowed to just stop for a moment.",
        ],
      },
    ],
  },
  {
    id: 'first-week',
    timeframe: 'The first week',
    label: 'This week',
    color: 'warm',
    intro: "This week has a few things with legal deadlines, but most tasks can be done in whatever order works for you. Don't try to fit everything into one day.",
    items: [
      {
        id: '2-1',
        title: 'Register the death',
        important: true,
        paragraphs: [
          "This must be done within 5 days in England, Wales, and Northern Ireland — or 8 days in Scotland. Visit your local register office (find it on GOV.UK). You can usually book an appointment online.",
          "Bring the Medical Certificate of Cause of Death from the doctor or coroner, plus your own photo ID. The registrar will issue a death certificate.",
          "Order multiple certified copies at the same time — they're cheaper this way and you'll need originals for banks, pension providers, and insurance companies. Most people need between 5 and 10.",
        ],
        badge: 'Legal deadline',
      },
      {
        id: '2-2',
        title: 'Arrange the funeral',
        paragraphs: [
          "You don't have to rush, but having this in hand can help you feel a little steadier. Funeral directors are used to working with families at different paces.",
          "Things to think about: burial or cremation, whether you'd like a religious or non-religious service, and roughly how many people might attend.",
          "Get quotes from more than one funeral director if you can — prices vary significantly even within the same town. Since 2021, all funeral directors in England and Wales are required by law to share a Standardised Price List on request.",
        ],
        link: { label: 'Compare prices near you', to: '/search' },
      },
      {
        id: '2-3',
        title: 'Look for the will',
        paragraphs: [
          "Check at home first — common places are a filing cabinet, a desk drawer, or with important documents. If you can't find one, try their solicitor, their bank, or the National Will Register.",
          "If there is a will, it names an executor — the person responsible for carrying out the deceased's wishes. If you're the executor, you'll likely need to apply for probate (more on that in the next section).",
          "If there's no will, don't panic. The estate is shared according to the rules of intestacy. A solicitor can walk you through this — many offer a free first consultation.",
        ],
      },
      {
        id: '2-4',
        title: 'Notify the bank',
        paragraphs: [
          "Contact the person's bank to let them know. They'll usually freeze the account to protect the estate, but this doesn't mean funeral costs can't be covered — ask the bank directly about this.",
          "Most banks have a bereavement team who handle this sensitively. They'll tell you what documents they need, which is usually a death certificate and your own ID.",
        ],
      },
      {
        id: '2-5',
        title: 'Use the Tell Us Once service',
        paragraphs: [
          "Tell Us Once is a free government service that lets you notify multiple departments at the same time — including HMRC, the DWP, the DVLA, and the Passport Office. It saves a lot of separate phone calls.",
          "You'll receive a unique reference number from the register office when you register the death. Use it at gov.uk/tell-us-once.",
        ],
      },
      {
        id: '2-6',
        title: 'Notify employer, landlord, or school if relevant',
        paragraphs: [
          "If the person was employed, their employer will need to know — and may have a death-in-service payment or outstanding wages to settle.",
          "If they were renting, the landlord needs to know so access can be arranged when you're ready.",
          "If the person who died was a child, or had children at school, those schools should be told.",
        ],
      },
    ],
  },
  {
    id: 'within-a-month',
    timeframe: 'Within a month',
    label: 'This month',
    color: 'neutral',
    intro: "These tasks are important, but none of them need to happen in the first few days. Work through them at your own pace, and ask for help wherever you can.",
    items: [
      {
        id: '3-1',
        title: 'Order more death certificates if needed',
        paragraphs: [
          "Each institution — banks, pension providers, insurance companies, investment accounts — usually requires an original certified copy. You cannot use photocopies.",
          "If you didn't order enough at registration, you can request more from the register office at any time. It's slightly cheaper to order them all at once, but it's not too late to get more.",
        ],
      },
      {
        id: '3-2',
        title: 'Apply for probate if required',
        paragraphs: [
          "Probate is the legal process of administering someone's estate. Not every estate needs it — if assets are jointly owned or the estate is small, you may be able to skip it.",
          "If the estate includes property, significant savings, or investments, you'll usually need probate. If there's a will, the named executor applies. If there's no will, the next of kin applies for 'letters of administration' instead.",
          "You can apply yourself through GOV.UK or use a solicitor. Probate can take anything from a few weeks to over a year depending on complexity.",
        ],
      },
      {
        id: '3-3',
        title: 'Cancel ongoing accounts and subscriptions',
        paragraphs: [
          "Go through direct debits and standing orders and cancel what's no longer needed. Common things to sort:",
        ],
        bullets: [
          "Mobile phone contract (ask for compassionate cancellation — many providers waive fees)",
          "Streaming services, gym memberships, magazine subscriptions",
          "Insurance policies (home, car, pet)",
          "Council tax — contact your local council",
          "Driving licence — notify the DVLA",
          "Passport — notify His Majesty's Passport Office",
          "NHS records — let their GP surgery know",
        ],
      },
      {
        id: '3-4',
        title: 'Contact pension and insurance providers',
        paragraphs: [
          "If the person had a pension, contact the provider. Depending on the type of pension, there may be a payment to a spouse, civil partner, or nominated beneficiary.",
          "If there's a life insurance policy, contact the insurer to start the claim. You'll need the policy number and a death certificate. Most claims are settled within a few weeks.",
        ],
      },
      {
        id: '3-5',
        title: 'Check whether you may be entitled to government support',
        paragraphs: [
          "If you were responsible for the funeral costs and you receive certain benefits, you may be entitled to a Funeral Expenses Payment — a government grant you don't have to repay.",
          "You can apply even if you've already paid, as long as you apply within 6 months of the funeral.",
        ],
        link: { label: 'Check your eligibility', to: '/government-grants' },
      },
      {
        id: '3-6',
        title: 'Sort through belongings at your own pace',
        paragraphs: [
          "There is no deadline for this. You do not have to clear a house or go through someone's belongings until you are ready. Some people find it healing to do it soon. Others need months or longer. Both are completely valid.",
          "If it feels like too much, ask a friend or family member to be there with you. Some charities can also help with house clearances sensitively and at low or no cost.",
        ],
      },
      {
        id: '3-7',
        title: 'Reach out for support — for yourself',
        paragraphs: [
          "Grief doesn't follow a schedule. It can feel distant at first, then hit hard weeks or months later. It can make you exhausted, forgetful, and unlike yourself. This is not weakness — it's grief.",
          "You don't have to manage it alone. There are people who can help:",
        ],
        bullets: [
          "Cruse Bereavement Support — cruse.org.uk or freephone 0808 808 1677",
          "Samaritans — samaritans.org or call 116 123 (free, 24 hours a day)",
          "Your GP — grief affects your physical health too, and they can help",
          "Local grief counsellors and bereavement groups (ask your GP for a referral)",
        ],
        closing: "It's okay to not be okay.",
      },
    ],
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

const CHEVRON = (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

const CHECK_ICON = (
  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

function ChecklistItem({ item, sectionIndex, index, isOpen, isDone, onToggleOpen, onToggleDone }) {
  const globalIndex = sectionIndex * 10 + index + 1

  return (
    <div className={`border-b border-warm-border last:border-0 transition-colors duration-150 ${isDone ? 'opacity-60' : ''}`}>

      {/* Row */}
      <div className="flex items-start gap-3 sm:gap-4 py-4 sm:py-5 px-5 sm:px-6">

        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleDone() }}
          aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
          className={`flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 transition-all duration-150 ${
            isDone
              ? 'bg-sage border-sage'
              : 'border-warm-border bg-white hover:border-sage'
          }`}
        >
          {isDone && CHECK_ICON}
        </button>

        {/* Title row — clicking opens detail */}
        <button
          onClick={onToggleOpen}
          className="flex-1 flex items-start justify-between gap-3 text-left group"
        >
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-xs font-bold text-sage shrink-0 mt-1 w-5 text-right tabular-nums">
              {globalIndex}
            </span>
            <div className="min-w-0">
              <span className={`font-semibold text-sm sm:text-base leading-snug transition-colors ${
                isDone ? 'line-through text-muted' : 'text-charcoal group-hover:text-sage'
              }`}>
                {item.title}
              </span>
              {item.badge && (
                <span className="ml-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 align-middle">
                  {item.badge}
                </span>
              )}
            </div>
          </div>
          <span className={`text-muted shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            {CHEVRON}
          </span>
        </button>
      </div>

      {/* Expandable detail */}
      {isOpen && (
        <div className="pb-5 px-5 sm:px-6 pl-[3.75rem] sm:pl-[4.25rem]">
          <div className="flex flex-col gap-3">
            {item.paragraphs.map((p, i) => (
              <p key={i} className="text-sm text-muted leading-relaxed">{p}</p>
            ))}

            {item.bullets && (
              <ul className="flex flex-col gap-2 pl-1">
                {item.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0 mt-2" />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {item.closing && (
              <p className="text-sm font-medium text-charcoal italic">{item.closing}</p>
            )}

            {item.link && (
              <div className="pt-1">
                <Link
                  to={item.link.to}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-sage hover:text-sage-dark underline underline-offset-2 transition-colors"
                >
                  {item.link.label}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const SECTION_STYLES = {
  sage:    { dot: 'bg-sage', label: 'text-sage bg-sage-light border-sage-border' },
  warm:    { dot: 'bg-amber-400', label: 'text-amber-700 bg-amber-50 border-amber-200' },
  neutral: { dot: 'bg-charcoal-soft', label: 'text-charcoal-soft bg-warm-border/60 border-warm-border' },
}

function Section({ section, sectionIndex, openItems, doneItems, onToggleOpen, onToggleDone }) {
  const styles = SECTION_STYLES[section.color]
  const doneCount = section.items.filter(item => doneItems.has(item.id)).length

  return (
    <div id={section.id} className="scroll-mt-24">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full shrink-0 ${styles.dot}`} />
        <h2 className="text-xl sm:text-2xl font-bold text-charcoal">{section.timeframe}</h2>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styles.label}`}>
          {section.label}
        </span>
        {doneCount > 0 && (
          <span className="ml-auto text-xs text-muted font-medium shrink-0">
            {doneCount} / {section.items.length} done
          </span>
        )}
      </div>

      {/* Intro */}
      <p className="text-muted text-sm leading-relaxed mb-4 pl-6">{section.intro}</p>

      {/* Items card */}
      <div className="bg-white rounded-2xl border border-warm-border shadow-sm divide-y divide-warm-border overflow-hidden mb-12">
        {section.items.map((item, i) => (
          <ChecklistItem
            key={item.id}
            item={item}
            sectionIndex={sectionIndex}
            index={i}
            isOpen={openItems.has(item.id)}
            isDone={doneItems.has(item.id)}
            onToggleOpen={() => onToggleOpen(item.id)}
            onToggleDone={() => onToggleDone(item.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const ALL_ITEMS = SECTIONS.flatMap(s => s.items)

export default function WhatToDo() {
  const [openItems, setOpenItems] = useState(new Set())
  const [doneItems, setDoneItems] = useState(new Set())

  function toggleOpen(id) {
    setOpenItems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleDone(id) {
    setDoneItems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const totalDone  = doneItems.size
  const totalItems = ALL_ITEMS.length

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      {/* ── Page header ── */}
      <div className="border-b border-warm-border bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-2 mb-5">
            <Link to="/" className="text-xs text-muted hover:text-charcoal transition-colors">Home</Link>
            <span className="text-muted text-xs">›</span>
            <span className="text-xs text-sage font-medium">What to do</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal leading-tight mb-5">
            What to do when someone dies
            <span className="block text-sage mt-1 text-2xl sm:text-3xl font-semibold">
              A calm, step-by-step guide
            </span>
          </h1>

          {/* The key note */}
          <div className="flex items-start gap-3 bg-sage-light border border-sage-border rounded-xl px-5 py-4 mb-6">
            <svg className="w-5 h-5 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <p className="text-sm text-charcoal leading-relaxed">
              <strong>There is no right or wrong order.</strong> Do what you can, when you can.
              This list is a guide, not a test. Some things can wait longer than you think.
            </p>
          </div>

          <p className="text-muted text-sm leading-relaxed">
            We've broken this into three timeframes so it feels manageable. Tick things off as you go — or simply read through and come back when you need to.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">

        {/* ── Progress bar (appears once at least one item is ticked) ── */}
        {totalDone > 0 && (
          <div className="bg-white border border-warm-border rounded-2xl px-6 py-5 mb-10">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-sm font-semibold text-charcoal">Your progress</p>
              <p className="text-sm text-muted">{totalDone} of {totalItems} steps ticked</p>
            </div>
            <div className="h-2 bg-warm-border rounded-full overflow-hidden">
              <div
                className="h-full bg-sage rounded-full transition-all duration-500"
                style={{ width: `${(totalDone / totalItems) * 100}%` }}
              />
            </div>
            {totalDone === totalItems && (
              <p className="text-sm text-sage font-medium mt-3">
                You have worked through everything on this list. That took real strength.
              </p>
            )}
          </div>
        )}

        {/* ── Section jump links ── */}
        <nav className="flex flex-wrap gap-2 mb-10">
          {SECTIONS.map(s => {
            const styles = SECTION_STYLES[s.color]
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors hover:opacity-80 ${styles.label}`}
              >
                {s.timeframe}
              </a>
            )
          })}
        </nav>

        {/* ── Sections ── */}
        {SECTIONS.map((section, si) => (
          <Section
            key={section.id}
            section={section}
            sectionIndex={si}
            openItems={openItems}
            doneItems={doneItems}
            onToggleOpen={toggleOpen}
            onToggleDone={toggleDone}
          />
        ))}

        {/* ── Bottom support CTA ── */}
        <div className="bg-white border border-warm-border rounded-2xl px-7 py-8 text-center mb-8">
          <h2 className="text-xl font-bold text-charcoal mb-3">Practical help while you're here</h2>
          <p className="text-muted text-sm leading-relaxed max-w-sm mx-auto mb-7">
            When you're ready, FuneralFair can help you compare local funeral prices and check whether you qualify for government support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/search"
              className="px-6 py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm text-sm"
            >
              Compare funeral prices
            </Link>
            <Link
              to="/government-grants"
              className="px-6 py-3 bg-cream hover:bg-sage-light border-2 border-warm-border hover:border-sage-border text-charcoal font-semibold rounded-xl transition-colors duration-150 text-sm"
            >
              Check grant eligibility
            </Link>
          </div>
        </div>

        {/* ── Bereavement support ── */}
        <div className="border border-warm-border rounded-2xl px-6 py-6 bg-white">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Bereavement support</p>
          <div className="flex flex-col gap-3">
            {[
              { name: 'Cruse Bereavement Support', detail: 'cruse.org.uk · Freephone 0808 808 1677' },
              { name: 'Samaritans', detail: 'samaritans.org · Call 116 123 (free, 24/7)' },
              { name: 'Child Bereavement UK', detail: 'childbereavementuk.org · For families and young people' },
              { name: 'AtALoss.org', detail: 'ataloss.org · Directory of bereavement support by region' },
            ].map(({ name, detail }) => (
              <div key={name} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-sage shrink-0 mt-2" />
                <div>
                  <p className="text-sm font-semibold text-charcoal">{name}</p>
                  <p className="text-xs text-muted">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}
