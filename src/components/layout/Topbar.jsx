import { RefreshCw, XCircle } from 'lucide-react'

const PAGE_TITLES = {
  catalog:  { title: 'Catalogue des plantes', emoji: '🌱' },
  calendar: { title: 'Calendrier des soins',  emoji: '📅' },
  settings: { title: 'Paramètres',            emoji: '⚙️' },
}

export default function TopBar({ currentPage, syncing, syncError }) {
  const info = PAGE_TITLES[currentPage] ?? { title: 'PlantCare', emoji: '🌿' }

  return (
    <header className="
      bg-white border-b border-plant-100
      px-6 py-4
      flex items-center justify-between
      shadow-sm
    ">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{info.emoji}</span>
        <h2 className="text-lg font-semibold text-gray-700">{info.title}</h2>
      </div>

      {/* Indicateurs de sync */}
      <div className="flex items-center gap-2">
        {syncing && (
          <RefreshCw className="w-4 h-4 animate-spin text-green-500" />
        )}
        {!syncing && syncError && (
          <XCircle className="w-4 h-4 text-red-400" title={syncError} />
        )}
      </div>
    </header>
  )
}
