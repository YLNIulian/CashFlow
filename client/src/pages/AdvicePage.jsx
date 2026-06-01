/* ═══════════════════════════════════════════════════════════════════════
   ADVICE PAGE — recomandări financiare personalizate (/advice)
   Recomandările sunt generate dinamic din datele de tranzacții.
   Filtrate pe categorii: Save / Spend / Invest / etc.
   ═══════════════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react';

import {
  AlertIcon,
  CheckIcon,
  GoalsIcon,
  CashFlowIcon,
  InvestmentsIcon,
  ChevronIcon,
} from '../shared/icons.jsx';

import {
  getPersonalTransactions,
  summarizeTransactions,
  buildCategoryBreakdown,
  formatCurrency,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';

/* ═══════════════════════════════════════════════════════════════════════
   ADVICE PAGE COMPONENT
   Props:
   - transactions → toate tranzacțiile
   ═══════════════════════════════════════════════════════════════════════ */

export default function AdvicePage({ transactions }) {
  const revealRef = useScrollReveal();
  const [activeCategory, setActiveCategory] = useState('recommendations');

  const personalTx = useMemo(() => getPersonalTransactions(transactions), [transactions]);
  const summary = useMemo(() => summarizeTransactions(personalTx), [personalTx]);
  const categoryData = useMemo(() => buildCategoryBreakdown(personalTx), [personalTx]);

  const biggest = categoryData[0];

  /* ─── Generare recomandări dinamice ──────────────────────────────── */
  const recommendations = useMemo(() => {
    const items = [];

    /* Rată de economisire */
    if (summary.income > 0) {
      const rate = Math.round(((summary.income - summary.expense) / summary.income) * 100);

      if (rate < 10) {
        items.push({
          id: 'savings',
          Icon: AlertIcon,
          tone: 'warning',
          tag: 'SAVE',
          title: 'Increase savings rate',
          description: `Your current savings rate is ${rate}%. Try setting one automatic transfer or reduce one flexible category.`,
          progress: Math.max(rate, 8),
          tasks: 5,
        });
      } else {
        items.push({
          id: 'savings-good',
          Icon: CheckIcon,
          tone: 'good',
          tag: 'SAVE',
          title: 'Savings rhythm looks healthy',
          description: `You are saving around ${rate}% based on tracked income and expenses. Keep the rhythm.`,
          progress: Math.min(rate, 100),
          tasks: 3,
        });
      }
    }

    /* Cea mai mare categorie de cheltuieli */
    if (biggest) {
      items.push({
        id: 'spend',
        Icon: biggest.Icon,
        tone: 'spend',
        tag: 'SPEND',
        title: `Review ${biggest.label}`,
        description: `${formatCurrency(biggest.value)} is currently your largest tracked spending area. A small limit here can have a big effect.`,
        progress: summary.expense > 0 ? Math.round((biggest.value / summary.expense) * 100) : 0,
        tasks: 4,
      });
    }

    /* Fond de urgență */
    items.push({
      id: 'home',
      Icon: GoalsIcon,
      tone: 'save',
      tag: 'SAVE',
      title: 'Build an emergency fund',
      description: 'A simple first target is one month of expenses. Then increase towards three to six months.',
      progress: summary.expense > 0 && summary.balance > 0
        ? Math.min(Math.round((summary.balance / summary.expense) * 100), 100)
        : 10,
      tasks: 7,
    });

    /* Urmărire cash flow */
    items.push({
      id: 'cashflow',
      Icon: CashFlowIcon,
      tone: 'cash',
      tag: 'SPEND',
      title: 'Track cash flow weekly',
      description: 'Check your net flow once a week to catch overspending early, not at the end of the month.',
      progress: personalTx.length > 0 ? 45 : 5,
      tasks: 6,
    });

    /* Pregătire pentru investiții */
    items.push({
      id: 'invest',
      Icon: InvestmentsIcon,
      tone: 'invest',
      tag: 'INVEST',
      title: 'Prepare for investing',
      description: 'Before investing, stabilize emergency savings and remove high-interest debt if present.',
      progress: summary.balance > 0 ? 35 : 8,
      tasks: 4,
    });

    return items;
  }, [summary, biggest, personalTx.length]);

  /* ─── Filtre categorii din sidebar ──────────────────────────────── */
  const categories = [
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'save', label: 'Save up' },
    { id: 'spend', label: 'Spend' },
    { id: 'paydown', label: 'Pay down' },
    { id: 'protect', label: 'Protect' },
    { id: 'invest', label: 'Invest' },
    { id: 'wellness', label: 'Wellness' },
  ];

  const filteredRecommendations = activeCategory === 'recommendations'
    ? recommendations
    : recommendations.filter((item) => {
      if (activeCategory === 'save') return item.tag === 'SAVE';
      if (activeCategory === 'spend') return item.tag === 'SPEND';
      if (activeCategory === 'invest') return item.tag === 'INVEST';
      return true;
    });

  return (
    <div className="content-shell advice-page" ref={revealRef}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Guidance</p>
          <h1>Recommendations</h1>
          <span>Prioritized ideas based on your current financial picture</span>
        </div>
      </header>

      <section className="advice-layout">

        {/* ── Lista de recomandări ──────────────────────────────────── */}
        <main className="advice-main scroll-reveal">
          <div className="advice-card-head">
            <h2>Prioritized by your data</h2>
            <button type="button" onClick={() => setActiveCategory('recommendations')}>Reset</button>
          </div>

          <div className="advice-list tab-pane-enter" key={activeCategory}>
            {filteredRecommendations.map((item, index) => {
              const Icon = item.Icon;

              return (
                <article key={item.id} className={`advice-item ${item.tone}`} style={{ '--delay': `${index * 60}ms` }}>
                  <div className="advice-item-icon">
                    <Icon size={22} />
                    <span>{item.tag}</span>
                  </div>

                  <div className="advice-item-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    <div className="advice-progress">
                      <span style={{ width: `${Math.min(item.progress, 100)}%` }} />
                    </div>

                    <small>
                      {item.progress >= 85 ? 'Almost done' : 'In progress'} · {item.tasks} tasks to complete
                    </small>
                  </div>

                  <ChevronIcon size={18} />
                </article>
              );
            })}
          </div>
        </main>

        {/* ── Sidebar categorii ─────────────────────────────────────── */}
        <aside className="advice-side scroll-reveal">
          <h2>Categories</h2>

          <div className="advice-category-list">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={activeCategory === category.id ? 'active' : ''}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
