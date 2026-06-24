import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { setPageMeta } from '../utils/setPageMeta'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const SECTIONS = [
  {
    title: 'Your wishes',
    icon: (
      <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
      </svg>
    ),
    items: [
      { label: 'Burial or cremation?', detail: 'This is the most fundamental decision. Direct cremation, attended cremation, or burial — each has different cost and practical implications.' },
      { label: 'Religious or secular service?', detail: 'If you have religious or cultural requirements, note them here. Some faith traditions have specific requirements around timing and preparation.' },
      { label: 'Where do you want any service held?', detail: 'Crematorium, church, woodland, a favourite venue — or no service at all. Noting this removes a burden from your family.' },
      { label: 'Music, readings, or other wishes for the day', detail: 'A favourite song, a poem, a request for people to wear colour instead of black. These details matter and are often forgotten.' },
      { label: 'What to do with ashes (if cremated)', detail: 'Buried in a garden of remembrance, scattered somewhere meaningful, kept at home, or split between family members — whatever you prefer.' },
    ],
  },
  {
    title: 'Practical arrangements',
    icon: (
      <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    items: [
      { label: 'Tell someone where your will is kept', detail: 'If you have a will, make sure at least one trusted person knows where it is. A solicitor, a family member, or a Will Register service.' },
      { label: 'Note the location of important documents', detail: 'Birth certificate, passport, marriage certificate, National Insurance number. Having these together saves your family significant time and stress.' },
      { label: 'List your key accounts and subscriptions', detail: 'Bank accounts, pension providers, HMRC, utility providers, online accounts. This makes the estate administration process far easier.' },
      { label: 'Consider a pre-paid funeral plan (with caution)', detail: 'Pre-paid plans lock in today\'s prices. But compare providers carefully — fees and terms vary significantly. Plans regulated by the FCA since 2022.' },
      { label: 'Leave contact details for key people', detail: 'Who needs to be told? A list of close friends, colleagues, or community members your family might not know to contact.' },
    ],
  },
  {
    title: 'Financial',
    icon: (
      <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    items: [
      { label: 'Have you set aside money for funeral costs?', detail: 'The average funeral costs £4,400. If you want a simple direct cremation, budget around £900–£1,500. Planning ahead avoids your family having to cover this at short notice.' },
      { label: 'Does anyone know about your savings and investments?', detail: 'Banks freeze accounts when someone dies. A trusted person should know roughly what accounts exist, even if not the balances.' },
      { label: 'Do you have a life insurance policy?', detail: 'If so, make sure someone knows it exists and where the documents are. Claims are often forgotten when families don\'t know to look.' },
      { label: 'Are you entitled to a government funeral payment?', detail: 'If the person arranging your funeral is on certain benefits, they may be able to claim a Funeral Expenses Payment from the government. Worth noting for them.' },
    ],
  },
]

export default function PlanAhead() {
  const [checked, setChecked] = useState({})
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    setPageMeta({
      title: 'Plan Ahead — Funeral Planning Guide | FuneralFair',
      description: 'Plan your own funeral arrangements in advance — reduce the burden on your family and make sure your wishes are known.',
      path: '/plan-ahead',
    })
    try {
      const saved = localStorage.getItem('ff_planahead')
      if (saved) setChecked(JSON.parse(saved))
    } catch {}
  }, [])

  function toggle(key) {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem('ff_planahead', JSON.stringify(next))
      return next
    })
  }

  function toggleExpand(key) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const totalItems = SECTIONS.reduce((n, s) => n + s.items.length, 0)
  const doneItems  = Object.values(checked).filter(Boolean).length
  const pct        = Math.round((doneItems / totalItems) * 100)

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-12 sm:py-20">

        {/* Header */}
        <div className="mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-sage">Planning ahead</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mt-3 mb-4 leading-tight">
            The kindest thing you can do for your family.
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-5">
            Planning your own funeral in advance is a gift to the people you love. It removes a huge burden — the guesswork, the difficult decisions at a painful time, the risk of getting it wrong.
          </p>
          <p className="text-muted leading-relaxed">
            You don't need to make every decision now. Even noting a few key wishes and leaving them somewhere your family can find them makes an enormous difference.
          </p>
        </div>

        {/* Progress bar */}
        {doneItems > 0 && (
          <div className="bg-white border border-warm-border rounded-2xl px-5 py-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-charcoal">{doneItems} of {totalItems} items noted</span>
              <span className="text-sm font-semibold text-sage">{pct}%</span>
            </div>
            <div className="h-2 bg-cream rounded-full overflow-hidden border border-warm-border">
              <div
                className="h-full bg-sage rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted mt-2">Your progress is saved in this browser.</p>
          </div>
        )}

        {/* Checklist sections */}
        <div className="space-y-8 mb-12">
          {SECTIONS.map(section => (
            <div key={section.title} className="bg-white rounded-2xl border border-warm-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-warm-border">
                <div className="w-9 h-9 rounded-full bg-sage-light border border-sage-border flex items-center justify-center shrink-0">
                  {section.icon}
                </div>
                <h2 className="font-bold text-charcoal">{section.title}</h2>
              </div>
              <div className="divide-y divide-warm-border">
                {section.items.map((item, i) => {
                  const key      = `${section.title}-${i}`
                  const done     = !!checked[key]
                  const open     = !!expanded[key]
                  return (
                    <div key={key} className={`px-5 py-4 transition-colors ${done ? 'bg-sage-light/40' : ''}`}>
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggle(key)}
                          className={`mt-0.5 w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${done ? 'bg-sage border-sage' : 'border-warm-border hover:border-sage'}`}
                          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {done && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => toggleExpand(key)}
                            className="text-left w-full"
                          >
                            <p className={`text-sm font-semibold ${done ? 'text-muted line-through' : 'text-charcoal'}`}>
                              {item.label}
                            </p>
                          </button>
                          {open && (
                            <p className="text-xs text-muted leading-relaxed mt-2">{item.detail}</p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleExpand(key)}
                          className="text-muted hover:text-charcoal shrink-0 mt-0.5"
                          aria-label="Expand"
                        >
                          <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA block */}
        <div className="bg-sage-light border border-sage-border rounded-2xl px-6 py-8">
          <h3 className="font-bold text-charcoal text-lg mb-2">Compare funeral prices now</h3>
          <p className="text-sm text-muted leading-relaxed mb-5">
            If you're planning ahead, comparing prices now means you know what to budget for — and you can share your preferred director with your family before the time comes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/search"
              className="flex-1 text-center py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Compare prices →
            </Link>
            <Link
              to="/funeral-costs/uk"
              className="flex-1 text-center py-3 bg-white hover:bg-cream border border-warm-border text-charcoal font-semibold rounded-xl text-sm transition-colors"
            >
              Funeral cost guide
            </Link>
          </div>
        </div>

        {/* Govt grants link */}
        <p className="text-center text-xs text-muted mt-8">
          Arranging a funeral for someone else?{' '}
          <Link to="/government-grants" className="underline underline-offset-2 hover:text-charcoal">
            You may be entitled to a government funeral payment.
          </Link>
        </p>

      </main>

      <Footer />
    </div>
  )
}
