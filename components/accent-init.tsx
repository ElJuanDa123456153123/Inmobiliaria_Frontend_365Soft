"use client"

import { useEffect } from "react"
import { applyAccent, getUserIdFromToken, loadPanelPrefs } from "@/lib/user-prefs"

// Aplica el acento efectivo del usuario en toda la app (home incluido):
// acento personal si tiene, si no el global del admin.
// Se re-aplica cuando cambia en otra pestaña o desde el panel (evento "accent-change").
export function AccentInit() {
  useEffect(() => {
    const apply = () => applyAccent(loadPanelPrefs(getUserIdFromToken()))

    apply()
    window.addEventListener("storage", apply)
    window.addEventListener("accent-change", apply)

    return () => {
      window.removeEventListener("storage", apply)
      window.removeEventListener("accent-change", apply)
    }
  }, [])

  return null
}
