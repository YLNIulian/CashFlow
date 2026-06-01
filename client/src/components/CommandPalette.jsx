// CommandPalette.jsx - paleta de comenzi rapide (se deschide cu Ctrl+K)
// Permite navigarea rapida la orice pagina prin tastare
// Am pus toate paginile aplicatiei in lista si filtrez dupa ce scrie userul

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  DashboardIcon,
  AccountsIcon,
  TransactionsIcon,
  CashFlowIcon,
  ReportsIcon,
  BudgetIcon,
  RecurringIcon,
  GoalsIcon,
  InvestmentsIcon,
  ForecastingIcon,
  AdviceIcon,
  CoupleIcon,
  BusinessIcon,
  SearchIcon,
} from '../shared/icons.jsx';

// -----------------------------------------------------------------------
// CommandPalette primeste:
// open     - true/false daca e vizibila
// onClose  - inchide paleta
// onAction - navighez la pagina selectata (si schimb modul daca trebuie)
// -----------------------------------------------------------------------

export default function CommandPalette({ open, onClose, onAction }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  // toate paginile disponibile in aplicatie
  const items = useMemo(() => [
    { label: 'Dashboard', path: '/dashboard', Icon: DashboardIcon },
    { label: 'Accounts', path: '/accounts', Icon: AccountsIcon },
    { label: 'Transactions', path: '/istoric', Icon: TransactionsIcon },
    { label: 'Cash Flow', path: '/cashflow', Icon: CashFlowIcon },
    { label: 'Reports', path: '/reports', Icon: ReportsIcon },
    { label: 'Budget', path: '/budget', Icon: BudgetIcon },
    { label: 'Recurring', path: '/recurring', Icon: RecurringIcon },
    { label: 'Goals', path: '/goals', Icon: GoalsIcon },
    { label: 'Investments', path: '/investments', Icon: InvestmentsIcon },
    { label: 'Forecasting', path: '/forecasting', Icon: ForecastingIcon },
    { label: 'Advice', path: '/advice', Icon: AdviceIcon },
    { label: 'Couples Dashboard', path: '/couple/dashboard', Icon: CoupleIcon },
    { label: 'Couples Transactions', path: '/couple/transactions', Icon: TransactionsIcon },
    { label: 'Business Dashboard', path: '/business/dashboard', Icon: BusinessIcon },
    { label: 'Business Transactions', path: '/business/transactions', Icon: TransactionsIcon },
    { label: 'Business Reports', path: '/business/reports', Icon: ReportsIcon },
  ], []);

  // cand se deschide paleta, pun focusul pe input automat
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery('');
    }
  }, [open]);

  // filtrez paginile dupa ce scrie userul
  const filtered = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;

  return (
    <div className="command-overlay cmd-overlay" onClick={onClose}>
      <div className="command-panel cmd-modal" onClick={(event) => event.stopPropagation()}>

        {/* campul de cautare */}
        <div className="command-search cmd-search">
          <SearchIcon size={17} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search or jump to..."
          />
          <kbd>esc</kbd>
        </div>

        {/* lista de rezultate filtrate */}
        <div className="command-list cmd-list">
          {filtered.length === 0 && (
            <div className="command-empty cmd-empty">No result found.</div>
          )}

          {filtered.map((item) => {
            const Icon = item.Icon;

            return (
              <button
                key={item.path}
                type="button"
                className="command-item cmd-item"
                onClick={() => onAction(item.path)}
              >
                <span className="command-item-icon cmd-item-icon">
                  <Icon size={16} />
                </span>
                <span>{item.label}</span>
                <span className="command-enter">↵</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
