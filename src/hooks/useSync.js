import { useState, useCallback } from 'react'

export function useSync() {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(
    localStorage.getItem('kdrive_last_sync') || null
  )
  const [syncError, setSyncError] = useState(null)

  const withSync = useCallback(async (fn) => {
    setSyncing(true)
    setSyncError(null)
    try {
      await fn()
      const now = new Date().toISOString()
      setLastSync(now)
      localStorage.setItem('kdrive_last_sync', now)
    } catch (e) {
      setSyncError(e.message)
      console.warn('Sync KDrive échouée:', e.message)
      // On ne bloque pas l'app, LocalStorage reste la source de vérité
    } finally {
      setSyncing(false)
    }
  }, [])

  return { syncing, lastSync, syncError, withSync }
}
