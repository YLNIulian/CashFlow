const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());

const connectionString = 'mongodb+srv://CashFlow2025:IulianLaurCash@cluster0.4eqcvml.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(connectionString)
  .then(() => console.log("✅ Conectat la MongoDB!"))
  .catch(err => console.error("❌ Eroare MongoDB:", err));

// --- SCHEMA TRANZACTIEI (ACTUALIZATA CU USERID) ---
const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    category: { type: String, default: 'General' },
    date: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// --- RUTĂ REGISTER ---
app.post('/api/register', async (req, res) => {
  try {
    const { nickname, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ nickname, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Cont creat cu succes!" });
  } catch (error) {
    res.status(500).json({ message: "Eroare la server" });
  }
});

// --- RUTĂ LOGIN ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Date incorecte!" });
    }
    res.status(200).json({ userId: user._id, nickname: user.nickname });
  } catch (error) {
    res.status(500).json({ message: "Eroare la server" });
  }
});

// --- RUTĂ GET (DOAR TRANZACTIILE USERULUI) ---
app.get('/api/transactions/:userId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: "Eroare la preluare" });
    }
});

// --- RUTĂ POST (SALVEAZA CU USERID) ---
app.post('/api/transactions', async (req, res) => {
    try {
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.json(newTransaction);
    } catch (err) {
        res.status(500).json({ message: "Eroare la salvare" });
    }
});

// --- RUTĂ DELETE ---
app.delete('/api/transactions/:id', async (req, res) => {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Stearsa!" });
});
// Rută pentru EDITAREA unei tranzacții
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category } = req.body;

    // Căutăm tranzacția după ID și o actualizăm cu noile date
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { description, amount, category },
      { new: true } // Această opțiune returnează obiectul deja modificat
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Tranzacția nu a fost găsită" });
    }

    res.json(updatedTransaction);
  } catch (error) {
    console.error("Eroare la server:", error);
    res.status(500).json({ message: "Eroare la actualizarea tranzacției" });
  }
});

app.listen(5000, () => console.log("🚀 Server pornit pe portul 5000"));