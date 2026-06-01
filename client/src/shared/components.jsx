// components.jsx - componentele mici reutilizabile din toata aplicatia
// Le-am pus aici ca sa nu le repet in fiecare pagina:
// CategoryIconBubble - bulita colorata cu iconul categoriei
// EmptyState         - mesajul afisat cand nu exista date
// LoadingCard        - placeholder animat cand se incarca datele
// MiniSparkline      - mini grafic SVG pentru cardurile de sumar
// CustomTooltip      - tooltip personalizat pentru graficele Recharts

import { AccountsIcon, SparkIcon } from './icons.jsx';
import { formatCurrency } from './helpers.js';

// ---- CategoryIconBubble ----
// arata iconul categoriei intr-o bulita colorata
// culoarea si fundalul vin din obiectul de categorie (CATEGORIES din constants.js)

export function CategoryIconBubble({ info, className = '', size = 16, style = {} }) {
  const Icon = info?.Icon || AccountsIcon;

  return (
    <span
      className={`category-bubble ${className}`}
      style={{
        background: info?.bgColor || 'rgba(113, 113, 122, .10)',
        color: info?.color || '#71717a',
        ...style,
      }}
    >
      <Icon size={size} />
    </span>
  );
}

// ---- EmptyState ----
// afisat cand nu exista date de afisat
// accepta un titlu, o descriere si optionat un buton de actiune

export function EmptyState({
  icon: Icon = SparkIcon,
  title = 'Nimic de afișat încă',
  description = 'Adaugă câteva date pentru a vedea această secțiune.',
  action,
  actionLabel,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={24} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && actionLabel && (
        <button type="button" className="btn btn-primary btn-sm" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ---- LoadingCard ----
// un placeholder cu animatie shimmer afisat cat timp se incarca datele de la server

export function LoadingCard({ label = 'Se încarcă...' }) {
  return (
    <div className="loading-card">
      <div className="loading-shimmer" />
      <p>{label}</p>
    </div>
  );
}

// ---- MiniSparkline ----
// un mini grafic SVG desenat manual (fara Recharts)
// e folosit in cardul de balance total din dashboard
// primeste un array de valori si le normalizeaza intre min si max

export function MiniSparkline({ data = [], positive = true }) {
  const width = 120;
  const height = 44;
  const pad = 4;
  const values = data.map((item) => Number(item.value ?? item.sold ?? 0));

  if (!values.length) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // calculez coordonatele SVG pentru fiecare punct
  const points = values
    .map((value, index) => {
      const x = values.length === 1
        ? width / 2
        : pad + (index / (values.length - 1)) * (width - pad * 2);
      const y = height - pad - ((value - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${pad},${height - pad} ${points} ${width - pad},${height - pad}`;
  const last = points.split(' ').at(-1)?.split(',');

  return (
    <svg className={`mini-sparkline ${positive ? 'positive' : 'negative'}`} viewBox={`0 0 ${width} ${height}`}>
      <polygon points={areaPoints} fill="currentColor" opacity="0.08" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {last && <circle cx={last[0]} cy={last[1]} r="3.2" fill="currentColor" />}
    </svg>
  );
}

// ---- CustomTooltip ----
// tooltip personalizat pentru graficele Recharts
// l-am facut ca sa arate consistent cu designul aplicatiei

export function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip custom-tooltip">
      <p className="ct-label">{label || payload[0].name || payload[0].dataKey}</p>
      <p className="ct-value">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}
