require('dotenv').config();
const express  = require('express');
const bcrypt   = require('bcrypt');
const session  = require('express-session');
const mysql    = require('mysql2/promise');
const multer   = require('multer');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Upload folder ───
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:    (_, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── DB Connection Pool ─────
const pool = mysql.createPool({
  host:             process.env.DB_HOST || 'localhost',
  user:             process.env.DB_USER || 'root',
  password:         process.env.DB_PASS || '',
  database:         process.env.DB_NAME || 'track_my_cash',
  waitForConnections: true,
  connectionLimit:  10
});

// ─── Middleware ─────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret:           process.env.SESSION_SECRET || 'trackmycash_secret_change_me',
  resave:           false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }   // 7 days
}));
app.use(express.static(path.join(__dirname, 'public')));

function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
  }
  req.userId = req.session.userId;   // ← convenience shorthand used in every query below
  next();
}

// ─── Static root ────
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));


// Register
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password || password.length < 6)
    return res.status(400).json({ success: false, message: 'All fields required. Password min 6 characters.' });

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length)
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const hash = await bcrypt.hash(password, 12);
    await pool.query('INSERT INTO users (username, email, password) VALUES (?,?,?)', [username, email, hash]);
    res.json({ success: true });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Login 
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const user  = rows[0];
    let   match = false;

    if (user.password.startsWith('$2')) {
      match = await bcrypt.compare(password, user.password);
    } else {
    
      match = (password === user.password);
      if (match) {
        const hash = await bcrypt.hash(password, 12);
        await pool.query('UPDATE users SET password=? WHERE id=?', [hash, user.id]);
      }
    }

    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    // ── Store user 
    req.session.userId   = user.id;        
    req.session.username = user.username;

    res.json({ success: true, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Logout 
app.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});
app.get('/me', requireAuth, async (req, res) => {
  try {
    const [[user]] = await pool.query('SELECT id, username, email, created_at FROM users WHERE id=?', [req.userId]);
    res.json(user || {});
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

//  ALL ROUTES BELOW USE requireAuth — every query filters by req.userId

function yearClause(year, col = 'date') {
  return year ? ` AND YEAR(${col}) = ${parseInt(year)}` : '';
}
//  REPORTS

app.get('/get-report-data', requireAuth, async (req, res) => {
  const uid = req.userId;
  const yc  = yearClause(req.query.year);
  try {
    const [[incRow]] = await pool.query(
      `SELECT COALESCE(SUM(price),0) AS total FROM transactions WHERE user_id=? AND LOWER(type)='income'${yc}`, [uid]);
    const [[expRow]] = await pool.query(
      `SELECT COALESCE(SUM(price),0) AS total FROM transactions WHERE user_id=? AND LOWER(type)='expense'${yc}`, [uid]);
    const totalIncome  = +incRow.total;
    const totalExpense = +expRow.total;
    res.json({ totalIncome, totalExpense, budgetLeft: totalIncome - totalExpense });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.get('/income-vs-expenses', requireAuth, async (req, res) => {
  const uid = req.userId;
  const yc  = yearClause(req.query.year);
  try {
    const [rows] = await pool.query(`
      SELECT MONTH(date) AS month,
        SUM(CASE WHEN LOWER(type)='income'  THEN price ELSE 0 END) AS income,
        SUM(CASE WHEN LOWER(type)='expense' THEN price ELSE 0 END) AS expense
      FROM transactions
      WHERE user_id=?${yc}
      GROUP BY MONTH(date)
      ORDER BY MONTH(date)`, [uid]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.get('/expense-categories', requireAuth, async (req, res) => {
  const uid = req.userId;
  const yc  = yearClause(req.query.year);
  try {
    const [rows] = await pool.query(`
      SELECT description AS category, SUM(price) AS total
      FROM transactions
      WHERE user_id=? AND LOWER(type)='expense'${yc}
      GROUP BY description
      ORDER BY total DESC`, [uid]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

//  TRANSACTIONS

app.get('/get-transactions', requireAuth, async (req, res) => {
  const uid   = req.userId;
  const limit = req.query.limit ? parseInt(req.query.limit) : 1000;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE user_id=? ORDER BY date DESC LIMIT ?', [uid, limit]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.post('/add-transaction', requireAuth, async (req, res) => {
  const uid = req.userId;
  const { name, date, amount, description, type } = req.body;
  if (!name || !date || !amount || !description || !type)
    return res.status(400).json({ message: 'All fields required.' });
  try {
    const [result] = await pool.query(
      'INSERT INTO transactions (user_id, name, date, price, description, type) VALUES (?,?,?,?,?,?)',
      [uid, name, date, amount, description, type]);
    res.status(201).json({ message: 'Transaction added', id: result.insertId });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.put('/transactions/:id', requireAuth, async (req, res) => {
  const uid = req.userId;
  const { name, date, amount, description, type } = req.body;
  try {
    // WHERE user_id=? ensures users cannot edit each other's transactions
    await pool.query(
      'UPDATE transactions SET name=?,date=?,price=?,description=?,type=? WHERE id=? AND user_id=?',
      [name, date, amount, description, type, req.params.id, uid]);
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.delete('/transactions/:id', requireAuth, async (req, res) => {
  const uid = req.userId;
  try {
    // WHERE user_id=? ensures users cannot delete each other's records
    await pool.query('DELETE FROM transactions WHERE id=? AND user_id=?', [req.params.id, uid]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

//  RECEIPTS

app.get('/receipts', requireAuth, async (req, res) => {
  const uid = req.userId;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM receipts WHERE user_id=? ORDER BY date DESC', [uid]);
    res.json(rows.map(r => ({
      ...r,
      date: r.date ? new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
    })));
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.post('/add-receipt', requireAuth, upload.single('image'), async (req, res) => {
  const uid       = req.userId;
  const { name, price, date } = req.body;
  const imagePath = req.file ? 'uploads/' + req.file.filename : null;
  try {
    await pool.query(
      'INSERT INTO receipts (user_id, name, price, date, image) VALUES (?,?,?,?,?)',
      [uid, name, price, date, imagePath]);
    res.json({ message: 'Receipt added' });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.put('/receipts/:id', requireAuth, upload.single('image'), async (req, res) => {
  const uid = req.userId;
  const { name, price, date } = req.body;
  const imagePath = req.file ? 'uploads/' + req.file.filename : null;
  try {
    if (imagePath) {
      await pool.query(
        'UPDATE receipts SET name=?,price=?,date=?,image=? WHERE id=? AND user_id=?',
        [name, price, date, imagePath, req.params.id, uid]);
    } else {
      await pool.query(
        'UPDATE receipts SET name=?,price=?,date=? WHERE id=? AND user_id=?',
        [name, price, date, req.params.id, uid]);
    }
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.delete('/receipts/:id', requireAuth, async (req, res) => {
  const uid = req.userId;
  try {
    await pool.query('DELETE FROM receipts WHERE id=? AND user_id=?', [req.params.id, uid]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

//  GOALS

app.get('/goals', requireAuth, async (req, res) => {
  const uid = req.userId;
  try {
    const [rows] = await pool.query(
      'SELECT *, (saved_amount/target_amount)*100 AS percentage FROM goals WHERE user_id=? ORDER BY id DESC', [uid]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.post('/add-goal', requireAuth, async (req, res) => {
  const uid = req.userId;
  const { goal_name, target_amount, deadline } = req.body;
  try {
    await pool.query(
      'INSERT INTO goals (user_id, goal_name, target_amount, saved_amount, deadline) VALUES (?,?,?,0,?)',
      [uid, goal_name, target_amount, deadline || null]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/update-goal', requireAuth, async (req, res) => {
  const uid = req.userId;
  const { id, saved_amount } = req.body;
  try {
    await pool.query(
      'UPDATE goals SET saved_amount = saved_amount + ? WHERE id=? AND user_id=?',
      [saved_amount, id, uid]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.delete('/delete-goal/:id', requireAuth, async (req, res) => {
  const uid = req.userId;
  try {
    await pool.query('DELETE FROM goals WHERE id=? AND user_id=?', [req.params.id, uid]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
});

//  BUDGET

app.get('/get-budgets', requireAuth, async (req, res) => {
  const uid = req.userId;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM budget WHERE user_id=? ORDER BY id DESC', [uid]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.post('/add-budget', requireAuth, async (req, res) => {
  const uid = req.userId;
  const { budgetType, budgetAmount, actualAmount } = req.body;
  const remaining = budgetAmount - actualAmount;
  try {
    const [r] = await pool.query(
      'INSERT INTO budget (user_id, budget_type, budget_amount, actual_amount, remaining_amount) VALUES (?,?,?,?,?)',
      [uid, budgetType, budgetAmount, actualAmount, remaining]);
    res.status(201).json({ message: 'Budget added', id: r.insertId });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.delete('/budgets/:id', requireAuth, async (req, res) => {
  const uid = req.userId;
  try {
    await pool.query('DELETE FROM budget WHERE id=? AND user_id=?', [req.params.id, uid]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});


//  CATEGORIES


app.get('/api/categories', requireAuth, async (req, res) => {
  const uid = req.userId;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE user_id=? ORDER BY type, name', [uid]);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.post('/api/categories', requireAuth, async (req, res) => {
  const uid = req.userId;
  const { name, type, icon } = req.body;
  try {
    const [r] = await pool.query(
      'INSERT INTO categories (user_id, name, type, icon, created_at, updated_at) VALUES (?,?,?,?,NOW(),NOW())',
      [uid, name, type, icon || 'fa-tag']);
    res.json({ id: r.insertId });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.put('/api/categories/:id', requireAuth, async (req, res) => {
  const uid = req.userId;
  const { name, type, icon } = req.body;
  try {
    await pool.query(
      'UPDATE categories SET name=?,type=?,icon=?,updated_at=NOW() WHERE id=? AND user_id=?',
      [name, type, icon || 'fa-tag', req.params.id, uid]);
    res.json({ message: 'Updated' });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

app.delete('/api/categories/:id', requireAuth, async (req, res) => {
  const uid = req.userId;
  try {
    await pool.query('DELETE FROM categories WHERE id=? AND user_id=?', [req.params.id, uid]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'DB error' }); }
});

// ─── 404 ───
app.use((_, res) => res.status(404).send('404: Not Found'));

// ─── Start ───
app.listen(PORT, () => {
  console.log(`Track My Cash running → http://localhost:${PORT}`);
});
