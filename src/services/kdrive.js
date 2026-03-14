const BASE = 'https://api.infomaniak.com/3/drive'

function getToken() {
  return localStorage.getItem('kdrive_token') || ''
}

function getDriveId() {
  return localStorage.getItem('kdrive_drive_id') || ''
}

// ─── Requête générique ────────────────────────────────────────────────────

async function kFetch(path, options = {}) {
  const token = getToken()
  if (!token) throw new Error('Token KDrive manquant')

  const res = await fetch(`${BASE}/${getDriveId()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.description || `HTTP ${res.status}`)
  }

  return res.json()
}

// ─── Recherche d'un fichier par chemin ────────────────────────────────────

async function findFile(path) {
  try {
    const res = await kFetch(`/files/1/files?path=${encodeURIComponent(path)}`)
    return res.data ?? null
  } catch {
    return null
  }
}

// ─── Création de dossier (ignore si existe déjà) ──────────────────────────

async function ensureFolder(parentId, name) {
  try {
    const res = await kFetch(`/files/${parentId}/directory`, {
      method: 'POST',
      body: JSON.stringify({ name, conflict_resolution: 'rename' }),
    })
    return res.data?.id
  } catch {
    // Dossier probablement déjà existant → on le cherche
    const list = await kFetch(`/files/${parentId}/files`)
    const found = list.data?.find(f => f.name === name && f.type === 'dir')
    return found?.id ?? null
  }
}

// ─── Init structure /PlantApp/ ────────────────────────────────────────────

let _folderId = null
let _soinsFolderId = null

export async function initKDrive() {
  const plantAppId = await ensureFolder(1, 'PlantApp')
  _folderId = plantAppId

  const soinsId = await ensureFolder(plantAppId, 'soins')
  _soinsFolderId = soinsId

  return { folderId: _folderId, soinsFolderId: _soinsFolderId }
}

// ─── Lecture JSON ─────────────────────────────────────────────────────────

export async function readJson(fileId) {
  const token = getToken()
  const res = await fetch(
    `${BASE}/${getDriveId()}/files/${fileId}/download`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return null
  return res.json()
}

// ─── Écriture JSON (upload) ───────────────────────────────────────────────

export async function writeJson(folderId, filename, data) {
  const token = getToken()
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })

  // On cherche si le fichier existe déjà pour l'écraser
  const existing = await findFileInFolder(folderId, filename)

  if (existing) {
    // PUT pour mettre à jour
    const res = await fetch(
      `https://upload.infomaniak.com/3/drive/${getDriveId()}/upload?file_id=${existing.id}&conflict_resolution=replace`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: blob,
      }
    )
    if (!res.ok) throw new Error(`Upload échoué: ${res.status}`)
    return res.json()
  } else {
    // POST pour créer
    const res = await fetch(
      `https://upload.infomaniak.com/3/drive/${getDriveId()}/upload?directory_id=${folderId}&file_name=${encodeURIComponent(filename)}&conflict_resolution=replace`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: blob,
      }
    )
    if (!res.ok) throw new Error(`Upload échoué: ${res.status}`)
    return res.json()
  }
}

async function findFileInFolder(folderId, filename) {
  try {
    const res = await kFetch(`/files/${folderId}/files`)
    return res.data?.find(f => f.name === filename) ?? null
  } catch {
    return null
  }
}

// ─── API publique simplifiée ──────────────────────────────────────────────

export async function loadPlants() {
  await initKDrive()
  const file = await findFileInFolder(_folderId, 'plants.json')
  if (!file) return null
  return readJson(file.id)
}

export async function savePlants(plants) {
  if (!_folderId) await initKDrive()
  return writeJson(_folderId, 'plants.json', plants)
}

export async function loadSoins(plantId) {
  if (!_soinsFolderId) await initKDrive()
  const file = await findFileInFolder(_soinsFolderId, `${plantId}.json`)
  if (!file) return null
  return readJson(file.id)
}

export async function saveSoins(plantId, config) {
  if (!_soinsFolderId) await initKDrive()
  return writeJson(_soinsFolderId, `${plantId}.json`, config)
}

// ─── Test de connexion ────────────────────────────────────────────────────

export async function testConnection() {
  const res = await kFetch('/files/1')
  return !!res.data
}
