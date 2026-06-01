// helpers.js - functii utilitare folosite in toata aplicatia
// Am pus aici tot ce tine de: formatare date, formatare bani,
// filtrare si grupare tranzactii, si construirea seriilor de date pentru grafice

import { getCategoryInfo } from './constants.js';

// ---- FUNCTII PENTRU DATE ----

// returneaza data in format "2025-06-01" (fus orar local, nu UTC)
// o folosesc ca key pentru grupari de tranzactii pe zile
export function getLocalDateKey(input = new Date()) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return getLocalDateKey(new Date());

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// face prima litera majuscula - util pentru lunile calendaristice
export function capFirst(text = '') {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---- FUNCTII PENTRU NUMERE SI MONEDA ----

// converteste la numar si returneaza 0 daca e invalid (undefined, null, NaN)
export function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

// formateaza un numar in format romanesc: 1.234 sau 1,2k daca e compact
export function formatMoney(value, compact = false) {
  const number = safeNumber(value);

  if (compact && Math.abs(number) >= 1000) {
    return new Intl.NumberFormat('ro-RO', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(number);
  }

  return new Intl.NumberFormat('ro-RO', {
    maximumFractionDigits: 0,
  }).format(number);
}

// formateaza ca valuta RON cu optiuni: compact (1.2k RON) si signed (+/-)
export function formatCurrency(value, options = {}) {
  const amount = safeNumber(value);
  const abs = Math.abs(amount);

  if (options.compact && abs >= 1000) {
    const compact = `${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k RON`;

    if (options.signed) {
      if (amount > 0) return `+${compact}`;
      if (amount < 0) return `−${compact}`;
    }

    return compact;
  }

  const formatted = abs.toLocaleString('ro-RO');

  if (options.signed) {
    if (amount > 0) return `+${formatted} RON`;
    if (amount < 0) return `−${formatted} RON`;
  }

  return `${formatted} RON`;
}

// ---- FORMATARE DATE IN ROMANA ----

// ex: "Luni, 1 ianuarie 2025"
export function formatFullDateRo(date) {
  const text = date.toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return capFirst(text);
}

// ex: "01 ian. 2025"
export function formatShortDateRo(date) {
  return new Date(date).toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// pentru lista de tranzactii recente: "Astazi", "Ieri" sau data completa
export function formatRecentDayLabel(date) {
  const today = getLocalDateKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const key = getLocalDateKey(date);

  if (key === today) return 'Astăzi';
  if (key === getLocalDateKey(yesterdayDate)) return 'Ieri';

  return capFirst(new Date(date).toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }));
}

// calculeaza variatia procentuala fata de luna anterioara
export function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

// ---- FILTRARE TRANZACTII ----

// returnez doar tranzactiile personale (scope = 'personal' sau fara scope)
export function getPersonalTransactions(transactions = []) {
  return transactions.filter((transaction) => !transaction.scope || transaction.scope === 'personal');
}

// returnez doar tranzactiile business
export function getBusinessTransactions(transactions = []) {
  return transactions.filter((transaction) => transaction.scope === 'business');
}

// ---- CALCULE SUMAR ----

// calculez totalul veniturilor, cheltuielilor, soldului si numarul de tranzactii
export function summarizeTransactions(transactions = []) {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + safeNumber(transaction.amount), 0);

  const expense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + safeNumber(transaction.amount), 0);

  return {
    income,
    expense,
    balance: income - expense,
    count: transactions.length,
  };
}

// filtrez tranzactiile pentru o anumita luna si an
export function getMonthlyTransactions(transactions = [], date = new Date()) {
  return transactions.filter((transaction) => {
    const txDate = new Date(transaction.date);

    return (
      txDate.getMonth() === date.getMonth()
      && txDate.getFullYear() === date.getFullYear()
    );
  });
}

// ---- SERII DE DATE PENTRU GRAFICE ----

// construiesc un array de obiecte pentru ultimele N luni
// fiecare obiect are: name (luna), venituri, cheltuieli, sold
export function buildMonthlySeries(transactions = [], months = 6) {
  const now = new Date();
  const result = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const monthTx = getMonthlyTransactions(transactions, cursor);
    const summary = summarizeTransactions(monthTx);

    result.push({
      name: capFirst(cursor.toLocaleDateString('ro-RO', { month: 'short' })),
      venituri: summary.income,
      cheltuieli: summary.expense,
      sold: summary.balance,
    });
  }

  return result;
}

// serie zilnica cu cheltuielile pe ultimele N zile (pentru graficul trend)
export function buildDailyExpenseSeries(transactions = [], days = 30) {
  const now = new Date();
  const result = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const cursor = new Date();
    cursor.setDate(now.getDate() - index);
    const key = getLocalDateKey(cursor);

    const value = transactions
      .filter((transaction) => getLocalDateKey(transaction.date) === key && transaction.type === 'expense')
      .reduce((sum, transaction) => sum + safeNumber(transaction.amount), 0);

    result.push({
      name: days <= 7
        ? cursor.toLocaleDateString('ro-RO', { weekday: 'short' })
        : cursor.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }),
      value,
      date: key,
    });
  }

  return result;
}

// serie cu soldul cumulat zilnic pe ultimele N zile (pentru sparkline-ul din balance hero)
export function buildDailyNetSeries(transactions = [], days = 14) {
  const now = new Date();
  let running = 0;
  const result = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const cursor = new Date();
    cursor.setDate(now.getDate() - index);
    const key = getLocalDateKey(cursor);

    const dayTx = transactions.filter((transaction) => getLocalDateKey(transaction.date) === key);
    const summary = summarizeTransactions(dayTx);

    running += summary.balance;

    result.push({
      name: cursor.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' }),
      value: running,
      sold: running,
    });
  }

  return result;
}

// grupez cheltuielile pe categorii si le sortez descrescator dupa suma
// e folosit pentru graficul donut si lista de top categorii
export function buildCategoryBreakdown(transactions = []) {
  const expenseTransactions = transactions.filter((transaction) => transaction.type === 'expense');

  return expenseTransactions
    .reduce((items, transaction) => {
      const existing = items.find((item) => item.id === transaction.category);
      const info = getCategoryInfo(transaction.category);

      if (existing) {
        existing.value += safeNumber(transaction.amount);
      } else {
        items.push({
          id: transaction.category,
          label: info.label,
          color: info.color,
          bgColor: info.bgColor,
          Icon: info.Icon,
          value: safeNumber(transaction.amount),
        });
      }

      return items;
    }, [])
    .sort((a, b) => b.value - a.value);
}
