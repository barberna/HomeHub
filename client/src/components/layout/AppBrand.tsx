import { Home } from 'lucide-react';
/** Reuses the same HomeHub identity in the desktop sidebar and mobile drawer. */
export function AppBrand() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">
        <Home size={20} />
      </span>

      <div>
        <strong>HomeHub</strong>
        <small>Household services</small>
      </div>
    </div>
  );
}
