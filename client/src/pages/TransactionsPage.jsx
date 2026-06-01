// TransactionsPage.jsx - pagina cu istoricul tranzactiilor (/istoric)
// Aceeasi pagina e folosita si pentru /couple/transactions si /business/transactions
// diferenta e prop-ul 'scope' care filtreaza tranzactiile corespunzatoare
// Contine: 4 carduri sumar, formular de adaugare, si tabelul cu filtru si cautare

import { useMemo, useState } from 'react';

import { PlusIcon, SearchIcon, TrashIcon } from '../shared/icons.jsx';
import { CATEGORIES, getCategoryInfo } from '../shared/constants.js';

import {
  getPersonalTransactions,
  getBusinessTransactions,
  summarizeTransactions,
  formatCurrency,
  formatShortDateRo,
  safeNumber,
  getLocalDateKey,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';
import { CategoryIconBubble, EmptyState } from '../shared/components.jsx';

// -----------------------------------------------------------------------
// TransactionsPage primeste:
// transactions  - toate tranzactiile din baza de date
// form, setForm - starea formularului (venita din App.jsx)
// onSubmit      - salveaza tranzactia la server
// onTypeChange  - actualizeaza categoria cand schimb tipul
// onDelete      - sterge o tranzactie dupa id
// scope         - 'personal' (default) / 'couples' / 'business'
// -----------------------------------------------------------------------

export default function TransactionsPage({
  transactions,
  form,
  setForm,
  onSubmit,
  onTypeChange,
  onDelete,
  scope = 'personal',
}) {
  // starea filtrelor din bara de cautare
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortMode, setSortMode] = useState('newest');

  const revealRef = useScrollReveal();

  // filtrez tranzactiile dupa scope (personal / couples / business)
  const scopedTransactions = useMemo(() => {
    if (scope === 'business') return getBusinessTransactions(transactions);
    if (scope === 'couples') return transactions.filter((transaction) => transaction.scope === 'couples');
    return getPersonalTransactions(transactions);
  }, [transactions, scope]);

  // aplic filtrele si sortarea pe lista de tranzactii
  const filteredTransactions = useMemo(() => {
    return [...scopedTransactions]
      .filter((transaction) => {
        const matchesQuery = !query
          || transaction.description?.toLowerCase().includes(query.toLowerCase())
          || getCategoryInfo(transaction.category).label.toLowerCase().includes(query.toLowerCase());

        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;

        return matchesQuery && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        if (sortMode === 'oldest') return new Date(a.date) - new Date(b.date);
        if (sortMode === 'amount-high') return safeNumber(b.amount) - safeNumber(a.amount);
        if (sortMode === 'amount-low') return safeNumber(a.amount) - safeNumber(b.amount);

        return new Date(b.date) - new Date(a.date);
      });
  }, [scopedTransactions, query, typeFilter, categoryFilter, sortMode]);

  // lista de categorii din formular - depinde de tip si de scope
  const categoriesForType = useMemo(() => {
    if (scope === 'business') {
      return form.type === 'income' ? CATEGORIES.business_income : CATEGORIES.business_expense;
    }

    return CATEGORIES[form.type] || CATEGORIES.expense;
  }, [form.type, scope]);

  // toate categoriile unice care apar in tranzactii (pentru filtrul de categorii)
  const allCategoryOptions = useMemo(() => {
    const ids = new Set(scopedTransactions.map((transaction) => transaction.category));
    return [...ids].map(getCategoryInfo);
  }, [scopedTransactions]);

  const summary = summarizeTransactions(scopedTransactions);

  return (
    <div className="content-shell transactions-page" ref={revealRef}>

      {/* titlul paginii */}
      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">
            {scope === 'business' ? 'Business' : scope === 'couples' ? 'Couples' : 'Personal'}
          </p>
          <h1>Transactions</h1>
          <span>Search, filter and add activity manually</span>
        </div>
      </header>

      {/* 4 carduri cu totaluri: venituri, cheltuieli, net, numar */}
      <section className="transactions-summary-grid scroll-reveal">
        <div className="summary-card">
          <span>Total income</span>
          <strong className="positive">+{formatCurrency(summary.income)}</strong>
        </div>

        <div className="summary-card">
          <span>Total expenses</span>
          <strong className="negative">−{formatCurrency(summary.expense)}</strong>
        </div>

        <div className="summary-card">
          <span>Net</span>
          <strong className={summary.balance >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(summary.balance, { signed: true })}
          </strong>
        </div>

        <div className="summary-card">
          <span>Transactions</span>
          <strong>{summary.count}</strong>
        </div>
      </section>

      {/* formularul pentru adaugarea manuala a tranzactiilor */}
      <section className="transaction-entry-card scroll-reveal">
        <div className="panel-head">
          <div>
            <span className="section-mini-label">Manual entry</span>
            <h2>Add transaction</h2>
          </div>
        </div>

        <form className="transaction-form" onSubmit={onSubmit}>
          <label>
            Type
            <select value={form.type} onChange={onTypeChange}>
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
              {categoriesForType.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Description
            <input
              value={form.description}
              onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
              placeholder="Merchant or note"
            />
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

          <label>
            Date
            <input
              type="date"
              value={form.date || getLocalDateKey()}
              onChange={(event) => setForm((previous) => ({ ...previous, date: event.target.value }))}
            />
          </label>

          <button type="submit" className="btn btn-primary">
            <PlusIcon size={16} />
            Add transaction
          </button>
        </form>
      </section>

      {/* tabelul cu tranzactii, bara de filtru si cautare */}
      <section className="transactions-table-card scroll-reveal">
        <div className="transactions-toolbar">
          <div className="search-field">
            <SearchIcon size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search transactions..."
            />
          </div>

          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>

          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {allCategoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>

          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amount-high">Amount high</option>
            <option value="amount-low">Amount low</option>
          </select>
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="Try changing filters or add a new transaction."
          />
        ) : (
          <div className="transactions-list">
            {filteredTransactions.map((transaction) => {
              const info = getCategoryInfo(transaction.category);

              return (
                <div key={transaction._id} className="transaction-row">
                  <div className="transaction-main">
                    <CategoryIconBubble info={info} size={17} />
                    <div>
                      <strong>{transaction.description}</strong>
                      <span>{info.label} · {formatShortDateRo(transaction.date)}</span>
                    </div>
                  </div>

                  <span className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '−'}
                    {formatCurrency(transaction.amount)}
                  </span>

                  {/* buton de stergere */}
                  <button
                    type="button"
                    className="icon-action danger"
                    onClick={() => onDelete(transaction._id)}
                    title="Delete"
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
