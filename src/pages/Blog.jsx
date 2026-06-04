import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { POSTS } from '../data/blogPosts'

export default function Blog() {
  useEffect(() => {
    document.title = 'Funeral Guides & Advice | FuneralFair'
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Honest, practical guides to funeral costs, choosing a funeral director, and what to expect when a loved one dies. No sales, no pressure.')
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 sm:px-6 py-12 sm:py-20">

        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-sage">Guides & advice</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mt-3 mb-4">
            Honest information when you need it most.
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Practical guides on funeral costs, types of funeral, and how to make the right choice for your family.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.map(post => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-warm-border p-6 shadow-sm hover:shadow-md hover:border-sage transition-all duration-150 flex flex-col"
            >
              <span className="text-xs font-semibold text-sage uppercase tracking-widest mb-3">
                {post.category}
              </span>
              <h2 className="font-bold text-charcoal text-base leading-snug mb-3 group-hover:text-sage transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-muted leading-relaxed flex-1 mb-4">
                {post.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-warm-border">
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  )
}
