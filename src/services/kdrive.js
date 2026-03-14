// ─── Config OAuth2 Infomaniak ─────────────────────────────────────────────

const CLIENT_ID = 'fa11e687-93eb-4e3a-b728-c86a3346cda9'
const REDIRECT_URI = 'https://gh0st974.github.io/plantcare/'
const AUTH_URL = 'https://login.infomaniak.com/authorize'
const TOKEN_URL = 'https://login.infomaniak.com/token'
const BASE = 'https://api.infomaniak.com/3/drive'
const SCOPE = 'drive'

// ─── Helpers stockage ────────────────────────────────────────────────────

export function getAccessToken() {
  return localStorage.getItem('kdrive_access_token') || ''
}

function getRefreshToken() {
  return localStorage.getItem('kdrive_refresh_token') || ''
}

function getDriveId() {
  return localStorage.getItem('kdrive_drive_id') || ''
}

function saveTokens({ access_token, refresh_token, expires_in }) {
  localStorage.setItem('kdrive_access_token', access_token)
  if (refresh_token) localStorage.setItem('kdrive_refresh_token', refresh_token)
  const expiry = Date.now() + expires_in * 1000
  localStorage.setItem('kdrive_token_expiry', expiry)
}

function isTokenExpired() {
  const expiry = localStorage.getItem('kdrive_token_expiry')
  if (!expiry) return true
  return Date.now() > parseInt(expiry) - 60000 // 1 min de marge
}

export function isAuthenticated() {
  return !!getAccessToken() && !!getDriveId()
}

// ─── OAuth2 : Login ───────────────────────────────────────────────────────

export function startOAuthLogin() {
  // Sauvegarde la page courante
  localStorage.setItem('oauth_return_page', 'dashboard')
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
  })

  window.location.href = `${AUTH_URL}?${params}`
}

// ─── OAuth2 : Échange du code ────────────────────────────────────────────

export async function handleOAuthCallback(code) {
  const clientSecret = localStorage.getItem('kdrive_client_secret') || ''
  
  if (!clientSecret) {
    throw new Error('Client secret manquant — configure-le dans les réglages')
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: clientSecret,
  })

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Échange token échoué: ${err}`)
  }

  const data = await res.json()
  saveTokens(data)
  return data
}

// ─── OAuth2 : Refresh token ──────────────────────────────────────────────

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  const clientSecret = localStorage.getItem('kdrive_client_secret') || ''

  if (!refreshToken || !clientSecret) throw new Error('Impossible de rafraîchir le token')

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: clientSecret,
  })

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) throw new Error('Refresh token expiré — reconnexion nécessaire')

  const data = await res.json()
  saveTokens(data)
  return data.access_token
}

// ─── Logout ───────────────────────────────────────────────────────────────

export function logout() {
  localStorage.removeItem('kdrive_access_token')
  localStorage.removeItem('kdrive_refresh_token')
  localStorage.removeItem('kdrive_token_expiry')
  localStorage.removeItem('kdrive_drive_id')
  _folderId = null
  _soinsFolderId = null
}

// ─── Requête générique (avec auto-refresh) ────────────────────────────────

async function kFetch(path, options = {}) {
  let token = getAccessToken()
  if (!token) throw new Error('Non authentifié')

  // Auto-refresh si expiré
  if (isTokenExpired()) {
    token = await refreshAccessToken()
  }

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

// ─── Récupération automatique du Drive ID ────────────────────────────────

export async function fetchAndSaveDriveId() {
  const token = getAccessToken()
  const res = await fetch('https://api.infomaniak.com/1/drive', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Impossible de récupérer les drives')
  const data = await res.json()
  const drive = data.data?.[0]
  if (!drive) throw new Error('Aucun drive trouvé')
  localStorage.setItem('kdrive_drive_id', String(drive.id))
  return drive.id
}

// ─── Structure dossiers ───────────────────────────────────────────────────

let _folderId = null
let _soinsFolderId = null

async function ensureFolder(parentId, name) {
  try {
    const res = await kFetch(`/files/${parentId}/directory`, {
      method: 'POST',
      body: JSON.stringify({ name, conflict_resolution: 'rename' }),
    })
    return res.data?.id
  } catch {
    const list = await kFetch(`/files/${parentId}/files`)
    const found = list.data?.find(f => f.name === name && f.type === 'dir')
    return found?.id ?? null
  }
}

export async function initKDrive() {
  const plantAppId = await ensureFolder(1, 'PlantApp')
  _folderId = plantAppId
  const soinsId = await ensureFolder(plantAppId, 'soins')
  _soinsFolderId = soinsId
  return { folderId: _folderId, soinsFolderId: _soinsFolderId }
}

// ─── Lecture / Écriture JSON (inchangées) ────────────────────────────────

async function findFileInFolder(folderId, filename) {
  try {
    const res = await kFetch(`/files/${folderId}/files`)
    return res.data?.find(f => f.name === filename) ?? null
  } catch {
    return null
  }
}

export async function readJson(fileId) {
  const token = getAccessToken()
  const res = await fetch(
    `${BASE}/${getDriveId()}/files/${fileId}/download`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return null
  return res.json()
}

export async function writeJson(folderId, filename, data) {
  const token = getAccessToken()
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const existing = await findFileInFolder(folderId, filename)

  const url = existing
    ? `https://upload.infomaniak.com/3/drive/${getDriveId()}/upload?file_id=${existing.id}&conflict_resolution=replace`
    : `https://upload.infomaniak.com/3/drive/${getDriveId()}/upload?directory_id=${folderId}&file_name=${encodeURIComponent(filename)}&conflict_resolution=replace`

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: blob,
  })
  if (!res.ok) throw new Error(`Upload échoué: ${res.status}`)
  return res.json()
}

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

export async function testConnection() {
  const res = await kFetch('/files/1')
  return !!res.data
}
