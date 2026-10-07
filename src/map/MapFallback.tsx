import { cn } from '../lib/fx'

export default function MapFallback({ className, text }: { className?: string; text?: string }) {
  return (
    <div className={cn('grid place-items-center rounded-[1.75rem] border-2 border-ink bg-paper-2 p-6 text-center text-sm font-semibold text-muted', !text && 'animate-pulse', className)}>
      {text}
    </div>
  )
}
