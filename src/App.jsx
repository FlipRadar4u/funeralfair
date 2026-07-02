import { lazy, Suspense, Component } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import { CompareProvider } from './context/CompareContext'
import CompareBar from './components/CompareBar'
import CookieBanner from './components/CookieBanner'

class RouteErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <p className="text-charcoal font-semibold mb-2">This page couldn't load.</p>
            <button
              onClick={() => { this.setState({ failed: false }); window.location.reload() }}
              className="text-sm text-sage underline"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const Home               = lazy(() => import('./pages/Home'))
const SearchResults      = lazy(() => import('./pages/SearchResults'))
const DirectorDetail     = lazy(() => import('./pages/DirectorDetail'))
const GovernmentGrants   = lazy(() => import('./pages/GovernmentGrants'))
const CostGuide          = lazy(() => import('./pages/CostGuide'))
const WhatToDo           = lazy(() => import('./pages/WhatToDo'))
const ForFuneralDirectors = lazy(() => import('./pages/ForFuneralDirectors'))
const HowWeRank          = lazy(() => import('./pages/HowWeRank'))
const FeaturedConfirmed  = lazy(() => import('./pages/FeaturedConfirmed'))
const AdminPanel         = lazy(() => import('./pages/AdminPanel'))
const CityPage           = lazy(() => import('./pages/CityPage'))
const DirectCremationCity = lazy(() => import('./pages/DirectCremationCity'))
const About              = lazy(() => import('./pages/About'))
const Blog               = lazy(() => import('./pages/Blog'))
const BlogPost           = lazy(() => import('./pages/BlogPost'))
const Compare            = lazy(() => import('./pages/Compare'))
const ClaimListing       = lazy(() => import('./pages/ClaimListing'))
const Dashboard          = lazy(() => import('./pages/Dashboard'))
const DirectorLogin      = lazy(() => import('./pages/DirectorLogin'))
const UpgradeRedirect    = lazy(() => import('./pages/UpgradeRedirect'))
const PlanAhead          = lazy(() => import('./pages/PlanAhead'))
const PrivacyPolicy      = lazy(() => import('./pages/PrivacyPolicy'))
const NotFound           = lazy(() => import('./pages/NotFound'))

function AnimatedRoutes() {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="page-enter">
      <RouteErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-cream" />}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/director/:id" element={<DirectorDetail />} />
          <Route path="/government-grants" element={<GovernmentGrants />} />
          <Route path="/cost-guide" element={<CostGuide />} />
          <Route path="/funeral-costs/uk" element={<CostGuide />} />
          <Route path="/what-to-do" element={<WhatToDo />} />
          <Route path="/what-to-do-when-someone-dies" element={<WhatToDo />} />
          <Route path="/for-funeral-directors" element={<ForFuneralDirectors />} />
          <Route path="/how-we-rank" element={<HowWeRank />} />
          <Route path="/featured-confirmed" element={<FeaturedConfirmed />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/funeral-directors/:city" element={<CityPage />} />
          <Route path="/direct-cremation/:city" element={<DirectCremationCity />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/claim/:token" element={<ClaimListing />} />
          <Route path="/dashboard/:token" element={<Dashboard />} />
          <Route path="/director-login" element={<DirectorLogin />} />
          <Route path="/upgrade/:token" element={<UpgradeRedirect />} />
          <Route path="/plan-ahead" element={<PlanAhead />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <CompareProvider>
        <ScrollToTop />
        <AnimatedRoutes />
        <CompareBar />
        <CookieBanner />
      </CompareProvider>
    </BrowserRouter>
  )
}

export default App
