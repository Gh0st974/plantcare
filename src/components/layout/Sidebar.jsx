const Icons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  leaf: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
           c1.85 0 3.58-.5 5.07-1.38
           C18.92 19.36 22 16.05 22 12
           c0-3.31-1.79-6.21-4.47-7.87
           A9.956 9.956 0 0 0 12 2z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 2c0 0-4 6-4 10a4 4 0 0 0 8 0C16 8 12 2 12 2z" />
    </svg>
  ),
  calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
      viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { id: 'catalog',   label: 'Mes Plantes', icon: Icons.leaf },
  { id: 'calendar',  label: 'Calendrier',  icon: Icons.calendar },
]

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="w-56 bg-green-800 text-green-100 flex flex-col shadow-xl">

      <div className="px-5 py-6 border-b border-green-700">
        <h1 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
          🌿 PlantCare
        </h1>
        <p className="text-xs text-green-300 mt-1">Mon suivi d'entretien</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = currentPage === item.id
          const activeClass = isActive
            ? 'bg-green-600 text-white shadow-inner'
            : 'text-green-200 hover:bg-green-700 hover:text-white'

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${activeClass}`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-green-700">
        <p className="text-xs text-green-400">v0.1.0 — Local</p>
      </div>
    </aside>
  )
}
