// DashboardPage.jsx (business) - dashboardul pentru modul Business (/business/dashboard)
// Arata: revenue, cheltuieli, profit si marja de profit
// plus un grafic bar chart cu evolutia lunara a veniturilor vs cheltuielilor

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getBusinessTransactions,
  summarizeTransactions,
  buildMonthlySeries,
  formatCurrency,
} from '../../shared/helpers.js';

import { useScrollReveal } from '../../shared/hooks.jsx';
import { CustomTooltip } from '../../shared/components.jsx';

export default function BusinessDashboardPage({ transactions }) {
  const revealRef = useScrollReveal();

  // filtrez doar tranzactiile cu scope 'business'
  const businessTx = useMemo(() => getBusinessTransactions(transactions), [transactions]);
  const summary = useMemo(() => summarizeTransactions(businessTx), [businessTx]);
  const monthly = useMemo(() => buildMonthlySeries(businessTx, 6), [businessTx]);

  // calculez marja de profit: (profit / revenue) * 100
  const profitMargin = summary.income > 0
    ? Math.round((summary.balance / summary.income) * 100)
    : 0;

  return (
    <div className="content-shell business-page" ref={revealRef}>

      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Business</p>
          <h1>Business dashboard</h1>
          <span>Revenue, operating costs and profit overview</span>
        </div>
      </header>

      {/* 4 carduri: revenue, cheltuieli, profit, marja */}
      <section className="transactions-summary-grid scroll-reveal">
        <div className="summary-card">
          <span>Revenue</span>
          <strong className="positive">+{formatCurrency(summary.income)}</strong>
        </div>
        <div className="summary-card">
          <span>Expenses</span>
          <strong className="negative">−{formatCurrency(summary.expense)}</strong>
        </div>
        <div className="summary-card">
          <span>Profit</span>
          <strong className={summary.balance >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(summary.balance, { signed: true })}
          </strong>
        </div>
        <div className="summary-card">
          <span>Margin</span>
          <strong>{profitMargin}%</strong>
        </div>
      </section>

      {/* graficul cu revenue vs cheltuieli pe ultimele 6 luni */}
      <section className="wide-panel scroll-reveal">
        <div className="panel-head">
          <div>
            <span className="section-mini-label">Performance</span>
            <h2>Revenue vs expenses</h2>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={monthly} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="venituri" fill="var(--income)" radius={[8, 8, 0, 0]} maxBarSize={34} />
            <Bar dataKey="cheltuieli" fill="var(--business)" radius={[8, 8, 0, 0]} maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
