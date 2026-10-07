import { useId, useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { game } from '../lib/game'
import { cn } from '../lib/fx'
import { Icon } from './ui'

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
const isPhone = (v: string) => /^\+?[\d\s()-]{10,}$/.test(v) && v.replace(/\D/g, '').length >= 10

export default function JoinForm({ onDone, cta = 'Oyuna Başla' }: { onDone: () => void; cta?: string }) {
  const id = useId()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [consent, setConsent] = useState(false)
  const [tried, setTried] = useState(false)

  const errors = {
    name: name.trim().length < 2 ? 'Adını yazar mısın?' : null,
    contact: !(isEmail(contact.trim()) || isPhone(contact.trim())) ? 'Geçerli bir e-posta ya da telefon numarası gir.' : null,
    consent: !consent ? 'Devam etmek için onay gerekli.' : null,
  }
  const valid = !errors.name && !errors.contact && !errors.consent

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!valid) {
      navigator.vibrate?.(60)
      return
    }
    game.register(name, contact)
    onDone()
  }

  const field = 'w-full rounded-2xl border-2 border-ink bg-white px-4 py-3.5 text-base font-semibold outline-none transition-shadow placeholder:font-medium placeholder:text-muted/70 focus:shadow-[4px_4px_0_0_var(--color-blue)]'

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <label htmlFor={`${id}-n`} className="mb-2 block text-sm font-extrabold">
          Adın Soyadın <span className="font-medium text-muted">(sertifikada yazacak)</span>
        </label>
        <input id={`${id}-n`} className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ör. Deniz Yılmaz" maxLength={48} />
        {tried && errors.name && <p className="mt-1.5 text-sm font-semibold text-red">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor={`${id}-c`} className="mb-2 block text-sm font-extrabold">
          E-posta ya da telefon <span className="font-medium text-muted">(çekiliş için)</span>
        </label>
        <input id={`${id}-c`} className={field} value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" inputMode="email" placeholder="ornek@mail.com" />
        {tried && errors.contact && <p className="mt-1.5 text-sm font-semibold text-red">{errors.contact}</p>}
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" className="peer sr-only" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span
          className={cn(
            'mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border-2 border-ink transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-blue',
            consent ? 'bg-ink text-paper' : 'bg-white',
          )}
        >
          {consent && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Icon name="check" className="size-4" />
            </motion.span>
          )}
        </span>
        <span className="text-sm leading-snug text-muted">
          {/* TODO: LÖSEV hukuk ekibinden alınacak KVKK aydınlatma metni linki */}
          Kişisel verilerimin bu etkinlik ve çekiliş kapsamında işlenmesine ilişkin <u className="font-semibold text-ink">aydınlatma metnini</u> okudum, onaylıyorum.
        </span>
      </label>
      {tried && errors.consent && <p className="-mt-3 text-sm font-semibold text-red">{errors.consent}</p>}

      <button type="submit" className="btn btn-red btn-lg w-full">
        {cta} <Icon name="arrow" />
      </button>
    </form>
  )
}
