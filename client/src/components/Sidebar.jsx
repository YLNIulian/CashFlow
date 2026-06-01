// Sidebar.jsx - bara laterala de navigare a aplicatiei
// Contine: logo, selectorul de mod (Personal/Couples/Business),
// lista de linkuri de navigare, butonul AI Assistant, support si footer cu userul

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  SearchIcon,
  UserIcon,
  CoupleIcon,
  BusinessIcon,
  SparkIcon,
  AdviceIcon,
  LogoutIcon,
  ReportsIcon,
  BudgetIcon,
  CashFlowIcon,
  ForecastingIcon,
  LailaLogoIcon,
  ChevronDownIcon,
} from '../shared/icons.jsx';

import { NAV_PERSONAL, NAV_COUPLES, NAV_BUSINESS } from '../shared/constants.js';

// -----------------------------------------------------------------------
// Sidebar primeste:
// userNickname - numele userului logat (afisat in footer)
// onLogout     - functia de delogare
// darkMode     - true/false pentru tema
// onToggleDark - schimba tema
// mode         - 'personal' / 'couples' / 'business'
// onModeChange - schimba modul curent
// coupleData   - daca userul e in cuplu sau nu
// onOpenCommand - deschide paleta Ctrl+K
// -----------------------------------------------------------------------

export default function Sidebar({
  userNickname,
  onLogout,
  darkMode,
  onToggleDark,
  mode,
  onModeChange,
  coupleData,
  onOpenCommand,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // controlez deschiderea modalelor de Support si AI din sidebar
  const [supportOpen, setSupportOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // starea pentru sectiunea Tips & Insights colapsibila
  const [tipsOpen, setTipsOpen] = useState(false);

  // aleg meniul potrivit in functie de modul curent
  const navItems = mode === 'couples'
    ? NAV_COUPLES
    : mode === 'business'
      ? NAV_BUSINESS
      : NAV_PERSONAL;

  // schimb modul si navighez la pagina de start a acelui mod
  const changeMode = (nextMode) => {
    onModeChange(nextMode);

    if (nextMode === 'personal') navigate('/dashboard');
    if (nextMode === 'couples') {
      // daca nu e conectat la cuplu, il trimit la pagina de setup
      navigate(coupleData?.coupled ? '/couple/dashboard' : '/couple/setup');
    }
    if (nextMode === 'business') navigate('/business/dashboard');
  };

  // copiez link-ul de invitatie in clipboard
  const copyInvite = async () => {
    const invite = `${window.location.origin}/login?invite=${encodeURIComponent(userNickname || 'laila')}`;

    try {
      await navigator.clipboard.writeText(invite);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside className={`app-sidebar sidebar-${mode}`}>

      {/* logo si buton de cautare */}
      <div className="sidebar-top">
        <button type="button" className="sidebar-brand" onClick={() => navigate('/dashboard')}>
          <span className="sidebar-mark">
            <LailaLogoIcon size={22} />
          </span>
          <span className="sidebar-brand-text">Laila</span>
        </button>

        <button type="button" className="sidebar-icon-button" onClick={onOpenCommand} title="Caută">
          <SearchIcon size={16} />
        </button>
      </div>

      {/* selectorul de mod: Personal / Couples / Business */}
      <div className="mode-segment" aria-label="Schimbă modul">
        <button
          type="button"
          className={mode === 'personal' ? 'active personal' : ''}
          onClick={() => changeMode('personal')}
          title="Personal"
        >
          <UserIcon size={13} />
          <span>Personal</span>
        </button>

        <button
          type="button"
          className={mode === 'couples' ? 'active couples' : ''}
          onClick={() => changeMode('couples')}
          title="Couples"
        >
          <CoupleIcon size={13} />
          <span>Couples</span>
        </button>

        <button
          type="button"
          className={mode === 'business' ? 'active business' : ''}
          onClick={() => changeMode('business')}
          title="Business"
        >
          <BusinessIcon size={13} />
          <span>Biz</span>
        </button>
      </div>

      {/* lista de linkuri - se schimba automat in functie de mod */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.Icon;

          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${active ? 'active' : ''}`}
              onClick={() => {
                // daca e in modul couples dar nu e conectat, il trimit la setup
                if (mode === 'couples' && !coupleData?.coupled && item.path !== '/couple/setup') {
                  navigate('/couple/setup');
                  return;
                }

                navigate(item.path);
              }}
            >
              <span className="sidebar-link-icon">
                <Icon size={18} />
              </span>
              <span className="sidebar-link-text">{item.label}</span>
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* sectiunea secundara: AI Assistant si Support */}
      <div className="sidebar-secondary">
        <button
          type="button"
          className="sidebar-secondary-link accent"
          onClick={() => navigate('/advice')}
        >
          <SparkIcon size={16} />
          <span>AI Assistant</span>
        </button>

        <button
          type="button"
          className="sidebar-secondary-card"
          onClick={() => setSupportOpen(true)}
        >
          <span className="sidebar-secondary-card-icon">
            <AdviceIcon size={18} />
          </span>
          <span>
            <strong>Support & Invite</strong>
            <small>Ajutor, feedback și link de invitație</small>
          </span>
        </button>
      </div>

      {/* sectiunea Tips & Insights colapsibila */}
      <div className="sidebar-tips-section">
        <button
          type="button"
          className="sidebar-tips-toggle"
          onClick={() => setTipsOpen((v) => !v)}
        >
          <SparkIcon size={14} />
          <span>Tips & Insights</span>
          <span className={`sidebar-tips-arrow ${tipsOpen ? 'open' : ''}`}>
            <ChevronDownIcon size={13} />
          </span>
        </button>

        {tipsOpen && (
          <div className="sidebar-tips-list">
            <div className="sidebar-tip-card">
              <span>💡</span>
              <p>Regula 50/30/20: 50% nevoi, 30% dorințe, 20% economii.</p>
            </div>
            <div className="sidebar-tip-card">
              <span>🛡️</span>
              <p>Fond de urgență: ideal 3-6 luni de cheltuieli rezervate.</p>
            </div>
            <div className="sidebar-tip-card">
              <span>📅</span>
              <p>Plătește-te pe tine primul — separă economiile la început de lună.</p>
            </div>
            <div className="sidebar-tip-card">
              <span>🔍</span>
              <p>Cheltuielile mici se adună. Urmărește-le săptămânal!</p>
            </div>
          </div>
        )}
      </div>

      {/* footer: toggle tema + informatii user + buton logout */}
      <div className="sidebar-footer">
        <button type="button" className="theme-toggle" onClick={onToggleDark}>
          <span>{darkMode ? 'Light' : 'Dark'}</span>
          <span className="theme-toggle-dot">{darkMode ? '☼' : '☾'}</span>
        </button>

        <div className="sidebar-user">
          <button type="button" className="sidebar-user-main" onClick={() => navigate('/profile')}>
            <span className="sidebar-avatar">{userNickname?.[0]?.toUpperCase() || 'L'}</span>
            <span className="sidebar-user-name">{userNickname || 'User'}</span>
          </button>

          <button type="button" className="sidebar-logout" onClick={onLogout} title="Logout">
            <LogoutIcon size={16} />
          </button>
        </div>
      </div>

      {/* modal Support & Invite - apare cand dai click pe cardul din sidebar */}
      {supportOpen && (
        <div className="laila-modal-backdrop" onClick={() => setSupportOpen(false)}>
          <div className="laila-modal" onClick={(event) => event.stopPropagation()}>
            <div className="laila-modal-head">
              <div>
                <span className="section-mini-label">Support</span>
                <h2>Support & Invite</h2>
              </div>
              <button type="button" onClick={() => setSupportOpen(false)}>×</button>
            </div>

            <div className="support-grid">
              <button
                type="button"
                className="support-action"
                onClick={() => {
                  window.location.href = 'mailto:support@laila.app?subject=Am nevoie de ajutor în Laila';
                }}
              >
                <span className="support-action-icon"><AdviceIcon size={20} /></span>
                <span>
                  <strong>Contact support</strong>
                  <small>Deschide emailul pentru mesaj către suport.</small>
                </span>
              </button>

              <button
                type="button"
                className="support-action"
                onClick={copyInvite}
              >
                <span className="support-action-icon"><CoupleIcon size={20} /></span>
                <span>
                  <strong>{copied ? 'Link copiat!' : 'Copy invite link'}</strong>
                  <small>Trimite Laila unui prieten sau partener.</small>
                </span>
              </button>

              <button
                type="button"
                className="support-action"
                onClick={() => {
                  setSupportOpen(false);
                  navigate('/profile');
                }}
              >
                <span className="support-action-icon"><UserIcon size={20} /></span>
                <span>
                  <strong>Account settings</strong>
                  <small>Editează profilul și preferințele.</small>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal AI Assistant - shortcut-uri catre paginile principale */}
      {aiOpen && (
        <div className="laila-modal-backdrop" onClick={() => setAiOpen(false)}>
          <div className="laila-modal ai-modal" onClick={(event) => event.stopPropagation()}>
            <div className="laila-modal-head">
              <div>
                <span className="section-mini-label">Assistant</span>
                <h2>AI Assistant</h2>
              </div>
              <button type="button" onClick={() => setAiOpen(false)}>×</button>
            </div>

            <div className="ai-command-grid">
              <button type="button" onClick={() => { setAiOpen(false); navigate('/reports'); }}>
                <ReportsIcon size={20} />
                <span>
                  <strong>Analyze spending</strong>
                  <small>Deschide rapoarte și vezi top categorii.</small>
                </span>
              </button>

              <button type="button" onClick={() => { setAiOpen(false); navigate('/budget'); }}>
                <BudgetIcon size={20} />
                <span>
                  <strong>Plan budget</strong>
                  <small>Setează limite lunare pe categorii.</small>
                </span>
              </button>

              <button type="button" onClick={() => { setAiOpen(false); navigate('/cashflow'); }}>
                <CashFlowIcon size={20} />
                <span>
                  <strong>Check cash flow</strong>
                  <small>Vezi veniturile, cheltuielile și netul.</small>
                </span>
              </button>

              <button type="button" onClick={() => { setAiOpen(false); navigate('/forecasting'); }}>
                <ForecastingIcon size={20} />
                <span>
                  <strong>Forecast balance</strong>
                  <small>Proiecție pentru următoarele luni.</small>
                </span>
              </button>
            </div>

            <div className="ai-note">
              <SparkIcon size={18} />
              <p>
                Laila folosește tranzacțiile tale ca să îți arate rapid unde se duc banii,
                ce categorie apasă bugetul și ce merită ajustat luna asta.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
