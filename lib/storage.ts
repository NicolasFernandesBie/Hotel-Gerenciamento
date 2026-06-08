'use client'

export function getAll<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function getById<T extends { id: string }>(key: string, id: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const items = getAll<T>(key)
    return items.find(item => item.id === id) || null
  } catch {
    return null
  }
}

export function save<T extends { id: string }>(key: string, item: T): void {
  if (typeof window === 'undefined') return
  try {
    const items = getAll<T>(key)
    items.push(item)
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    console.error(`Failed to save item to ${key}`)
  }
}

export function update<T extends { id: string }>(key: string, item: T): void {
  if (typeof window === 'undefined') return
  try {
    const items = getAll<T>(key)
    const index = items.findIndex(i => i.id === item.id)
    if (index !== -1) {
      items[index] = item
      localStorage.setItem(key, JSON.stringify(items))
    }
  } catch {
    console.error(`Failed to update item in ${key}`)
  }
}

export function remove(key: string, id: string): void {
  if (typeof window === 'undefined') return
  try {
    const items = getAll<any>(key)
    const filtered = items.filter(item => item.id !== id)
    localStorage.setItem(key, JSON.stringify(filtered))
  } catch {
    console.error(`Failed to remove item from ${key}`)
  }
}

export function saveAll<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    console.error(`Failed to save items to ${key}`)
  }
}

export function clear(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    console.error(`Failed to clear ${key}`)
  }
}
