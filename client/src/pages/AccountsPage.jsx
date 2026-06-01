// AccountsPage.jsx - pagina de conturi (BETA) (/accounts)
// Momentan afisez conturi simulate bazate pe tranzactiile introduse manual
// Nu am integrat inca un API bancar real - e marcat cu BETA in sidebar

import { PlusIcon, WalletIconFallback, AccountsIcon, TransactionsIcon } from '../shared/icons.jsx';

import {
  getPersonalTransactions,
  summarizeTransactions,
  formatCurrency,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';

export default function AccountsPage({ transactions }) {
  const revealRef = useScrollReveal();
  const summary = summarizeTransactions(getPersonalTransactions(transactions));

  // cele 3 conturi simulate pe baza tranzactiilor
  const accounts = [
    {
      id: 'cash',
      name: 'Cash',
      type: 'Manual account',
      balance: Math.max(summary.balance, 0),
      Icon: WalletIconFallback,
      tone: 'green',
    },
    {
      id: 'checking',
      name: 'Checking',
      type: 'Estimated from transactions',
      balance: summary.income,
      Icon: AccountsIcon,
      tone: 'blue',
    },
    {
      id: 'spending',
      name: 'Spending',
      type: 'Expense tracker',
      balance: -summary.expense,
      Icon: TransactionsIcon,
      tone: 'orange',
    },
  ];

  return (
    <div className="content-shell" ref={revealRef}>

      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Accounts · Beta</p>
          <h1>Accounts</h1>
          <span>Manual overview based on tracked activity</span>
        </div>

        <button type="button" className="btn btn-primary">
          <PlusIcon size={16} />
          Add account
        </button>
      </header>

      {/* cardurile pentru fiecare cont */}
      <section className="accounts-grid scroll-reveal">
        {accounts.map((account) => {
          const Icon = account.Icon;

          return (
            <article key={account.id} className={`account-card ${account.tone}`}>
              <span className="account-card-icon">
                <Icon size={20} />
              </span>
              <div>
                <h3>{account.name}</h3>
                <p>{account.type}</p>
              </div>
              <strong className={account.balance >= 0 ? 'positive' : 'negative'}>
                {formatCurrency(account.balance, { signed: true })}
              </strong>
            </article>
          );
        })}
      </section>
    </div>
  );
}
