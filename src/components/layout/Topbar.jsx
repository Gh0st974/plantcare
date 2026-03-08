const PAGE_TITLES = {
  catalog:  { title: 'Catalogue des plantes', emoji: '🌱' },
  calendar: { title: 'Calendrier des soins',  emoji: '📅' },
}

export default function TopBar({ currentPage }) {
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

      {/* Espace réservé pour future barre de recherche ou bouton profil */}
      <div />
    </header>
  )
}
