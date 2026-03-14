import { useMemo, useState, useCallback } from 'react'

function getSoinsData(plantId) {
  const config = JSON.parse(localStorage.getItem(`soins_${plantId}`)) || {}
  return { config }
}

function getNextCareDate(lastDate, frequencyDays) {
  if (!lastDate || !frequencyDays) return null
  const d = new Date(lastDate)
  d.setDate(d.getDate() + frequencyDays)
  return d
}

function diffDays(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - today) / (1000 * 60 * 60 * 24))
}

function StatusBadge({ diff }) {
  if (diff < 0)   return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">En retard de {Math.abs(diff)}j</span>
  if (diff === 0) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Aujourd'hui</span>
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Dans {diff}j</span>
}

const CARE_TYPES = [
  { key: 'arrosage',    label: 'Arrosage',    emoji: '💧' },
  { key: 'brumisation', label: 'Brumisation', emoji: '💦' },
  { key: 'engrais',     label: 'Engrais',     emoji: '🌱' },
  { key: 'rempotage',   label: 'Rempotage',   emoji: '🪴' },
  { key: 'taille',      label: 'Taille',      emoji: '✂️' },
]

export default function Dashboard({ plantsHook }) {
  const { plants } = plantsHook
  const [tick, setTick] = useState(0)

  const markDone = useCallback((plantId, careKey) => {
    const config = JSON.parse(localStorage.getItem(`soins_${plantId}`)) || {}
    if (!config[careKey]) config[careKey] = {}
    config[careKey].dernierSoin = new Date().toISOString().split('T')[0]
    if (config[careKey].mode === 'dateFixe') {
      config[careKey].prochaineDate = ''
    }
    localStorage.setItem(`soins_${plantId}`, JSON.stringify(config))

    window.dispatchEvent(new StorageEvent('storage', {
      key: `soins_${plantId}`,
      newValue: JSON.stringify(config),
    }))

    setTick(t => t + 1)
  }, [])

  const careItems = useMemo(() => {
    const items = []

    plants.forEach(plant => {
      const { config } = getSoinsData(plant.id)

      CARE_TYPES.forEach(({ key, label, emoji }) => {
        const cfg = config[key] || {}
        if (!cfg.actif) return

        let nextDate = null

        if (cfg.mode === 'dateFixe' && cfg.prochaineDate) {
          nextDate = new Date(cfg.prochaineDate)
        } else if (cfg.intervalJours) {
          nextDate = cfg.dernierSoin
            ? getNextCareDate(cfg.dernierSoin, cfg.intervalJours)
            : new Date()
        }

        if (!nextDate) return

        const diff = diffDays(nextDate)
        if (diff > 3) return

        items.push({
          plantId: plant.id,
          plantName: plant.name,
          careKey: key,
          type: label,
          emoji,
          nextDate,
          diff,
        })
      })
    })

    return items.sort((a, b) => a.diff - b.diff)
  }, [plants, tick])

  const late = careItems.filter(i => i.diff < 0)
  const soon = careItems.filter(i => i.diff >= 0)

  const CareRow = ({ item }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-lg">{item.emoji}</span>
        <div>
          <p className="text-sm font-medium text-gray-800">{item.plantName}</p>
          <p className="text-xs text-gray-400">{item.type}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge diff={item.diff} />
        <button
          onClick={() => markDone(item.plantId, item.careKey)}
          className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          Fait ✓
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
        <p className="text-sm text-gray-400 mt-1">Ce qui nécessite ton attention</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{plants.length}</p>
          <p className="text-sm text-gray-400 mt-1">Plantes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{late.length}</p>
          <p className="text-sm text-red-400 mt-1">En retard</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{soon.length}</p>
          <p className="text-sm text-yellow-400 mt-1">Dans 3 jours</p>
        </div>
      </div>

      {late.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 text-center">
          <h3 className="font-semibold text-red-700 mb-3">🚨 En retard</h3>
          {late.map((item, i) => <CareRow key={i} item={item} />)}
        </div>
      )}

      {soon.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 text-center">
          <h3 className="font-semibold text-yellow-700 mb-3">⏰ À faire dans les 3 prochains jours</h3>
          {soon.map((item, i) => <CareRow key={i} item={item} />)}
        </div>
      )}

      {careItems.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
          <p className="text-4xl mb-3">🌿</p>
          <p className="font-medium">Tout est à jour !</p>
          <p className="text-sm mt-1">Aucun soin urgent dans les 3 prochains jours.</p>
        </div>
      )}
    </div>
  )
}
