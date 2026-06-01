// InvestmentsPage.jsx - pagina de pregătire pentru investitii (BETA) (/investments)
// Evalueaza daca userul e "gata" sa investeasca pe baza a 4 criterii simple:
// sold pozitiv, venituri > cheltuieli, fond urgenta, tracking consistent

import { InvestmentsIcon, CheckIcon, AlertIcon } from '../shared/icons.jsx';

import {
  getPersonalTransactions,
  summarizeTransactions,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';

export default function InvestmentsPage({ transactions }) {
  const revealRef = useScrollReveal();
  const summary = summarizeTransactions(getPersonalTransactions(transactions));

  // daca sunt indeplinite primele 2 criterii, userul e "ready"
  const investReady = summary.balance > 0 && summary.income > summary.expense;

  // lista cu criteriile si daca sunt indeplinite sau nu
  const checks = [
    { label: 'Positive net balance', done: summary.balance > 0 },
    { label: 'Income above expenses', done: summary.income > summary.expense },
    { label: 'Emergency fund started', done: summary.balance >= summary.expense && summary.expense > 0 },
    { label: 'Consistent tracking', done: transactions.length >= 10 },
  ];

  return (
    <div className="content-shell" ref={revealRef}>

      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Investments · Beta</p>
          <h1>Investment readiness</h1>
          <span>High-level readiness based on your tracked cash flow</span>
        </div>
      </header>

      {/* cardul cu scorul de pregatire si lista de criterii */}
      <section className="investment-board scroll-reveal">
        <div className="investment-score-card">
          <div className={`investment-orb ${investReady ? 'ready' : 'wait'}`}>
            <InvestmentsIcon size={34} />
          </div>
          <h2>{investReady ? 'You may be ready to plan' : 'Stabilize cash flow first'}</h2>
          <p>
            {investReady
              ? 'Your tracked net position is positive. Consider emergency savings before investing.'
              : 'Build a positive monthly surplus and emergency savings before taking investment risk.'}
          </p>
        </div>

        {/* lista de criterii: bifa verde daca e indeplinit, semn de atentie altfel */}
        <div className="investment-checks">
          {checks.map((item) => (
            <div key={item.label} className={item.done ? 'done' : ''}>
              <span>{item.done ? <CheckIcon size={14} /> : <AlertIcon size={14} />}</span>
              <strong>{item.label}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
