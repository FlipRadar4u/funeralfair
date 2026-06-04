import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Point({ icon, title, body }) {
  return (
    <div className="flex gap-4">
      <div className="w-9 h-9 rounded-full bg-sage-light border border-sage-border flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-charcoal text-sm mb-1">{title}</p>
        <p className="text-sm text-muted leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

export default function About() {
  useEffect(() => {
    document.title = 'About FuneralFair — Honest UK Funeral Price Comparison'
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'How FuneralFair works, why we built it, and how we make money. We help families compare real funeral prices without commission or sales pressure.')
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-12 sm:py-20">

        {/* Intro */}
        <div className="mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-sage">About FuneralFair</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mt-3 mb-6 leading-tight">
            Built to fix something broken.
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-5">
            When someone dies, families shouldn't have to face opaque pricing, pressure tactics, and a market that profits from grief. But for most people in the UK arranging a funeral, that's exactly what happens.
          </p>
          <p className="text-muted leading-relaxed mb-5">
            FuneralFair was built from a simple belief: you deserve to know what a funeral costs before you pick up the phone. Real prices, from real local directors — without having to speak to a salesperson, create an account, or hand over your details.
          </p>
          <p className="text-muted leading-relaxed">
            We're independent. We take no commission. And we built this because the alternative — staying silent while families pay thousands more than they need to — wasn't an option.
          </p>
        </div>

        {/* How it works */}
        <div className="border-t border-warm-border pt-10 mb-12">
          <h2 className="text-xl font-bold text-charcoal mb-6">How it works</h2>
          <div className="space-y-6">
            <Point
              icon={
                <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
                </svg>
              }
              title="We list real prices from funeral directors across the UK"
              body="We collect pricing data including from the legally required Standardised Price Lists that every funeral director must publish. Prices are updated regularly and sourced directly — no estimates, no averages."
            />
            <Point
              icon={
                <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              }
              title="We never take commission — ever"
              body="When you contact a funeral director through FuneralFair, we receive nothing. No referral fee, no lead charge, no cut of the funeral cost. Results cannot be bought. The only commercial arrangement we have with directors is Featured Partner placement — clearly labelled, above the main results."
            />
            <Point
              icon={
                <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                </svg>
              }
              title="No account needed — we exist to inform, not to capture leads"
              body="Search, compare prices, and get contact details without signing up or handing over your email. We're not building a database of grieving families to market to. We're here to give you what you need and get out of your way."
            />
            <Point
              icon={
                <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" />
                </svg>
              }
              title="Results sorted by distance or price — not by who pays us"
              body="Standard results are ordered by proximity to your search location or by price, depending on what you choose. A director cannot pay to appear higher in those results."
            />
          </div>
        </div>

        {/* How we make money */}
        <div className="border-t border-warm-border pt-10 mb-12">
          <h2 className="text-xl font-bold text-charcoal mb-4">How we make money — honestly</h2>
          <p className="text-sm text-muted leading-relaxed mb-4">
            Funeral directors can pay to be listed as a <strong className="text-charcoal">Featured Partner</strong>. This places them in a clearly labelled section at the top of search results — separate from and clearly distinct from standard listings. It is the only way money changes hands between us and a director.
          </p>
          <p className="text-sm text-muted leading-relaxed mb-4">
            We will never hide, demote, or remove a director from standard results because they haven't paid us. We will never inflate prices to make featured directors look cheaper. And we will never sell your contact details to anyone.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            That's the deal. No small print.
          </p>
        </div>

        {/* Mission callout */}
        <div className="bg-sage-light border border-sage-border rounded-2xl px-6 py-8 text-center mb-4">
          <p className="text-charcoal font-semibold text-lg mb-3">Our mission</p>
          <p className="text-muted leading-relaxed text-sm max-w-lg mx-auto mb-6">
            To make funeral pricing in the UK transparent — so that families can make informed decisions at the hardest moment of their lives, without pressure, without confusion, and without being taken advantage of.
          </p>
          <Link
            to="/search"
            className="inline-block px-6 py-3 bg-sage text-white font-semibold rounded-xl text-sm hover:bg-sage-dark transition-colors"
          >
            Find local directors →
          </Link>
        </div>

        {/* Contact */}
        <p className="text-center text-xs text-muted mt-6">
          Questions or feedback?{' '}
          <a href="mailto:hello@funeralfair.co.uk" className="underline underline-offset-2 hover:text-charcoal">
            hello@funeralfair.co.uk
          </a>
        </p>

      </main>

      <Footer />
    </div>
  )
}
