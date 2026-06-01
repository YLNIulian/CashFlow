const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

const connectionString = 'mongodb://laurentiucoroama_db_user:CashFlow2026@ac-hcjsorh-shard-00-00.4eqcvml.mongodb.net:27017,ac-hcjsorh-shard-00-01.4eqcvml.mongodb.net:27017,ac-hcjsorh-shard-00-02.4eqcvml.mongodb.net:27017/?ssl=true&replicaSet=atlas-jrjfll-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(connectionString)
  .then(() => console.log("✅ Conectat la MongoDB!"))
  .catch(err => console.error("❌ Eroare MongoDB:", err));

/* ═══════════════════════════════════════════════════════════════════
   SCHEMAS
   ═══════════════════════════════════════════════════════════════════ */

// User Schema (extended with onboarding)
const UserSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  onboarding: {
    goal: { type: String, default: null },
    currentMethod: { type: String, default: null },
    situation: { type: String, default: null },
    income: { type: String, default: null },
    completedAt: { type: Date, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  category: { type: String, default: 'General' },
  scope: { type: String, enum: ['personal', 'couple', 'business'], default: 'personal' },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', default: null },
  date: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// Couple Schema
const CoupleSchema = new mongoose.Schema({
  user1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  inviteCode: { type: String, required: true, unique: true },
  coupleName: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const Couple = mongoose.model('Couple', CoupleSchema);

/// Goal Schema — actualizat cu coverIndex
const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date, default: null },
  coverIndex: { type: Number, default: 0 },
  scope: { type: String, enum: ['personal', 'couple'], default: 'personal' },
  createdAt: { type: Date, default: Date.now }
});
const Goal = mongoose.model('Goal', GoalSchema);

/* ═══════════════════════════════════════════════════════════════════
   AUTH ROUTES
   ═══════════════════════════════════════════════════════════════════ */

app.post('/api/register', async (req, res) => {
  try {
    const { nickname, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email deja înregistrat." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ nickname, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Cont creat cu succes!", userId: newUser._id });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Eroare la server" });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Date incorecte!" });
    }
    res.status(200).json({
      userId: user._id,
      nickname: user.nickname,
      onboarding: user.onboarding
    });
  } catch (error) {
    res.status(500).json({ message: "Eroare la server" });
  }
});

/* ═══════════════════════════════════════════════════════════════════
   USER / PROFILE ROUTES
   ═══════════════════════════════════════════════════════════════════ */

app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: "User negăsit." });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Eroare la server" });
  }
});

app.put('/api/users/:userId', async (req, res) => {
  try {
    const { nickname } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { nickname },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Eroare la actualizare" });
  }
});

app.post('/api/users/:userId/onboarding', async (req, res) => {
  try {
    const { goal, currentMethod, situation, income } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        onboarding: {
          goal,
          currentMethod,
          situation,
          income,
          completedAt: new Date()
        }
      },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: "User negăsit." });
    res.json({ message: "Onboarding salvat!", user });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Eroare la salvare" });
  }
});

/* ═══════════════════════════════════════════════════════════════════
   TRANSACTION ROUTES
   ═══════════════════════════════════════════════════════════════════ */

app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Eroare la preluare" });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.json(newTransaction);
  } catch (err) {
    res.status(500).json({ message: "Eroare la salvare" });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Ștearsă!" });
  } catch (err) {
    res.status(500).json({ message: "Eroare la ștergere" });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category } = req.body;
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { description, amount, category },
      { new: true }
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

/* ═══════════════════════════════════════════════════════════════════
   COUPLE ROUTES
   ═══════════════════════════════════════════════════════════════════ */

app.post('/api/couples/create', async (req, res) => {
  try {
    const { userId } = req.body;
    const existing = await Couple.findOne({
      $or: [{ user1Id: userId }, { user2Id: userId }]
    });
    if (existing) {
      return res.status(400).json({
        message: "Ești deja într-un cuplu.",
        couple: existing
      });
    }
    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();
      const exists = await Couple.findOne({ inviteCode });
      if (!exists) isUnique = true;
    }
    const couple = new Couple({ user1Id: userId, inviteCode });
    await couple.save();
    res.status(201).json({
      message: "Cuplu creat!",
      coupleId: couple._id,
      inviteCode: couple.inviteCode
    });
  } catch (error) {
    console.error("Create couple error:", error);
    res.status(500).json({ message: "Eroare la crearea cuplului" });
  }
});

app.post('/api/couples/join', async (req, res) => {
  try {
    const { userId, inviteCode } = req.body;
    const existingCouple = await Couple.findOne({
      $or: [{ user1Id: userId }, { user2Id: userId }]
    });
    if (existingCouple) {
      return res.status(400).json({ message: "Ești deja într-un cuplu." });
    }
    const couple = await Couple.findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!couple) return res.status(404).json({ message: "Cod invalid." });
    if (couple.user2Id) return res.status(400).json({ message: "Cuplul e deja complet." });
    if (couple.user1Id.toString() === userId) {
      return res.status(400).json({ message: "Nu te poți conecta cu tine." });
    }
    couple.user2Id = userId;
    await couple.save();
    const partner = await User.findById(couple.user1Id);
    res.status(200).json({
      message: "Conectat cu succes!",
      coupleId: couple._id,
      partnerName: partner?.nickname || 'Partener'
    });
  } catch (error) {
    console.error("Join couple error:", error);
    res.status(500).json({ message: "Eroare la conectare" });
  }
});

app.get('/api/couples/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const couple = await Couple.findOne({
      $or: [{ user1Id: userId }, { user2Id: userId }]
    });
    if (!couple) {
      return res.status(404).json({ message: "Nu ești într-un cuplu.", coupled: false });
    }
    const partnerId = couple.user1Id.toString() === userId ? couple.user2Id : couple.user1Id;
    let partnerName = null;
    if (partnerId) {
      const partner = await User.findById(partnerId);
      partnerName = partner?.nickname || 'Partener';
    }
    res.json({
      coupled: !!couple.user2Id,
      coupleId: couple._id,
      inviteCode: couple.inviteCode,
      coupleName: couple.coupleName,
      partnerId,
      partnerName,
      isCreator: couple.user1Id.toString() === userId
    });
  } catch (error) {
    console.error("Get couple error:", error);
    res.status(500).json({ message: "Eroare" });
  }
});

app.get('/api/couples/:coupleId/transactions', async (req, res) => {
  try {
    const couple = await Couple.findById(req.params.coupleId);
    if (!couple) return res.status(404).json({ message: "Cuplu negăsit." });
    const userIds = [couple.user1Id];
    if (couple.user2Id) userIds.push(couple.user2Id);
    const transactions = await Transaction.find({
      $or: [
        { userId: { $in: userIds }, scope: 'couple' },
        { coupleId: couple._id }
      ]
    }).sort({ date: -1 });
    const user1 = await User.findById(couple.user1Id);
    const user2 = couple.user2Id ? await User.findById(couple.user2Id) : null;
    const enriched = transactions.map(t => {
      const tx = t.toObject();
      tx.userName = tx.userId.toString() === couple.user1Id.toString()
        ? (user1?.nickname || 'Partener 1')
        : (user2?.nickname || 'Partener 2');
      return tx;
    });
    res.json(enriched);
  } catch (error) {
    console.error("Get couple tx error:", error);
    res.status(500).json({ message: "Eroare" });
  }
});

app.post('/api/couples/:coupleId/transactions', async (req, res) => {
  try {
    const couple = await Couple.findById(req.params.coupleId);
    if (!couple) return res.status(404).json({ message: "Cuplu negăsit." });
    const newTx = new Transaction({
      ...req.body,
      scope: 'couple',
      coupleId: couple._id
    });
    await newTx.save();
    const user = await User.findById(newTx.userId);
    const result = newTx.toObject();
    result.userName = user?.nickname || 'Unknown';
    res.json(result);
  } catch (error) {
    console.error("Add couple tx error:", error);
    res.status(500).json({ message: "Eroare" });
  }
});

app.put('/api/couples/:coupleId/name', async (req, res) => {
  try {
    const { coupleName } = req.body;
    const couple = await Couple.findByIdAndUpdate(
      req.params.coupleId,
      { coupleName },
      { new: true }
    );
    if (!couple) return res.status(404).json({ message: "Cuplu negăsit." });
    res.json(couple);
  } catch (error) {
    res.status(500).json({ message: "Eroare" });
  }
});

/* ═══════════════════════════════════════════════════════════════════
   GOAL ROUTES
   ═══════════════════════════════════════════════════════════════════ */

app.get('/api/goals/:userId', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: "Eroare" });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const goal = new Goal(req.body);
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Eroare" });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Eroare" });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: "Șters!" });
  } catch (err) {
    res.status(500).json({ message: "Eroare" });
  }
});

/* ═══════════════════════════════════════════════════════════════════
   INSIGHTS HELPER ROUTE
   ═══════════════════════════════════════════════════════════════════ */

app.get('/api/insights/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.params.userId,
      scope: 'personal'
    }).sort({ date: -1 });

    const user = await User.findById(req.params.userId).select('onboarding');

    res.json({
      transactions,
      onboarding: user?.onboarding || null
    });
  } catch (err) {
    res.status(500).json({ message: "Eroare" });
  }
});

/* ═══════════════════════════════════════════════════════════════════
   START
   ═══════════════════════════════════════════════════════════════════ */

app.listen(5000, () => console.log("🚀 Server pornit pe portul 5000"));