import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './App.css';

// IMPORTURI IMAGINI
import bgImage from './bg-finance.png';
import bannerImg from './unnamed.jpg';

// --- CONFIGURARE CATEGORII ---
const CATEGORIES = {
  expense: [
    { id: 'food', label: 'Mâncare', icon: '🍔', color: '#e74c3c' },
    { id: 'transport', label: 'Transport', icon: '🚗', color: '#3498db' },
    { id: 'utilities', label: 'Utilități', icon: '💡', color: '#f39c12' },
    { id: 'entertainment', label: 'Divertisment', icon: '🎬', color: '#9b59b6' },
    { id: 'health', label: 'Sănătate', icon: '💊', color: '#e67e22' },
    { id: 'shopping', label: 'Cumpărături', icon: '🛍️', color: '#ff7979' },
    { id: 'other_exp', label: 'Altele (-)', icon: '🛒', color: '#95a5a6' }
  ],
  income: [
    { id: 'salary', label: 'Salariu', icon: '💰', color: '#27ae60' },
    { id: 'freelance', label: 'Freelance', icon: '💻', color: '#2ecc71' },
    { id: 'gift', label: 'Cadou', icon: '🎁', color: '#f1c40f' },
    { id: 'other_inc', label: 'Altele (+)', icon: '💵', color: '#1abc9c' }
  ]
};

const getCategoryInfo = (categoryId) => {
  const exp = CATEGORIES.expense.find(c => c.id === categoryId);
  if (exp) return exp;
  const inc = CATEGORIES.income.find(c => c.id === categoryId);
  if (inc) return inc;
  return { icon: '📌', color: '#bdc3c7', label: 'General' };
};

// --- PAGINA DE LOGIN ACTUALIZATĂ (STÂNGA BLUR / DREAPTA TEXT COMPLEX) ---
function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const dataToSend = isLogin ? { email, password } : { nickname, email, password };
      const response = await axios.post(`http://localhost:5000${endpoint}`, dataToSend);

      if (isLogin) {
        onLogin(response.data.nickname, response.data.userId);
        navigate('/');
      } else {
        setMessage(response.data.message);
        setIsLogin(true);
        setPassword('');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Eroare la server.");
    }
  };

  return (
    <div style={{
      position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0,
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${bgImage})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
    }}>
      <div style={{
        display: 'flex', width: '1000px', minHeight: '550px',
        borderRadius: '25px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'
      }}>

        {/* PARTEA STÂNGĂ: GLASSMORPHISM (BLUR) */}
        <div style={{
          flex: '1',
          background: 'rgba(255, 255, 255, 0.1)', // Foarte transparent
          backdropFilter: 'blur(25px)', // EFECTUL DE BLUR PUTERNIC
          WebkitBackdropFilter: 'blur(25px)',
          padding: '50px 45px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: 'white'
        }}>
          <h2 style={{ marginBottom: '10px', fontSize: '2.5rem', fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            {isLogin ? 'Pregătit de decolare?' : 'Creează Plan de Zbor'}
          </h2>
          <p style={{ marginBottom: '35px', fontSize: '1rem', opacity: 0.9 }}>
            {isLogin ? 'Introdu coordonatele pentru a accesa bordul de control.' : 'Înrolează-te și preia manșa finanțelor tale chiar azi.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {!isLogin && <input type="text" placeholder="Nickname Pilot" value={nickname} onChange={(e) => setNickname(e.target.value)} required style={{ padding: '15px', borderRadius: '12px', border: 'none', fontSize: '1rem', background: 'rgba(255,255,255,0.9)', color: '#1a2a47', outline: 'none' }} />}
            <input type="email" placeholder="Coordonate Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '15px', borderRadius: '12px', border: 'none', fontSize: '1rem', background: 'rgba(255,255,255,0.9)', color: '#1a2a47', outline: 'none' }} />
            <input type="password" placeholder="Cod de Acces (Parolă)" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '15px', borderRadius: '12px', border: 'none', fontSize: '1rem', background: 'rgba(255,255,255,0.9)', color: '#1a2a47', outline: 'none' }} />
            <button type="submit" style={{ background: '#3498db', padding: '16px', borderRadius: '12px', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(52, 152, 219, 0.4)', transition: '0.3s' }}>
              {isLogin ? 'Lansează Dashboard' : 'Confirmă Înrolarea'}
            </button>
          </form>

          {message && <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '20px', color: '#ff7675' }}>{message}</p>}
          <p style={{ textAlign: 'center', cursor: 'pointer', color: 'white', marginTop: '30px', fontSize: '0.95rem', fontWeight: 'bold', textDecoration: 'underline' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Nu ai licență? Înregistrează-te ➔' : 'Ești deja pilot? Conectează-te ➔'}
          </p>
        </div>

        {/* PARTEA DREAPTĂ: TEXT COMPLEX ȘI MODERN */}
        <div style={{
          flex: '1.2',
          background: '#1a2a47',
          color: 'white',
          padding: '60px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{ background: 'rgba(52, 152, 219, 0.2)', padding: '8px 15px', borderRadius: '30px', width: 'fit-content', fontSize: '0.85rem', color: '#3498db', fontWeight: 'bold', marginBottom: '25px' }}>
            ✈️ COPILOTUL TĂU INTELIGENT
          </div>
          <h1 style={{ fontSize: '3.2rem', margin: '0 0 20px 0', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-1px' }}>
            Navighează cu Precizie în Lumea Banilor.
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#bdc3c7', marginBottom: '40px' }}>
            CashPilots nu este doar un simplu tracker. Este sistemul tău de navigație prin turbulențele economice. Transformăm datele brute în viziune clară, oferindu-ți control total asupra fiecărei mile financiare parcurse.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '10px' }}>🧭</span>
              <strong style={{ display: 'block', marginBottom: '5px' }}>Direcție Clară</strong>
              <small style={{ opacity: 0.6 }}>Vezi exact unde pleacă fiecare leu și ajustează cursul.</small>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '10px' }}>📉</span>
              <strong style={{ display: 'block', marginBottom: '5px' }}>Zero Turbulențe</strong>
              <small style={{ opacity: 0.6 }}>Anticipează cheltuielile și aterizează mereu pe profit.</small>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
function HistoryPage({ transactions, onDelete, onUpdate, getCategoryInfo, categories }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', amount: 0, category: '' });

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (t) => {
    setEditingId(t._id);
    setEditForm({ description: t.description, amount: t.amount, category: t.category });
  };

  const saveEdit = (id) => {
    onUpdate(id, editForm);
    setEditingId(null);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#1a2a47', fontWeight: '800', marginBottom: '25px' }}>📜 Jurnal de Bord Financiar</h2>
      
      <input 
        type="text" 
        placeholder="Caută în istoric..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid #dfe6e9', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredTransactions.map(t => {
          const info = getCategoryInfo(t.category);
          const isEditing = editingId === t._id;

          return (
            <div key={t._id} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '20px', background: 'white', borderRadius: '20px', 
              boxShadow: '0 8px 20px rgba(0,0,0,0.03)', borderLeft: `8px solid ${info.color}` 
            }}>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                  <input type="text" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{flex: 2, padding: '8px', borderRadius: '8px', border: '1px solid #ddd'}} />
                  <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})} style={{width: '100px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd'}} />
                  <button onClick={() => saveEdit(t._id)} style={{background: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer'}}>Ok</button>
                  <button onClick={() => setEditingId(null)} style={{background: '#bdc3c7', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer'}}>X</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '2rem' }}>{info.icon}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2d3436' }}>{t.description}</div>
                      <div style={{ color: '#95a5a6', fontSize: '0.85rem' }}>{info.label} • {new Date(t.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <strong style={{ fontSize: '1.3rem', color: t.type === 'income' ? '#2ecc71' : '#e74c3c' }}>
                      {t.type === 'income' ? '+' : '-'}{t.amount} RON
                    </strong>
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <button onClick={() => startEdit(t)} style={{ background: '#f0f2f5', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>✏️</button>
                       <button onClick={() => onDelete(t._id)} style={{ background: '#fff0f0', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
// --- APLICATIA PRINCIPALA ---
function App() {
  const [userNickname, setUserNickname] = useState(localStorage.getItem('userNickname') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', type: 'expense', category: 'food' });

  useEffect(() => { if (userId) fetchTransactions(); }, [userId]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/transactions/${userId}`);
      setTransactions(response.data);
    } catch (error) { console.error(error); }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setForm({ ...form, type: newType, category: CATEGORIES[newType][0].id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) return alert("Completează tot!");
    await axios.post('http://localhost:5000/api/transactions', { ...form, userId });
    setForm({ description: '', amount: '', type: 'expense', category: 'food' });
    fetchTransactions();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/transactions/${id}`);
    fetchTransactions();
  };
  const handleUpdate = async (id, updatedData) => {
  try {
    await axios.put(`http://localhost:5000/api/transactions/${id}`, updatedData);
    fetchTransactions(); // Reîmprospătăm lista după editare
  } catch (error) {
    console.error("Eroare la editare:", error);
    alert("Nu s-a putut salva modificarea.");
  }
};

  const handleLogin = (nickname, id) => {
    setUserNickname(nickname); setUserId(id);
    localStorage.setItem('userNickname', nickname); localStorage.setItem('userId', id);
  };

  const handleLogout = () => {
    setUserNickname(null); setUserId(null); localStorage.clear();
    window.location.href = '/login';
  };

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const dataByCategory = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
  }, {});
  const chartData = Object.keys(dataByCategory).map(catId => {
    const info = getCategoryInfo(catId);
    return { name: info.label, value: dataByCategory[catId], color: info.color };
  });

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f7fa', fontFamily: "'Segoe UI', sans-serif" }}>

        {/* NAVBAR - LOGO STÂNGA, MENIU DREAPTA */}
        <nav style={{ background: '#1a2a47', color: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900' }}>✈️ CashPilots</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {userNickname ? (
              <>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/istoric" style={{ color: 'white', textDecoration: 'none' }}>Istoric</Link>
                <span style={{ color: '#f39c12', fontWeight: 'bold', paddingLeft: '15px', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>👋 {userNickname}</span>
                <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>Ieșire</button>
              </>
            ) : <Link to="/login" style={{ color: 'white', textDecoration: 'none', background: '#3498db', padding: '8px 20px', borderRadius: '8px' }}>Login</Link>}
          </div>
        </nav>

        <div style={{ flex: 1, padding: '40px 20px' }}>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />

            <Route path="/" element={userNickname ? (
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* 1. HERO BANNER CU IMAGINEA TA (unnamed.jpg) */}
                <div style={{
                  background: 'linear-gradient(135deg, #1a2a47 0%, #2c3e50 100%)',
                  padding: '40px 50px', borderRadius: '30px', marginBottom: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  color: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ zIndex: 2 }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Salut, {userNickname}! 👋</h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Balanța ta: <strong style={{ color: '#2ecc71' }}>{balance} RON</strong></p>
                  </div>
                  <img src={bannerImg} alt="Banner" style={{ height: '180px', zIndex: 2, borderRadius: '20px' }} />
                  <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#3498db', opacity: 0.1, borderRadius: '50%', top: '-100px', right: '-50px' }}></div>
                </div>

                {/* 2. CARDURI STATUS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', color: 'white', padding: '30px', borderRadius: '20px' }}>
                    <h3 style={{ margin: 0, opacity: 0.8 }}>Venituri</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>+{income} RON</p>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #ff7675 0%, #d63031 100%)', color: 'white', padding: '30px', borderRadius: '20px' }}>
                    <h3 style={{ margin: 0, opacity: 0.8 }}>Cheltuieli</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>-{expense} RON</p>
                  </div>
                </div>

                {/* 3. GRAFIC + FORMULAR (SIDE BY SIDE) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' }}>
                  <div style={{ background: 'white', padding: '35px', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ marginBottom: '30px' }}>📊 Analiză Categorii</h3>
                    <div style={{ height: '320px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: '#f8f9fa' }} />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={50}>
                            {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* FORMULARUL CU SELECTORUL DE CATEGORIE */}
                  <div style={{ background: 'white', padding: '35px', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                    <h3>➕ Tranzacție Nouă</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Tip</label>
                          <select value={form.type} onChange={handleTypeChange} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #dfe6e9' }}>
                            <option value="expense">📉 Cheltuială</option>
                            <option value="income">📈 Venit</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Categorie</label>
                          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #dfe6e9' }}>
                            {CATEGORIES[form.type].map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <input type="text" placeholder="Descriere" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #dfe6e9' }} />
                      <input type="number" placeholder="Suma" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #dfe6e9', fontWeight: 'bold' }} />
                      <button type="submit" style={{ padding: '18px', borderRadius: '12px', border: 'none', background: form.type === 'income' ? '#27ae60' : '#e74c3c', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Adaugă în Buget</button>
                    </form>
                  </div>
                </div>

              </div>
            ) : <Navigate to="/login" />} />

            <Route path="/istoric" element={userNickname ? (
              <HistoryPage
                transactions={transactions}
                onDelete={handleDelete}
                onUpdate={handleUpdate} // Am adăugat funcția de update aici
                getCategoryInfo={getCategoryInfo}
                categories={CATEGORIES}
              />
            ) : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;