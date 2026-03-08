import { useState, useEffect } from 'react';

export function useCalendar() {
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('calendrier_notes')) || {};
    } catch { return {}; }
  });

  const [seasonalTasks, setSeasonalTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('calendrier_saisons')) || {
        Printemps: [], Été: [], Automne: [], Hiver: []
      };
    } catch {
      return { Printemps: [], Été: [], Automne: [], Hiver: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem('calendrier_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('calendrier_saisons', JSON.stringify(seasonalTasks));
  }, [seasonalTasks]);

  const addNote = (dateKey, note) => {
    setNotes(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), note]
    }));
  };

  const deleteNote = (dateKey, index) => {
    setNotes(prev => {
      const updated = [...(prev[dateKey] || [])];
      updated.splice(index, 1);
      return { ...prev, [dateKey]: updated };
    });
  };

  const addSeasonalTask = (season, task) => {
    setSeasonalTasks(prev => ({
      ...prev,
      [season]: [...prev[season], task]
    }));
  };

  const deleteSeasonalTask = (season, index) => {
    setSeasonalTasks(prev => {
      const updated = [...prev[season]];
      updated.splice(index, 1);
      return { ...prev, [season]: updated };
    });
  };

  return { notes, seasonalTasks, addNote, deleteNote, addSeasonalTask, deleteSeasonalTask };
}
