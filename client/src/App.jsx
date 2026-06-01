// App.jsx - fisierul principal care tine toata aplicatia impreuna
// Aici am pus: starea globala (cine e logat, tranzactiile, modul curent),
// toate handlere-le pentru login/logout/adaugare/stergere
// si toate rutele catre fiecare pagina.

import { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import axios from 'axios';

import './App.css';

// import-uri din fisierele mele de shared (lucruri folosite in mai multe locuri)
import { API, CATEGORIES, getCategoryInfo } from './shared/constants.js';
import { getLocalDateKey } from './shared/helpers.js';
import { useToast, ToastContainer } from './shared/hooks.jsx';

// componentele mari de layout
import Sidebar from './components/Sidebar.jsx';
import CommandPalette from './components/CommandPalette.jsx';

// paginile publice (fara login)
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/LoginPage.jsx';

// paginile pentru modul Personal
import Dashboard from './pages/DashboardPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import CashFlowPage from './pages/CashFlowPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import GoalsPage from './pages/GoalsPage.jsx';
import AdvicePage from './pages/AdvicePage.jsx';
import RecurringPage from './pages/RecurringPage.jsx';
import AccountsPage from './pages/AccountsPage.jsx';
import InvestmentsPage from './pages/InvestmentsPage.jsx';
import ForecastingPage from './pages/ForecastingPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// paginile pentru modul Couples
import CouplesSetupPage from './pages/couples/SetupPage.jsx';
import CoupleDashboardPage from './pages/couples/DashboardPage.jsx';

// paginile pentru modul Business
import BusinessDashboardPage from './pages/business/DashboardPage.jsx';

// pagina de eroare 404
import NotFoundPage from './pages/NotFoundPage.jsx';

// -----------------------------------------------------------------------
// AppShell - componenta care gestioneaza toata logica aplicatiei
// Am pus aici tot state-ul global ca sa il pot trimite la orice pagina
// -----------------------------------------------------------------------

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  // informatii despre userul logat
  const [userNickname, setUserNickname] = useState(() => localStorage.getItem('laila-nickname') || '');
  const [userId, setUserId] = useState(() => localStorage.getItem('laila-user-id') || '');

  // lista cu toate tranzactiile venite de la server
  const [transactions, setTransactions] = useState([]);

  // tema dark/light - o salvez in localStorage sa ramana si dupa refresh
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('laila-theme') === 'dark');

  // modul curent: 'personal', 'couples' sau 'business'
  const [mode, setMode] = useState(() => localStorage.getItem('laila-mode') || 'personal');

  // deschis/inchis pentru paleta de comenzi (Ctrl+K)
  const [commandOpen, setCommandOpen] = useState(false);

  // datele despre cuplu, salvate in localStorage
  const [coupleData, setCoupleData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laila-couple-data') || '{}');
    } catch {
      return {};
    }
  });

  // hook-ul meu pentru toast-uri (notificarile mici de succes/eroare)
  const { toasts, addToast, dismissToast } = useToast();

  // starea formularului de adaugare tranzactie
  const [form, setForm] = useState({
    type: 'expense',
    category: CATEGORIES.expense[0].id,
    description: '',
    amount: '',
    date: getLocalDateKey(),
    scope: 'personal',
  });

  // daca userId exista, userul e logat
  const isLoggedIn = !!userId;

  // aplica sau scoate clasa 'dark' pe html cand se schimba tema
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('laila-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // salvez modul curent in localStorage
  useEffect(() => {
    localStorage.setItem('laila-mode', mode);
  }, [mode]);

  // scurtatura tastatura: Ctrl+K deschide paleta, Escape o inchide
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isCommand = event.metaKey || event.ctrlKey;

      if (isCommand && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }

      if (event.key === 'Escape') {
        setCommandOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // iau toate tranzactiile de la server pentru userul logat
  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      return;
    }

    try {
      const response = await axios.get(`${API}/api/transactions/${userId}`);
      setTransactions(response.data || []);
    } catch {
      setTransactions([]);
    }
  }, [userId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // la login: salvez datele in localStorage si navighez la dashboard
  const handleLogin = (nickname, id) => {
    localStorage.setItem('laila-nickname', nickname);
    localStorage.setItem('laila-user-id', id);
    setUserNickname(nickname);
    setUserId(id);
    navigate('/dashboard');
  };

  // la logout: sterg tot din localStorage si ma duc pe landing page
  const handleLogout = () => {
    localStorage.removeItem('laila-nickname');
    localStorage.removeItem('laila-user-id');
    setUserNickname('');
    setUserId('');
    setTransactions([]);
    navigate('/');
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
  };

  // returnez lista de categorii potrivita pentru contextul curent
  const getCategoryListForCurrentContext = (type, path = location.pathname) => {
    if (path.startsWith('/business')) {
      return type === 'income' ? CATEGORIES.business_income : CATEGORIES.business_expense;
    }

    return CATEGORIES[type] || CATEGORIES.expense;
  };

  // cand schimb tipul (expense/income), resetez si categoria la prima din lista
  const handleTypeChange = (event) => {
    const nextType = event.target.value;

    setForm((previous) => {
      const categoryList = getCategoryListForCurrentContext(nextType);

      return {
        ...previous,
        type: nextType,
        category: categoryList[0]?.id || CATEGORIES.expense[0].id,
      };
    });
  };

  // determin scope-ul (personal/couples/business) dupa URL-ul curent
  const inferScopeFromPath = () => {
    if (location.pathname.startsWith('/business')) return 'business';
    if (location.pathname.startsWith('/couple')) return 'couples';
    return 'personal';
  };

  // trimit tranzactia la server si reincarca lista
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.description || !form.amount) {
      addToast('Completează descrierea și suma.', 'warning');
      return;
    }

    const scope = inferScopeFromPath();

    const payload = {
      userId,
      type: form.type,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      date: form.date || getLocalDateKey(),
      scope,
    };

    try {
      await axios.post(`${API}/api/transactions`, payload);

      // resetez formularul dupa adaugare reusita
      setForm((previous) => {
        const categoryList = getCategoryListForCurrentContext(previous.type);

        return {
          ...previous,
          category: categoryList[0]?.id || CATEGORIES.expense[0].id,
          description: '',
          amount: '',
          date: getLocalDateKey(),
        };
      });

      await fetchTransactions();
      addToast('Tranzacție adăugată.', 'success');
    } catch {
      addToast('Nu am putut adăuga tranzacția.', 'error');
    }
  };

  // sterg o tranzactie dupa id
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/transactions/${id}`);
      await fetchTransactions();
      addToast('Tranzacție ștearsă.', 'success');
    } catch {
      addToast('Nu am putut șterge tranzacția.', 'error');
    }
  };

  // actualizez nickname-ul si in localStorage
  const updateNickname = (nextNickname) => {
    localStorage.setItem('laila-nickname', nextNickname);
    setUserNickname(nextNickname);
  };

  // cand selectez ceva din paleta de comenzi, schimb si modul corespunzator
  const handleCommandAction = (path) => {
    setCommandOpen(false);

    if (path.startsWith('/business')) setMode('business');
    else if (path.startsWith('/couple')) setMode('couples');
    else setMode('personal');

    navigate(path);
  };

  // daca nu e logat, afisez doar landing si login
  if (!isLoggedIn) {
    return (
      <>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Login onLogin={handleLogin} startRegister />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // daca e logat, afisez sidebar + toate rutele aplicatiei
  return (
    <div className={`app-frame mode-${mode}`}>
      <Sidebar
        userNickname={userNickname}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((value) => !value)}
        mode={mode}
        onModeChange={handleModeChange}
        coupleData={coupleData}
        onOpenCommand={() => setCommandOpen(true)}
      />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ---- PAGINI PERSONAL ---- */}
          <Route
            path="/dashboard"
            element={(
              <Dashboard
                userNickname={userNickname}
                transactions={transactions}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                onTypeChange={handleTypeChange}
              />
            )}
          />

          <Route path="/accounts" element={<AccountsPage transactions={transactions} />} />

          <Route
            path="/istoric"
            element={(
              <TransactionsPage
                transactions={transactions}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                onTypeChange={handleTypeChange}
                onDelete={handleDelete}
              />
            )}
          />

          <Route path="/cashflow" element={<CashFlowPage transactions={transactions} />} />
          <Route path="/reports" element={<ReportsPage transactions={transactions} />} />
          <Route path="/budget" element={<BudgetPage transactions={transactions} />} />
          <Route path="/recurring" element={<RecurringPage transactions={transactions} />} />
          <Route path="/goals" element={<GoalsPage userId={userId} transactions={transactions} />} />
          <Route path="/investments" element={<InvestmentsPage transactions={transactions} />} />
          <Route path="/forecasting" element={<ForecastingPage transactions={transactions} />} />
          <Route path="/advice" element={<AdvicePage transactions={transactions} />} />

          <Route
            path="/profile"
            element={(
              <ProfilePage
                userId={userId}
                userNickname={userNickname}
                transactions={transactions}
                onUpdateNickname={updateNickname}
              />
            )}
          />

          {/* ---- PAGINI COUPLES ---- */}
          <Route
            path="/couple/setup"
            element={<CouplesSetupPage coupleData={coupleData} setCoupleData={setCoupleData} />}
          />

          <Route
            path="/couple/dashboard"
            element={coupleData?.coupled ? (
              <CoupleDashboardPage transactions={transactions} coupleData={coupleData} />
            ) : (
              <Navigate to="/couple/setup" replace />
            )}
          />

          <Route
            path="/couple/transactions"
            element={(
              <TransactionsPage
                transactions={transactions}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                onTypeChange={handleTypeChange}
                onDelete={handleDelete}
                scope="couples"
              />
            )}
          />

          <Route path="/couple/budget" element={<BudgetPage transactions={transactions} scope="couples" />} />
          <Route path="/couple/goals" element={<GoalsPage userId={userId} transactions={transactions} />} />
          <Route path="/couple/advice" element={<AdvicePage transactions={transactions} />} />

          {/* ---- PAGINI BUSINESS ---- */}
          <Route path="/business/dashboard" element={<BusinessDashboardPage transactions={transactions} />} />

          <Route
            path="/business/transactions"
            element={(
              <TransactionsPage
                transactions={transactions}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                onTypeChange={handleTypeChange}
                onDelete={handleDelete}
                scope="business"
              />
            )}
          />

          <Route path="/business/reports" element={<ReportsPage transactions={transactions} scope="business" />} />
          <Route path="/business/forecasting" element={<ForecastingPage transactions={transactions} />} />
          <Route path="/business/budget" element={<BudgetPage transactions={transactions} scope="business" />} />

          {/* ---- 404 ---- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* paleta de comenzi rapide Ctrl+K */}
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onAction={handleCommandAction}
      />

      {/* notificarile de tip toast (succes, eroare, warning) */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

// componenta root - pune router-ul in jurul intregii aplicatii
export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

// re-export pentru compatibilitate cu alte fisiere care importa din App.jsx
export { CATEGORIES, getCategoryInfo };
