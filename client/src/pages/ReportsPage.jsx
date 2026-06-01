/* ═══════════════════════════════════════════════════════════════════════
   REPORTS PAGE — rapoarte financiare detaliate (/reports)
   Folosit și pentru /business/reports (scope='business').
   Tab-uri: Summary (net în timp) | Categories (donut + rank) | Monthly (bar)
   ═══════════════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ReportsIcon } from '../shared/icons.jsx';
import { getCategoryInfo } from '../shared/constants.js';

import {
  getPersonalTransactions,
  getBusinessTransactions,
  summarizeTransactions,
  buildMonthlySeries,
  buildCategoryBreakdown,
  formatCurrency,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';
import { CategoryIconBubble, EmptyState, CustomTooltip } from '../shared/components.jsx';

/* ═══════════════════════════════════════════════════════════════════════
   REPORTS PAGE COMPONENT
   Props:
   - transactions → toate tranzacțiile
   - scope        → 'personal' | 'business' | 'couples'
   ═══════════════════════════════════════════════════════════════════════ */

export default function ReportsPage({ transactions, scope = 'personal' }) {
  const revealRef = useScrollReveal();
  const [activeTab, setActiveTab] = useState('summary');

  /* ─── Filtrare pe scope ──────────────────────────────────────────── */
  const scopedTransactions = useMemo(() => {
    if (scope === 'business') return getBusinessTransactions(transactions);
    if (scope === 'couples') return transactions.filter((transaction) => transaction.scope === 'couples');
    return getPersonalTransactions(transactions);
  }, [transactions, scope]);

  const summary = useMemo(() => summarizeTransactions(scopedTransactions), [scopedTransactions]);
  const monthly = useMemo(() => buildMonthlySeries(scopedTransactions, 6), [scopedTransactions]);
  const categories = useMemo(() => buildCategoryBreakdown(scopedTransactions), [scopedTransactions]);

  return (
    <div className="content-shell reports-page" ref={revealRef}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">
            {scope === 'business' ? 'Business Reports' : scope === 'couples' ? 'Couples Reports' : 'Reports'}
          </p>
          <h1>Financial reports</h1>
          <span>Deep-dive into your spending, categories and trends</span>
        </div>
      </header>

      {/* ── Tab-uri navigare ─────────────────────────────────────────── */}
      <div className="report-tabs scroll-reveal">
        {[
          { id: 'summary', label: 'Summary' },
          { id: 'categories', label: 'Categories' },
          { id: 'monthly', label: 'Monthly' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Carduri sumar ────────────────────────────────────────────── */}
      <section className="transactions-summary-grid scroll-reveal">
        <div className="summary-card">
          <span>Income</span>
          <strong className="positive">+{formatCurrency(summary.income)}</strong>
        </div>

        <div className="summary-card">
          <span>Expenses</span>
          <strong className="negative">−{formatCurrency(summary.expense)}</strong>
        </div>

        <div className="summary-card">
          <span>Net</span>
          <strong className={summary.balance >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(summary.balance, { signed: true })}
          </strong>
        </div>

        <div className="summary-card">
          <span>Savings rate</span>
          <strong>
            {summary.income > 0
              ? `${Math.round(((summary.income - summary.expense) / summary.income) * 100)}%`
              : '—'}
          </strong>
        </div>
      </section>

      {/* ── Conținut tab activ ───────────────────────────────────────── */}
      <div className="report-tab-stage scroll-reveal">

        {/* Tab: Summary — sold net în timp (AreaChart) */}
        {activeTab === 'summary' && (
          <section className="wide-panel tab-pane-enter">
            <div className="panel-head">
              <div>
                <span className="section-mini-label">Summary</span>
                <h2>Net over time</h2>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="reportNetGradient" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#reportNetGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Tab: Categories — donut chart + ranking */}
        {activeTab === 'categories' && (
          <section className="reports-category-layout tab-pane-enter">
            <div className="wide-panel">
              <div className="panel-head">
                <div>
                  <span className="section-mini-label">Categories</span>
                  <h2>Expense distribution</h2>
                </div>
              </div>

              {categories.length === 0 ? (
                <EmptyState
                  icon={ReportsIcon}
                  title="No expense data"
                  description="Add expenses to build this report."
                />
              ) : (
                <div className="reports-donut-big">
                  <ResponsiveContainer width="100%" height={340}>
                    <PieChart>
                      <Pie
                        data={categories}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={82}
                        outerRadius={130}
                        paddingAngle={3}
                      >
                        {categories.map((category) => (
                          <Cell key={category.id} fill={category.color} stroke="var(--surface)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="wide-panel">
              <div className="panel-head compact">
                <div>
                  <span className="section-mini-label">Rank</span>
                  <h2>Top categories</h2>
                </div>
              </div>

              <div className="rank-list">
                {categories.map((category, index) => {
                  const percent = summary.expense > 0 ? Math.round((category.value / summary.expense) * 100) : 0;

                  return (
                    <div key={category.id} className="rank-row">
                      <span className="rank-number">{String(index + 1).padStart(2, '0')}</span>
                      <CategoryIconBubble info={category} />
                      <div>
                        <strong>{category.label}</strong>
                        <span>{percent}% of expenses</span>
                      </div>
                      <em>{formatCurrency(category.value)}</em>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Tab: Monthly — venituri și cheltuieli per lună (BarChart) */}
        {activeTab === 'monthly' && (
          <section className="wide-panel tab-pane-enter">
            <div className="panel-head">
              <div>
                <span className="section-mini-label">Monthly</span>
                <h2>Income and spending by month</h2>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={monthly} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="venituri" fill="var(--income)" radius={[8, 8, 0, 0]} maxBarSize={34} />
                <Bar dataKey="cheltuieli" fill="var(--expense-soft)" radius={[8, 8, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}
      </div>
    </div>
  );
}
