import { Link } from 'react-router-dom'
export function NotFound() {
  return (
    <div className="wrap py-24">
      <p className="font-display text-sm font-bold text-stat wide">Undeliverable</p>
      <h1 className="display mt-3 text-5xl">This address isn't on the route.</h1>
      <p className="lede">The page may have moved. Head back to the start.</p>
      <Link to="/" className="btn-stat mt-8">Back to StatSweep</Link>
    </div>
  )
}
