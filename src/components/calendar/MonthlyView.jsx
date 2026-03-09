import { useState } from 'react';
import { usePlants } from '../../hooks/usePlants';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin',
                 'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export default function MonthlyView({ notes, addNote, deleteNote }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

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

        if (soin.mode === 'dateFixe') {
          // Date fixe : une seule occurrence
          if (soin.prochaineDate === dateKey) {
            cares.push({ plant: plant.nom || plant.name, type: soinId });
          }

        } else if (soin.dernierSoin && soin.intervalJours) {
          // Intervalle : on projette toutes les occurrences du mois
          const debut = new Date(soin.dernierSoin);
          const cible = new Date(dateKey + 'T12:00:00');
          const diffJours = Math.round((cible - debut) / 86400000);

          if (diffJours > 0 && diffJours % soin.intervalJours === 0) {
            cares.push({ plant: plant.nom || plant.name, type: soinId });
          }
        }
      });
    } catch { /* ignore */ }
  });
  return cares;
};


  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleAddNote = () => {
    if (!selectedDay) return;
    if (!titleInput.trim() && !noteInput.trim()) return;
    addNote(selectedDay, {
      title: titleInput.trim(),
      text: noteInput.trim(),
      time: new Date().toISOString()
    });
    setTitleInput('');
    setNoteInput('');
  };

  const CARE_ICONS = {
    arrosage: '💧', engrais: '🌿', rempotage: '🪴',
    taille: '✂️', traitement: '🧪'
  };

  return (
    <div className="space-y-4">

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-green-100 text-green-700 font-bold text-lg">←</button>
        <h2 className="text-xl font-bold text-green-800">{MONTHS[currentMonth]} {currentYear}</h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-green-100 text-green-700 font-bold text-lg">→</button>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-green-600 py-1">{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateKey = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const dayNotes = notes[dateKey] || [];
          const cares = getPlantCareForDay(dateKey);
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          const isPast = new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const hasOverdue = isPast && cares.length > 0;

          return (
            <div
              key={dateKey}
              onClick={() => setSelectedDay(dateKey)}
              className={`min-h-[70px] p-1 rounded-lg border cursor-pointer transition-all
                ${isToday ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 bg-white'}
                ${hasOverdue ? 'border-red-300 bg-red-50' : ''}
                ${selectedDay === dateKey ? 'ring-2 ring-green-400' : ''}
              `}
            >
              {/* Numéro */}
              <div className={`text-xs font-bold mb-1 ${isToday ? 'text-green-600' : hasOverdue ? 'text-red-500' : 'text-gray-600'}`}>
                {day}
              </div>

              {/* Icônes soins */}
            <div className="flex flex-col gap-0.5 mt-0.5">
            {cares.map((c, i) => (
                <div key={i} className="flex items-center gap-0.5">
                <span className="text-xs leading-none">{CARE_ICONS[c.type] || '🌱'}</span>
                <span className="text-[9px] leading-tight text-gray-600 truncate max-w-[48px]">
                    {c.plant}
                </span>
                </div>
            ))}
            </div>

              {/* Pills notes — popover CSS pur au hover */}
              <div className="mt-0.5 space-y-0.5">
                {dayNotes.map((note, i) => (
                  <div
                    key={i}
                    onClick={e => e.stopPropagation()}
                    className="relative group"
                  >
                    <div className="bg-yellow-100 border border-yellow-300 rounded px-1 py-0.5 w-full cursor-default">
                      <span className="text-[10px] leading-tight text-yellow-800 font-medium truncate block">
                        {note.title || '📝 Note'}
                      </span>
                    </div>

                    {/* Popover visible au hover — CSS pur */}
                    {(note.title || note.text) && (
                      <div className="
                        absolute z-50 bottom-full left-0 mb-1
                        bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl
                        w-48 pointer-events-none
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-150
                      ">
                        {note.title && <p className="font-semibold mb-0.5">{note.title}</p>}
                        {note.text  && <p className="text-gray-300 whitespace-pre-wrap">{note.text}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Panel jour sélectionné */}
      {selectedDay && (
        <div className="bg-white rounded-xl border border-green-200 p-4 space-y-3">
          <h3 className="font-semibold text-green-800">
            📅 {new Date(selectedDay + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>

          {/* Soins prévus */}
          {getPlantCareForDay(selectedDay).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">SOINS PRÉVUS</p>
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

            {/* Formulaire */}
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
