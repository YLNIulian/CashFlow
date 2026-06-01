/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD PAGE — pagina principală după autentificare (/dashboard)
   Conține și widget-urile auxiliare:
   - SetupChecklist      → pași de onboarding pentru utilizatori noi
   - FinancialHealthScore → scor financiar vizual cu inel SVG
   - AIAdviceNudge       → sugestie rapidă bazată pe tranzacțiile lunii
   ═══════════════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

import {
  PlusIcon,
  ReportsIcon,
  SparkIcon,
  CalendarIcon,
  CheckIcon,
  ChevronIcon,
  TransactionsIcon,
  IncomeIcon,
  BudgetIcon,
  GoalsIcon,
  CashFlowIcon,
  AlertIcon,
} from '../shared/icons.jsx';

import { CATEGORIES, getCategoryInfo } from '../shared/constants.js';

import {
  getPersonalTransactions,
  summarizeTransactions,
  getMonthlyTransactions,
  buildMonthlySeries,
  buildDailyExpenseSeries,
  buildDailyNetSeries,
  buildCategoryBreakdown,
  formatCurrency,
  formatMoney,
  formatFullDateRo,
  formatRecentDayLabel,
  percentChange,
  safeNumber,
  getLocalDateKey,
} from '../shared/helpers.js';

import { useAnimatedNumber, useScrollReveal } from '../shared/hooks.jsx';
import { CategoryIconBubble, EmptyState, MiniSparkline, CustomTooltip } from '../shared/components.jsx';

/* ═══════════════════════════════════════════════════════════════════════
   WIDGET: SetupChecklist
   Afișat utilizatorilor noi care nu au completat toți pașii de setup.
   ═══════════════════════════════════════════════════════════════════════ */

function SetupChecklist({ transactions, onNavigate }) {
  const [hidden, setHidden] = useState(() => localStorage.getItem('laila-setup-hidden') === 'true');

  const hasTransactions = transactions.length > 0;
  const hasIncome = transactions.some((tx) => tx.type === 'income');
  const hasExpense = transactions.some((tx) => tx.type === 'expense');

  let hasBudget = false;
  try {
    const budgets = JSON.parse(localStorage.getItem('laila-budgets') || '{}');
    hasBudget = Object.values(budgets).some((value) => Number(value) > 0);
  } catch {
    hasBudget = false;
  }

  const items = [
    {
      id: 'connect',
      title: 'Add first transaction',
      description: 'Pornește dashboard-ul cu prima tranzacție.',
      done: hasTransactions,
      Icon: TransactionsIcon,
      action: () => onNavigate('/istoric'),
    },
    {
      id: 'income',
      title: 'Add income',
      description: 'Adaugă salariu, freelance sau alte venituri.',
      done: hasIncome,
      Icon: IncomeIcon,
      action: () => onNavigate('/dashboard'),
    },
    {
      id: 'expense',
      title: 'Add expense',
      description: 'Adaugă o cheltuială pentru rapoarte reale.',
      done: hasExpense,
      Icon: BudgetIcon,
      action: () => onNavigate('/dashboard'),
    },
    {
      id: 'budget',
      title: 'Create a budget',
      description: 'Setează limite lunare pentru categoriile principale.',
      done: hasBudget,
      Icon: GoalsIcon,
      action: () => onNavigate('/budget'),
    },
  ];

  const completed = items.filter((item) => item.done).length;
  const progress = Math.round((completed / items.length) * 100);

  if (hidden || completed === items.length) return null;

  return (
    <section className="setup-card scroll-reveal">
      <div className="setup-card-header">
        <div>
          <h2>Getting Started</h2>
          <p>Finalizează setup-ul ca Laila să îți poată calcula insight-uri mai bune.</p>
        </div>

        <button
          type="button"
          className="setup-hide"
          onClick={() => {
            localStorage.setItem('laila-setup-hidden', 'true');
            setHidden(true);
          }}
        >
          Hide
        </button>
      </div>

      <div className="setup-progress-bar">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="setup-items">
        {items.map((item, index) => {
          const Icon = item.Icon;

          return (
            <button
              key={item.id}
              type="button"
              className={`setup-item ${item.done ? 'done' : ''}`}
              onClick={item.action}
              style={{ '--delay': `${index * 60}ms` }}
            >
              <span className="setup-item-icon">
                {item.done ? <CheckIcon size={16} /> : <Icon size={18} />}
              </span>

              <span className="setup-item-copy">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>

              <span className="setup-item-status">
                {item.done ? 'Done' : <ChevronIcon size={15} />}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WIDGET: FinancialHealthScore
   Scor de sănătate financiară 0-100 calculat din tranzacții.
   ═══════════════════════════════════════════════════════════════════════ */

function FinancialHealthScore({ transactions }) {
  const score = useMemo(() => {
    if (!transactions.length) return 0;

    const summary = summarizeTransactions(transactions);
    const month = summarizeTransactions(getMonthlyTransactions(transactions));

    let points = 0;

    if (summary.income > 0) {
      const savingsRate = ((summary.income - summary.expense) / summary.income) * 100;

      if (savingsRate >= 25) points += 38;
      else if (savingsRate >= 15) points += 30;
      else if (savingsRate >= 5) points += 20;
      else if (savingsRate >= 0) points += 12;
    }

    const expenseCategories = new Set(
      transactions
        .filter((transaction) => transaction.type === 'expense')
        .map((transaction) => transaction.category)
    );
    points += Math.min(expenseCategories.size * 4, 20);

    const monthsWithActivity = new Set(
      transactions.map((transaction) => {
        const date = new Date(transaction.date);
        return `${date.getFullYear()}-${date.getMonth()}`;
      })
    );
    points += Math.min(monthsWithActivity.size * 8, 20);

    if (month.income > 0) {
      const monthlyRatio = month.expense / month.income;

      if (monthlyRatio <= 0.65) points += 22;
      else if (monthlyRatio <= 0.8) points += 16;
      else if (monthlyRatio <= 1) points += 9;
    }

    return Math.min(Math.max(Math.round(points), 0), 100);
  }, [transactions]);

  const animatedScore = useAnimatedNumber(score, 1200);

  const tier = score >= 80
    ? { label: 'Excellent', tone: 'great', copy: 'Ai un echilibru foarte bun între venituri, cheltuieli și economii.' }
    : score >= 60
      ? { label: 'Good', tone: 'good', copy: 'Ai un ritm stabil. Câteva ajustări pot crește scorul rapid.' }
      : score >= 40
        ? { label: 'Fair', tone: 'warn', copy: 'Există semne bune, dar bugetul are nevoie de mai mult control.' }
        : { label: 'Needs attention', tone: 'danger', copy: 'Începe cu o limită simplă de cheltuieli și un obiectiv de economisire.' };

  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score / 100) * circumference;

  return (
    <section className={`health-widget ${tier.tone} scroll-reveal`}>
      <div className="health-ring-wrap">
        <svg width="124" height="124" viewBox="0 0 124 124" className="health-ring">
          <circle cx="62" cy="62" r="44" className="health-ring-bg" />
          <circle
            cx="62"
            cy="62"
            r="44"
            className="health-ring-value"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
          <text x="62" y="61" textAnchor="middle" dominantBaseline="middle" className="health-score">
            {animatedScore}
          </text>
          <text x="62" y="82" textAnchor="middle" dominantBaseline="middle" className="health-score-sub">
            /100
          </text>
        </svg>
      </div>

      <div className="health-copy">
        <span className="health-pill">{tier.label}</span>
        <h3>Financial Health Score</h3>
        <p>{tier.copy}</p>
      </div>

      <div className="health-breakdown">
        <div>
          <span>Savings</span>
          <strong>{score >= 60 ? 'Stable' : 'Watch'}</strong>
        </div>
        <div>
          <span>Tracking</span>
          <strong>{transactions.length >= 5 ? 'Active' : 'New'}</strong>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WIDGET: AIAdviceNudge
   Afișează o alertă dacă cheltuielile depășesc 85% din venitul lunii.
   ═══════════════════════════════════════════════════════════════════════ */

function AIAdviceNudge({ transactions, onNavigate }) {
  const summary = summarizeTransactions(getMonthlyTransactions(transactions));
  const ratio = summary.income > 0 ? summary.expense / summary.income : 0;
  const showWarning = summary.income > 0 && ratio > 0.85;

  return (
    <section className={`ai-nudge ${showWarning ? 'warning' : ''} scroll-reveal`}>
      <div className="ai-nudge-icon">
        <SparkIcon size={19} />
      </div>

      <div className="ai-nudge-copy">
        <h3>{showWarning ? 'Cheltuielile sunt aproape de venit' : 'Insight rapid pregătit'}</h3>
        <p>
          {showWarning
            ? `Ai cheltuit ${Math.round(ratio * 100)}% din venitul lunii. Verifică top categoriile și ajustează limita.`
            : 'Verifică rapoartele, cash flow-ul sau bugetul pentru următorul pas financiar.'}
        </p>
      </div>

      <div className="ai-nudge-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onNavigate('/reports')}>
          Reports
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate('/budget')}>
          Budget
        </button>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD — componenta principală
   Props:
   - userNickname → numele utilizatorului autentificat
   - transactions → toate tranzacțiile
   - form / setForm / onSubmit / onTypeChange → state formular adăugare
   ═══════════════════════════════════════════════════════════════════════ */

export default function Dashboard({
  userNickname,
  transactions,
  form,
  setForm,
  onSubmit,
  onTypeChange,
}) {
  const navigate = useNavigate();
  const revealRef = useScrollReveal();

  const [quickOpen, setQuickOpen] = useState(null);
  const [trendRange, setTrendRange] = useState('month');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* ─── Filtrare și calcule ────────────────────────────────────────── */
  const personalTx = useMemo(() => getPersonalTransactions(transactions), [transactions]);

  const now = new Date();
  const thisMonthTx = useMemo(() => getMonthlyTransactions(personalTx, now), [personalTx]);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthTx = useMemo(() => getMonthlyTransactions(personalTx, lastMonthDate), [personalTx]);

  const totalSummary = useMemo(() => summarizeTransactions(personalTx), [personalTx]);
  const monthSummary = useMemo(() => summarizeTransactions(thisMonthTx), [thisMonthTx]);
  const lastMonthSummary = useMemo(() => summarizeTransactions(lastMonthTx), [lastMonthTx]);

  /* ─── Numere animate ─────────────────────────────────────────────── */
  const animatedBalance = useAnimatedNumber(totalSummary.balance, 1200);
  const animatedIncome = useAnimatedNumber(monthSummary.income, 900);
  const animatedExpense = useAnimatedNumber(monthSummary.expense, 900);
  const animatedRemaining = useAnimatedNumber(monthSummary.balance, 1000);

  /* ─── Serii grafice ──────────────────────────────────────────────── */
  const monthlySeries = useMemo(() => buildMonthlySeries(personalTx, 6), [personalTx]);
  const dailyNetSeries = useMemo(() => buildDailyNetSeries(personalTx, 14), [personalTx]);

  const expenseTrendData = useMemo(() => {
    if (trendRange === 'week') return buildDailyExpenseSeries(personalTx, 7);

    if (trendRange === 'quarter') {
      const monthly = buildMonthlySeries(personalTx, 3);
      return monthly.map((item) => ({ name: item.name, value: item.cheltuieli }));
    }

    return buildDailyExpenseSeries(personalTx, 30);
  }, [personalTx, trendRange]);

  const categoryData = useMemo(() => buildCategoryBreakdown(personalTx), [personalTx]);

  /* ─── Tranzacții recente grupate pe zile ─────────────────────────── */
  const recentTransactions = useMemo(() => {
    return [...personalTx]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12);
  }, [personalTx]);

  const groupedRecent = useMemo(() => {
    const grouped = recentTransactions.reduce((acc, transaction) => {
      const key = getLocalDateKey(transaction.date);

      if (!acc[key]) {
        acc[key] = {
          key,
          date: new Date(transaction.date),
          total: 0,
          items: [],
        };
      }

      acc[key].items.push(transaction);
      acc[key].total += transaction.type === 'income'
        ? safeNumber(transaction.amount)
        : -safeNumber(transaction.amount);

      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => b.date - a.date);
  }, [recentTransactions]);

  /* ─── Autocomplete descriere ─────────────────────────────────────── */
  const descriptionHistory = useMemo(() => {
    return [...new Set(personalTx.map((tx) => tx.description).filter(Boolean))].slice(0, 18);
  }, [personalTx]);

  /* ─── Date contextuale header ────────────────────────────────────── */
  const currentHour = now.getHours();
  const greeting = currentHour < 12
    ? `Good morning, ${userNickname || 'there'}`
    : currentHour < 18
      ? `Good afternoon, ${userNickname || 'there'}`
      : `Good evening, ${userNickname || 'there'}`;

  const monthVsLast = percentChange(monthSummary.expense, lastMonthSummary.expense);
  const remainingTone = monthSummary.balance >= 0 ? 'positive' : 'negative';

  const topCategory = categoryData[0];
  const expenseTotal = categoryData.reduce((sum, item) => sum + item.value, 0);

  /* ─── Handlers formular rapid ────────────────────────────────────── */
  const openQuickForm = (type) => {
    setQuickOpen((previous) => (previous === type ? null : type));
    setForm((previous) => ({
      ...previous,
      type,
      category: CATEGORIES[type][0].id,
    }));
  };

  const handleDescriptionChange = (value) => {
    setForm((previous) => ({ ...previous, description: value }));

    if (value.trim().length > 1) {
      const matches = descriptionHistory
        .filter((description) => description.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 6);

      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleQuickSubmit = async (event) => {
    const shouldClose = form.description && form.amount;
    await onSubmit(event);

    if (shouldClose) {
      setQuickOpen(null);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="content-shell dashboard-page" ref={revealRef}>

      {/* ── Header pagină ─────────────────────────────────────────── */}
      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Dashboard</p>
          <h1>{greeting}</h1>
          <span>{formatFullDateRo(now)}</span>
        </div>

        <div className="topbar-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/reports')}>
            <ReportsIcon size={16} />
            Reports
          </button>

          <button type="button" className="btn btn-primary" onClick={() => openQuickForm('expense')}>
            <PlusIcon size={16} />
            Add transaction
          </button>
        </div>
      </header>

      {/* ── Grid primar: balance hero + card cheltuieli luna ─────────── */}
      <section className="dashboard-grid-primary">
        <div className="balance-hero scroll-reveal">
          <div className="balance-hero-bg" />
          <div className="balance-hero-content">
            <div className="balance-label-row">
              <span>Total balance</span>
              <span className={`trend-pill ${totalSummary.balance >= 0 ? 'up' : 'down'}`}>
                {totalSummary.balance >= 0 ? 'Healthy' : 'Needs review'}
              </span>
            </div>

            {/* Fix 1: culoarea soldului e mereu neutra - nu mai e verde/rosu */}
            <div className="balance-amount">
              {formatCurrency(animatedBalance, { signed: true })}
            </div>

            <div className="balance-meta-grid">
              <div>
                <span>This month income</span>
                <strong className="positive">+{formatCurrency(animatedIncome)}</strong>
              </div>

              <div>
                <span>This month spent</span>
                <strong className="negative">−{formatCurrency(animatedExpense)}</strong>
              </div>

              <div>
                <span>Remaining</span>
                <strong className={remainingTone}>{formatCurrency(animatedRemaining, { signed: true })}</strong>
              </div>
            </div>
          </div>

          <div className="balance-spark">
            <MiniSparkline data={dailyNetSeries} positive={totalSummary.balance >= 0} />
          </div>
        </div>

        <div className="month-card scroll-reveal">
          <div className="month-card-top">
            <span>Spending this month</span>
            <button type="button" onClick={() => navigate('/cashflow')}>
              View cash flow
            </button>
          </div>

          <strong>{formatCurrency(monthSummary.expense)}</strong>

          <p className={monthVsLast <= 0 ? 'positive' : 'negative'}>
            {monthVsLast >= 0 ? '+' : ''}
            {monthVsLast}% vs. last month
          </p>

          <div className="month-mini-chart">
            <ResponsiveContainer width="100%" height={116}>
              <AreaChart data={expenseTrendData}>
                <defs>
                  <linearGradient id="monthSpendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--accent)"
                  strokeWidth={2.6}
                  fill="url(#monthSpendGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── Setup checklist (utilizatori noi) ─────────────────────── */}
      <SetupChecklist transactions={personalTx} onNavigate={navigate} />

      {/* ── Formular rapid adăugare tranzacție ───────────────────── */}
      <section className="quick-drawer-card scroll-reveal">
        <div className="quick-drawer-head">
          <div>
            <span className="section-mini-label">Quick actions</span>
            <h2>Add something fast</h2>
          </div>

          <div className="quick-action-row">
            <button
              type="button"
              className={`quick-chip ${quickOpen === 'expense' ? 'active expense' : ''}`}
              onClick={() => openQuickForm('expense')}
            >
              <PlusIcon size={14} />
              Expense
            </button>

            <button
              type="button"
              className={`quick-chip ${quickOpen === 'income' ? 'active income' : ''}`}
              onClick={() => openQuickForm('income')}
            >
              Income
            </button>

            <button type="button" className="quick-chip" onClick={() => navigate('/goals')}>
              <GoalsIcon size={14} />
              Goal
            </button>
          </div>
        </div>

        <div className={`quick-form-area ${quickOpen ? 'open' : ''}`}>
          <form className="quick-form-grid" onSubmit={handleQuickSubmit}>
            <label>
              Type
              <select
                value={form.type}
                onChange={(event) => {
                  setQuickOpen(event.target.value);
                  onTypeChange(event);
                }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(event) => setForm((previous) => ({ ...previous, category: event.target.value }))}
              >
                {CATEGORIES[form.type].map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="description-field">
              Description
              <input
                value={form.description}
                onChange={(event) => handleDescriptionChange(event.target.value)}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 130)}
                placeholder="Starbucks, Rent, Paycheck..."
              />

              {showSuggestions && (
                <div className="autocomplete-menu">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setForm((previous) => ({ ...previous, description: suggestion }));
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </label>

            <label>
              Amount
              <input
                type="number"
                value={form.amount}
                onChange={(event) => setForm((previous) => ({
                  ...previous,
                  amount: event.target.value === '' ? '' : Number(event.target.value),
                }))}
                placeholder="0"
              />
            </label>

            <button type="submit" className={`quick-submit-btn ${form.type}`}>
              Add
            </button>
          </form>
        </div>
      </section>

      {/* ── Grid secundar: Health Score + AI Nudge ─────────────────── */}
      <section className="dashboard-grid-secondary">
        <FinancialHealthScore transactions={personalTx} />
        <AIAdviceNudge transactions={personalTx} onNavigate={navigate} />
      </section>

      {/* ── Analytics board: trend cheltuieli + categorii ────────── */}
      <section className="analytics-board scroll-reveal">
        <div className="analytics-main">
          <div className="panel-head">
            <div>
              <span className="section-mini-label">Trends</span>
              <h2>Spending over time</h2>
            </div>

            <div className="segmented-mini">
              {[
                { id: 'week', label: '7D' },
                { id: 'month', label: '30D' },
                { id: 'quarter', label: '3M' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={trendRange === item.id ? 'active' : ''}
                  onClick={() => setTrendRange(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {expenseTrendData.every((item) => item.value === 0) ? (
            <EmptyState
              icon={CashFlowIcon}
              title="No spending trend yet"
              description="Add a few expense transactions to see your flow."
            />
          ) : (
            <div className="large-chart">
              <ResponsiveContainer width="100%" height={310}>
                <AreaChart data={expenseTrendData}>
                  <defs>
                    <linearGradient id="expenseTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.26} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--accent)"
                    strokeWidth={2.8}
                    fill="url(#expenseTrendGradient)"
                    activeDot={{ r: 5 }}
                    dot={{ r: 2.6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="analytics-side">
          <div className="panel-head compact">
            <div>
              <span className="section-mini-label">Categories</span>
              <h2>Where money went</h2>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <EmptyState
              icon={ReportsIcon}
              title="No categories yet"
              description="Your category breakdown appears here."
            />
          ) : (
            <>
              <div className="donut-wrap">
                <ResponsiveContainer width="100%" height={208}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={86}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} stroke="var(--surface)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="donut-center">
                  <span>Total</span>
                  <strong>{formatMoney(expenseTotal, true)}</strong>
                </div>
              </div>

              <div className="category-list">
                {categoryData.slice(0, 5).map((category) => {
                  const percentage = expenseTotal > 0
                    ? Math.round((category.value / expenseTotal) * 100)
                    : 0;

                  return (
                    <div key={category.id} className="category-row">
                      <div>
                        <CategoryIconBubble info={category} size={15} />
                        <span>{category.label}</span>
                      </div>

                      <div>
                        <strong>{percentage}%</strong>
                        <span>{formatCurrency(category.value, { compact: true })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Grid inferior: Cash Flow 6 luni + Tranzacții recente ──── */}
      <section className="dashboard-lower-grid">
        <div className="cashflow-panel scroll-reveal">
          <div className="panel-head">
            <div>
              <span className="section-mini-label">Cash Flow</span>
              <h2>Six-month overview</h2>
            </div>

            <button type="button" className="text-action" onClick={() => navigate('/cashflow')}>
              View details
            </button>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlySeries} barGap={7}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="venituri" radius={[7, 7, 0, 0]} fill="var(--income)" maxBarSize={26} />
              <Bar dataKey="cheltuieli" radius={[7, 7, 0, 0]} fill="var(--expense-soft)" maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="recent-panel scroll-reveal">
          <div className="panel-head">
            <div>
              <span className="section-mini-label">Recent</span>
              <h2>Latest transactions</h2>
            </div>

            <button type="button" className="text-action" onClick={() => navigate('/istoric')}>
              View all
            </button>
          </div>

          {groupedRecent.length === 0 ? (
            <EmptyState
              icon={TransactionsIcon}
              title="No transactions yet"
              description="Your latest activity will appear here."
              action={() => openQuickForm('expense')}
              actionLabel="Add first transaction"
            />
          ) : (
            <div className="recent-groups">
              {groupedRecent.map((group) => (
                <div key={group.key} className="recent-group">
                  <div className="recent-group-head">
                    <span>{formatRecentDayLabel(group.date)}</span>
                    <strong className={group.total >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(group.total, { signed: true })}
                    </strong>
                  </div>

                  {group.items.map((transaction) => {
                    const info = getCategoryInfo(transaction.category);

                    return (
                      <div key={transaction._id} className="transaction-line">
                        <div className="transaction-line-left">
                          <CategoryIconBubble info={info} size={15} />
                          <div>
                            <strong>{transaction.description}</strong>
                            <span>{info.label}</span>
                          </div>
                        </div>

                        <span className={transaction.type === 'income' ? 'positive' : 'negative'}>
                          {transaction.type === 'income' ? '+' : '−'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Insight strip: top categorie + ritm lunar ─────────────── */}
      <section className="insight-strip scroll-reveal">
        <div className="insight-strip-card">
          <span className="strip-icon">
            <SparkIcon size={18} />
          </span>

          <div>
            <strong>
              {topCategory
                ? `${topCategory.label} is your largest spending category`
                : 'Your spending pattern will appear here'}
            </strong>

            <p>
              {topCategory
                ? `${formatCurrency(topCategory.value)} spent. Review this category if you want a quick win.`
                : 'Add more transactions and Laila will identify patterns automatically.'}
            </p>
          </div>
        </div>

        <div className="insight-strip-card muted">
          <span className="strip-icon">
            <CalendarIcon size={18} />
          </span>

          <div>
            <strong>Monthly rhythm</strong>
            <p>
              {monthSummary.expense > 0
                ? `${formatCurrency(monthSummary.expense)} spent so far this month.`
                : 'No spending logged this month yet.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
