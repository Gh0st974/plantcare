import { useState } from 'react';
import MonthlyView from '../components/calendar/MonthlyView';
import SeasonalView from '../components/calendar/SeasonalView';
import { useCalendar } from '../hooks/useCalendar';

export default function Calendar({ plantsHook }) {
  const [view, setView] = useState('monthly');
  const { notes, seasonalTasks, addNote, deleteNote, addSeasonalTask, deleteSeasonalTask } = useCalendar();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-green-800">📅 Calendrier</h1>
          <p className="text-sm text-gray-500 mt-1">Planifiez vos soins et tâches saisonnières</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 self-start sm:self-auto">
          <button
            onClick={() => setView('monthly')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'monthly' ? 'bg-white text-green-700 shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📆 Mensuel
          </button>
          <button
            onClick={() => setView('seasonal')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'seasonal' ? 'bg-white text-green-700 shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🌿 Saisonnier
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        {view === 'monthly' ? (
          <MonthlyView notes={notes} addNote={addNote} deleteNote={deleteNote} />
        ) : (
          <SeasonalView
            seasonalTasks={seasonalTasks}
            addSeasonalTask={addSeasonalTask}
            deleteSeasonalTask={deleteSeasonalTask}
          />
        )}
      </div>
    </div>
  );
}
