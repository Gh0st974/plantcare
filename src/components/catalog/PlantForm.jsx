import { useState, useRef, useEffect } from 'react'

const EMPTY_FORM = { name: '', species: '', note: '', photo: null }

function compressImage(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(maxWidth / img.width, 1)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = url
  })
}

export default function PlantForm({ initial = EMPTY_FORM, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial)
  const [preview, setPreview] = useState(initial.photo || null)
  const [compressing, setCompressing] = useState(false)
  const galleryRef = useRef()
  const cameraRef = useRef()

  // ✅ Fix édition : réinitialise quand on change de plante
  useEffect(() => {
    setForm(initial)
    setPreview(initial.photo || null)
  }, [initial.id])

  async function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setCompressing(true)
    try {
      const compressed = await compressImage(file)
      setPreview(compressed)
      setForm(f => ({ ...f, photo: compressed }))
    } catch (err) {
      console.error('Erreur compression image', err)
    } finally {
      setCompressing(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Preview photo */}
      <div className="w-full h-40 rounded-xl border-2 border-dashed border-green-300 overflow-hidden bg-green-50 flex items-center justify-center">
        {compressing ? (
          <p className="text-sm text-gray-400">Compression en cours...</p>
        ) : preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <p className="text-sm text-gray-400">Aucune photo</p>
        )}
      </div>

      {/* Boutons choix photo */}
      <div className="flex gap-2">
        {/* Input galerie caché */}
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhoto}
        />
        {/* Input caméra caché */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />

        <button
          type="button"
          onClick={() => galleryRef.current.click()}
          className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition"
        >
          📁 Galerie
        </button>
        <button
          type="button"
          onClick={() => cameraRef.current.click()}
          className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition"
        >
          📷 Caméra
        </button>
      </div>

      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Mon Monstera"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
        />
      </div>

      {/* Boutons formulaire */}
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
          disabled={compressing}
          className="flex-1 bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition font-medium disabled:opacity-50"
        >
          Sauvegarder
        </button>
      </div>

    </form>
  )
}
