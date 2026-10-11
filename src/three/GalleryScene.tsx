import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { gallery, renderArt, type GalleryItem } from '@/data/gallery'

const vert = /* glsl */ `
  varying vec2 vUv;
  uniform float uBend;
  void main() {
    vUv = uv;
    vec3 p = position;
    float s = sin(uv.x * 3.14159265);
    p.z += s * uBend;
    p.y += (uv.y - 0.5) * s * uBend * 0.25;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const frag = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uDim;
  uniform float uAspect;
  float sdRound(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float d = sdRound(p, vec2(uAspect * 0.5, 0.5), 0.06);
    float a = 1.0 - smoothstep(-0.004, 0.004, d);
    vec3 col = texture2D(uMap, vUv).rgb;
    col = mix(vec3(1.0), col, uDim);
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`

const W = 2.4
const H = 3.2
const GAP = 2.75

function Card({ item, index, pos, onPick }: { item: GalleryItem; index: number; pos: React.RefObject<{ cur: number; vel: number }>; onPick: (i: number) => void }) {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: { uMap: { value: new THREE.Texture() }, uBend: { value: 0 }, uDim: { value: 1 }, uAspect: { value: W / H } },
      }),
    [],
  )
  useEffect(() => {
    let tex: THREE.Texture
    if (item.src) {
      tex = new THREE.TextureLoader().load(item.src, () => (material.uniformsNeedUpdate = true))
    } else {
      tex = new THREE.CanvasTexture(renderArt(item))
    }
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    tex.needsUpdate = true
    material.uniforms.uMap!.value = tex
    return () => tex.dispose()
  }, [item, material])
  useFrame(() => {
    const m = mesh.current
    const p = pos.current
    if (!m || !p) return
    const d = index - p.cur
    const ad = Math.abs(d)
    m.position.x = d * GAP * (ad > 1 ? 0.78 : 1)
    m.position.z = -Math.min(ad, 3) * 0.7
    m.rotation.y = THREE.MathUtils.clamp(-d * 0.42, -1.0, 1.0)
    m.scale.setScalar(1 - Math.min(ad, 3) * 0.09)
    material.uniforms.uBend!.value = THREE.MathUtils.clamp(-p.vel * 1.4, -0.9, 0.9) * (1 - Math.min(ad, 2) * 0.3)
    material.uniforms.uDim!.value = 1 - Math.min(ad, 2) * 0.22
    m.renderOrder = -Math.round(ad * 10)
  })
  return (
    <mesh
      ref={mesh}
      material={material}
      onClick={(e) => {
        e.stopPropagation()
        onPick(index)
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <planeGeometry args={[W, H, 24, 1]} />
    </mesh>
  )
}

function Cam() {
  const size = useThree((s) => s.size)
  const zoom = Math.min(size.width / 8.4, size.height / 3.85)
  return <OrthographicCamera makeDefault position={[0, 0, 12]} zoom={zoom} near={-20} far={40} />
}

export default function GalleryScene({ target, onPick }: { target: React.RefObject<number>; onPick: (i: number) => void }) {
  const pos = useRef({ cur: target.current ?? 0, vel: 0 })
  useFrame((_, dt) => {
    const t = target.current ?? 0
    const p = pos.current
    const prev = p.cur
    p.cur += (t - p.cur) * Math.min(1, dt * 6)
    p.vel += ((p.cur - prev) / Math.max(dt, 1e-3) - p.vel) * Math.min(1, dt * 10)
  })
  return (
    <>
      <Cam />
      {gallery.map((g, i) => (
        <Card key={g.id} item={g} index={i} pos={pos} onPick={onPick} />
      ))}
    </>
  )
}
