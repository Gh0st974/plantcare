import { useState, useEffect, useCallback } from 'react'
import { loadPlants, savePlants } from '../services/kdrive'
import { useSync } from './useSync'

const STORAGE_KEY = 'plantcare_plants'

// ─── Utilitaire calcul prochaine date ─────────────────────────────────────
// (ta fonction getProchaineSoin inchangée)
export function getProchaineSoin(cfg, dernierSoin = null) {
  if (!cfg || !cfg.actif) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (cfg.mode === 'dateFixe') {
    return cfg.prochaineDate ? new Date(cfg.prochaineDate) : null
  }
  if (cfg.mode === 'frequence') {
    if (!dernierSoin) return today
    const base = new Date(dernierSoin)
    base.setHours(0, 0, 0, 0)
    base.setDate(base.getDate() + cfg.intervalJours)
    return base
  }
  if (cfg.mode === 'departFrequence') {
    const depart = new Date(cfg.dateDepart)
    depart.setHours(0, 0, 0, 0)
    if (today < depart) return depart
    if (dernierSoin) {
      const base = new Date(dernierSoin)
      base.setHours(0, 0, 0, 0)
      base.setDate(base.getDate() + cfg.intervalJours)
      return base
    }
    return depart
  }
  return null
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function usePlants() {
  const { syncing, lastSync, syncError, withSync } = useSync()
  const hasToken = !!localStorage.getItem('kdrive_token')

  const [plants, setPlants] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // ── Chargement initial depuis KDrive ──────────────────────────────────
  useEffect(() => {
    if (!hasToken) return

    withSync(async () => {
      const remote = await loadPlants()
      if (!remote) return // Fichier pas encore créé

      // Merge : on garde la version la plus récente par plante
      setPlants(local => {
        const localMap = Object.fromEntries(local.map(p => [p.id, p]))
        const remoteMap = Object.fromEntries(remote.map(p => [p.id, p]))

        const merged = Object.values({ ...localMap, ...remoteMap })
          .map(p => {
            const l = localMap[p.id]
            const r = remoteMap[p.id]
            if (!l) return r
            if (!r) return l
            return new Date(l.createdAt) >= new Date(r.createdAt) ? l : r
          })

        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        return merged
      })
    })
  }, []) // eslint-disable-line

  // ── Sauvegarde LocalStorage à chaque changement ───────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plants))
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('⚠️ Stockage plein !')
      }
    }
  }, [plants])

  // ── Helpers avec sync KDrive en arrière-plan ──────────────────────────

  const syncToKDrive = useCallback((updatedPlants) => {
    if (!hasToken) return
    withSync(() => savePlants(updatedPlants))
  }, [hasToken, withSync])

  function addPlant(plantData) {
    const newPlant = {
      ...plantData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      cares: [],
    }
    setPlants(prev => {
      const updated = [newPlant, ...prev]
      syncToKDrive(updated)
      return updated
    })
    return newPlant.id
  }

  function updatePlant(id, updates) {
    setPlants(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p)
      syncToKDrive(updated)
      return updated
    })
  }

  function deletePlant(id) {
    setPlants(prev => {
      const updated = prev.filter(p => p.id !== id)
      syncToKDrive(updated)
      return updated
    })
  }

  // ── Sync manuelle (bouton dans Settings) ─────────────────────────────
  async function forcSync() {
    await withSync(() => savePlants(plants))
  }

  return {
    plants,
    addPlant,
    updatePlant,
    deletePlant,
    forcSync,
    syncing,
    lastSync,
    syncError,
  }
}
