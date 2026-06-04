import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import { CompareProvider } from './context/CompareContext'
import CompareBar from './components/CompareBar'
import CookieBanner from './components/CookieBanner'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import DirectorDetail from './pages/DirectorDetail'
import GovernmentGrants from './pages/GovernmentGrants'
import CostGuide from './pages/CostGuide'
import WhatToDo from './pages/WhatToDo'
import ForFuneralDirectors from './pages/ForFuneralDirectors'
import HowWeRank from './pages/HowWeRank'
import FeaturedConfirmed from './pages/FeaturedConfirmed'
import DirectorDashboard from './pages/DirectorDashboard'
import AdminPanel from './pages/AdminPanel'
import CityPage from './pages/CityPage'
import DirectCremationCity from './pages/DirectCremationCity'
import About from './pages/About'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Compare from './pages/Compare'
import ClaimListing from './pages/ClaimListing'
import PlanAhead from './pages/PlanAhead'
import PrivacyPolicy from './pages/PrivacyPolicy'
import NotFound from './pages/NotFound'

function AnimatedRoutes() {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="page-enter">
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
        <Route path="/director/dashboard" element={<DirectorDashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/funeral-directors/:city" element={<CityPage />} />
        <Route path="/direct-cremation/:city" element={<DirectCremationCity />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/claim/:token" element={<ClaimListing />} />
        <Route path="/plan-ahead" element={<PlanAhead />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
