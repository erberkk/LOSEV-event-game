import type { RefObject } from 'react'
import { useMotionValue, useMotionValueEvent, useScroll } from 'motion/react'

type Offset = NonNullable<Parameters<typeof useScroll>[0]>['offset']

/**
 * useScroll ilerlemesinin JS tarafında hesaplanan kopyası.
 * Motion, scroll'a doğrudan bağlı opacity/transform'u ScrollTimeline'a devrederken
 * offset'leri yanlış eşleyebiliyor; bu kopya bunu engelliyor.
 */
export function useProgress(target: RefObject<HTMLElement | null>, offset: Offset) {
  const { scrollYProgress } = useScroll({ target, offset })
  const p = useMotionValue(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => p.set(v))
  return p
}
