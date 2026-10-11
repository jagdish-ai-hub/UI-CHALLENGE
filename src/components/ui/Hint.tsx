import type { ReactNode } from 'react'

/** Shows one string for mouse devices and another for touch devices (no JS needed). */
export function Hint({ mouse, touch }: { mouse: ReactNode; touch: ReactNode }) {
  return (
    <>
      <span className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline">{mouse}</span>
      <span className="[@media(hover:hover)_and_(pointer:fine)]:hidden">{touch}</span>
    </>
  )
}
