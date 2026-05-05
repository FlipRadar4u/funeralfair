import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import SearchResults from './pages/SearchResults'
import DirectorDetail from './pages/DirectorDetail'
import GovernmentGrants from './pages/GovernmentGrants'
import CostGuide from './pages/CostGuide'
import WhatToDo from './pages/WhatToDo'
import ForFuneralDirectors from './pages/ForFuneralDirectors'

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
        <Route path="/what-to-do" element={<WhatToDo />} />
        <Route path="/for-funeral-directors" element={<ForFuneralDirectors />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
