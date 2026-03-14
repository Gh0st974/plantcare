import CartePlante from './CartePlante'

const VueCollection = ({ plantes, vue, onEdit, onDelete }) => {
  if (vue === 'liste') {
    return (
      <div className="flex flex-col gap-2">
        {plantes.map(plante => (
          <div key={plante.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {plante.photo 
                    ? <img src={plante.photo} className="w-8 h-8 rounded-full object-cover" />
                    : '🌿'
                  }
                </span>
              <div>
                <p className="font-semibold text-gray-800">{plante.nom}</p>
                <p className="text-sm text-gray-400">{plante.nomScientifique || 'Espèce inconnue'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(plante)} className="text-sm text-blue-500 hover:underline">Modifier</button>
              <button onClick={() => onDelete(plante.id)} className="text-sm text-red-400 hover:underline">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Vue grille (défaut)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {plantes.map(plante => (
        <CartePlante
          key={plante.id}
          plante={plante}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default VueCollection
