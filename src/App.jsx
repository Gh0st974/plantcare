import { useState } from 'react'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/Topbar.jsx'
import Catalog from './pages/Catalog.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Calendar from './pages/Calendar.jsx'
import Sidebar, { BottomNav } from './components/layout/Sidebar.jsx'


export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const PAGES = {
    dashboard: <Dashboard />,
    catalog: <Catalog />,
    calendar: <Calendar />,
  }

  return (
    <div className="flex h-screen bg-plant-50 text-gray-800 overflow-hidden">
      
      {/* Sidebar — visible uniquement sur desktop */}
      <div className="hidden md:flex">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>

      {/* Contenu principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar currentPage={currentPage} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {PAGES[currentPage]}
        </main>
      </div>

      {/* Bottom Nav — visible uniquement sur mobile */}
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  )
}
