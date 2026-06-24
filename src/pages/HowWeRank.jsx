import { useEffect } from 'react'
import { setPageMeta } from '../utils/setPageMeta'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function HowWeRank() {
  useEffect(() => {
    setPageMeta({
      title: 'How We Rank Results — FuneralFair',
      description: "FuneralFair never accepts commission from funeral directors. Here's exactly how we rank results and how the Featured Partner scheme works.",
      path: '/how-we-rank',
    })
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-6 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">How we rank results</h1>
        <p className="text-muted text-base mb-10 leading-relaxed">
          We believe you deserve honest, clear information at one of the most difficult times in your life.
        </p>

        <div className="space-y-10">

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-2">Where prices come from</h2>
            <p className="text-muted leading-relaxed">
              Prices shown on FuneralFair come directly from each funeral director's legally required
              Standardised Price List (SPL) — documents that all funeral directors in England and Wales
              must publish under CMA regulations. We source prices from these published lists and update
              our records regularly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-2">Advertising disclosure</h2>
            <div className="bg-white border border-warm-border rounded-2xl px-5 py-4">
              <p className="text-charcoal leading-relaxed">
                Some funeral directors pay a fee to be featured prominently in our search results.
                <strong> This does not affect the order in which you see them.</strong> Featured Partner
                listings are always shown in a separate, clearly labelled box so you can see exactly
                which results are paid.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-2">How we order results</h2>
            <ul className="space-y-2 text-muted leading-relaxed">
              <li className="flex gap-2">
                <span className="text-sage font-bold mt-0.5">·</span>
                <span><strong className="text-charcoal">Postcode search:</strong> results are sorted by distance from your location, nearest first.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-sage font-bold mt-0.5">·</span>
                <span><strong className="text-charcoal">Town search:</strong> results are sorted by lowest price.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-sage font-bold mt-0.5">·</span>
                <span>Featured Partners are always shown in a separate section above the main results.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-2">Price accuracy</h2>
            <p className="text-muted leading-relaxed">
              Prices are sourced from each provider's published Standardised Price List. We update our
              records regularly, but prices can change at any time. Always verify the final cost directly
              with the funeral director before making any arrangements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-charcoal mb-2">Last updated</h2>
            <p className="text-muted leading-relaxed">
              Each listing shows the date we last verified the prices displayed. If you notice a price
              that appears out of date, please{' '}
              <a href="mailto:hello@funeralfair.co.uk" className="text-sage underline underline-offset-2 hover:text-sage-dark">
                let us know
              </a>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
