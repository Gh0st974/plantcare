import { useState } from 'react'
import { usePlants } from '../../hooks/usePlants'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

const COLORS = [
  { label: 'Vert',   bg: 'bg-green-400',  light: 'bg-green-100',  text: 'text-green-700' },
  { label: 'Bleu',   bg: 'bg-blue-400',   light: 'bg-blue-100',   text: 'text-blue-700' },
  { label: 'Jaune',  bg: 'bg-yellow-400', light: 'bg-yellow-100', text: 'text-yellow-700' },
  { label: 'Rouge',  bg: 'bg-red-400',    light: 'bg-red-100',    text: 'text-red-700' },
  { label: 'Violet', bg: 'bg-purple-400', light: 'bg-purple-100', text: 'text-purple-700' },
  { label: 'Orange', bg: 'bg-orange-400', light: 'bg-orange-100', text: 'text-orange-700' },
]

const STORAGE_KEY = 'calendrier_annuel'
const LANE_HEIGHT = 28
const LANE_GAP = 4

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

// ─── Distance en mois depuis aujourd'hui (0 = ce mois-ci) ────────────────────
function getMonthDistance(startMonth) {
  const currentMonth = new Date().getMonth() // 0-11
  if (startMonth >= currentMonth) {
    return startMonth - currentMonth
  } else {
    return (12 - currentMonth) + startMonth // boucle sur l'année suivante
  }
}

function assignLanes(tasks) {
  const sorted = [...tasks].sort((a, b) => a.startMonth - b.startMonth)
  const lanes = []
  return sorted.map(task => {
    let laneIdx = lanes.findIndex(endMonth => endMonth < task.startMonth)
    if (laneIdx === -1) { laneIdx = lanes.length; lanes.push(task.endMonth) }
    else { lanes[laneIdx] = task.endMonth }
    return { ...task, lane: laneIdx }
  })
}

// ─── Composant Vue Liste (Mobile) ────────────────────────────────
function TaskCard({ task, onEdit }) {
  const color = COLORS[task.colorIndex || 0]
  const monthRange = task.startMonth === task.endMonth
    ? MONTHS[task.startMonth]
    : `${MONTHS[task.startMonth]} → ${MONTHS[task.endMonth]}`

  return (
    <div
      onClick={() => onEdit(task)}
      className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer hover:shadow-sm transition ${color.light} border-transparent`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color.bg}`} />
        <span className={`text-sm font-medium ${color.text}`}>{task.label}</span>
      </div>
      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${color.bg} text-white`}>
        {monthRange}
      </span>
    </div>
  )
}

function MobileList({ rows, onEdit }) {
  return (
    <div className="space-y-5">
      {rows.map(row => (
        <div key={row.key}>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">
            {row.label}
          </p>
          {row.tasks.length === 0 ? (
            <p className="text-xs text-gray-300 italic px-1">Aucune tâche</p>
          ) : (
            <div className="space-y-2">
              {row.tasks.map(task => (
                <TaskCard key={task.id} task={task} onEdit={onEdit} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Composant Gantt (Desktop) ───────────────────────────────────
function GanttView({ rows, onEdit }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full table-fixed">
        <thead>
          <tr className="bg-green-50 border-b border-gray-200">
            <th className="w-36 px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Plante
            </th>
            {MONTHS.map((m, i) => (
              <th key={i} className="px-0 py-2 text-center text-xs font-medium text-gray-500">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const rowHeight = row.laneCount * LANE_HEIGHT + (row.laneCount - 1) * LANE_GAP + 12
            return (
              <tr key={row.key} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 text-sm font-medium text-gray-700 truncate align-middle"
                  style={{ height: rowHeight }}>
                  {row.label}
                </td>
                {MONTHS.map((_, monthIdx) => (
                  <td key={monthIdx} className="relative px-0 py-0" style={{ height: rowHeight }}>
                    {row.tasks
                      .filter(t => monthIdx >= t.startMonth && monthIdx <= t.endMonth)
                      .map(task => {
                        const color = COLORS[task.colorIndex || 0]
                        const isStart = monthIdx === task.startMonth
                        const isEnd = monthIdx === task.endMonth
                        const topOffset = task.lane * (LANE_HEIGHT + LANE_GAP) + 6
                        return (
                          <div
                            key={task.id}
                            onClick={() => onEdit(task)}
                            title={task.label}
                            style={{
                              position: 'absolute',
                              top: topOffset,
                              height: LANE_HEIGHT,
                              left: isStart ? 4 : 0,
                              right: isEnd ? 4 : 0,
                              borderRadius: `${isStart ? '999px' : '0'} ${isEnd ? '999px' : '0'} ${isEnd ? '999px' : '0'} ${isStart ? '999px' : '0'}`,
                            }}
                            className={`${color.bg} opacity-85 hover:opacity-100 cursor-pointer transition flex items-center overflow-hidden`}
                          >
                            {isStart && (
                              <span className="px-2 text-white text-xs font-semibold truncate whitespace-nowrap">
                                {task.label}
                              </span>
                            )}
                          </div>
                        )
                      })}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Composant Principal ──────────────────────────────────────────
export default function SeasonalView() {
  const { plants } = usePlants()
  const [tasks, setTasks] = useState(loadTasks)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState({
    label: '', plantId: '', startMonth: 0, endMonth: 0, colorIndex: 0,
  })

  const buildRows = () => {
    const rows = []

    // ── Global ──────────────────────────────────────────────────────
    const globalTasks = assignLanes(tasks.filter(t => !t.plantId))
    if (globalTasks.length > 0) {
      const laneCount = Math.max(...globalTasks.map(t => t.lane)) + 1
      const closestDistance = Math.min(
        ...globalTasks.map(t => getMonthDistance(Number(t.startMonth)))
      )
      rows.push({ key: 'global', label: '🌍 Global', tasks: globalTasks, laneCount, closestDistance })
    }

    // ── Plantes ─────────────────────────────────────────────────────
    plants.forEach(p => {
      const pt = assignLanes(tasks.filter(t => t.plantId === p.id))
      if (pt.length === 0) return
      const laneCount = Math.max(...pt.map(t => t.lane)) + 1
      const closestDistance = Math.min(
        ...pt.map(t => getMonthDistance(Number(t.startMonth)))
      )
      rows.push({ key: p.id, label: `🌿 ${p.name}`, tasks: pt, laneCount, closestDistance })
    })

    // ── Tri par proximité temporelle ────────────────────────────────
    rows.sort((a, b) => a.closestDistance - b.closestDistance)

    return rows
  }

  const rows = buildRows()

  function openAdd() {
    setForm({ label: '', plantId: '', startMonth: 0, endMonth: 0, colorIndex: 0 })
    setEditTask(null)
    setShowForm(true)
  }

  function openEdit(task) {
    setForm({
      label: task.label,
      plantId: task.plantId || '',
      startMonth: task.startMonth,
      endMonth: task.endMonth,
      colorIndex: task.colorIndex || 0,
    })
    setEditTask(task)
    setShowForm(true)
  }

  function handleSave() {
    if (!form.label.trim()) return
    const start = Number(form.startMonth)
    const end = Number(form.endMonth)
    const entry = {
      id: editTask ? editTask.id : crypto.randomUUID(),
      label: form.label.trim(),
      plantId: form.plantId || null,
      startMonth: Math.min(start, end),
      endMonth: Math.max(start, end),
      colorIndex: Number(form.colorIndex),
    }
    const updated = editTask
      ? tasks.map(t => t.id === editTask.id ? entry : t)
      : [...tasks, entry]
    setTasks(updated)
    saveTasks(updated)
    setShowForm(false)
  }

  function handleDelete(id) {
    const updated = tasks.filter(t => t.id !== id)
    setTasks(updated)
    saveTasks(updated)
    setShowForm(false)
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Vue annuelle</h2>
        <button
          onClick={openAdd}
          className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          + Ajouter
        </button>
      </div>

      {/* Gantt desktop / Liste mobile */}
      {rows.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-medium">Aucune tâche saisonnière</p>
          <p className="text-sm mt-1">Cliquez sur "+ Ajouter" pour commencer.</p>
        </div>
      )}
      <div className="hidden md:block">
        <GanttView rows={rows} onEdit={openEdit} />
      </div>
      <div className="md:hidden">
        <MobileList rows={rows} onEdit={openEdit} />
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {editTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h3>

            <div>
              <label className="text-sm text-gray-600 font-medium">Nom de la tâche</label>
              <input
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Ex: Tailler les rosiers"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">Plante (optionnel)</label>
              <select
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                value={form.plantId}
                onChange={e => setForm(f => ({ ...f, plantId: e.target.value }))}
              >
                <option value="">Global</option>
                {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm text-gray-600 font-medium">Mois début</label>
                <select
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={form.startMonth}
                  onChange={e => setForm(f => ({ ...f, startMonth: e.target.value }))}
                >
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 font-medium">Mois fin</label>
                <select
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={form.endMonth}
                  onChange={e => setForm(f => ({ ...f, endMonth: e.target.value }))}
                >
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">Couleur</label>
              <div className="flex gap-2 mt-2">
                {COLORS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setForm(f => ({ ...f, colorIndex: i }))}
                    className={`w-7 h-7 rounded-full ${c.bg} border-2 transition ${
                      form.colorIndex === i ? 'border-gray-800 scale-110' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              {editTask && (
                <button
                  onClick={() => handleDelete(editTask.id)}
                  className="text-sm text-red-500 hover:text-red-700 transition"
                >
                  Supprimer
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
                >
                  {editTask ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
