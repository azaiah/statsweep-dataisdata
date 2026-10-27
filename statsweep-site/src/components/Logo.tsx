import { useId } from 'react'

/** StatSweep mark: a radar scope sweeping, with a red medical blip where it just found something. */
export function Mark({ size = 36, tile = true, className = '' }: { size?: number; tile?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`sw${id}`} x1="32" y1="11" x2="50" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#39D5CF" stopOpacity=".15" />
          <stop offset="1" stopColor="#39D5CF" />
        </linearGradient>
      </defs>
      {tile && <rect width="64" height="64" rx="15" fill="#0B1F33" />}
      <circle cx="32" cy="32" r="21" stroke="#39D5CF" strokeOpacity=".38" strokeWidth="2" />
      <circle cx="32" cy="32" r="11.5" stroke="#39D5CF" strokeOpacity=".38" strokeWidth="2" />
      <path d="M32 32 L32 11 A21 21 0 0 1 51.2 23.4 Z" fill={`url(#sw${id})`} />
      <path d="M32 32 L51.2 23.4" stroke="#39D5CF" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3.2" fill="#39D5CF" />
      <path d="M44 38.2h3.6v-3.6h4v3.6h3.6v4h-3.6v3.6h-4v-3.6H44z" fill="#E5383B" />
    </svg>
  )
}

export function Logo({ dark = false, by = true }: { dark?: boolean; by?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark size={36} />
      <span className="leading-none">
        <span className={`block font-display text-[1.35rem] font-extrabold tracking-tight wide ${dark ? 'text-white' : 'text-night'}`}>StatSweep</span>
        {by && <span className={`mt-0.5 block text-[11px] font-medium ${dark ? 'text-white/60' : 'text-steel'}`}>presented by DataIsData</span>}
      </span>
    </span>
  )
}

export function DataIsDataBadge({ dark = true }: { dark?: boolean }) {
  return (
    <a href="https://dataisdata.com" className={`inline-flex items-center gap-2 text-sm ${dark ? 'text-white/70 hover:text-white' : 'text-steel hover:text-night'}`}>
      <img src="/images/dataisdata.png" alt="" width={26} height={28} className={dark ? '' : 'brightness-[.45]'} />
      <span>A DataIsData service</span>
    </a>
  )
}
