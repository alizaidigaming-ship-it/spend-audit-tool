"use client"

import { useCallback, useEffect, useState } from "react"

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  // Load persisted value on mount (client only).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw != null) {
        setValue(JSON.parse(raw) as T)
      }
    } catch {
      // Ignore malformed/inaccessible storage.
    } finally {
      setHydrated(true)
    }
  }, [key])

  const setStoredValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // Ignore write failures (e.g. private mode / quota).
        }
        return resolved
      })
    },
    [key],
  )

  return [value, setStoredValue, hydrated]
}
