// LoginPage.jsx - pagina de autentificare si inregistrare (/login)
// Am facut un singur formular care poate fi si login si register
// Toggle-ul din jos schimba intre cele doua moduri
// La register, daca exista date de onboarding in localStorage, le trimit si pe ele

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { BudgetIcon, CashFlowIcon, GoalsIcon, SparkIcon, LailaLogoIcon } from '../shared/icons.jsx';
import { API } from '../shared/constants.js';

// -----------------------------------------------------------------------
// Login primeste:
// onLogin - functia din App.jsx care salveaza datele dupa autentificare
// -----------------------------------------------------------------------

export default function Login({ onLogin, startRegister }) {
  const navigate = useNavigate();

  // startRegister vine din ruta /register si deschide direct formularul de cont nou
  const [isLogin, setIsLogin] = useState(!startRegister);

  // campurile formularului
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // mesaj de eroare sau confirmare
  const [message, setMessage] = useState('');

  // dezactivez butonul cat timp asteapt raspunsul de la server
  const [busy, setBusy] = useState(false);

  // trimit datele la server
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setMessage('');

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const payload = isLogin
        ? { email, password }
        : { nickname, email, password };

      const response = await axios.post(`${API}${endpoint}`, payload);

      if (isLogin) {
        // la login reusit: apelez callback-ul din App si navighez la dashboard
        onLogin(response.data.nickname, response.data.userId);
        navigate('/dashboard');
        return;
      }

      // daca am date de onboarding salvate, le trimit dupa ce s-a creat contul
      const onboardingData = localStorage.getItem('lailaOnboarding');

      if (onboardingData && response.data.userId) {
        try {
          await axios.post(
            `${API}/api/users/${response.data.userId}/onboarding`,
            JSON.parse(onboardingData)
          );
          localStorage.removeItem('lailaOnboarding');
        } catch {
          // nu e critic daca esueaza, continuu
        }
      }

      // dupa register, trec automat pe modul login
      setMessage(response.data.message || 'Cont creat. Te poți conecta.');
      setIsLogin(true);
      setPassword('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Nu am putut finaliza acțiunea.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-card login-card">

        {/* coloana stanga: formularul propriu-zis */}
        <div className="login-left">
          <button type="button" className="auth-logo login-brand" onClick={() => navigate('/')}>
            <span className="login-brand-mark">
              <LailaLogoIcon size={20} />
            </span>
            Laila
          </button>

          <div className="auth-copy">
            <p className="eyebrow">{isLogin ? 'Welcome back' : 'Start clean'}</p>
            <h1 className="login-title">{isLogin ? 'Intră în contul tău.' : 'Creează contul Laila.'}</h1>
            <p className="login-sub">
              {isLogin
                ? 'Personal, couples și business într-un spațiu financiar calm.'
                : 'În câteva secunde ai dashboard, buget, obiective și insight-uri.'}
            </p>
          </div>

          <form className="auth-form login-form" onSubmit={handleSubmit}>
            {/* campul de nickname apare doar la register */}
            {!isLogin && (
              <label className="fld">
                <span>Nickname</span>
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="ex: coroană"
                  required
                />
              </label>
            )}

            <label className="fld">
              <span>Email</span>
              <input
                value={email}
                type="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="fld">
              <span>Parolă</span>
              <input
                value={password}
                type="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            <button type="submit" className="btn-login" disabled={busy}>
              {busy
                ? 'Se procesează...'
                : isLogin
                  ? 'Conectează-te'
                  : 'Creează cont'}
            </button>
          </form>

          {/* mesaj de eroare sau confirmare */}
          {message && <p className="auth-message login-err">{message}</p>}

          {/* buton pentru a trece intre login si register */}
          <button
            type="button"
            className="auth-switch login-switch"
            onClick={() => {
              setIsLogin((previous) => !previous);
              setMessage('');
            }}
          >
            {isLogin ? 'Nu ai cont? Înregistrează-te' : 'Ai deja cont? Conectează-te'}
          </button>
        </div>

        {/* coloana dreapta: prezentarea features aplicatiei */}
        <div className="login-right">
          <h2 className="login-hero">
            Money clarity, <em>without chaos.</em>
          </h2>
          <p className="login-hero-sub">
            Dashboard, buget, obiective și rapoarte pentru fiecare mod de viață.
          </p>

          {/* carduri decorative care arata ce poate face aplicatia */}
          <div className="login-features">
            <div className="lf-card">
              <span><BudgetIcon size={17} /></span>
              <div>
                <strong>Budget</strong>
                <small>Planificat vs actual</small>
              </div>
            </div>

            <div className="lf-card">
              <span><CashFlowIcon size={17} /></span>
              <div>
                <strong>Cash Flow</strong>
                <small>Venituri și cheltuieli</small>
              </div>
            </div>

            <div className="lf-card">
              <span><GoalsIcon size={17} /></span>
              <div>
                <strong>Goals</strong>
                <small>Economii și progres</small>
              </div>
            </div>

            <div className="lf-card">
              <span><SparkIcon size={17} /></span>
              <div>
                <strong>Insights</strong>
                <small>Recomandări utile</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
