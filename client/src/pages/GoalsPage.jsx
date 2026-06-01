// GoalsPage.jsx - pagina cu obiectivele de economisire (/goals)
// Userul poate crea obiective (ex: vacanta, fond urgenta), contribui cu sume
// si urmareste progresul fiecarui obiectiv vizual
// Datele sunt salvate in MongoDB prin API-ul meu

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { PlusIcon, GoalsIcon, TrashIcon, CheckIcon } from '../shared/icons.jsx';
import { API } from '../shared/constants.js';

import {
  getPersonalTransactions,
  summarizeTransactions,
  formatCurrency,
  safeNumber,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';
import { EmptyState, LoadingCard } from '../shared/components.jsx';

// primesc si onDeposit ca sa pot anunta App.jsx sa refresheze tranzactiile dupa depunere
export default function GoalsPage({ userId, transactions, onDeposit }) {
  const revealRef = useScrollReveal();

  const [goals, setGoals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  // starea formularului de obiectiv nou
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
  });

  const personalTx = useMemo(() => getPersonalTransactions(transactions), [transactions]);
  const summary = useMemo(() => summarizeTransactions(personalTx), [personalTx]);

  // iau obiectivele de la server
  const fetchGoals = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${API}/api/goals/${userId}`);
      setGoals(response.data || []);
    } catch {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // calculez statisticile totale pentru sidebar
  const totalTarget = goals.reduce((sum, goal) => sum + safeNumber(goal.targetAmount), 0);
  const totalCurrent = goals.reduce((sum, goal) => sum + safeNumber(goal.currentAmount), 0);
  const completed = goals.filter((goal) => safeNumber(goal.currentAmount) >= safeNumber(goal.targetAmount)).length;

  // creez un obiectiv nou si il trimit la server
  const handleAdd = async (event) => {
    event.preventDefault();
    if (!newGoal.title || !newGoal.targetAmount || !userId) return;

    const payload = {
      userId,
      title: newGoal.title,
      targetAmount: Number(newGoal.targetAmount),
    };

    if (newGoal.deadline) payload.deadline = newGoal.deadline;

    await axios.post(`${API}/api/goals`, payload);

    setNewGoal({ title: '', targetAmount: '', deadline: '' });
    setShowAdd(false);
    fetchGoals();
  };

  // depun bani in obiectiv si creez si o tranzactie expense
  // asa soldul total scade automat
  const handleDeposit = async (goal, amount) => {
    const currentAmount = Math.min(
      safeNumber(goal.currentAmount) + amount,
      safeNumber(goal.targetAmount)
    );

    // actualizez suma din obiectiv
    await axios.put(`${API}/api/goals/${goal._id}`, { currentAmount });

    // creez si o tranzactie ca sa se reflecte in sold
    await axios.post(`${API}/api/transactions`, {
      userId,
      type: 'expense',
      category: 'other_exp',
      description: `Goal: ${goal.title}`,
      amount,
      date: new Date().toISOString().slice(0, 10),
      scope: 'personal',
    });

    fetchGoals();
    // anunt App.jsx sa refresheze tranzactiile → soldul se recalculeaza
    if (onDeposit) onDeposit();
  };

  // sterg un obiectiv
  const handleDelete = async (goalId) => {
    await axios.delete(`${API}/api/goals/${goalId}`);
    fetchGoals();
  };

  // gradientele pentru cover-ul vizual al fiecarui obiectiv
  const covers = [
    'linear-gradient(135deg, #a7f3d0, #34d399)',
    'linear-gradient(135deg, #93c5fd, #60a5fa)',
    'linear-gradient(135deg, #fde68a, #f59e0b)',
    'linear-gradient(135deg, #c4b5fd, #8b5cf6)',
    'linear-gradient(135deg, #67e8f9, #06b6d4)',
    'linear-gradient(135deg, #fda4af, #fb7185)',
  ];

  return (
    <div className="content-shell goals-page" ref={revealRef}>

      {/* header cu buton de adaugare */}
      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">Goals</p>
          <h1>Save up</h1>
          <span>Contribute and track progress towards financial goals</span>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setShowAdd((value) => !value)}>
          <PlusIcon size={16} />
          New goal
        </button>
      </header>

      <section className="goals-layout">

        {/* lista principala de obiective */}
        <main className="goals-list-shell scroll-reveal">
          <div className="goals-list-top">
            <h2>Save up</h2>
            <strong>{formatCurrency(totalTarget)}</strong>
          </div>

          {/* formularul de creare obiectiv (se arata la click pe "New goal") */}
          {showAdd && (
            <form className="goal-add-form tab-pane-enter" onSubmit={handleAdd}>
              <label>
                Goal name
                <input
                  value={newGoal.title}
                  onChange={(event) => setNewGoal((previous) => ({ ...previous, title: event.target.value }))}
                  placeholder="Vacation, Emergency Fund..."
                />
              </label>

              <label>
                Target amount
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(event) => setNewGoal((previous) => ({ ...previous, targetAmount: event.target.value }))}
                  placeholder="10000"
                />
              </label>

              <label>
                Target date
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(event) => setNewGoal((previous) => ({ ...previous, deadline: event.target.value }))}
                />
              </label>

              <button type="submit" className="btn btn-primary">Create</button>
            </form>
          )}

          {/* stare de loading, empty sau lista de obiective */}
          {loading ? (
            <LoadingCard />
          ) : goals.length === 0 ? (
            <EmptyState
              icon={GoalsIcon}
              title="No goals yet"
              description="Create your first goal and start tracking progress."
              action={() => setShowAdd(true)}
              actionLabel="Create goal"
            />
          ) : (
            <div className="goal-rows">
              {goals.map((goal, index) => {
                const current = safeNumber(goal.currentAmount);
                const target = safeNumber(goal.targetAmount);
                const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
                const remaining = Math.max(target - current, 0);
                const deadline = goal.deadline ? new Date(goal.deadline) : null;
                const daysLeft = deadline ? Math.ceil((deadline - new Date()) / 86400000) : null;
                const completedGoal = progress >= 100;

                return (
                  <article
                    key={goal._id}
                    className={`goal-row-card ${completedGoal ? 'completed' : ''}`}
                    style={{ '--delay': `${index * 65}ms` }}
                  >
                    {/* cover colorat cu icon */}
                    <div className="goal-cover" style={{ background: covers[index % covers.length] }}>
                      {completedGoal ? <CheckIcon size={24} /> : <GoalsIcon size={24} />}
                    </div>

                    <div className="goal-row-content">
                      <div className="goal-row-head">
                        <div>
                          <h3>{goal.title}</h3>
                          <p>
                            {completedGoal
                              ? 'Completed'
                              : daysLeft !== null
                                ? `${daysLeft > 0 ? daysLeft : 0} days left`
                                : 'No target date'}
                          </p>
                        </div>

                        <div className="goal-money">
                          <strong>{formatCurrency(current)}</strong>
                          <span>{progress}% of {formatCurrency(target)}</span>
                        </div>
                      </div>

                      {/* bara de progres */}
                      <div className="goal-progress-track">
                        <span style={{ width: `${progress}%` }} />
                      </div>

                      {!completedGoal && (
                        <p className="goal-remaining">
                          {formatCurrency(remaining)} remaining
                        </p>
                      )}
                    </div>

                    {/* butoanele de depunere (+100, +500, +1000) si stergere */}
                    <div className="goal-actions">
                      {!completedGoal && [100, 500, 1000].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleDeposit(goal, amount)}
                        >
                          +{amount}
                        </button>
                      ))}

                      <button type="button" className="danger" onClick={() => handleDelete(goal._id)}>
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* sidebar cu statistici si soldul disponibil */}
        <aside className="goals-side scroll-reveal">
          <div className="available-goals-card">
            <strong>{formatCurrency(Math.max(summary.balance, 0))}</strong>
            <span>Available for goals</span>
          </div>

          <div className="goal-stat-list">
            <div>
              <span>Total saved</span>
              <strong className="positive">{formatCurrency(totalCurrent)}</strong>
            </div>
            <div>
              <span>Total target</span>
              <strong>{formatCurrency(totalTarget)}</strong>
            </div>
            <div>
              <span>Completed</span>
              <strong>{completed}</strong>
            </div>
            <div>
              <span>Average progress</span>
              <strong>
                {goals.length
                  ? `${Math.round(goals.reduce((sum, goal) => {
                    const target = safeNumber(goal.targetAmount);
                    if (!target) return sum;
                    return sum + Math.min((safeNumber(goal.currentAmount) / target) * 100, 100);
                  }, 0) / goals.length)}%`
                  : '—'}
              </strong>
            </div>
          </div>

          <button type="button" className="allocate-btn" onClick={() => setShowAdd(true)}>
            Add new goal
          </button>

          <button type="button" className="edit-accounts-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Review goals
          </button>
        </aside>
      </section>
    </div>
  );
}
