import Hero from '@/sections/Hero'
import { useTitle } from '@/lib/useTitle'
import Recruitment from '@/sections/Recruitment'
import Meets from '@/sections/Meets'
import Gallery from '@/sections/Gallery'
import Achievements from '@/sections/Achievements'
import Community from '@/sections/Community'
import Cta from '@/sections/Cta'

export default function Home() {
  useTitle('')
  return (
    <>
      <Hero />
      <Recruitment />
      <Meets />
      <Gallery />
      <Achievements />
      <Community />
      <Cta />
    </>
  )
}
