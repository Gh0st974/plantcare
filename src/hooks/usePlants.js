import { useState, useEffect } from 'react'

const STORAGE_KEY = 'plantcare_plants'

// ─── Utilitaire calcul prochaine date ───────────────────────────────────────

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

    // Pas encore démarré → on affiche la date de départ
    if (today < depart) return depart

    // Démarré, un soin a déjà été fait → on calcule depuis le dernier soin
    if (dernierSoin) {
      const base = new Date(dernierSoin)
      base.setHours(0, 0, 0, 0)
      base.setDate(base.getDate() + cfg.intervalJours)
      return base
    }

    // Démarré mais jamais fait → date de départ
    return depart
  }

  return null
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePlants() {
  const [plants, setPlants] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plants))
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('⚠️ Stockage plein ! Supprime des plantes ou des photos pour continuer.')
      }
    }
  }, [plants])

  function addPlant(plantData) {
    const newPlant = {
      ...plantData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      cares: [],
    }
    setPlants(prev => [newPlant, ...prev])
    return newPlant.id
  }

  function updatePlant(id, updates) {
    setPlants(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  function deletePlant(id) {
    setPlants(prev => prev.filter(p => p.id !== id))
  }

  return { plants, addPlant, updatePlant, deletePlant }
}
