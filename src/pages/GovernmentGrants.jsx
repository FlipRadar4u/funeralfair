import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ─── Question definitions ─────────────────────────────────────────────────────

const QUESTIONS = [
  {
    key: 'benefits',
    type: 'checkbox',
    question: 'Are you currently receiving any of these benefits?',
    hint: 'Select all that apply',
    options: [
      { value: 'uc',  label: 'Universal Credit' },
      { value: 'hb',  label: 'Housing Benefit' },
      { value: 'is',  label: 'Income Support' },
      { value: 'esa', label: 'Employment and Support Allowance (ESA)' },
      { value: 'pc',  label: 'Pension Credit' },
      { value: 'none', label: 'None of the above', separator: true },
    ],
  },
  {
    key: 'relationship',
    type: 'radio',
    question: 'What was your relationship to the person who died?',
    options: [
      { value: 'partner',  label: 'Partner or spouse' },
      { value: 'parent',   label: 'Parent of a child aged under 16' },
      { value: 'relative', label: 'Close relative or friend responsible for the funeral' },
    ],
  },
  {
    key: 'ukFuneral',
    type: 'radio',
    question: 'Is the funeral taking place in the UK?',
    options: [
      { value: 'yes', label: 'Yes, in the UK' },
      { value: 'no',  label: 'No, outside the UK' },
    ],
  },
  {
    key: 'prePaidPlan',
    type: 'radio',
    question: 'Did the person who died have a pre-paid funeral plan?',
    hint: 'A plan that pays for some or all of the funeral in advance',
    options: [
      { value: 'yes',    label: 'Yes, they had a pre-paid plan' },
      { value: 'no',     label: 'No, they did not' },
      { value: 'unsure', label: "I'm not sure" },
    ],
  },
  {
    key: 'alreadyPaid',
    type: 'radio',
    question: 'Have you already paid for the funeral?',
    options: [
      { value: 'yes', label: 'Yes, I have already paid' },
      { value: 'no',  label: "No, I haven't paid yet" },
    ],
  },
]

const BLANK_ANSWERS = { benefits: [], relationship: null, ukFuneral: null, prePaidPlan: null, alreadyPaid: null }

// ─── Eligibility calculation ──────────────────────────────────────────────────

function calculateResult(answers) {
  const hasBenefit = answers.benefits.length > 0 && !answers.benefits.includes('none')
  const isUK       = answers.ukFuneral === 'yes'
  const prePaid    = answers.prePaidPlan === 'yes'
  const paid       = answers.alreadyPaid === 'yes'

  if (!hasBenefit) return { type: 'no-benefit' }
  if (!isUK)       return { type: 'not-uk' }
  return { type: 'eligible', prePaid, paid }
}

// ─── Small shared components ──────────────────────────────────────────────────

function ProgressBar({ step, total }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-muted uppercase tracking-widest">
          Eligibility checker
        </span>
        <span className="text-xs font-medium text-muted">
          Step {step} of {total}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < step ? 'bg-sage' : 'bg-warm-border'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function OptionCard({ selected, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 text-sm font-medium
        ${selected
          ? 'border-sage bg-sage-light text-charcoal'
          : 'border-warm-border bg-white text-charcoal hover:border-sage hover:bg-sage-light/60'
        } ${className}`}
    >
      {children}
    </button>
  )
}

// ─── Step renderers ───────────────────────────────────────────────────────────

function CheckboxStep({ question, hint, options, selected, onChange, onNext }) {
  const toggle = (value) => {
    if (value === 'none') {
      onChange(selected.includes('none') ? [] : ['none'])
    } else {
      const without = selected.filter(v => v !== 'none')
      onChange(without.includes(value) ? without.filter(v => v !== value) : [...without, value])
    }
  }

  const canProceed = selected.length > 0

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-1.5 leading-snug">{question}</h2>
      {hint && <p className="text-sm text-muted mb-6">{hint}</p>}

      <div className="flex flex-col gap-2.5 mb-8">
        {options.map((opt, i) => {
          const isSel = selected.includes(opt.value)
          return (
            <div key={opt.value}>
              {opt.separator && i > 0 && (
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 border-t border-warm-border" />
                  <span className="text-xs text-muted">or</span>
                  <div className="flex-1 border-t border-warm-border" />
                </div>
              )}
              <OptionCard selected={isSel} onClick={() => toggle(opt.value)}>
                <span className="flex items-center gap-3">
                  <span className={`flex items-center justify-center w-5 h-5 rounded border-2 shrink-0 transition-colors ${
                    isSel ? 'bg-sage border-sage' : 'border-warm-border bg-white'
                  }`}>
                    {isSel && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {opt.label}
                </span>
              </OptionCard>
            </div>
          )
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-3.5 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  )
}

function RadioStep({ question, hint, options, onSelect }) {
  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-1.5 leading-snug">{question}</h2>
      {hint && <p className="text-sm text-muted mb-6">{hint}</p>}
      {!hint && <div className="mb-6" />}

      <div className="flex flex-col gap-2.5">
        {options.map(opt => (
          <OptionCard key={opt.value} selected={false} onClick={() => onSelect(opt.value)}>
            <span className="flex items-center gap-3">
              <span className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-warm-border bg-white shrink-0" />
              {opt.label}
            </span>
          </OptionCard>
        ))}
      </div>
    </div>
  )
}

// ─── Result screens ───────────────────────────────────────────────────────────

function ResultEligible({ prePaid, paid, onRestart }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Hero result */}
      <div className="bg-sage-light border border-sage-border rounded-2xl px-7 py-8 text-center">
        <div className="w-14 h-14 bg-sage rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-charcoal mb-2">You may be eligible</h2>
        <p className="text-muted text-sm max-w-sm mx-auto leading-relaxed">
          Based on your answers, you could qualify for <strong className="text-charcoal">Funeral Expenses Payment</strong> — a government grant to help with funeral costs.
        </p>
      </div>

      {/* Caveats */}
      {(prePaid || paid) && (
        <div className="bg-white border border-warm-border rounded-2xl px-6 py-5 flex flex-col gap-3">
          <h3 className="font-semibold text-charcoal text-sm">A couple of things to note</h3>
          {prePaid && (
            <div className="flex items-start gap-3 text-sm text-muted">
              <svg className="w-4 h-4 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>Because the deceased had a pre-paid plan, the grant amount may be <strong className="text-charcoal">reduced</strong> by the value of that plan.</span>
            </div>
          )}
          {paid && (
            <div className="flex items-start gap-3 text-sm text-muted">
              <svg className="w-4 h-4 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              <span>You can still claim even though you have already paid — but you must <strong className="text-charcoal">apply within 6 months</strong> of the funeral date.</span>
            </div>
          )}
        </div>
      )}

      {/* What it covers */}
      <div className="bg-white border border-warm-border rounded-2xl px-6 py-5">
        <h3 className="font-semibold text-charcoal text-sm mb-3">What it can cover</h3>
        <ul className="flex flex-col gap-2 text-sm text-muted">
          {[
            'Death registration costs',
            'Funeral director fees (burial or cremation)',
            'Up to £1,000 for other costs (flowers, obituary notices, etc.)',
            'Travel costs to arrange or attend the funeral',
          ].map(item => (
            <li key={item} className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <a
        href="https://www.gov.uk/funeral-payments/overview"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full block text-center py-4 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm text-base"
      >
        Apply on GOV.UK
        <svg className="inline-block ml-2 w-4 h-4 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>
      <p className="text-center text-xs text-muted -mt-2">Opens the official UK government website</p>

      <button onClick={onRestart} className="text-sm text-muted hover:text-charcoal underline underline-offset-2 transition-colors py-1 text-center">
        Start again
      </button>
    </div>
  )
}

const ALTERNATIVES = [
  {
    title: 'Your local council',
    desc: "Most councils have a welfare or hardship fund. Contact your local authority's social services team to ask about emergency financial support.",
  },
  {
    title: 'Turn2us grant finder',
    desc: 'Turn2us is a national charity that helps people find charitable grants and financial support. Use their free grant search at turn2us.org.uk.',
  },
  {
    title: 'Payment plans with the funeral director',
    desc: 'Many funeral directors offer flexible payment plans or are aware of support funds. Ask them directly — many work with families in difficult circumstances.',
  },
  {
    title: 'Public health funeral',
    desc: "If no-one is able to pay for a funeral, the local council has a legal duty to arrange one. Contact your local council's environmental health team.",
  },
]

function ResultNotEligible({ reason, onRestart }) {
  const isNoBenefit = reason === 'no-benefit'

  return (
    <div className="flex flex-col gap-5">
      {/* Result header */}
      <div className="bg-white border border-warm-border rounded-2xl px-7 py-8 text-center">
        <div className="w-14 h-14 bg-cream border-2 border-warm-border rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-charcoal mb-2">
          {isNoBenefit ? "You may not qualify for this scheme" : "This scheme covers UK funerals only"}
        </h2>
        <p className="text-muted text-sm max-w-sm mx-auto leading-relaxed">
          {isNoBenefit
            ? "Funeral Expenses Payment is only available if you're currently receiving a qualifying benefit. But there are other ways to get help."
            : "Funeral Expenses Payment is for funerals in the UK. For funerals abroad, contact the relevant country's authorities or a charitable organisation."}
        </p>
      </div>

      {/* Alternative options */}
      <div className="bg-white border border-warm-border rounded-2xl px-6 py-6">
        <h3 className="font-semibold text-charcoal mb-4">Other sources of help</h3>
        <div className="flex flex-col gap-5">
          {ALTERNATIVES.map(({ title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sage-light border border-sage-border flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-charcoal text-sm mb-0.5">{title}</p>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Still check gov.uk */}
      <div className="flex items-start gap-3 bg-sage-light border border-sage-border rounded-xl px-5 py-4">
        <svg className="w-5 h-5 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="text-sm text-muted leading-relaxed">
          <strong className="text-charcoal">We recommend checking directly.</strong>{' '}
          Eligibility rules can change and your full circumstances may qualify you.{' '}
          <a
            href="https://www.gov.uk/funeral-payments/eligibility"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sage hover:underline font-medium"
          >
            Check full eligibility on GOV.UK →
          </a>
        </p>
      </div>

      <button onClick={onRestart} className="text-sm text-muted hover:text-charcoal underline underline-offset-2 transition-colors py-1 text-center">
        Start again
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GovernmentGrants() {
  const [step,        setStep]     = useState(0)            // 0–4 = questions
  const [done,        setDone]     = useState(false)
  const [answers,     setAnswers]  = useState(BLANK_ANSWERS)
  const [animating,   setAnimating]= useState(false)

  const totalSteps = QUESTIONS.length
  const q = QUESTIONS[step]

  function advance() {
    if (step < totalSteps - 1) {
      setStep(s => s + 1)
    } else {
      setDone(true)
    }
  }

  function handleNext() {
    advance()
  }

  function handleRadio(key, value) {
    setAnswers(a => ({ ...a, [key]: value }))
    // Brief pause so the user sees the selection highlighted before advancing
    setTimeout(advance, 320)
  }

  function handleCheckboxChange(values) {
    setAnswers(a => ({ ...a, benefits: values }))
  }

  function restart() {
    setStep(0)
    setDone(false)
    setAnswers(BLANK_ANSWERS)
  }

  const result = done ? calculateResult(answers) : null

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-xl mx-auto">

          {/* ── Page header ── */}
          {!done && (
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-sage-light border border-sage-border text-sage text-xs font-semibold tracking-widest uppercase">
                Government support
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3 leading-tight">
                Funeral Expenses Payment
              </h1>
              <p className="text-muted text-base max-w-sm mx-auto leading-relaxed">
                The UK government may cover some or all of your funeral costs. Answer 5 quick questions to check your eligibility.
              </p>
            </div>
          )}

          {done && (
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-2">Your result</h1>
              <p className="text-muted text-base">Based on your answers</p>
            </div>
          )}

          {/* ── Checker card ── */}
          <div className={`bg-white rounded-2xl border border-warm-border shadow-sm px-6 sm:px-8 py-7 ${done ? '' : ''}`}>

            {/* Progress bar — only shown during questions */}
            {!done && (
              <ProgressBar step={step + 1} total={totalSteps} />
            )}

            {/* Questions */}
            {!done && q.type === 'checkbox' && (
              <CheckboxStep
                key={step}
                question={q.question}
                hint={q.hint}
                options={q.options}
                selected={answers.benefits}
                onChange={handleCheckboxChange}
                onNext={handleNext}
              />
            )}

            {!done && q.type === 'radio' && (
              <RadioStep
                key={step}
                question={q.question}
                hint={q.hint}
                options={q.options}
                onSelect={(value) => handleRadio(q.key, value)}
              />
            )}

            {/* Back button — shown from step 2 onward */}
            {!done && step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="mt-6 flex items-center gap-1.5 text-sm text-muted hover:text-charcoal transition-colors duration-150 group"
              >
                <svg className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back
              </button>
            )}

            {/* Results */}
            {done && result.type === 'eligible' && (
              <ResultEligible prePaid={result.prePaid} paid={result.paid} onRestart={restart} />
            )}
            {done && result.type !== 'eligible' && (
              <ResultNotEligible reason={result.type} onRestart={restart} />
            )}
          </div>

          {/* ── Reassurance note ── */}
          {!done && (
            <p className="text-center text-xs text-muted mt-5 leading-relaxed">
              Your answers are not stored or shared.
              This checker gives general guidance only — always{' '}
              <a
                href="https://www.gov.uk/funeral-payments"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-charcoal"
              >
                check GOV.UK
              </a>{' '}
              for the full eligibility criteria.
            </p>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
