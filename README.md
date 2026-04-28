<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Bebas+Neue&size=80&duration=3000&pause=1000&color=1a7a4a&center=true&vCenter=true&width=700&height=100&lines=Track_My_Cash;v2.0" alt="TrackMyCash" />

### **PERSONAL FINANCE · FULL-STACK EXPENSE TRACKER**

*Secure by default. Clean by design. Built to last.*

<br/>

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-Auth-FF6C37?style=for-the-badge)
![Multer](https://img.shields.io/badge/Multer-Uploads-blueviolet?style=for-the-badge)
![MIT](https://img.shields.io/badge/License-MIT-000000?style=for-the-badge)

</div>

---

<br/>

## &nbsp; The Idea

Track My Cash is a smart and user-friendly expense tracking application designed to help individuals manage their daily finances with ease. The system allows users to record income and expenses, categorize transactions, monitor spending habits, and generate detailed financial reports. With features such as budget planning, transaction history, visual analytics, and secure data management, Track My Cash empowers users to take full control of their personal finances. Its intuitive interface ensures a seamless experience, making financial management simple, organized, and efficient for everyday users.

Built to explore what a Node + MySQL stack looks like when you stop cutting corners and start building something you'd actually use.

<br/>

---

<br/>

## &nbsp; Screenshots

<table>
<tr>
<td width="50%">

**01 — Dashboard**
![Hero Section](./screenshots/01-hero.png)

</td>
<td width="50%">

**02 — Scroll Animation**
![Scroll Animation](./screenshots/02-scroll-animation.png)

</td>
</tr>
<tr>
<td width="50%">

**03 — Features**
![Features](./screenshots/03-features.png)

</td>
<td width="50%">

**04 — Gallery**
![Gallery](./screenshots/04-gallery.png)

</td>
</tr>
<tr>
<td colspan="2">

**05 — Mobile**
![Mobile View](./screenshots/05-mobile.png)

</td>
</tr>
</table>

<br/>

---

<br/>

## &nbsp; What's New in v2.0

```
bcrypt Password Hashing    →  Plain-text passwords gone. Every hash salted properly.
Session Authentication     →  Stay logged in. express-session backed and signed.
Connection Pooling         →  mysql2 pool replaces the single fragile connection.
CSV Export                 →  Download your full report — one click, clean file.
Year Filter                →  Slice dashboard and reports by any year, instantly.
Inline Transaction Editing →  Edit without leaving the page. Was add-only before.
Goal Deadlines             →  Color-coded urgency. Red means act now.
Toast Notifications        →  alert() is gone. Every message is non-blocking.
Search + Filter            →  Find any transaction or receipt in seconds.
Dark / Light Mode          →  Toggle saved to localStorage per user.
Secure Uploads             →  Receipts land in public/uploads/, never the root.
.env Config                →  All secrets out of source code. Always.
```

<br/>

---

<br/>

## &nbsp; Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Runtime** | Node.js + Express | Fast, minimal, battle-tested |
| **Database** | MySQL2 + pooling | Reliable relational data, connection reuse |
| **Auth** | bcrypt + express-session | Industry-standard hashing, signed sessions |
| **Uploads** | Multer | Simple multipart handling for receipt images |
| **Dev** | Nodemon + dotenv | Hot reload + environment isolation |

<br/>

---

<br/>

## &nbsp; Get Running

```bash
# Clone
git clone https://github.com/yourusername/trackmycash.git
cd trackmycash

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your DB credentials and session secret

# Database
mysql -u root -p < schema.sql

# Start
npm start

# Development (auto-reload)
npm run dev
```

> Opens at `http://localhost:3000` — log in and start tracking.

<br/>

---

<br/>

## &nbsp; Environment Variables

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=trackmycash
SESSION_SECRET=your-secret-key
PORT=3000
```

<br/>

---

<br/>

## &nbsp; Project Structure

```
TrackMyCash/
├── public/
│   ├── css/
│   │   └── main.css          # All shared styles
│   ├── uploads/              # Receipt images (auto-created)
│   ├── shared.js             # Sidebar, toast, helpers
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── transaction.html
│   ├── goals.html
│   ├── budget.html
│   ├── category.html
│   ├── report.html
│   └── receipts.html
├── screenshots/              # README assets
├── server.js                 # Express backend
├── schema.sql                # Database schema
├── package.json
├── .env.example
└── README.md
```

<br/>

---

<br/>

## &nbsp; Security Philosophy

Security in v2.0 isn't a feature — it's the foundation.

Each decision was made with a clear goal:

- **Passwords** — bcrypt with proper salt rounds. Nothing stored reversible.
- **Sessions** — signed with a secret, stored server-side. No JWT shortcuts.
- **Uploads** — destination controlled, never user-defined. No path traversal.
- **Credentials** — `.env` only. Never committed, never hardcoded.

If it touches user data, it was treated seriously.

<br/>

---

<br/>

## &nbsp; Roadmap

- [ ] OAuth login (Google / GitHub)
- [ ] Monthly budget alerts via email
- [ ] Multi-currency support
- [ ] Data visualisation dashboard (charts)
- [ ] PWA support for mobile install

<br/>

---

<br/>

## &nbsp; License

MIT — use it, fork it, build on it.

<br/>

---

<div align="center">

*Designed and built with care*

<br/>

**TrackMyCash v2.0 — Personal Expense Tracker**

</div>
