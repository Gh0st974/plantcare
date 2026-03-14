import { useState, useEffect } from 'react'
import Sidebar, { BottomNav } from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/Topbar.jsx'
import Catalog from './pages/Catalog.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Calendar from './pages/Calendar.jsx'
import Settings from './components/settings/Settings.jsx'
import { usePlants } from './hooks/usePlants'
import { handleOAuthCallback, fetchAndSaveDriveId } from './services/kdrive'

export default function App() {
  const plantsHook = usePlants()
  const { forcSync, syncing, lastSync, syncError } = plantsHook
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [oauthStatus, setOauthStatus] = useState(null) // 'processing' | 'success' | 'error'

  // ─── Détection callback OAuth ──────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    if (error) {
      setOauthStatus('error')
      // Nettoie l'URL
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    if (code) {
      setOauthStatus('processing')
      // Nettoie l'URL immédiatement
      window.history.replaceState({}, '', window.location.pathname)

      handleOAuthCallback(code)
        .then(() => fetchAndSaveDriveId())
        .then(() => {
          setOauthStatus('success')
          setCurrentPage('settings') // Redirige vers settings pour tester
          setTimeout(() => setOauthStatus(null), 3000)
        })
        .catch(e => {
          console.error('OAuth callback error:', e)
          setOauthStatus('error')
          setTimeout(() => setOauthStatus(null), 5000)
        })
    }
  }, [])

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

        {/* Bannière OAuth */}
        {oauthStatus === 'processing' && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm 
                          text-blue-700 flex items-center gap-2">
            <span className="animate-spin">⟳</span> 
            Connexion à KDrive en cours...
          </div>
        )}
        {oauthStatus === 'success' && (
          <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-sm text-green-700">
            ✅ Connecté à KDrive avec succès !
          </div>
        )}
        {oauthStatus === 'error' && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700">
            ❌ Erreur de connexion — vérifie ton client secret dans les réglages
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {renderPage()}
        </main>
      </div>

      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  )
}
