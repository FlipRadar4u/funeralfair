import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { setPageMeta } from '../utils/setPageMeta'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getPost, POSTS } from '../data/blogPosts'

export default function BlogPost() {
  const { slug } = useParams()
  const navigate  = useNavigate()
  const post      = getPost(slug)

  useEffect(() => {
    if (!post) { navigate('/blog', { replace: true }); return }
    setPageMeta({
      title: `${post.title} | FuneralFair`,
      description: post.description || '',
      path: `/blog/${slug}`,
    })
    window.scrollTo(0, 0)
  }, [slug, post, navigate])

  if (!post) return null

  const related = POSTS.filter(p => post.relatedSlugs?.includes(p.slug))

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-12 sm:py-20">

        {/* Back */}
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-charcoal mb-8 group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          All guides
        </Link>

        {/* Header */}
        <div className="mb-10">
          <span className="text-xs font-semibold text-sage uppercase tracking-widest">{post.category}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mt-3 mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Article body */}
        <article className="space-y-8 mb-12">
          {post.sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="text-xl font-bold text-charcoal mb-3">{section.heading}</h2>
              )}
              <div className="prose-body">
                {section.body.split('\n\n').map((para, j) => {
                  const trimmed = para.trim()
                  if (!trimmed) return null
                  if (trimmed.startsWith('•')) {
                    const items = trimmed.split('\n').filter(l => l.startsWith('•'))
                    return (
                      <ul key={j} className="space-y-2 my-4">
                        {items.map((item, k) => (
                          <li key={k} className="flex gap-2 text-sm text-muted leading-relaxed">
                            <span className="text-sage mt-1 shrink-0">•</span>
                            <span>{item.replace(/^•\s*/, '')}</span>
                          </li>
                        ))}
                      </ul>
                    )
                  }
                  if (/^\d+\./.test(trimmed)) {
                    const items = trimmed.split('\n').filter(l => /^\d+\./.test(l))
                    return (
                      <ol key={j} className="space-y-2 my-4">
                        {items.map((item, k) => (
                          <li key={k} className="flex gap-2 text-sm text-muted leading-relaxed">
                            <span className="text-sage font-semibold shrink-0">{k + 1}.</span>
                            <span>{item.replace(/^\d+\.\s*/, '')}</span>
                          </li>
                        ))}
                      </ol>
                    )
                  }
                  return (
                    <p key={j} className="text-muted leading-relaxed text-sm sm:text-base mb-4">
                      {trimmed}
                    </p>
                  )
                })}
              </div>
            </div>
          ))}
        </article>

        {/* CTA */}
        {post.cta && (
          <div className="bg-sage-light border border-sage-border rounded-2xl px-6 py-7 text-center mb-12">
            <Link
              to={post.cta.path}
              className="inline-block px-6 py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {post.cta.label}
            </Link>
            <p className="text-xs text-muted mt-3">Free to use · No account needed · No sales calls</p>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="border-t border-warm-border pt-10">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-widest mb-5">Related guides</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map(p => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group bg-white rounded-xl border border-warm-border p-5 hover:border-sage hover:shadow-sm transition-all"
                >
                  <span className="text-xs text-sage font-semibold uppercase tracking-widest">{p.category}</span>
                  <p className="text-sm font-semibold text-charcoal mt-1 group-hover:text-sage transition-colors leading-snug">
                    {p.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}
