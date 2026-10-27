export const money = (n: number, cents = false) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents ? 2 : 0, minimumFractionDigits: cents ? 2 : 0 }).format(n || 0)
export const shortDate = (s?: string) => s ? new Date(s.length === 10 ? s + 'T12:00' : s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
export const longDate = (s?: string) => s ? new Date(s.length === 10 ? s + 'T12:00' : s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''
export const time = (s?: string) => s ? new Date(s).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''
export const stamp = (s?: string) => s ? `${longDate(s)}, ${time(s)}` : ''
export const daysUntil = (s?: string) => s ? Math.ceil((new Date(s.length === 10 ? s + 'T17:00' : s).getTime() - Date.now()) / 864e5) : Infinity
export const ago = (s?: string) => { if (!s) return ''; const m = (Date.now() - new Date(s).getTime()) / 6e4; if (m < 1) return 'just now'; if (m < 60) return Math.round(m) + ' min ago'; if (m < 1440) return Math.round(m / 60) + ' h ago'; return Math.round(m / 1440) + ' d ago' }
export const uid = (p: string) => p + '-' + Math.random().toString(36).slice(2, 8).toUpperCase()
