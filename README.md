# Track My Cash v2.0

A complete personal expense tracker rebuilt with security, architecture, and UX improvements.

## What's New in v2.0

- **Password hashing** with bcrypt (no more plain text passwords)
- **Session-based authentication** (users stay logged in)
- **Connection pooling** (replaces single MySQL connection)
- **Duplicate routes removed** and all `server.js` logic cleaned up
- **Consistent type casing** in all SQL queries
- **Year filter** on dashboard and reports
- **CSV export** on the reports page
- **Dark/light mode toggle** saved to localStorage
- **Deadline tracking** on goals with color-coded urgency
- **Delete confirmations** everywhere
- **Toast notifications** instead of alert boxes
- **Search + filter** on transactions and receipts
- **Uploads** go to `public/uploads/` not the project root
- **`.env` file** for all secrets and DB credentials
- **Edit transactions** inline (was add-only before)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env with your DB credentials
```

### 3. Create the database
```bash
mysql -u root -p < schema.sql
```

### 4. Run the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Open `http://localhost:3000` in your browser.

## Project Structure

```
TrackMyCash/
├── public/
│   ├── css/
│   │   └── main.css          ← All shared styles
│   ├── uploads/              ← Receipt images (auto-created)
│   ├── shared.js             ← Sidebar, toast, helpers
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── transaction.html
│   ├── goals.html
│   ├── budget.html
│   ├── category.html
│   ├── report.html
│   └── receipts.html
├── server.js                 ← Express backend (cleaned up)
├── schema.sql                ← Database schema
├── package.json
├── .env.example
└── README.md
```
