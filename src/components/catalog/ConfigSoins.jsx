import { useState } from 'react'

const SOINS_DISPONIBLES = [
  { id: 'arrosage',    label: 'Arrosage',    emoji: '💧' },
  { id: 'brumisation', label: 'Brumisation', emoji: '💦' },
  { id: 'engrais',     label: 'Engrais',     emoji: '🌱' },
  { id: 'rempotage',   label: 'Rempotage',   emoji: '🪴' },
  { id: 'taille',      label: 'Taille',      emoji: '✂️' },
]

export default function ConfigSoins({ config, onSauvegarder, onFermer }) {
  const [local, setLocal] = useState(() => {
    const init = {}
    SOINS_DISPONIBLES.forEach(s => {
      init[s.id] = config[s.id] ?? {
        actif: false,
        mode: 'frequence',
        intervalJours: 7,
        prochaineDate: '',
        dateDepart: '',
      }
    })
    return init
  })

  function toggleActif(id) {
    setLocal(prev => ({
      ...prev,
      [id]: { ...prev[id], actif: !prev[id].actif }
    }))
  }

  function setMode(id, mode) {
    setLocal(prev => ({
      ...prev,
      [id]: { ...prev[id], mode }
    }))
  }

  function setValeur(id, champ, valeur) {
    setLocal(prev => ({
      ...prev,
      [id]: { ...prev[id], [champ]: valeur }
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            ⚙️ Configurer les soins
          </h2>
          <button
            onClick={onFermer}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Liste des soins */}
        <div className="px-5 py-3 space-y-4 max-h-[60vh] overflow-y-auto">
          {SOINS_DISPONIBLES.map(soin => {
            const c = local[soin.id]
            return (
              <div key={soin.id} className="space-y-2">

                {/* Ligne principale : toggle + label */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleActif(soin.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      c.actif ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      c.actif ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                  <span className="text-lg">{soin.emoji}</span>
                  <span className="font-medium text-gray-700">{soin.label}</span>
                </div>

                {/* Options visibles seulement si actif */}
                {c.actif && (
                  <div className="ml-14 space-y-2">

                    {/* Sélecteur de mode : 3 options */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setMode(soin.id, 'frequence')}
                        className={`text-xs px-3 py-1 rounded-full border transition ${
                          c.mode === 'frequence'
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
                        }`}
                      >
                        🔄 Fréquence
                      </button>
                      <button
                        onClick={() => setMode(soin.id, 'dateFixe')}
                        className={`text-xs px-3 py-1 rounded-full border transition ${
                          c.mode === 'dateFixe'
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
                        }`}
                      >
                        📅 Date fixe
                      </button>
                      <button
                        onClick={() => setMode(soin.id, 'departFrequence')}
                        className={`text-xs px-3 py-1 rounded-full border transition ${
                          c.mode === 'departFrequence'
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
                        }`}
                      >
                        🗓️ Départ + fréquence
                      </button>
                    </div>

                    {/* Champs selon le mode */}

                    {c.mode === 'frequence' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>tous les</span>
                        <input
                          type="number"
                          min="1"
                          value={c.intervalJours}
                          onChange={e => setValeur(soin.id, 'intervalJours', Number(e.target.value))}
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                        <span>jours</span>
                      </div>
                    )}

                    {c.mode === 'dateFixe' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Le :</span>
                        <input
                          type="date"
                          value={c.prochaineDate}
                          onChange={e => setValeur(soin.id, 'prochaineDate', e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                    )}

                    {c.mode === 'departFrequence' && (
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>Démarre le :</span>
                          <input
                            type="date"
                            value={c.dateDepart}
                            onChange={e => setValeur(soin.id, 'dateDepart', e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-400"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span>puis tous les</span>
                          <input
                            type="number"
                            min="1"
                            value={c.intervalJours}
                            onChange={e => setValeur(soin.id, 'intervalJours', Number(e.target.value))}
                            className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                          />
                          <span>jours</span>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center mb-3">
            Clique sur "Fait ✓" sur la carte pour enregistrer un soin
          </p>
          <button
            onClick={() => onSauvegarder(local)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition"
          >
            Valider
          </button>
        </div>

      </div>
    </div>
  )
}
