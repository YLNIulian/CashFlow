// LandingPage.jsx - pagina de start a aplicatiei (/)
// Asta e prima pagina pe care o vede un utilizator care nu e logat
// Am pus: un navbar simplu, un hero cu text si un preview animat al dashboard-ului,
// si o sectiune cu 3 features principale ale aplicatiei

import { useNavigate } from 'react-router-dom';

import {
  SparkIcon,
  BudgetIcon,
  CashFlowIcon,
  CoupleIcon,
  GoalsIcon,
  FoodIcon,
  IncomeIcon,
  LailaLogoIcon,
} from '../shared/icons.jsx';

export default function LandingPage() {
  const navigate = useNavigate();

  // randurile fake din cardul de preview - arata cum ar arata dashboard-ul
  const previewRows = [
    { label: 'Mâncare', meta: 'Buget urmărit', value: '−700 RON', Icon: FoodIcon, tone: 'expense' },
    { label: 'Salariu', meta: 'Venit lunar', value: '+2.100 RON', Icon: IncomeIcon, tone: 'income' },
    { label: 'Vacanță', meta: 'Obiectiv activ', value: '72%', Icon: GoalsIcon, tone: 'goal' },
  ];

  return (
    <div className="landing-page">

      {/* navbar - logo si butoanele de login/register */}
      <nav className="landing-nav">
        <button type="button" className="landing-brand" onClick={() => navigate('/')}>
          <span className="landing-brand-mark">
            <LailaLogoIcon size={22} />
          </span>
          <strong>Laila</strong>
        </button>

        <div className="landing-nav-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>
            Login
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
            Start now
          </button>
        </div>
      </nav>

      {/* sectiunea hero: textul din stanga si preview-ul din dreapta */}
      <main className="landing-hero">

        {/* textul principal cu titlu, subtitlu, butoane CTA si 3 statistici */}
        <section className="landing-copy">
          <span className="landing-pill">
            <SparkIcon size={15} />
            Personal · Couples · Business
          </span>

          <h1 className="landing-title">
            Controlează banii <span>fără haos.</span>
          </h1>

          <p className="landing-subtitle">
            Laila îți adună veniturile, cheltuielile, bugetele, obiectivele și cash flow-ul
            într-un spațiu elegant, rapid și ușor de urmărit.
          </p>

          <div className="landing-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/login')}>
              Creează cont
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/login')}>
              Intră în cont
            </button>
          </div>

          {/* 3 cifre mici care arata ce ofera aplicatia */}
          <div className="landing-stats">
            <article className="landing-stat">
              <strong>3</strong>
              <span>moduri de lucru</span>
            </article>
            <article className="landing-stat">
              <strong>Live</strong>
              <span>cash flow lunar</span>
            </article>
            <article className="landing-stat">
              <strong>AI</strong>
              <span>recomandări utile</span>
            </article>
          </div>
        </section>

        {/* preview vizual al aplicatiei - cardul mare + 2 carduri mici care plutesc */}
        <section className="landing-visual" aria-label="Laila dashboard preview">
          <div className="landing-orb landing-orb-one" />
          <div className="landing-orb landing-orb-two" />

          {/* cardul principal care simuleaza dashboard-ul */}
          <article className="landing-card-main">
            <div className="landing-card-top">
              <div>
                <span>Total balance</span>
                <strong>+3.446 RON</strong>
              </div>
              <em className="landing-card-pill">Healthy</em>
            </div>

            {/* mini bara chart decorativa */}
            <div className="landing-mini-chart">
              {[38, 58, 42, 78, 64, 88, 72].map((height) => (
                <span key={height} style={{ height: `${height}%` }} />
              ))}
            </div>

            {/* randurile fake care arata categorii de tranzactii */}
            <div className="landing-rows">
              {previewRows.map((row) => {
                const Icon = row.Icon;

                return (
                  <div key={row.label} className={`landing-row ${row.tone}`}>
                    <div>
                      <span className="landing-row-icon">
                        <Icon size={16} />
                      </span>
                      <span>
                        <strong>{row.label}</strong>
                        <small>{row.meta}</small>
                      </span>
                    </div>
                    <em>{row.value}</em>
                  </div>
                );
              })}
            </div>
          </article>

          {/* carduri mici care plutesc peste cardul principal */}
          <article className="landing-floating-card one">
            <span>Left to budget</span>
            <strong>1.400 RON</strong>
          </article>

          <article className="landing-floating-card two">
            <span>Monthly rhythm</span>
            <strong>+18%</strong>
          </article>
        </section>
      </main>

      {/* sectiunea cu cele 3 features principale */}
      <section className="landing-section">
        <div className="landing-section-head">
          <h2>Tot ce contează, fără ecrane aglomerate.</h2>
          <p>Bugete, rapoarte, obiective și recomandări într-un UI curat, cu animații subtile și focus pe claritate.</p>
        </div>

        <div className="landing-feature-grid">
          <article className="landing-feature">
            <span className="landing-feature-icon"><BudgetIcon size={22} /></span>
            <h3>Bugete clare</h3>
            <p>Planificat, cheltuit și rămas pentru fiecare categorie.</p>
          </article>

          <article className="landing-feature">
            <span className="landing-feature-icon"><CashFlowIcon size={22} /></span>
            <h3>Cash flow vizual</h3>
            <p>Vezi rapid dacă luna merge bine sau trebuie ajustată.</p>
          </article>

          <article className="landing-feature">
            <span className="landing-feature-icon"><CoupleIcon size={22} /></span>
            <h3>Couples mode</h3>
            <p>Un spațiu comun pentru cheltuieli și obiective împreună.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
