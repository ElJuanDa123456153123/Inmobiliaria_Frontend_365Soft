// Preferencias personales del panel de propietario, aisladas por usuario.
// El admin controla el acento global (home/admin, localStorage "accent-color"),
// que es el que ven los visitantes y los usuarios sin acento personal.

export type PanelAccent = "cyan" | "blue" | "green" | "purple" | "orange" | "red"

export interface PanelPrefs {
  accent?: PanelAccent
  sidebarCollapsed?: boolean
}

function base64UrlToBase64(input: string): string {
  return input.replace(/-/g, "+").replace(/_/g, "/")
}

// Extrae el user_id del payload del JWT sin librerías externas
export function getUserIdFromToken(): string | null {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem("token")
  if (!token) return null
  try {
    const payloadPart = token.split(".")[1]
    const json = new TextDecoder().decode(
      Uint8Array.from(atob(base64UrlToBase64(payloadPart)), (c) => c.charCodeAt(0))
    )
    const payload = JSON.parse(json)
    if (payload?.user_id) return String(payload.user_id)
    if (payload?.sub) return String(payload.sub)
  } catch {
    // token inválido: caer al fallback
  }
  return localStorage.getItem("userId")
}

function prefsKey(userId: string | null): string {
  const id = userId || localStorage.getItem("userName") || "anon"
  return `panel-prefs-${id}`
}

export function loadPanelPrefs(userId: string | null): PanelPrefs {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(prefsKey(userId)) || "{}") as PanelPrefs
  } catch {
    return {}
  }
}

export function savePanelPrefs(userId: string | null, prefs: PanelPrefs): void {
  if (typeof window === "undefined") return
  localStorage.setItem(prefsKey(userId), JSON.stringify(prefs))
}

// Aplica el acento efectivo del usuario en todo el sitio:
// 1. Si tiene acento personal → se usa en panel Y home (solo lo ve ese usuario)
// 2. Si no tiene → se usa el acento global configurado por el admin (localStorage "accent-color")
export function applyAccent(prefs: PanelPrefs): void {
  if (typeof window === "undefined") return
  const root = document.documentElement

  if (prefs.accent && prefs.accent !== "cyan") {
    root.setAttribute("data-accent", prefs.accent)
    return
  }

  const globalAccent = localStorage.getItem("accent-color")
  if (globalAccent) {
    root.setAttribute("data-accent", globalAccent)
  } else {
    root.removeAttribute("data-accent")
  }
}
