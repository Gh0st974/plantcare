import React from 'react';

const SOINS_META = {
  arrosage:    { label: 'Arrosage',    icone: '💧' },
  brumisation: { label: 'Brumisation', icone: '💦' },
  engrais:     { label: 'Engrais',     icone: '🌱' },
  rempotage:   { label: 'Rempotage',   icone: '🪴' },
  taille:      { label: 'Taille',      icone: '✂️' },
}

const STATUT_STYLE = {
  ok: {
    point: 'bg-green-400',
    texte: 'text-green-700',
    label: (jours) => jours === null ? 'Ok' : `Dans ${jours}j`,
  },
  bientot: {
    point: 'bg-yellow-400',
    texte: 'text-yellow-700',
    label: (jours) => `Bientôt (${jours}j)`,
  },
  urgent: {
    point: 'bg-red-400',
    texte: 'text-red-700',
    label: (jours) => jours === 0 ? `Aujourd'hui !` : `En retard de ${Math.abs(jours)}j`,
  },
}

export default function LigneSoin({ soin, onLoguer }) {
  const meta = SOINS_META[soin.id] ?? { label: soin.id, icone: '🌿' }
  const style = STATUT_STYLE[soin.statut] ?? STATUT_STYLE.ok
  const labelStatut = style.label(soin.jours)

  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-green-50 group">
      <div className="flex items-center gap-2">
        <span className="text-lg">{meta.icone}</span>
        <span className="text-sm font-medium text-gray-700">{meta.label}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${style.point}`} />
          <span className={`text-xs font-medium ${style.texte}`}>
            {labelStatut}
          </span>
        </div>

        <button
          onClick={() => onLoguer(soin.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium"
        >
          Fait ✓
        </button>
      </div>
    </div>
  )
}
