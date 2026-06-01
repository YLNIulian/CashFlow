// AdvicePage.jsx - chat AI local cu asistentul financiar (/advice)
// Nu foloseste niciun API extern - analizeaza datele reale ale userului
// si genereaza raspunsuri inteligente in romana, complet offline
// Fisier: src/pages/AdvicePage.jsx

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

import { SparkIcon, SendIcon } from '../shared/icons.jsx';
import { API } from '../shared/constants.js';

import {
  getPersonalTransactions,
  summarizeTransactions,
  getMonthlyTransactions,
  buildCategoryBreakdown,
  formatCurrency,
  safeNumber,
} from '../shared/helpers.js';

import { useScrollReveal } from '../shared/hooks.jsx';

// -----------------------------------------------------------------------
// MOTORUL LOCAL DE RASPUNSURI
// Analizeaza mesajul userului si returneaza un raspuns bazat pe datele reale
// -----------------------------------------------------------------------

function generateResponse(message, { summary, monthSummary, categoryData, goals, name, personalTx }) {
  const msg = message.toLowerCase().trim();
  const fmt = (n) => formatCurrency(n);

  // --- detectez intrebarile fara legatura cu finantele ---
  const financialKeywords = [
    'cheltuiel', 'venit', 'sold', 'bani', 'obiectiv', 'economis', 'sfat',
    'financiar', 'lunar', 'categor', 'tranzact', 'buget', 'permit', 'cat am',
    'câți', 'unde', 'cel mai mult', 'luna asta', 'cum stau', 'balance', 'total',
    'ajut', 'recomand', 'ce fac', 'goal', 'stau', 'cumpăr', 'cumpar', 'achizit',
    'câștig', 'castig', 'salariu', 'disponibil', 'ramas', 'rămas', 'mai am',
    'trecuta', 'trecută', 'comparati', 'fata de', 'față de', 'cea mai mare',
    'investi', 'acții', 'actii', 'azi', 'astăzi', 'ieri', 'merit', 'iau',
    'cât mai', 'cat mai', 'câștigat', 'castigat',
  ];
  const isFinancial = financialKeywords.some((kw) => msg.includes(kw));

  if (!isFinancial) {
    const preview = message.length > 35 ? `${message.slice(0, 35)}...` : message;
    return `Eu mă ocup doar de finanțele tale, ${name}! 😊 Nu știu să răspund la "${preview}". Încearcă: "Cum stau cu cheltuielile?" sau "Pot să cumpăr ceva de 1000 RON?"`;
  }

  // --- pot sa cumpar X / imi permit ---
  if (msg.includes('cumpăr') || msg.includes('cumpar') || msg.includes('îmi permit') || msg.includes('imi permit') || msg.includes('merit') || msg.includes('achizit') || msg.includes('iau un') || msg.includes('iau o')) {
    // extrag suma din mesaj daca exista (ex: "pot sa cumpar ceva de 2000 ron")
    const numbers = message.match(/\d+(?:[.,]\d+)?/g);
    const amount = numbers ? Math.max(...numbers.map((n) => parseFloat(n.replace(',', '.')))) : null;

    if (amount && amount > 0) {
      if (summary.balance <= 0) {
        return `${name}, cu soldul actual de **${fmt(summary.balance)}** nu îți recomand să cumperi ceva de **${fmt(amount)}** acum 😬 Mai întâi intră pe plus!`;
      } else if (amount > summary.balance) {
        return `${name}, **${fmt(amount)}** depășește soldul tău de **${fmt(summary.balance)}** ❌ Nu îți recomand această achiziție. Economisește mai întâi!`;
      } else if (amount > summary.balance * 0.5) {
        const pct = Math.round((amount / summary.balance) * 100);
        return `${name}, **${fmt(amount)}** reprezintă **${pct}%** din soldul tău de **${fmt(summary.balance)}** ⚠️ E mult! Asigură-te că mai ai bani pentru urgențe înainte să cumperi.`;
      } else if (amount > summary.balance * 0.2) {
        const pct = Math.round((amount / summary.balance) * 100);
        return `${name}, tehnic poți cumpăra ceva de **${fmt(amount)}** — ai **${fmt(summary.balance)}** și reprezintă **${pct}%** 🤔 Gândește-te dacă e o necesitate sau o dorință.`;
      } else {
        const pct = Math.round((amount / summary.balance) * 100);
        return `${name}, **${fmt(amount)}** e accesibil! Reprezintă doar **${pct}%** din soldul tău de **${fmt(summary.balance)}** ✅ Dacă ai nevoie de el, mergi!`;
      }
    }

    // nu a specificat suma — il rog sa o spuna
    if (summary.balance <= 0) {
      return `${name}, momentan soldul tău e **${fmt(summary.balance)}** 😬 Nu e momentul potrivit pentru achiziții. Concentrează-te să intri pe plus!`;
    }
    return `${name}, ai **${fmt(summary.balance)}** disponibili 💰 Spune-mi suma exactă și îți spun dacă îți permiți! De ex: "Pot să cumpăr ceva de 2000 RON?"`;
  }

  // --- venituri / cat castig / salariu ---
  if (msg.includes('venit') || msg.includes('câștig') || msg.includes('castig') || msg.includes('salariu') || msg.includes('câștigat') || msg.includes('castigat')) {
    if (summary.income === 0) {
      return `${name}, nu am venituri înregistrate 📭 Adaugă tranzacții de tip Income și îți voi arăta situația completă!`;
    }
    return `${name}, ai înregistrat **${fmt(summary.income)}** venituri totale 💵 Luna asta: **${fmt(monthSummary.income)}**. Cheltuielile lunii: ${fmt(monthSummary.expense)} — îți rămân **${fmt(monthSummary.balance)}**.`;
  }

  // --- cat mai am disponibil luna asta ---
  if (msg.includes('disponibil') || msg.includes('mai am') || msg.includes('ramas') || msg.includes('rămas') || msg.includes('cât mai') || msg.includes('cat mai')) {
    if (monthSummary.income === 0) {
      return `${name}, nu ai venituri înregistrate luna asta 📭 Adaugă venitul și îți voi spune cât îți rămâne disponibil!`;
    }
    const available = monthSummary.balance;
    if (available > 0) {
      return `${name}, luna asta îți mai rămân **${fmt(available)}** disponibili 💰 Ai câștigat **${fmt(monthSummary.income)}** și ai cheltuit **${fmt(monthSummary.expense)}** până acum.`;
    }
    return `${name}, luna asta ai depășit veniturile cu **${fmt(Math.abs(available))}** 😬 Ai câștigat **${fmt(monthSummary.income)}** dar ai cheltuit **${fmt(monthSummary.expense)}**.`;
  }

  // --- comparatie cu luna trecuta ---
  if (msg.includes('luna trecuta') || msg.includes('luna trecută') || msg.includes('comparati') || msg.includes('comparativ') || msg.includes('fata de') || msg.includes('față de')) {
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthTx = personalTx.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    });

    if (lastMonthTx.length === 0) {
      return `${name}, nu am date din luna trecută pentru comparație 📭 Luna aceasta: cheltuieli **${fmt(monthSummary.expense)}**, venituri **${fmt(monthSummary.income)}**.`;
    }

    const lastExpense = lastMonthTx
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + safeNumber(tx.amount), 0);

    const diff = monthSummary.expense - lastExpense;
    const pct = lastExpense > 0 ? Math.round((Math.abs(diff) / lastExpense) * 100) : 0;

    if (diff > 0) {
      return `${name}, luna asta ai cheltuit **${fmt(monthSummary.expense)}** față de **${fmt(lastExpense)}** luna trecută — cu **${pct}% mai mult** 📈 Încearcă să revii la ritmul anterior!`;
    } else if (diff < 0) {
      return `${name}, luna asta ai cheltuit **${fmt(monthSummary.expense)}** față de **${fmt(lastExpense)}** luna trecută — cu **${pct}% mai puțin** 📉 Felicitări, te-ai descurcat mai bine!`;
    }
    return `${name}, cheltuielile lunii sunt similare cu luna trecută — **${fmt(monthSummary.expense)}** 📊 Ritm constant!`;
  }

  // --- cea mai mare cheltuiala / cel mai scump lucru ---
  if (msg.includes('cea mai mare') || msg.includes('mai scump') || msg.includes('scumpă') || msg.includes('scumpa') || msg.includes('mult am cheltuit')) {
    const expenses = personalTx.filter((tx) => tx.type === 'expense');
    if (expenses.length === 0) {
      return `${name}, nu ai cheltuieli înregistrate încă 📭 Adaugă câteva tranzacții!`;
    }
    const biggest = expenses.reduce((max, tx) => safeNumber(tx.amount) > safeNumber(max.amount) ? tx : max, expenses[0]);
    const pct = summary.expense > 0 ? Math.round((safeNumber(biggest.amount) / summary.expense) * 100) : 0;
    return `${name}, cea mai mare cheltuială a ta e **${biggest.description}** — **${fmt(biggest.amount)}** 🏷️ Reprezintă ${pct}% din totalul cheltuielilor tale.`;
  }

  // --- cheltuieli azi sau ieri ---
  if (msg.includes('azi') || msg.includes('astăzi') || msg.includes('astazi') || msg.includes('ieri')) {
    const isYesterday = msg.includes('ieri');
    const targetDate = new Date();
    if (isYesterday) targetDate.setDate(targetDate.getDate() - 1);
    const targetKey = targetDate.toISOString().slice(0, 10);

    const dayTx = personalTx.filter((tx) => new Date(tx.date).toISOString().slice(0, 10) === targetKey);
    const dayExpense = dayTx.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + safeNumber(tx.amount), 0);
    const dayIncome = dayTx.filter((tx) => tx.type === 'income').reduce((s, tx) => s + safeNumber(tx.amount), 0);
    const label = isYesterday ? 'ieri' : 'azi';

    if (dayTx.length === 0) {
      return `${name}, ${label} nu ai înregistrat nicio tranzacție 📭`;
    }

    let response = `${name}, ${label} ai `;
    if (dayExpense > 0) response += `cheltuit **${fmt(dayExpense)}**`;
    if (dayIncome > 0) response += `${dayExpense > 0 ? ' și ' : ''}câștigat **${fmt(dayIncome)}**`;
    response += ` (${dayTx.length} tranzacții)`;

    const biggest = dayTx.filter((tx) => tx.type === 'expense').sort((a, b) => safeNumber(b.amount) - safeNumber(a.amount))[0];
    if (biggest) response += `. Cea mai mare: **${biggest.description}** (${fmt(biggest.amount)})`;

    return `${response} 📋`;
  }

  // --- investitii / actiuni / bursa ---
  if (msg.includes('investi') || msg.includes('acții') || msg.includes('actii') || msg.includes('bursă') || msg.includes('bursa') || msg.includes('fond')) {
    const savingsRate = summary.income > 0 ? Math.round(((summary.income - summary.expense) / summary.income) * 100) : 0;
    if (summary.balance <= 0) {
      return `${name}, nu îți recomand să investești acum — soldul e **${fmt(summary.balance)}** 😬 Primul pas e să stabilizezi cheltuielile și să intri pe plus!`;
    } else if (savingsRate < 10) {
      return `${name}, înainte de investiții ai nevoie de un fond de urgență 🛡️ Rata de economisire e **${savingsRate}%** — prea mică. Ajunge mai întâi la 20% economisit lunar, abia apoi gândește-te la investiții!`;
    }
    return `${name}, cu un sold de **${fmt(summary.balance)}** și o rată de economisire de **${savingsRate}%**, ești aproape pregătit! ✅ Înainte de orice investiție, asigură-te că ai un fond de urgență de **${fmt(monthSummary.expense * 4)}–${fmt(monthSummary.expense * 6)}** (3-6 luni de cheltuieli).`;
  }

  // --- cum stau cu cheltuielile / luna asta ---
  if (msg.includes('cheltuiel') || msg.includes('luna asta') || msg.includes('cum stau') || msg.includes('lunar') || msg.includes('stau')) {
    if (monthSummary.income === 0 && monthSummary.expense === 0) {
      return `${name}, nu ai tranzacții luna asta încă 📭 Adaugă primele venituri și cheltuieli și îți voi putea spune exact cum stai!`;
    }

    const ratio = monthSummary.income > 0
      ? Math.round((monthSummary.expense / monthSummary.income) * 100)
      : 100;

    if (ratio > 100) {
      return `${name}, luna asta ai cheltuit **${fmt(monthSummary.expense)}** dar ai câștigat doar **${fmt(monthSummary.income)}** 😬 Ești pe minus cu ${fmt(Math.abs(monthSummary.balance))}. E momentul să reduci cheltuielile!`;
    } else if (ratio > 85) {
      return `${name}, ai cheltuit **${fmt(monthSummary.expense)}** din **${fmt(monthSummary.income)}** venituri — ${ratio}% 🟡 Ești aproape de limită! Îți rămân doar ${fmt(monthSummary.balance)} pentru restul lunii.`;
    } else if (ratio > 60) {
      return `Luna asta arăți bine, ${name}! 📊 Ai cheltuit **${fmt(monthSummary.expense)}** din **${fmt(monthSummary.income)}** (${ratio}%). Îți rămân **${fmt(monthSummary.balance)}** disponibili — ritm decent!`;
    } else {
      return `Excelent, ${name}! 🎉 Ai cheltuit doar **${fmt(monthSummary.expense)}** din **${fmt(monthSummary.income)}** venituri (${ratio}%). Economisești serios — ai **${fmt(monthSummary.balance)}** la dispoziție!`;
    }
  }

  // --- unde cheltuiesc cel mai mult / categorii ---
  if (msg.includes('cel mai mult') || msg.includes('categor') || msg.includes('unde') || msg.includes('banii') || msg.includes('pe ce')) {
    if (categoryData.length === 0) {
      return `${name}, nu am găsit cheltuieli înregistrate încă 📭 Adaugă câteva tranzacții de tip Expense și îți voi arăta exact unde se duc banii!`;
    }

    const top = categoryData[0];
    const percent = summary.expense > 0 ? Math.round((top.value / summary.expense) * 100) : 0;
    const second = categoryData[1];

    let response = `${name}, cheltuiești cel mai mult pe **${top.label}** — ${fmt(top.value)} (${percent}% din total) 🎯`;
    if (second) {
      response += ` Pe locul 2 e **${second.label}** cu ${fmt(second.value)}.`;
    }
    response += ` Dacă vrei să economisești, **${top.label}** e locul de unde să înceapă tăierile!`;
    return response;
  }

  // --- obiective / goals / imi permit ---
  if (msg.includes('obiectiv') || msg.includes('goal') || msg.includes('permit') || msg.includes('economis') || msg.includes('pot')) {
    const active = goals.filter(g => safeNumber(g.currentAmount) < safeNumber(g.targetAmount));
    const done = goals.filter(g => safeNumber(g.currentAmount) >= safeNumber(g.targetAmount));

    if (goals.length === 0) {
      return `${name}, nu ai niciun obiectiv setat! 🎯 Ai un sold de **${fmt(summary.balance)}**. E momentul perfect să setezi primul obiectiv — un fond de urgență sau ceva ce îți dorești!`;
    }

    if (summary.balance <= 0) {
      return `${name}, momentan soldul tău e **${fmt(summary.balance)}** 😬 Nu aș recomanda obiective noi acum. Mai întâi echilibrează veniturile cu cheltuielile!`;
    }

    let response = `${name}, ai **${active.length} obiective active**`;
    if (done.length > 0) response += ` și **${done.length} finalizate** 🏆`;
    response += `! Cu un sold de **${fmt(summary.balance)}**, `;
    response += summary.balance > 5000
      ? `poți susține confortabil obiectivele existente și poate adăuga unul nou! 💪`
      : `concentrează-te pe obiectivele existente înainte de a adăuga altele noi.`;
    return response;
  }

  // --- sfat financiar ---
  if (msg.includes('sfat') || msg.includes('recomand') || msg.includes('ajut') || msg.includes('ce fac') || msg.includes('ce sa') || msg.includes('financiar')) {
    const savingsRate = summary.income > 0
      ? Math.round(((summary.income - summary.expense) / summary.income) * 100)
      : 0;

    if (savingsRate < 0) {
      return `${name}, sfat important: **cheltuielile sunt mai mari decât veniturile** ⚠️ Rata de economisire: ${savingsRate}%. Prioritatea 1 este să intri pe plus — identifică 2-3 cheltuieli pe care le poți reduce chiar acum!`;
    } else if (savingsRate < 10) {
      return `${name}, economisești **${savingsRate}%** din venituri 💡 Targetul ideal e 20%+. Încearcă regula **50/30/20**: 50% nevoi, 30% dorințe, 20% economii. Micile ajustări fac diferența mare în timp!`;
    } else if (savingsRate < 20) {
      return `${name}, economisești **${savingsRate}%** — ești pe drumul bun! 🌱 Încearcă să crești până la 20%+. Sfat: automatizează o sumă fixă spre economii la **începutul lunii**, înainte să cheltuiești altceva!`;
    } else {
      return `${name}, economisești **${savingsRate}%** din venituri — ești în top! 🌟 Sfatul meu: dacă nu ai deja un fond de urgență de 3-6 luni de cheltuieli (${fmt(monthSummary.expense * 5)} ar fi ideal), acela e priority #1 înainte de orice investiție!`;
    }
  }

  // --- sold total ---
  if (msg.includes('sold') || msg.includes('total') || msg.includes('cat am') || msg.includes('câți') || msg.includes('balance')) {
    return `${name}, soldul tău total este **${fmt(summary.balance)}** 💰 Din care: venituri ${fmt(summary.income)}, cheltuieli ${fmt(summary.expense)}. ${summary.balance >= 0 ? 'Ești pe plus — bine! 👍' : 'Atenție, ești pe minus! 😬'}`;
  }

  // --- raspuns generic cu date reale ---
  if (summary.count === 0) {
    return `Bună ${name}! 👋 Nu ai adăugat tranzacții încă. Du-te la pagina **Transactions** și adaugă primele venituri și cheltuieli — abia atunci îți pot da sfaturi bazate pe datele tale reale!`;
  }

  // raspuns generic - fara asteriscuri single ca sa nu apara literal
  return `${name}, am analizat datele tale! 🤔 Ai un sold de **${fmt(summary.balance)}** și **${summary.count} tranzacții** înregistrate. Încearcă să mă întrebi: "Cum stau cu cheltuielile?", "Unde cheltuiesc cel mai mult?" sau "Dă-mi un sfat financiar"!`;
}

// -----------------------------------------------------------------------
// HELPER - randeaza textul cu bold (**text** → <strong>text</strong>)
// -----------------------------------------------------------------------

function renderText(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

// -----------------------------------------------------------------------
// ADVICE PAGE COMPONENT
// -----------------------------------------------------------------------

export default function AdvicePage({ transactions, userId, userNickname }) {
  const revealRef = useScrollReveal();

  // starea conversatiei
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [goals, setGoals] = useState([]);

  const messagesEndRef = useRef(null);

  const name = userNickname || 'utilizator';

  // iau obiectivele ca sa le pot referentia in raspunsuri
  useEffect(() => {
    if (!userId) return;
    axios.get(`${API}/api/goals/${userId}`)
      .then((r) => setGoals(r.data || []))
      .catch(() => setGoals([]));
  }, [userId]);

  // scroll automat la ultimul mesaj
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // calculez datele financiare pentru motorul de raspunsuri
  const personalTx = useMemo(() => getPersonalTransactions(transactions), [transactions]);
  const summary = useMemo(() => summarizeTransactions(personalTx), [personalTx]);
  const monthSummary = useMemo(() => summarizeTransactions(getMonthlyTransactions(personalTx)), [personalTx]);
  const categoryData = useMemo(() => buildCategoryBreakdown(personalTx), [personalTx]);

  // trimit un mesaj si generez raspunsul local
  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setInput('');

    // adaug mesajul userului
    setMessages((prev) => [...prev, {
      id: Date.now(),
      role: 'user',
      text: trimmed,
    }]);

    // arat animatia de typing
    setIsTyping(true);

    // simulez o pauza de gandire (800-1400ms)
    await new Promise((resolve) => setTimeout(resolve, 900 + trimmed.length * 8));

    // generez raspunsul local bazat pe datele reale
    const response = generateResponse(trimmed, {
      summary, monthSummary, categoryData, goals, name, personalTx,
    });

    setIsTyping(false);
    setMessages((prev) => [...prev, {
      id: Date.now() + 1,
      role: 'assistant',
      text: response,
    }]);
  }, [isTyping, summary, monthSummary, categoryData, goals, name]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // intrebarile sugerate ca chips-uri - arata ce poate raspunde chatul
  const chips = [
    'Cum stau cu cheltuielile luna asta?',
    'Pot să cumpăr ceva de 1000 RON?',
    'Unde cheltuiesc cel mai mult?',
    'Cât mai am disponibil luna asta?',
    'Cum stau față de luna trecută?',
    'Dă-mi un sfat financiar',
  ];

  const isEmpty = messages.length === 0;

  return (
    <div className="content-shell" ref={revealRef}>

      {/* header pagina */}
      <header className="page-topbar scroll-reveal">
        <div>
          <p className="page-kicker">AI Assistant</p>
          <h1>Asistent financiar</h1>
          <span>Întreabă-mă orice despre finanțele tale</span>
        </div>
      </header>

      <div className="advice-chat-layout scroll-reveal">

        {/* fereastra de chat cu mesajele */}
        <div className="chat-window">
          {isEmpty ? (
            /* starea initiala - salut si instructiuni */
            <div className="chat-empty">
              <div className="chat-empty-icon">
                <SparkIcon size={26} />
              </div>
              <h3>Bună, {name}! 👋</h3>
              <p>Sunt asistentul tău financiar.<br />Analizez datele tale reale și îți dau sfaturi concrete.</p>
            </div>
          ) : (
            /* lista de mesaje */
            messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <div className="chat-avatar">
                  {msg.role === 'user'
                    ? (name[0] || 'U').toUpperCase()
                    : <SparkIcon size={15} />}
                </div>
                <div className="chat-bubble">
                  {renderText(msg.text)}
                </div>
              </div>
            ))
          )}

          {/* animatie de typing cat timp se "gandeste" */}
          {isTyping && (
            <div className="chat-message assistant">
              <div className="chat-avatar"><SparkIcon size={15} /></div>
              <div className="chat-bubble chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* chips-urile cu intrebari sugerate */}
        <div className="chat-chips">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              className="chat-chip"
              onClick={() => sendMessage(chip)}
              disabled={isTyping}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* campul de input si butonul de trimitere */}
        <form className="chat-input-row" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrie un mesaj..."
            disabled={isTyping}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!input.trim() || isTyping}
          >
            <SendIcon size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
