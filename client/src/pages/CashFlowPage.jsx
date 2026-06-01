// CashFlowPage.jsx - pagina cu miscarea banilor in timp (/cashflow)
// Arata venituri vs cheltuieli pe bara si soldul net pe graficul cu suprafata
// Userul poate alege intre 6 luni si 12 luni prin butoanele din header

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getPersonalTransactions,
  summarizeTransactions,
  buildMonthlySeries,
  formatCurrency,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';
import { CustomTooltip } from '../shared/components.jsx';

export default function CashFlowPage({ transactions }) {
  const revealRef = useScrollReveal();

  // intervalul selectat: '6m' sau '12m'
  const [range, setRange] = useState('6m');

  const personalTx = useMemo(() => getPersonalTransactions(transactions), [transactions]);

  // construiesc seria de date pentru grafic in functie de intervalul ales
  const chartData = useMemo(() => {
    return buildMonthlySeries(personalTx, range === '12m' ? 12 : 6);
  }, [personalTx, range]);

  const summary = useMemo(() => summarizeTransactions(personalTx), [personalTx]);

  // calculez media veniturilor si cheltuielilor pe luna (pentru carduri)
  const averageIncome = chartData.length
    ? Math.round(chartData.reduce((sum, item) => sum + item.venituri, 0) / chartData.length)
    : 0;

  const averageExpense = chartData.length
    ? Math.round(chartData.reduce((sum, item) => sum + item.cheltuieli, 0) / chartData.length)
    : 0;

  return (
    <div className="content-shell" ref={revealRef}>

      {/* header cu selector de interval */}
      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Cash Flow</p>
          <h1>Money movement</h1>
          <span>Income, expenses and net change over time</span>
        </div>

        <div className="segmented-mini large">
          <button type="button" className={range === '6m' ? 'active' : ''} onClick={() => setRange('6m')}>
            6 months
          </button>
          <button type="button" className={range === '12m' ? 'active' : ''} onClick={() => setRange('12m')}>
            12 months
          </button>
        </div>
      </header>

      {/* 4 carduri: total venituri, total cheltuieli, media veniturilor, media cheltuielilor */}
      <section className="transactions-summary-grid scroll-reveal">
        <div className="summary-card">
          <span>Total income</span>
          <strong className="positive">+{formatCurrency(summary.income)}</strong>
        </div>

        <div className="summary-card">
          <span>Total expenses</span>
          <strong className="negative">−{formatCurrency(summary.expense)}</strong>
        </div>

        <div className="summary-card">
          <span>Average income</span>
          <strong>{formatCurrency(averageIncome)}</strong>
        </div>

        <div className="summary-card">
          <span>Average expenses</span>
          <strong>{formatCurrency(averageExpense)}</strong>
        </div>
      </section>

      {/* grafic bar chart: venituri vs cheltuieli pe fiecare luna */}
      <section className="wide-panel scroll-reveal">
        <div className="panel-head">
          <div>
            <span className="section-mini-label">Overview</span>
            <h2>Income vs. expenses</h2>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={chartData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="venituri" fill="var(--income)" radius={[8, 8, 0, 0]} maxBarSize={36} />
            <Bar dataKey="cheltuieli" fill="var(--expense-soft)" radius={[8, 8, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* grafic area chart: soldul net cumulat pe luna */}
      <section className="wide-panel scroll-reveal">
        <div className="panel-head">
          <div>
            <span className="section-mini-label">Net flow</span>
            <h2>Monthly net position</h2>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="cashflowNetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="sold"
              stroke="var(--accent)"
              strokeWidth={3}
              fill="url(#cashflowNetGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
