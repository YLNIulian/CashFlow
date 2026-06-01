// ProfilePage.jsx - pagina de profil a utilizatorului (/profile)
// Arata: avatarul, nickname-ul (editabil), email-ul si statisticile totale
// Nickname-ul e salvat si in localStorage si in MongoDB

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { CheckIcon, EditIcon } from '../shared/icons.jsx';
import { API } from '../shared/constants.js';

import {
  getPersonalTransactions,
  summarizeTransactions,
  formatCurrency,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';

export default function ProfilePage({ userId, userNickname, transactions, onUpdateNickname }) {
  const revealRef = useScrollReveal();

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(userNickname || '');

  // datele complete ale userului (email, data inregistrarii)
  const [userData, setUserData] = useState(null);

  // incarc datele userului de la server
  useEffect(() => {
    if (!userId) return;

    axios.get(`${API}/api/users/${userId}`)
      .then((response) => setUserData(response.data))
      .catch(() => setUserData(null));
  }, [userId]);

  const personalTx = useMemo(() => getPersonalTransactions(transactions), [transactions]);
  const summary = useMemo(() => summarizeTransactions(personalTx), [personalTx]);

  // salvez nickname-ul nou la server si actualizez in App.jsx
  const saveNickname = async () => {
    if (!nickname.trim()) return;

    try {
      await axios.put(`${API}/api/users/${userId}`, { nickname: nickname.trim() });
      onUpdateNickname(nickname.trim());
      setEditing(false);
    } catch {
      setEditing(false);
    }
  };

  return (
    <div className="content-shell profile-page" ref={revealRef}>

      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Profile</p>
          <h1>Your account</h1>
          <span>Manage your Laila identity and overview</span>
        </div>
      </header>

      {/* cardul principal cu avatarul si nickname-ul */}
      <section className="profile-hero scroll-reveal">
        {/* avatarul e prima litera din nickname */}
        <div className="profile-avatar-xl">
          {userNickname?.[0]?.toUpperCase() || 'L'}
        </div>

        <div className="profile-copy">
          {editing ? (
            /* formular de editare nickname */
            <div className="profile-edit-inline">
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                autoFocus
              />
              <button type="button" onClick={saveNickname}>
                <CheckIcon size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setNickname(userNickname || '');
                  setEditing(false);
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <h2>
              {userNickname}
              {/* buton de editare langa nume */}
              <button type="button" onClick={() => setEditing(true)}>
                <EditIcon size={14} />
              </button>
            </h2>
          )}

          <p>{userData?.email || 'No email loaded'}</p>
          <span>
            {userData?.createdAt
              ? `Member since ${new Date(userData.createdAt).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}`
              : 'Personal workspace'}
          </span>
        </div>
      </section>

      {/* statisticile rapide ale userului */}
      <section className="transactions-summary-grid scroll-reveal">
        <div className="summary-card">
          <span>Transactions</span>
          <strong>{summary.count}</strong>
        </div>
        <div className="summary-card">
          <span>Income tracked</span>
          <strong className="positive">+{formatCurrency(summary.income)}</strong>
        </div>
        <div className="summary-card">
          <span>Expenses tracked</span>
          <strong className="negative">−{formatCurrency(summary.expense)}</strong>
        </div>
        <div className="summary-card">
          <span>Net</span>
          <strong className={summary.balance >= 0 ? 'positive' : 'negative'}>
            {formatCurrency(summary.balance, { signed: true })}
          </strong>
        </div>
      </section>

      {/* detalii despre workspace: mod, moneda, locale */}
      <section className="profile-detail-card scroll-reveal">
        <div className="panel-head">
          <div>
            <span className="section-mini-label">Preferences</span>
            <h2>Workspace details</h2>
          </div>
        </div>

        <div className="profile-detail-grid">
          <div>
            <span>Current mode</span>
            <strong>Personal</strong>
          </div>
          <div>
            <span>Currency</span>
            <strong>RON</strong>
          </div>
          <div>
            <span>Locale</span>
            <strong>Romania</strong>
          </div>
          <div>
            <span>Data source</span>
            <strong>Manual tracking</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
