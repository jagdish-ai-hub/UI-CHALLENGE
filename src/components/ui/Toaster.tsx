import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, TriangleAlert, X } from 'lucide-react'
import { useToasts } from '@/store/useToasts'
import { cn } from '@/lib/utils'

const icon = { ok: Check, info: Info, warn: TriangleAlert }
const tone = { ok: 'bg-g-green-50 text-g-green-700', info: 'bg-g-blue-50 text-g-blue-700', warn: 'bg-g-yellow-50 text-g-yellow-700' }

export default function Toaster() {
  const toasts = useToasts((s) => s.toasts)
  const dismiss = useToasts((s) => s.dismiss)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const I = icon[t.tone]
          return (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-white py-2.5 pl-2.5 pr-3 shadow-[0_12px_40px_-12px_rgba(32,33,36,.35)]">
              <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', tone[t.tone])}>
                <I size={16} />
              </span>
              <span className="text-sm">{t.text}</span>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="ml-1 grid size-6 place-items-center rounded-full text-muted hover:bg-wash">
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
