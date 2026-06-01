// ForecastingPage.jsx - pagina de prognoza (/forecasting)
// Calculez media netului lunar din ultimele 6 luni
// si proiectez cumulativ pentru urmatoarele 6 luni
// E o proiectie simpla liniara, nu machine learning

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getPersonalTransactions,
  buildMonthlySeries,
  formatCurrency,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';
import { CustomTooltip } from '../shared/components.jsx';

export default function ForecastingPage({ transactions }) {
  const revealRef = useScrollReveal();
  const personalTx = useMemo(() => getPersonalTransactions(transactions), [transactions]);

  // seria ultimelor 6 luni (pentru a calcula media)
  const monthly = useMemo(() => buildMonthlySeries(personalTx, 6), [personalTx]);

  // media netului pe luna
  const avgNet = monthly.length
    ? Math.round(monthly.reduce((sum, item) => sum + item.sold, 0) / monthly.length)
    : 0;

  // proiectez 6 luni in viitor: fiecare luna e avgNet * (luna + 1)
  const forecast = Array.from({ length: 6 }, (_, index) => ({
    name: new Date(new Date().getFullYear(), new Date().getMonth() + index + 1, 1)
      .toLocaleDateString('ro-RO', { month: 'short' }),
    value: avgNet * (index + 1),
  }));

  return (
    <div className="content-shell" ref={revealRef}>

      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Forecasting</p>
          <h1>Projected balance</h1>
          <span>A simple forward view based on average monthly net flow</span>
        </div>
      </header>

      {/* graficul cu proiectia pentru urmatoarele 6 luni */}
      <section className="wide-panel scroll-reveal">
        <div className="panel-head">
          <div>
            <span className="section-mini-label">Projection</span>
            <h2>Next six months</h2>
          </div>
          {/* apar media neta calculata */}
          <strong className={avgNet >= 0 ? 'positive' : 'negative'}>
            Avg net {formatCurrency(avgNet, { signed: true })}
          </strong>
        </div>

        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={forecast}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--accent)"
              strokeWidth={3}
              fill="url(#forecastGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
