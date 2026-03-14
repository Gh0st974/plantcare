import { useState } from 'react'
import Sidebar, { BottomNav } from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/Topbar.jsx'
import Catalog from './pages/Catalog.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Calendar from './pages/Calendar.jsx'
import Settings from './components/settings/Settings.jsx'
import { usePlants } from './hooks/usePlants'

export default function App() {
  const plantsHook = usePlants()
  const { forcSync, syncing, lastSync, syncError } = plantsHook
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard plantsHook={plantsHook} />
      case 'catalog':   return <Catalog plantsHook={plantsHook} />
      case 'calendar':  return <Calendar plantsHook={plantsHook} />
      case 'settings':  return (
        <Settings
          onClose={() => setCurrentPage('dashboard')}
          forcSync={forcSync}
          syncing={syncing}
          lastSync={lastSync}
          syncError={syncError}
        />
      )
      default: return <Dashboard plantsHook={plantsHook} />
    }
  }

  return (
    <div className="flex h-screen bg-plant-50 text-gray-800 overflow-hidden">
      <div className="hidden md:flex">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar currentPage={currentPage} syncing={syncing} syncError={syncError} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {renderPage()}
        </main>
      </div>

      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  )
}
