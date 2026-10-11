import { create } from 'zustand'

export interface Toast {
  id: number
  text: string
  tone: 'ok' | 'info' | 'warn'
}

interface S {
  toasts: Toast[]
  push: (text: string, tone?: Toast['tone']) => void
  dismiss: (id: number) => void
}

let n = 0
export const useToasts = create<S>((set, get) => ({
  toasts: [],
  push: (text, tone = 'ok') => {
    const id = ++n
    set((s) => ({ toasts: [...s.toasts, { id, text, tone }] }))
    window.setTimeout(() => get().dismiss(id), 3600)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
