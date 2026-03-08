import { useState, useEffect } from 'react'
import Modal from '../components/ui/Modal'
import PlantForm from '../components/catalog/PlantForm'
import VueCollection from '../components/catalog/VueCollection'
import { usePlants } from '../hooks/usePlants'

export default function Catalog() {
  const { plants, addPlant, updatePlant, deletePlant } = usePlants()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [vue, setVue] = useState(() => localStorage.getItem('plantcare-vue') || 'grille')

  useEffect(() => {
    localStorage.setItem('plantcare-vue', vue)
  }, [vue])

  const filtered = plants.filter(p =>
    (p.nom || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.nomScientifique || '').toLowerCase().includes(search.toLowerCase())
  )

  function handleAddSubmit(form) {
    addPlant({ ...form, id: Date.now() })
    setModal(null)
  }

  function handleEdit(plant) {
    setEditTarget(plant)
    setModal('edit')
  }

  function handleEditSubmit(form) {
    updatePlant({ ...form, id: editTarget.id })
    setModal(null)
    setEditTarget(null)
  }

  function handleDelete(id) {
    if (confirm('Supprimer cette plante ?')) deletePlant(id)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ma Collection 🌿</h1>
          <p className="text-sm text-gray-500">{plants.length} plante{plants.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition"
        >
          + Ajouter
        </button>
      </div>

      {/* Barre recherche + toggle */}
      <div className="flex gap-3">
        <input
          placeholder="🔍 Rechercher une plante..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
        />
        {/* Toggle vue */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setVue('grille')}
            title="Vue grille"
            className={`px-3 py-1.5 rounded-lg transition text-lg ${
              vue === 'grille'
                ? 'bg-white shadow text-green-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            ⊞
          </button>
          <button
            onClick={() => setVue('liste')}
            title="Vue liste"
            className={`px-3 py-1.5 rounded-lg transition text-lg ${
              vue === 'liste'
                ? 'bg-white shadow text-green-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Contenu */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🪴</div>
          <p className="text-lg font-medium">
            {plants.length === 0 ? 'Votre collection est vide' : 'Aucune plante trouvée'}
          </p>
          <p className="text-sm mt-1">
            {plants.length === 0 ? 'Ajoutez votre première plante !' : 'Essayez un autre terme'}
          </p>
        </div>
      ) : (
        <VueCollection
          plantes={filtered}
          vue={vue}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Ajout */}
      {modal === 'add' && (
        <Modal title="🌱 Nouvelle plante" onClose={() => setModal(null)}>
          <PlantForm onSubmit={handleAddSubmit} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {/* Modal Édition */}
      {modal === 'edit' && editTarget && (
        <Modal title="✏️ Modifier la plante" onClose={() => { setModal(null); setEditTarget(null) }}>
          <PlantForm
            initial={editTarget}
            onSubmit={handleEditSubmit}
            onCancel={() => { setModal(null); setEditTarget(null) }}
          />
        </Modal>
      )}
    </div>
  )
}
