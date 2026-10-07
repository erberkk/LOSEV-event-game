import { Link } from 'react-router'
import { EVENT } from '../data/event'
import { LETTERS } from '../data/letters'
import { Wordmark } from './ui'

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-ink pb-[calc(env(safe-area-inset-bottom)+2rem)] text-paper">
      <div className="flex h-2">
        {LETTERS.map((l) => (
          <span key={l.id} className="flex-1" style={{ background: l.color }} />
        ))}
      </div>
      <div className="container-x flex flex-col gap-8 pt-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Wordmark className="text-5xl" />
          <p className="mt-3 max-w-sm text-sm text-paper/60">
            {EVENT.title} · {EVENT.dates} {EVENT.year} {EVENT.week} kapsamında LÖSEV gönüllüleri tarafından hazırlanmıştır.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-paper/80">
          <Link to="/katil" className="hover:text-sun">Oyuna Katıl</Link>
          <Link to="/oyun" className="hover:text-sun">Oyunum</Link>
          <a href={EVENT.officialSite} target="_blank" rel="noreferrer" className="hover:text-sun">losev.org.tr</a>
        </nav>
      </div>
    </footer>
  )
}
