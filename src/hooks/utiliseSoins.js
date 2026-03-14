import { useState, useCallback } from 'react'
import { loadSoins, saveSoins } from '../services/kdrive'
import { useSync } from './useSync'

const AUJOURD_HUI = () => new Date().toISOString().split('T')[0]

// (tes fonctions joursRestants et statutSoin inchangées)
function joursRestants(soin) {
  if (!soin?.actif) return null
  const aujourd = new Date()
  aujourd.setHours(0, 0, 0, 0)
  if (soin.mode === 'dateFixe') {
    if (!soin.prochaineDate) return null
    return Math.round((new Date(soin.prochaineDate) - aujourd) / 86400000)
  }
  if (!soin.dernierSoin) return 0
  const dernier = new Date(soin.dernierSoin)
  const prochaine = new Date(dernier)
  prochaine.setDate(prochaine.getDate() + (soin.intervalJours || 7))
  return Math.round((prochaine - aujourd) / 86400000)
}

function statutSoin(soin) {
  const j = joursRestants(soin)
  if (j === null) return 'inactif'
  if (j < 0)  return 'urgent'
  if (j <= 2) return 'bientot'
  return 'ok'
}

export function utiliseSoins(planteId) {
  const storageKey = `soins_${planteId}`
  const hasToken = !!localStorage.getItem('kdrive_token')
  const { withSync } = useSync()

  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // ── Chargement initial depuis KDrive ──────────────────────────────────
  useState(() => {
    if (!hasToken || !planteId) return
    withSync(async () => {
      const remote = await loadSoins(planteId)
      if (!remote) return
      setConfig(remote)
      localStorage.setItem(storageKey, JSON.stringify(remote))
    })
  })

  const sauvegarderConfig = useCallback((nouvelleConfig) => {
    setConfig(nouvelleConfig)
    localStorage.setItem(storageKey, JSON.stringify(nouvelleConfig))
    if (hasToken) {
      withSync(() => saveSoins(planteId, nouvelleConfig))
    }
  }, [storageKey, planteId, hasToken, withSync])

  const enregistrerSoin = useCallback((soinId) => {
    setConfig(prev => {
      const updated = {
        ...prev,
        [soinId]: {
          ...prev[soinId],
          dernierSoin: AUJOURD_HUI(),
          ...(prev[soinId]?.mode === 'dateFixe' ? { prochaineDate: '' } : {})
        }
      }
      localStorage.setItem(storageKey, JSON.stringify(updated))
      if (hasToken) {
        withSync(() => saveSoins(planteId, updated))
      }
      return updated
    })
  }, [storageKey, planteId, hasToken, withSync])

  const soinsActifs = Object.entries(config)
    .filter(([, s]) => s?.actif)
    .map(([id, s]) => ({
      id,
      ...s,
      jours: joursRestants(s),
      statut: statutSoin(s),
    }))

  return { config, soinsActifs, sauvegarderConfig, enregistrerSoin }
}
