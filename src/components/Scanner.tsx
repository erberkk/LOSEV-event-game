import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import QrScanner from 'qr-scanner'
import { letterByToken } from '../data/letters'
import { Icon } from './ui'

/** Site içi QR okuyucu. Telefonun kendi kamerasıyla okutmak da aynı /h/:token sayfasına gider. */
export default function Scanner({ onClose }: { onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [wrong, setWrong] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)

    let lastWrong = 0
    const scanner = new QrScanner(
      video.current!,
      ({ data }) => {
        let token: string | undefined
        try {
          token = new URL(data, window.location.origin).pathname.match(/\/h\/([^/?#]+)/)?.[1]
        } catch {
          /* QR bir URL değil */
        }
        if (token && letterByToken(token)) {
          scanner.stop()
          navigator.vibrate?.(30)
          onClose()
          navigate(`/h/${token}`)
        } else if (Date.now() - lastWrong > 2500) {
          lastWrong = Date.now()
          setWrong(true)
          setTimeout(() => setWrong(false), 2200)
        }
      },
      { preferredCamera: 'environment', maxScansPerSecond: 8, returnDetailedScanResult: true },
    )
    scanner.start().catch(() =>
      setError(
        window.isSecureContext
          ? 'Kameraya erişilemedi. Tarayıcı ayarlarından kamera iznini açabilir ya da telefonunun kendi kamerasıyla QR’ı okutabilirsin.'
          : 'Kamera yalnızca güvenli (https) bağlantıda çalışır.',
      ),
    )
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      scanner.destroy()
    }
  }, [navigate, onClose])

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[90] flex flex-col bg-ink text-paper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal
      aria-label="QR kod okut"
    >
      <video ref={video} className="absolute inset-0 size-full object-cover" playsInline muted />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0,transparent_34%,rgb(20_17_15/0.82)_35%)]" />

      <div className="relative flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <p className="font-display text-lg font-bold">Harfin üzerindeki QR’ı okut</p>
        <button onClick={onClose} className="grid size-11 place-items-center rounded-full border-2 border-paper/80 bg-ink/40" aria-label="Kapat">
          <Icon name="close" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative aspect-square w-[68vmin] max-w-80">
          {['top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl', 'top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl'].map((c) => (
            <span key={c} className={`absolute size-12 border-sun ${c}`} />
          ))}
          <motion.span
            className="absolute inset-x-4 h-0.5 rounded-full bg-sun shadow-[0_0_18px_4px_rgb(255_194_26/0.6)]"
            animate={{ top: ['8%', '92%', '8%'] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <div className="relative min-h-28 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
        {error ? (
          <p className="mx-auto max-w-sm rounded-2xl bg-red p-4 text-sm font-semibold">{error}</p>
        ) : wrong ? (
          <p className="mx-auto max-w-sm rounded-2xl bg-sun p-4 text-sm font-bold text-ink">Bu QR bu oyuna ait değil. LÖSEV harfinin üzerindeki kodu dene.</p>
        ) : (
          <p className="text-sm text-paper/75">QR kodu çerçevenin içine hizala. Otomatik okunacak.</p>
        )}
      </div>
    </motion.div>,
    document.body,
  )
}
