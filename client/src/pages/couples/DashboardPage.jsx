// DashboardPage.jsx (couples) - dashboardul comun pentru cuplu (/couple/dashboard)
// Arata: statisticile comune, un grafic donut cu distributia cheltuielilor
// si activitatea recenta partajata
// Daca nu exista tranzactii 'couples', iau primele 8 tranzactii personale ca fallback

import { useMemo } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { CoupleIcon } from '../../shared/icons.jsx';
import { getCategoryInfo } from '../../shared/constants.js';

import {
  getPersonalTransactions,
  summarizeTransactions,
  formatCurrency,
} from '../../shared/helpers.js';

import { useScrollReveal } from '../../shared/hooks.jsx';
import { CategoryIconBubble, EmptyState, CustomTooltip } from '../../shared/components.jsx';

export default function CoupleDashboardPage({ transactions, coupleData }) {
  const revealRef = useScrollReveal();

  // filtrez tranzactiile cu scope 'couples'
  const coupleTx = useMemo(() => (
    transactions.filter((transaction) => transaction.scope === 'couples')
  ), [transactions]);

  // daca nu exista tranzactii de couples, iau primele 8 personale ca sa nu fie gol
  const fallbackTx = coupleTx.length ? coupleTx : getPersonalTransactions(transactions).slice(0, 8);
  const summary = summarizeTransactions(fallbackTx);

  // impart cheltuielile 52%/48% intre cei doi (simulat)
  const splitData = [
    { name: 'You', value: Math.max(summary.expense * 0.52, 0) },
    { name: coupleData?.partnerName || 'Partner', value: Math.max(summary.expense * 0.48, 0) },
  ];

  return (
    <div className="content-shell couple-dashboard" ref={revealRef}>

      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Couples</p>
          <h1>Shared dashboard</h1>
          <span>
            {coupleData?.partnerName
              ? `You and ${coupleData.partnerName}`
              : 'Shared household view'}
          </span>
        </div>
      </header>

      {/* 4 carduri cu statisticile comune */}
      <section className="transactions-summary-grid scroll-reveal">
        <div className="summary-card">
          <span>Shared income</span>
          <strong className="positive">+{formatCurrency(summary.income)}</strong>
        </div>
        <div className="summary-card">
          <span>Shared spending</span>
          <strong className="negative">−{formatCurrency(summary.expense)}</strong>
        </div>
        <div className="summary-card">
          <span>Shared net</span>
          <strong className={summary.balance >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(summary.balance, { signed: true })}
          </strong>
        </div>
        <div className="summary-card">
          <span>Items tracked</span>
          <strong>{summary.count}</strong>
        </div>
      </section>

      {/* donut cu distributia cheltuielilor + lista tranzactii recente */}
      <section className="couple-grid">
        <div className="wide-panel scroll-reveal">
          <div className="panel-head">
            <div>
              <span className="section-mini-label">Together</span>
              <h2>Contribution split</h2>
            </div>
          </div>

          {/* graficul donut care arata cine a cheltuit mai mult */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={splitData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={112}
                paddingAngle={4}
              >
                <Cell fill="var(--couple)" />
                <Cell fill="var(--accent)" />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* tranzactiile recente comune */}
        <div className="wide-panel scroll-reveal">
          <div className="panel-head compact">
            <div>
              <span className="section-mini-label">Recent</span>
              <h2>Shared activity</h2>
            </div>
          </div>

          {fallbackTx.length === 0 ? (
            <EmptyState
              icon={CoupleIcon}
              title="No shared activity yet"
              description="Add couple transactions to see them here."
            />
          ) : (
            <div className="recent-groups no-days">
              {fallbackTx.slice(0, 8).map((transaction) => {
                const info = getCategoryInfo(transaction.category);

                return (
                  <div key={transaction._id} className="transaction-line">
                    <div className="transaction-line-left">
                      <CategoryIconBubble info={info} />
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
          )}
        </div>
      </section>
    </div>
  );
}
