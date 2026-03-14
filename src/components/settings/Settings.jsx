import React, { useState } from 'react'
import { testConnection, initKDrive } from '../../services/kdrive'
import { CheckCircle, XCircle, RefreshCw, Cloud } from 'lucide-react'

export default function Settings({ onClose, forcSync, syncing, lastSync, syncError }) {
  const [token, setToken] = useState(localStorage.getItem('kdrive_token') || '')
  const [driveId, setDriveId] = useState(localStorage.getItem('kdrive_drive_id') || '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null) // 'ok' | 'error'

  function handleSave() {
    localStorage.setItem('kdrive_token', token.trim())
    localStorage.setItem('kdrive_drive_id', driveId.trim())
    setTestResult(null)
  }

  async function handleTest() {
    handleSave()
    setTesting(true)
    setTestResult(null)
    try {
      await initKDrive()
      await testConnection()
      setTestResult('ok')
    } catch {
      setTestResult('error')
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

      {/* Token */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Token API Infomaniak
        </label>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="eyJ..."
          className="border rounded-lg px-3 py-2 text-sm font-mono"
        />
        <a
          href="https://manager.infomaniak.com/v3/ng/profile/api"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-green-600 underline"
        >
          → Générer un token sur manager.infomaniak.com
        </a>
      </div>

      {/* Drive ID */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          ID du Drive kDrive
        </label>
        <input
          type="text"
          value={driveId}
          onChange={e => setDriveId(e.target.value)}
          placeholder="123456"
          className="border rounded-lg px-3 py-2 text-sm font-mono"
        />
        <p className="text-xs text-gray-400">
          Visible dans l'URL de drive.infomaniak.com/app/drive/<strong>XXXXXX</strong>
        </p>
      </div>

      {/* Boutons */}
      <div className="flex gap-3">
        <button
          onClick={handleTest}
          disabled={testing || !token || !driveId}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
          Tester la connexion
        </button>

        <button
          onClick={handleSave}
          className="border border-green-600 text-green-700 px-4 py-2 rounded-lg text-sm"
        >
          Sauvegarder
        </button>
      </div>

      {/* Résultat test */}
      {testResult === 'ok' && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" /> Connexion OK — dossier /PlantApp/ créé
        </div>
      )}
      {testResult === 'error' && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <XCircle className="w-4 h-4" /> Échec — vérifie ton token et l'ID du drive
        </div>
      )}

      {/* État sync */}
      <div className="border-t pt-4 flex flex-col gap-2">
        <p className="text-sm text-gray-500">
          Dernière sync : <span className="font-medium">{syncDate}</span>
        </p>
        {syncError && (
          <p className="text-xs text-red-400">Erreur : {syncError}</p>
        )}
        <button
          onClick={forcSync}
          disabled={syncing || !token}
          className="flex items-center gap-2 text-sm text-green-700 underline disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          Forcer la synchronisation
        </button>
      </div>
    </div>
  )
}
