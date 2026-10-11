import { useEffect } from 'react'

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · GDG on Campus` : 'GDG on Campus · ITER'
  }, [title])
}
