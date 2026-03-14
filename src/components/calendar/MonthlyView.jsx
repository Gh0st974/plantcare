import { useState } from 'react';
import { usePlants } from '../../hooks/usePlants';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin',
                'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const CARE_ICONS = {
  arrosage:    '💧',
  brumisation: '💦',
  engrais:     '🌱',
  rempotage:   '🪴',
  taille:      '✂️',
  traitement:  '🧪',
};

export default function MonthlyView({ notes, addNote, deleteNote }) {
  const today = new Date();
  const [currentYear, setCurrentYear]   = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay]   = useState(null);
  const [titleInput, setTitleInput]     = useState('');
  const [noteInput, setNoteInput]       = useState('');

  const { plants } = usePlants();

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const getPlantCareForDay = (dateKey) => {
    const cares = [];

    plants.forEach(plant => {
      try {
        const stored = localStorage.getItem(`soins_${plant.id}`);
        if (!stored) return;
        const config = JSON.parse(stored);

        Object.entries(config).forEach(([soinId, soin]) => {
          if (!soin?.actif) return;

          let nextKey = null;

          if (soin.mode === 'dateFixe') {
            nextKey = soin.prochaineDate || null;

          } else if (soin.mode === 'departFrequence') {
            const depart = soin.dateDepart ? new Date(soin.dateDepart) : null;
            if (!depart) return;
            depart.setHours(0, 0, 0, 0);

            const todayD = new Date();
            todayD.setHours(0, 0, 0, 0);

            if (todayD < depart && !soin.dernierSoin) {
              nextKey = soin.dateDepart;
            } else {
              const base = soin.dernierSoin ? new Date(soin.dernierSoin) : depart;
              base.setHours(0, 0, 0, 0);
              const next = new Date(base);
              next.setDate(next.getDate() + (soin.intervalJours || 7));
              nextKey = next.toISOString().split('T')[0];
            }

          } else {
            // mode 'frequence'
            if (!soin.dernierSoin) {
              nextKey = new Date().toISOString().split('T')[0];
            } else {
              const next = new Date(soin.dernierSoin);
              next.setHours(0, 0, 0, 0);
              next.setDate(next.getDate() + (soin.intervalJours || 7));
              nextKey = next.toISOString().split('T')[0];
            }
          }

          if (nextKey === dateKey) {
            cares.push({
              plant: plant.nom || plant.name,
              type: soinId,
            });
          }
        });
      } catch { /* ignore */ }
    });

    return cares;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay    = getFirstDayOfMonth(currentYear, currentMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleAddNote = () => {
    if (!selectedDay) return;
    if (!titleInput.trim() && !noteInput.trim()) return;
    addNote(selectedDay, { title: titleInput.trim(), text: noteInput.trim() });
    setTitleInput('');
    setNoteInput('');
  };

  const todayKey = today.toISOString().split('T')[0];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">‹</button>
        <h2 className="text-lg font-semibold text-gray-800">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">›</button>
      </div>

      {/* En-têtes jours */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const isToday    = dateKey === todayKey;
          const isSelected = dateKey === selectedDay;
          const cares      = getPlantCareForDay(dateKey);
          const hasNotes   = (notes[dateKey] || []).length > 0;

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDay(isSelected ? null : dateKey)}
              className={`
                relative flex flex-col items-center rounded-xl py-2 px-1 text-sm font-medium transition
                ${isToday    ? 'bg-green-500 text-white'           : ''}
                ${isSelected && !isToday ? 'bg-green-100 text-green-800' : ''}
                ${!isToday && !isSelected ? 'hover:bg-gray-100 text-gray-700' : ''}
              `}
            >
              <span>{day}</span>
              {/* Points indicateurs */}
              <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                {cares.slice(0, 3).map((c, i) => (
                  <span key={i} className="text-xs leading-none">{CARE_ICONS[c.type] || '🌱'}</span>
                ))}
                {hasNotes && (
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block mt-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Panneau détail jour sélectionné */}
      {selectedDay && (
        <div className="mt-4 border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
          <p className="text-sm font-bold text-gray-700 mb-3">
            📅 {new Date(selectedDay + 'T12:00:00').toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </p>

          {/* Soins plantes */}
          {getPlantCareForDay(selectedDay).length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">SOINS PLANTES</p>
              <div className="space-y-1">
                {getPlantCareForDay(selectedDay).map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-green-50 rounded px-2 py-1">
                    <span>{CARE_ICONS[c.type] || '🌱'}</span>
                    <span className="font-medium">{c.plant}</span>
                    <span className="text-gray-500">— {c.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes existantes */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">NOTES</p>
            {(notes[selectedDay] || []).map((note, i) => (
              <div key={i} className="flex items-start justify-between bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mb-1">
                <div className="flex-1 min-w-0">
                  {note.title && <p className="text-sm font-semibold text-gray-800">{note.title}</p>}
                  {note.text  && <p className="text-sm text-gray-600 mt-0.5">{note.text}</p>}
                </div>
                <button
                  onClick={() => deleteNote(selectedDay, i)}
                  className="text-red-400 hover:text-red-600 ml-2 text-xs shrink-0 mt-0.5"
                >✕</button>
              </div>
            ))}

            {/* Formulaire ajout note */}
            <div className="mt-2 space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
              <input
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                placeholder="Titre de la note..."
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <div className="flex gap-2">
                <input
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  placeholder="Détails (optionnel)..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <button
                  onClick={handleAddNote}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
                >+</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
