import { createContext, useContext, useState, useEffect } from 'react'

const CompareContext = createContext(null)

export function CompareProvider({ children }) {
  const [list, setList] = useState(() => {
    try {
      const saved = localStorage.getItem('ff_compare')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('ff_compare', JSON.stringify(list))
  }, [list])

  function add(director) {
    setList(prev => {
      if (prev.find(d => d.id === director.id)) return prev
      if (prev.length >= 3) return prev
      return [...prev, {
        id: director.id,
        name: director.name,
        town: director.town,
        attended_price: director.attended_price,
        cremation_price: director.cremation_price,
        nafd_member: director.nafd_member,
        saif_member: director.saif_member,
        website: director.website,
      }]
    })
  }

  function remove(id) {
    setList(prev => prev.filter(d => d.id !== id))
  }

  function clear() { setList([]) }

  function isInList(id) { return list.some(d => d.id === id) }

  return (
    <CompareContext.Provider value={{ list, add, remove, clear, isInList }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  return useContext(CompareContext)
}
