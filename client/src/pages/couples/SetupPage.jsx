// SetupPage.jsx - pagina de setup pentru modul Couples (/couple/setup)
// Userul introduce numele partenerului si se "conecteaza" cu el
// Datele se salveaza in localStorage (nu am implementat inca back-end complet pentru couples)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CoupleIcon } from '../../shared/icons.jsx';
import { useScrollReveal } from '../../shared/hooks.jsx';

export default function CouplesSetupPage({ coupleData, setCoupleData }) {
  const navigate = useNavigate();
  const revealRef = useScrollReveal();

  // numele partenerului introdus de user
  const [partnerName, setPartnerName] = useState(coupleData?.partnerName || '');

  // salvez datele si navighez la dashboardul de couples
  const connect = () => {
    const next = {
      coupled: true,
      partnerName: partnerName || 'Partner',
      connectedAt: new Date().toISOString(),
    };

    localStorage.setItem('laila-couple-data', JSON.stringify(next));
    setCoupleData(next);
    navigate('/couple/dashboard');
  };

  return (
    <div className="content-shell" ref={revealRef}>

      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Couples</p>
          <h1>Set up shared finance</h1>
          <span>Create a lightweight shared view for two people</span>
        </div>
      </header>

      {/* cardul principal de setup */}
      <section className="couple-setup-card scroll-reveal">
        <div className="couple-setup-art">
          <CoupleIcon size={46} />
        </div>

        <div className="couple-setup-copy">
          <h2>Manage money together without awkward spreadsheets.</h2>
          <p>
            Track shared expenses, see who paid what, and understand your combined cash flow.
          </p>

          <label>
            Partner name
            <input
              value={partnerName}
              onChange={(event) => setPartnerName(event.target.value)}
              placeholder="ex: Alex"
            />
          </label>

          <button type="button" className="btn btn-primary" onClick={connect}>
            Start couples mode
          </button>
        </div>
      </section>
    </div>
  );
}
