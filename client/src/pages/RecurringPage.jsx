// RecurringPage.jsx - pagina cu tranzactiile recurente (/recurring)
// Detectez automat tranzactiile repetate dupa descriere (minim 2 aparitii)
// Nu am nevoie sa fac nimic manual - grupez singur descrierile si le afisez

import { useMemo } from 'react';

import { RecurringIcon } from '../shared/icons.jsx';
import { getCategoryInfo } from '../shared/constants.js';

import {
  getPersonalTransactions,
  formatCurrency,
  safeNumber,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';
import { CategoryIconBubble, EmptyState } from '../shared/components.jsx';

export default function RecurringPage({ transactions }) {
  const revealRef = useScrollReveal();
  const personalTx = useMemo(() => getPersonalTransactions(transactions), [transactions]);

  // grupez tranzactiile dupa descriere si pastrez doar ce apare de 2+ ori
  const recurring = useMemo(() => {
    const grouped = personalTx.reduce((acc, transaction) => {
      const key = transaction.description?.trim().toLowerCase();
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(transaction);
      return acc;
    }, {});

    return Object.entries(grouped)
      .filter(([, items]) => items.length >= 2)
      .map(([key, items]) => ({
        key,
        description: items[0].description,
        category: items[0].category,
        type: items[0].type,
        count: items.length,
        total: items.reduce((sum, item) => sum + safeNumber(item.amount), 0),
        avg: Math.round(items.reduce((sum, item) => sum + safeNumber(item.amount), 0) / items.length),
      }))
      .sort((a, b) => b.count - a.count);
  }, [personalTx]);

  return (
    <div className="content-shell" ref={revealRef}>

      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Recurring</p>
          <h1>Recurring transactions</h1>
          <span>Detected repeated descriptions from your activity</span>
        </div>
      </header>

      {/* lista cu tranzactiile recurente detectate */}
      <section className="wide-panel scroll-reveal">
        {recurring.length === 0 ? (
          <EmptyState
            icon={RecurringIcon}
            title="No recurring patterns yet"
            description="Repeated merchants or descriptions will show up automatically."
          />
        ) : (
          <div className="recurring-list-rich">
            {recurring.map((item) => {
              const info = getCategoryInfo(item.category);

              return (
                <div key={item.key} className="recurring-rich-row">
                  <CategoryIconBubble info={info} />
                  <div>
                    <strong>{item.description}</strong>
                    {/* apar numarul de ori, media sumei */}
                    <span>{info.label} · {item.count} times · average {formatCurrency(item.avg)}</span>
                  </div>
                  <em className={item.type === 'income' ? 'positive' : 'negative'}>
                    {item.type === 'income' ? '+' : '−'}
                    {formatCurrency(item.total)}
                  </em>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
