import { useState, useRef, useEffect } from 'react'

const EMPTY_FORM = { name: '', species: '', note: '', photo: null, photoPosition: { x: 50, y: 50 } }

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
      // On retourne aussi le ratio pour détecter l'orientation
      resolve({ dataUrl: canvas.toDataURL('image/jpeg', quality), width: canvas.width, height: canvas.height })
    }
    img.onerror = reject
    img.src = url
  })
}

export default function PlantForm({ initial = EMPTY_FORM, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial)
  const [preview, setPreview] = useState(initial.photo || null)
  const [compressing, setCompressing] = useState(false)
  const [position, setPosition] = useState(initial.photoPosition || { x: 50, y: 50 })
  // 'landscape' | 'portrait'
  const [orientation, setOrientation] = useState('landscape')

  const galleryRef = useRef()
  const cameraRef = useRef()
  const containerRef = useRef()
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setForm(initial)
    setPreview(initial.photo || null)
    setPosition(initial.photoPosition || { x: 50, y: 50 })
    // Détecter l'orientation de la photo existante
    if (initial.photo) {
      const img = new Image()
      img.onload = () => setOrientation(img.height > img.width ? 'portrait' : 'landscape')
      img.src = initial.photo
    }
  }, [initial.id])

  async function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setCompressing(true)
    try {
      const { dataUrl, width, height } = await compressImage(file)
      setPreview(dataUrl)
      setPosition({ x: 50, y: 50 })
      setOrientation(height > width ? 'portrait' : 'landscape')
      setForm(f => ({ ...f, photo: dataUrl, photoPosition: { x: 50, y: 50 } }))
    } catch (err) {
      console.error('Erreur compression image', err)
    } finally {
      setCompressing(false)
    }
  }

  function getClientPos(e) {
    if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    return { x: e.clientX, y: e.clientY }
  }

  function onDragStart(e) {
    if (!preview) return
    e.preventDefault()
    dragging.current = true
    lastPos.current = getClientPos(e)
  }

  function onDragMove(e) {
    if (!dragging.current) return
    const current = getClientPos(e)
    const container = containerRef.current.getBoundingClientRect()
    const dx = ((current.x - lastPos.current.x) / container.width) * 100
    const dy = ((current.y - lastPos.current.y) / container.height) * 100
    lastPos.current = current
    setPosition(prev => {
      const next = {
        x: Math.min(100, Math.max(0, prev.x - dx)),
        y: Math.min(100, Math.max(0, prev.y - dy)),
      }
      setForm(f => ({ ...f, photoPosition: next }))
      return next
    })
  }

  function onDragEnd() { dragging.current = false }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  // Hauteur adaptative : portrait → plus haut pour voir la plante entière
  const previewHeight = orientation === 'portrait' ? 'h-72' : 'h-40'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Preview photo avec drag */}
      <div
        ref={containerRef}
        className={`w-full ${previewHeight} rounded-xl border-2 border-dashed border-green-300 overflow-hidden bg-green-50 flex items-center justify-center relative select-none transition-all duration-300`}
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
        style={{ cursor: preview ? 'grab' : 'default' }}
      >
        {compressing ? (
          <p className="text-sm text-gray-400">Compression en cours...</p>
        ) : preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
              style={{ objectPosition: `${position.x}% ${position.y}%` }}
            />
            <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
              ✋ Glisse pour recadrer
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Aucune photo</p>
        )}
      </div>

      {/* Boutons choix photo */}
      <div className="flex gap-2">
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
        <button type="button" onClick={() => galleryRef.current.click()}
          className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition">
          📁 Galerie
        </button>
        <button type="button" onClick={() => cameraRef.current.click()}
          className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition">
          📷 Caméra
        </button>
      </div>

      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
        <input type="text" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Mon Monstera"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          required />
      </div>

      {/* Espèce */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Espèce</label>
        <input type="text" value={form.species}
          onChange={e => setForm(f => ({ ...f, species: e.target.value }))}
          placeholder="Monstera deliciosa"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <textarea value={form.note}
          onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          placeholder="Arroser tous les 7 jours..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
      </div>

      {/* Boutons formulaire */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 hover:bg-gray-50 transition">
          Annuler
        </button>
        <button type="submit" disabled={compressing}
          className="flex-1 bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition font-medium disabled:opacity-50">
          Sauvegarder
        </button>
      </div>
    </form>
  )
}
