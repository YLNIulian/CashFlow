/* ═══════════════════════════════════════════════════════════════════════
   BUDGET PAGE — planificarea bugetului lunar (/budget)
   Folosit și pentru /couple/budget și /business/budget.
   Conține: grid metrici, tabel categorii (planificat/actual/rămas),
            sidebar cu rezumat și sfaturi.
   ═══════════════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react';

import { SparkIcon } from '../shared/icons.jsx';
import { CATEGORIES } from '../shared/constants.js';

import {
  getPersonalTransactions,
  getBusinessTransactions,
  summarizeTransactions,
  getMonthlyTransactions,
  formatCurrency,
  safeNumber,
  capFirst,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';
import { CategoryIconBubble } from '../shared/components.jsx';

/* ═══════════════════════════════════════════════════════════════════════
   BUDGET PAGE COMPONENT
   Props:
   - transactions → toate tranzacțiile
   - scope        → 'personal' | 'couples' | 'business'
   ═══════════════════════════════════════════════════════════════════════ */

export default function BudgetPage({ transactions, scope = 'personal' }) {
  const revealRef = useScrollReveal();
  const [activeTab, setActiveTab] = useState('expenses');
  const [selectedCategory, setSelectedCategory] = useState(null);

  /* ─── Bugetele sunt stocate în localStorage ──────────────────────── */
  const [budgets, setBudgets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laila-budgets') || '{}');
    } catch {
      return {};
    }
  });

  /* ─── Filtrare tranzacții pe scope ───────────────────────────────── */
  const scopedTx = useMemo(() => {
    if (scope === 'business') return getBusinessTransactions(transactions);
    if (scope === 'couples') return transactions.filter((transaction) => transaction.scope === 'couples');
    return getPersonalTransactions(transactions);
  }, [transactions, scope]);

  const monthTx = useMemo(() => getMonthlyTransactions(scopedTx), [scopedTx]);
  const monthSummary = useMemo(() => summarizeTransactions(monthTx), [monthTx]);

  /* ─── Categorii în funcție de scope ─────────────────────────────── */
  const expenseCategories = scope === 'business' ? CATEGORIES.business_expense : CATEGORIES.expense;
  const incomeCategories = scope === 'business' ? CATEGORIES.business_income : CATEGORIES.income;

  /* ─── Cheltuieli și venituri reale per categorie (luna curentă) ─── */
  const spendingByCategory = useMemo(() => {
    return monthTx.reduce((acc, transaction) => {
      if (transaction.type !== 'expense') return acc;
      acc[transaction.category] = (acc[transaction.category] || 0) + safeNumber(transaction.amount);
      return acc;
    }, {});
  }, [monthTx]);

  const incomeByCategory = useMemo(() => {
    return monthTx.reduce((acc, transaction) => {
      if (transaction.type !== 'income') return acc;
      acc[transaction.category] = (acc[transaction.category] || 0) + safeNumber(transaction.amount);
      return acc;
    }, {});
  }, [monthTx]);

  /* ─── Cheia bugetului: include scope-ul pentru separare ─────────── */
  const budgetKey = (categoryId) => `${scope}-${categoryId}`;

  /* ─── Totaluri planificate ───────────────────────────────────────── */
  const totalPlannedExpenses = expenseCategories.reduce(
    (sum, category) => sum + safeNumber(budgets[budgetKey(category.id)]),
    0
  );

  const totalPlannedIncome = incomeCategories.reduce(
    (sum, category) => sum + safeNumber(budgets[budgetKey(`income-${category.id}`)]),
    0
  );

  /* ─── Categorii fixe (primele 3) vs. flexibile (restul) ─────────── */
  const fixedCategories = expenseCategories.slice(0, 3);
  const flexibleCategories = expenseCategories.slice(3);

  const fixedSpent = fixedCategories.reduce(
    (sum, category) => sum + safeNumber(spendingByCategory[category.id]),
    0
  );

  const flexSpent = flexibleCategories.reduce(
    (sum, category) => sum + safeNumber(spendingByCategory[category.id]),
    0
  );

  const plannedFixed = fixedCategories.reduce(
    (sum, category) => sum + safeNumber(budgets[budgetKey(category.id)]),
    0
  );

  const plannedFlexible = flexibleCategories.reduce(
    (sum, category) => sum + safeNumber(budgets[budgetKey(category.id)]),
    0
  );

  /* ─── Calcule rezumat ────────────────────────────────────────────── */
  const remainingBudget = monthSummary.income - monthSummary.expense;
  const plannedRemaining = totalPlannedIncome - totalPlannedExpenses;
  const budgetUsage = totalPlannedExpenses > 0
    ? Math.min(Math.round((monthSummary.expense / totalPlannedExpenses) * 100), 100)
    : 0;

  const overBudgetCount = expenseCategories.filter((category) => {
    const planned = safeNumber(budgets[budgetKey(category.id)]);
    const actual = safeNumber(spendingByCategory[category.id]);
    return planned > 0 && actual > planned;
  }).length;

  /* ─── Salvare buget în localStorage ─────────────────────────────── */
  const updateBudget = (key, value) => {
    const next = {
      ...budgets,
      [key]: Number(value || 0),
    };

    setBudgets(next);
    localStorage.setItem('laila-budgets', JSON.stringify(next));
  };

  /* ─── Auto-plan pe baza venitului lunar ──────────────────────────── */
  const quickPlan = () => {
    const next = { ...budgets };
    const incomeBase = monthSummary.income || 10000;

    expenseCategories.forEach((category, index) => {
      const ratios = [0.28, 0.12, 0.1, 0.08, 0.07, 0.1, 0.05];
      next[budgetKey(category.id)] = Math.round(incomeBase * (ratios[index] || 0.05));
    });

    incomeCategories.forEach((category, index) => {
      if (index === 0) next[budgetKey(`income-${category.id}`)] = Math.round(incomeBase * 0.85);
      else if (index === 1) next[budgetKey(`income-${category.id}`)] = Math.round(incomeBase * 0.15);
      else next[budgetKey(`income-${category.id}`)] = 0;
    });

    setBudgets(next);
    localStorage.setItem('laila-budgets', JSON.stringify(next));
  };

  /* ─── Resetare buget ─────────────────────────────────────────────── */
  const resetBudget = () => {
    const next = { ...budgets };

    [...expenseCategories, ...incomeCategories].forEach((category) => {
      delete next[budgetKey(category.id)];
      delete next[budgetKey(`income-${category.id}`)];
    });

    setBudgets(next);
    localStorage.setItem('laila-budgets', JSON.stringify(next));
  };

  /* ─── Render rând categorie ──────────────────────────────────────── */
  const renderCategoryRows = (categories, type) => {
    const source = type === 'income' ? incomeByCategory : spendingByCategory;

    return categories.map((category, index) => {
      const actual = safeNumber(source[category.id]);
      const key = type === 'income'
        ? budgetKey(`income-${category.id}`)
        : budgetKey(category.id);
      const planned = safeNumber(budgets[key]);
      const remaining = type === 'income'
        ? actual - planned
        : planned - actual;
      const percent = planned > 0
        ? Math.min(Math.round((actual / planned) * 100), 100)
        : actual > 0
          ? 100
          : 0;
      const isOver = type === 'expense' && planned > 0 && actual > planned;

      return (
        <div
          key={category.id}
          className={`budget-row ${selectedCategory === category.id ? 'selected' : ''}`}
          style={{ '--delay': `${index * 45}ms` }}
          onClick={() => setSelectedCategory(category.id)}
        >
          <div className="budget-category">
            <CategoryIconBubble info={category} size={16} />
            <div>
              <strong>{category.label}</strong>
              <span>{isOver ? 'Over budget' : type === 'income' ? 'Income plan' : 'Monthly limit'}</span>
            </div>
          </div>

          <div className="budget-cell planned">
            <input
              type="number"
              value={budgets[key] || ''}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => updateBudget(key, event.target.value)}
              placeholder="0"
            />
          </div>

          <div className="budget-cell actual">
            {formatCurrency(actual)}
          </div>

          <div className={`budget-cell remaining ${remaining >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(remaining, { signed: true })}
          </div>

          <div className="budget-progress-line">
            <span
              className={isOver ? 'over' : 'ok'}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      );
    });
  };

  return (
    <div className="content-shell budget-page" ref={revealRef}>

      {/* ── Header cu acțiuni ────────────────────────────────────────── */}
      <header className="budget-toolbar scroll-reveal">
        <div>
          <p className="page-kicker">{scope === 'business' ? 'Business Budget' : 'Budget'}</p>
          <h1>{capFirst(new Date().toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' }))}</h1>
          <span>Planificat vs. actual pentru luna curentă</span>
        </div>

        <div className="budget-toolbar-actions">
          <button type="button" className="btn btn-ghost" onClick={quickPlan}>
            <SparkIcon size={15} />
            Auto plan
          </button>
          <button type="button" className="btn btn-ghost" onClick={resetBudget}>
            Reset
          </button>
        </div>
      </header>

      {/* ── Grid 4 metrici ───────────────────────────────────────────── */}
      <section className="budget-overview-grid scroll-reveal">
        <div className="budget-metric-card">
          <span>Left to budget</span>
          <strong className={remainingBudget >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(remainingBudget, { signed: true })}
          </strong>
          <p>Venit real minus cheltuieli reale luna aceasta.</p>
        </div>

        <div className="budget-metric-card">
          <span>Planned balance</span>
          <strong className={plannedRemaining >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(plannedRemaining, { signed: true })}
          </strong>
          <p>Venit planificat minus cheltuieli planificate.</p>
        </div>

        <div className="budget-metric-card">
          <span>Budget used</span>
          <strong>{budgetUsage}%</strong>
          <div className="budget-mini-track">
            <span style={{ width: `${budgetUsage}%` }} />
          </div>
        </div>

        <div className="budget-metric-card">
          <span>Over budget</span>
          <strong className={overBudgetCount > 0 ? 'negative' : 'positive'}>
            {overBudgetCount}
          </strong>
          <p>{overBudgetCount > 0 ? 'Categorii depășite.' : 'Toate limitele sunt ok.'}</p>
        </div>
      </section>

      {/* ── Layout principal: tabel + sidebar ────────────────────────── */}
      <section className="budget-layout">
        <div className="budget-main scroll-reveal">
          {/* Tab-uri Income / Expenses */}
          <div className="budget-tabs">
            <button
              type="button"
              className={activeTab === 'income' ? 'active' : ''}
              onClick={() => setActiveTab('income')}
            >
              Income
            </button>
            <button
              type="button"
              className={activeTab === 'expenses' ? 'active' : ''}
              onClick={() => setActiveTab('expenses')}
            >
              Expenses
            </button>
          </div>

          {/* Header coloane tabel */}
          <div className="budget-header-row">
            <span />
            <span>Planned</span>
            <span>Actual</span>
            <span>Remaining</span>
          </div>

          {/* Rânduri categorii */}
          <div className="budget-group tab-pane-enter" key={activeTab}>
            {activeTab === 'income' ? (
              <>
                <div className="budget-group-title">
                  <span>Income</span>
                  <strong>{formatCurrency(totalPlannedIncome)} planned</strong>
                </div>
                {renderCategoryRows(incomeCategories, 'income')}
              </>
            ) : (
              <>
                <div className="budget-group-title">
                  <span>Fixed</span>
                  <strong>{formatCurrency(plannedFixed)} planned</strong>
                </div>
                {renderCategoryRows(fixedCategories, 'expense')}

                <div className="budget-group-title secondary">
                  <span>Flexible</span>
                  <strong>{formatCurrency(plannedFlexible)} planned</strong>
                </div>
                {renderCategoryRows(flexibleCategories, 'expense')}
              </>
            )}
          </div>
        </div>

        {/* Sidebar rezumat */}
        <aside className="budget-sidebar scroll-reveal">
          <div className="budget-remaining-card">
            <strong className={remainingBudget >= 0 ? 'positive' : 'negative'}>
              {formatCurrency(remainingBudget)}
            </strong>
            <span>Left to budget</span>
          </div>

          <div className="budget-summary-tabs">
            <button type="button" className={activeTab === 'income' ? 'active' : ''} onClick={() => setActiveTab('income')}>
              Income
            </button>
            <button type="button" className={activeTab === 'expenses' ? 'active' : ''} onClick={() => setActiveTab('expenses')}>
              Expenses
            </button>
          </div>

          <div className="budget-summary-list">
            <div>
              <div>
                <span>Fixed</span>
                <strong>{formatCurrency(plannedFixed)} planned</strong>
              </div>
              <div className="summary-progress">
                <span style={{ width: `${Math.min((fixedSpent / Math.max(plannedFixed, 1)) * 100, 100)}%` }} />
              </div>
              <p>
                <strong>{formatCurrency(fixedSpent)} spent</strong>
                <em>{formatCurrency(Math.max(plannedFixed - fixedSpent, 0))} left</em>
              </p>
            </div>

            <div>
              <div>
                <span>Flexible</span>
                <strong>{formatCurrency(plannedFlexible)} planned</strong>
              </div>
              <div className="summary-progress alt">
                <span style={{ width: `${Math.min((flexSpent / Math.max(plannedFlexible, 1)) * 100, 100)}%` }} />
              </div>
              <p>
                <strong>{formatCurrency(flexSpent)} spent</strong>
                <em>{formatCurrency(Math.max(plannedFlexible - flexSpent, 0))} left</em>
              </p>
            </div>
          </div>

          <div className="budget-tip">
            <SparkIcon size={16} />
            <p>
              Auto plan completează limitele pe baza venitului lunar. Poți edita orice sumă direct în tabel.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
