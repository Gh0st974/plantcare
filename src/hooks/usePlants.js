import { useState, useEffect } from 'react'

const STORAGE_KEY = 'plantcare_plants'

export function usePlants() {
  const [plants, setPlants] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plants))
  }, [plants])

  function addPlant(plantData) {
    const newPlant = {
      ...plantData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      cares: [],
    }
    setPlants(prev => [newPlant, ...prev])
    return newPlant.id
  }

  function updatePlant(id, updates) {
    setPlants(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  function deletePlant(id) {
    setPlants(prev => prev.filter(p => p.id !== id))
  }

  return { plants, addPlant, updatePlant, deletePlant }
}
