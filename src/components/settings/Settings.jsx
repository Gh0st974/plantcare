import React, { useState, useEffect } from 'react'
import {
  startOAuthLogin,
  logout,
  isAuthenticated,
  testConnection,
  initKDrive,
  fetchAndSaveDriveId,
} from '../../services/kdrive'
import { CheckCircle, XCircle, RefreshCw, Cloud, LogIn, LogOut } from 'lucide-react'

export default function Settings({ onClose, forcSync, syncing, lastSync, syncError }) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated())
  const [clientSecret, setClientSecret] = useState(
    localStorage.getItem('kdrive_client_secret') || ''
  )
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  // Vérifie si on revient d'un callback OAuth
  useEffect(() => {
    setAuthenticated(isAuthenticated())
  }, [])

  function handleSaveSecret() {
    localStorage.setItem('kdrive_client_secret', clientSecret.trim())
  }

  function handleLogin() {
    handleSaveSecret()
    startOAuthLogin()
  }

  function handleLogout() {
    logout()
    setAuthenticated(false)
    setTestResult(null)
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      // Auto-récupération du Drive ID si manquant
      if (!localStorage.getItem('kdrive_drive_id')) {
        await fetchAndSaveDriveId()
      }
      await initKDrive()
      await testConnection()
      setAuthenticated(true)
      setTestResult('ok')
    } catch (e) {
      setTestResult('error')
      console.error(e)
    } finally {
      setTesting(false)
    }
  }

  const syncDate = lastSync
    ? new Date(lastSync).toLocaleString('fr-FR')
    : 'Jamais'

  return (
    <div className="p-6 max-w-lg mx-auto flex flex-col gap-6">
      <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
        <Cloud className="w-5 h-5" /> Synchronisation KDrive
      </h2>

      {/* Statut connexion */}
      <div className={`rounded-lg px-4 py-3 flex items-center gap-2 text-sm font-medium
        ${authenticated
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-gray-50 text-gray-500 border border-gray-200'
        }`}>
        {authenticated
          ? <><CheckCircle className="w-4 h-4" /> Connecté à KDrive</>
          : <><XCircle className="w-4 h-4" /> Non connecté</>
        }
      </div>

      {/* Client Secret (une seule fois) */}
      {!authenticated && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Client Secret
            <span className="ml-1 text-xs text-gray-400">(stocké localement)</span>
          </label>
          <input
            type="password"
            value={clientSecret}
            onChange={e => setClientSecret(e.target.value)}
            placeholder="Colle ton client secret ici"
            className="border rounded-lg px-3 py-2 text-sm font-mono"
          />
          <p className="text-xs text-gray-400">
            Récupéré lors de la création de l'application OAuth sur manager.infomaniak.com
          </p>
        </div>
      )}

      {/* Boutons auth */}
      <div className="flex gap-3">
        {!authenticated ? (
          <button
            onClick={handleLogin}
            disabled={!clientSecret}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 
                       rounded-lg text-sm disabled:opacity-50 hover:bg-green-700"
          >
            <LogIn className="w-4 h-4" />
            Se connecter avec Infomaniak
          </button>
        ) : (
          <>
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 
                         rounded-lg text-sm disabled:opacity-50 hover:bg-green-700"
            >
              {testing
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <CheckCircle className="w-4 h-4" />
              }
              Tester la connexion
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-red-300 text-red-500 
                         px-4 py-2 rounded-lg text-sm hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Déconnecter
            </button>
          </>
        )}
      </div>

      {/* Résultat test */}
      {testResult === 'ok' && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" /> Connexion OK — dossier /PlantApp/ prêt
        </div>
      )}
      {testResult === 'error' && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <XCircle className="w-4 h-4" /> Échec — reconnecte-toi
        </div>
      )}

      {/* État sync */}
      {authenticated && (
        <div className="border-t pt-4 flex flex-col gap-2">
          <p className="text-sm text-gray-500">
            Dernière sync : <span className="font-medium">{syncDate}</span>
          </p>
          {syncError && (
            <p className="text-xs text-red-400">Erreur : {syncError}</p>
          )}
          <button
            onClick={forcSync}
            disabled={syncing}
            className="flex items-center gap-2 text-sm text-green-700 underline disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Forcer la synchronisation
          </button>
        </div>
      )}
    </div>
  )
}
