import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'

export type Tier = 'high' | 'low' | 'off'

let webglSupport: boolean | null = null

/** Checked once and cached: every probe context would otherwise count toward the browser's WebGL limit. */
function hasWebGL() {
  if (webglSupport !== null) return webglSupport
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    webglSupport = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglSupport = false
  }
  return webglSupport
}

/** Resolves user preference + device capability to a render tier. */
export function useTier(): Tier {
  const quality = useStore((s) => s.quality)
  const motion = useStore((s) => s.motion)
  const [auto, setAuto] = useState<Tier>('high')

  useEffect(() => {
    const compute = () => {
      if (!hasWebGL()) return 'off' as Tier
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'off' as Tier
      const narrow = window.matchMedia('(max-width: 820px)').matches
      const coarse = window.matchMedia('(pointer: coarse)').matches
      const cores = navigator.hardwareConcurrency ?? 8
      return (narrow || coarse || cores <= 4 ? 'low' : 'high') as Tier
    }
    setAuto(compute())
    const mq = window.matchMedia('(max-width: 820px)')
    const on = () => setAuto(compute())
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  if (!motion) return 'off'
  if (quality === 'off') return 'off'
  if (quality === 'high' || quality === 'low') return hasWebGL() ? quality : 'off'
  return auto
}
