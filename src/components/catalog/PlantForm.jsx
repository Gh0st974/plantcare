import { useState, useRef } from 'react'

const EMPTY_FORM = { name: '', species: '', note: '', photo: null }

export default function PlantForm({ initial = EMPTY_FORM, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial)
  const [preview, setPreview] = useState(initial.photo || null)
  const fileRef = useRef()

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target.result)
      setForm(f => ({ ...f, photo: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo */}
      <div
        className="w-full h-40 rounded-xl border-2 border-dashed border-plant-300 flex items-center justify-center cursor-pointer overflow-hidden bg-plant-50"
        onClick={() => fileRef.current.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-3xl">📷</div>
            <p className="text-sm mt-1">Cliquer pour ajouter une photo</p>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Mon Monstera"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-plant-400"
          required
        />
      </div>

      {/* Espèce */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Espèce</label>
        <input
          type="text"
          value={form.species}
          onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
          placeholder="Monstera deliciosa"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-plant-400"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <textarea
          value={form.note}
          onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          placeholder="Arroser tous les 7 jours..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-plant-400 resize-none"
        />
      </div>

      {/* Boutons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 hover:bg-gray-50 transition"
        >
          Annuler
        </button>
        <button
            type="submit"
            className="flex-1 bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition font-medium"
            >
            Sauvegarder
        </button>
      </div>
    </form>
  )
}
