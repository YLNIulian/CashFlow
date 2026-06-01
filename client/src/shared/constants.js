// constants.js - constantele globale ale aplicatiei
// Am pus aici: adresa serverului, categoriile de tranzactii si meniurile de navigare
// Le-am scos intr-un fisier separat ca sa le pot folosi din orice pagina fara sa le repet

import {
  AccountsIcon,
  FoodIcon,
  TransportIcon,
  UtilitiesIcon,
  EntertainmentIcon,
  HealthIcon,
  ShoppingIcon,
  IncomeIcon,
  CodeIcon,
  GiftIcon,
  InvoiceIcon,
  UserIcon,
  EquipmentIcon,
  MarketingIcon,
  BusinessIcon,
  CoupleIcon,
  DashboardIcon,
  TransactionsIcon,
  CashFlowIcon,
  ReportsIcon,
  BudgetIcon,
  RecurringIcon,
  GoalsIcon,
  InvestmentsIcon,
  ForecastingIcon,
} from './icons.jsx';

// adresa backend-ului meu Express
export const API = 'http://localhost:5000';

// ---- CATEGORIILE DE TRANZACTII ----
// am 4 tipuri: cheltuieli personale, venituri personale, cheltuieli business, venituri business
// fiecare categorie are: id (unic), label (text afisat), Icon, culoare si fundal colorat

export const CATEGORIES = {
  // cheltuieli pentru modul personal
  expense: [
    { id: 'food', label: 'Mâncare', Icon: FoodIcon, color: '#f97316', bgColor: 'rgba(249, 115, 22, .10)' },
    { id: 'transport', label: 'Transport', Icon: TransportIcon, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, .10)' },
    { id: 'utilities', label: 'Utilități', Icon: UtilitiesIcon, color: '#d97706', bgColor: 'rgba(217, 119, 6, .10)' },
    { id: 'entertainment', label: 'Divertisment', Icon: EntertainmentIcon, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, .10)' },
    { id: 'health', label: 'Sănătate', Icon: HealthIcon, color: '#ec4899', bgColor: 'rgba(236, 72, 153, .10)' },
    { id: 'shopping', label: 'Cumpărături', Icon: ShoppingIcon, color: '#06b6d4', bgColor: 'rgba(6, 182, 212, .10)' },
    { id: 'other_exp', label: 'Altele', Icon: AccountsIcon, color: '#71717a', bgColor: 'rgba(113, 113, 122, .10)' },
  ],
  // venituri pentru modul personal
  income: [
    { id: 'salary', label: 'Salariu', Icon: IncomeIcon, color: '#10b981', bgColor: 'rgba(16, 185, 129, .12)' },
    { id: 'freelance', label: 'Freelance', Icon: CodeIcon, color: '#059669', bgColor: 'rgba(5, 150, 105, .12)' },
    { id: 'gift', label: 'Cadou', Icon: GiftIcon, color: '#34d399', bgColor: 'rgba(52, 211, 153, .14)' },
    { id: 'other_inc', label: 'Altele', Icon: IncomeIcon, color: '#6ee7b7', bgColor: 'rgba(110, 231, 183, .15)' },
  ],
  // cheltuieli pentru modul business
  business_expense: [
    { id: 'invoice', label: 'Factură', Icon: InvoiceIcon, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, .10)' },
    { id: 'salary_out', label: 'Salarii', Icon: UserIcon, color: '#2563eb', bgColor: 'rgba(37, 99, 235, .10)' },
    { id: 'equipment', label: 'Echipamente', Icon: EquipmentIcon, color: '#6366f1', bgColor: 'rgba(99, 102, 241, .10)' },
    { id: 'marketing', label: 'Marketing', Icon: MarketingIcon, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, .10)' },
    { id: 'other_biz', label: 'Altele', Icon: BusinessIcon, color: '#64748b', bgColor: 'rgba(100, 116, 139, .10)' },
  ],
  // venituri pentru modul business
  business_income: [
    { id: 'biz_revenue', label: 'Venituri', Icon: IncomeIcon, color: '#10b981', bgColor: 'rgba(16, 185, 129, .12)' },
    { id: 'biz_client', label: 'Clienți', Icon: CoupleIcon, color: '#059669', bgColor: 'rgba(5, 150, 105, .12)' },
    { id: 'biz_other_inc', label: 'Altele', Icon: BusinessIcon, color: '#34d399', bgColor: 'rgba(52, 211, 153, .14)' },
  ],
};

// getCategoryInfo - caut o categorie dupa id
// daca nu o gasesc, returnez un obiect generic ca sa nu crape aplicatia
export function getCategoryInfo(categoryId) {
  const all = [
    ...CATEGORIES.expense,
    ...CATEGORIES.income,
    ...CATEGORIES.business_expense,
    ...CATEGORIES.business_income,
  ];

  return (
    all.find((category) => category.id === categoryId) || {
      id: categoryId || 'other_exp',
      label: categoryId || 'General',
      Icon: AccountsIcon,
      color: '#71717a',
      bgColor: 'rgba(113, 113, 122, .10)',
    }
  );
}

// ---- MENIURILE DIN SIDEBAR ----
// am cate un array separat pentru fiecare mod de lucru

// meniul pentru modul Personal (10 pagini)
export const NAV_PERSONAL = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon, path: '/dashboard' },
  { id: 'accounts', label: 'Accounts', Icon: AccountsIcon, path: '/accounts', badge: 'BETA' },
  { id: 'transactions', label: 'Transactions', Icon: TransactionsIcon, path: '/istoric' },
  { id: 'cashflow', label: 'Cash Flow', Icon: CashFlowIcon, path: '/cashflow' },
  { id: 'reports', label: 'Reports', Icon: ReportsIcon, path: '/reports' },
  { id: 'budget', label: 'Budget', Icon: BudgetIcon, path: '/budget' },
  { id: 'recurring', label: 'Recurring', Icon: RecurringIcon, path: '/recurring' },
  { id: 'goals', label: 'Goals', Icon: GoalsIcon, path: '/goals' },
  { id: 'investments', label: 'Investments', Icon: InvestmentsIcon, path: '/investments', badge: 'BETA' },
  { id: 'forecasting', label: 'Forecasting', Icon: ForecastingIcon, path: '/forecasting' },
];

// meniul pentru modul Couples (4 pagini)
export const NAV_COUPLES = [
  { id: 'couple-dashboard', label: 'Dashboard', Icon: DashboardIcon, path: '/couple/dashboard' },
  { id: 'couple-transactions', label: 'Transactions', Icon: TransactionsIcon, path: '/couple/transactions' },
  { id: 'couple-budget', label: 'Budget', Icon: BudgetIcon, path: '/couple/budget' },
  { id: 'couple-goals', label: 'Goals', Icon: GoalsIcon, path: '/couple/goals' },
];

// meniul pentru modul Business (4 pagini)
export const NAV_BUSINESS = [
  { id: 'business-dashboard', label: 'Dashboard', Icon: DashboardIcon, path: '/business/dashboard' },
  { id: 'business-transactions', label: 'Transactions', Icon: TransactionsIcon, path: '/business/transactions' },
  { id: 'business-reports', label: 'Reports', Icon: ReportsIcon, path: '/business/reports' },
  { id: 'business-forecasting', label: 'Forecasting', Icon: ForecastingIcon, path: '/business/forecasting' },
];
