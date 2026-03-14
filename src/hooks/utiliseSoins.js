import { useState, useCallback } from 'react'

const AUJOURD_HUI = () => new Date().toISOString().split('T')[0]

function joursRestants(soin) {
  if (!soin?.actif) return null
  const aujourd = new Date()
  aujourd.setHours(0, 0, 0, 0)

  if (soin.mode === 'dateFixe') {
    if (!soin.prochaineDate) return null
    return Math.round((new Date(soin.prochaineDate) - aujourd) / 86400000)
  }

  if (soin.mode === 'departFrequence') {
    const depart = soin.dateDepart ? new Date(soin.dateDepart) : null
    if (!depart) return null
    depart.setHours(0, 0, 0, 0)

    const base = soin.dernierSoin ? new Date(soin.dernierSoin) : depart
    base.setHours(0, 0, 0, 0)

    if (aujourd < depart && !soin.dernierSoin) {
      return Math.round((depart - aujourd) / 86400000)
    }

    const prochaine = new Date(base)
    prochaine.setDate(prochaine.getDate() + (soin.intervalJours || 7))
    return Math.round((prochaine - aujourd) / 86400000)
  }

  // mode 'frequence' (défaut)
  if (!soin.dernierSoin) return 0
  const dernier = new Date(soin.dernierSoin)
  dernier.setHours(0, 0, 0, 0)
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

  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const sauvegarderConfig = useCallback((nouvelleConfig) => {
    setConfig(nouvelleConfig)
    localStorage.setItem(storageKey, JSON.stringify(nouvelleConfig))
  }, [storageKey])

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
      return updated
    })
  }, [storageKey])

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
