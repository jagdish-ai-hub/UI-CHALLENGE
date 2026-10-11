import { useState, lazy } from 'react'
import { ArrowRight, Rocket } from 'lucide-react'
import { SceneFrame } from '@/three/lazy'
import { Button, ButtonLink, Reveal } from '@/components/ui/primitives'
import { scrollToId } from '@/lib/lenis'

const RocketScene = lazy(() => import('@/three/RocketScene'))

export default function Cta() {
  const [fire, setFire] = useState(0)
  const [msg, setMsg] = useState(false)
  const launch = () => {
    setFire((n) => n + 1)
    setMsg(true)
    window.setTimeout(() => setMsg(false), 3200)
  }
  return (
    <section id="join" className="relative bg-white pb-24 pt-6 sm:pb-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="overflow-hidden rounded-[2.5rem] bg-g-blue-50">
          <div className="grid items-center gap-2 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-8 sm:p-14">
              <Reveal>
                <p className="eyebrow">Ready when you are</p>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="display mt-4 text-[clamp(2.8rem,6.4vw,5.4rem)]">
                  Your first
                  <br />
                  <span className="text-g-blue">launch</span> is{' '}
                  <span className="marker" style={{ ['--marker' as string]: '#FBBC04' }}>
                    here.
                  </span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted">Join a team, ship something real with people who care about the same things, and leave with a badge, a project and friends.</p>
              </Reveal>
              <Reveal delay={0.16} className="mt-8 flex flex-wrap gap-3">
                <Button onClick={() => scrollToId('recruit')}>
                  Apply to the core team <ArrowRight size={16} />
                </Button>
                <Button variant="outline" onClick={launch}>
                  <Rocket size={16} /> Launch
                </Button>
                <ButtonLink to="/members" variant="outline">
                  Meet the members
                </ButtonLink>
              </Reveal>
              <p className="mt-5 h-5 text-sm text-g-green-700" aria-live="polite">
                {msg ? 'Three, two, one. Applications are open until the end of the month.' : ''}
              </p>
            </div>
            <div className="relative">
              <SceneFrame label="3D rocket on a launch pad. Click it to launch." className="h-[380px] sm:h-[500px]" fallback={<div className="absolute inset-0 grid place-items-center text-muted"><Rocket size={64} /></div>}>
                {() => <RocketScene trigger={fire} onLaunch={launch} />}
              </SceneFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
