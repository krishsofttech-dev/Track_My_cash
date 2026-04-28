CREATE DATABASE IF NOT EXISTS track_my_cash CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE track_my_cash;

-- ── Users ───
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,              
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Transactions ───────
CREATE TABLE IF NOT EXISTS transactions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,                        
  name        VARCHAR(150) NOT NULL,
  type        ENUM('Income','Expense') NOT NULL,
  price       DECIMAL(12,2) NOT NULL,
  description VARCHAR(200),
  date        DATE NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Receipts ───
CREATE TABLE IF NOT EXISTS receipts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,                         
  name       VARCHAR(150) NOT NULL,
  price      DECIMAL(12,2) NOT NULL,
  date       DATE,
  image      VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Goals ────
CREATE TABLE IF NOT EXISTS goals (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,                      
  goal_name     VARCHAR(150) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  saved_amount  DECIMAL(12,2) DEFAULT 0,
  deadline      DATE DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Budget ───
CREATE TABLE IF NOT EXISTS budget (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,                  
  budget_type      VARCHAR(100) NOT NULL,
  budget_amount    DECIMAL(12,2) NOT NULL,
  actual_amount    DECIMAL(12,2) NOT NULL,
  remaining_amount DECIMAL(12,2) NOT NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Categories ─────
CREATE TABLE IF NOT EXISTS categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,                         
  name       VARCHAR(100) NOT NULL,
  type       ENUM('Income','Expense') NOT NULL DEFAULT 'Expense',
  icon       VARCHAR(50) DEFAULT 'fa-tag',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


INSERT IGNORE INTO users (id, username, email, password) VALUES
  (1, 'alice',  'alice@gmail.com', '1234567'),
  (2, 'bob',    'bob@gmail.com',   '1234566');


INSERT IGNORE INTO categories (user_id, name, type, icon) VALUES
  (1, 'Salary',        'Income',  'fa-briefcase'),
  (1, 'Freelance',     'Income',  'fa-laptop'),
  (1, 'Food',          'Expense', 'fa-utensils'),
  (1, 'Transport',     'Expense', 'fa-car'),
  (1, 'Shopping',      'Expense', 'fa-shopping-bag'),
  (1, 'Healthcare',    'Expense', 'fa-heartbeat'),
  (1, 'Utilities',     'Expense', 'fa-bolt'),
  (1, 'Entertainment', 'Expense', 'fa-film');

INSERT IGNORE INTO transactions (user_id, name, type, price, description, date) VALUES
  (1, 'Monthly Salary',    'Income',  150000.00, 'Salary',        '2025-01-05'),
  (1, 'Freelance Project', 'Income',   45000.00, 'Freelance',     '2025-01-12'),
  (1, 'Grocery Shopping',  'Expense',   8500.00, 'Food',          '2025-01-08'),
  (1, 'Electricity Bill',  'Expense',   3200.00, 'Utilities',     '2025-01-10'),
  (1, 'Netflix',           'Expense',   1490.00, 'Entertainment', '2025-01-15'),
  (1, 'Monthly Salary',    'Income',  150000.00, 'Salary',        '2025-02-05'),
  (1, 'Petrol',            'Expense',   5600.00, 'Transport',     '2025-02-07'),
  (1, 'Medical Checkup',   'Expense',   4500.00, 'Healthcare',    '2025-02-14'),
  (1, 'Grocery Shopping',  'Expense',   7800.00, 'Food',          '2025-02-20'),
  (1, 'Freelance Project', 'Income',   60000.00, 'Freelance',     '2025-02-25'),
  (1, 'Monthly Salary',    'Income',  150000.00, 'Salary',        '2025-03-05'),
  (1, 'Clothes Shopping',  'Expense',  12000.00, 'Shopping',      '2025-03-10'),
  (1, 'Grocery Shopping',  'Expense',   9200.00, 'Food',          '2025-03-18'),
  (1, 'Electricity Bill',  'Expense',   3100.00, 'Utilities',     '2025-03-12');

INSERT IGNORE INTO goals (user_id, goal_name, target_amount, saved_amount, deadline) VALUES
  (1, 'Emergency Fund',  300000.00, 85000.00, '2025-12-31'),
  (1, 'New Laptop',       80000.00, 32000.00, '2025-06-30');


INSERT IGNORE INTO budget (user_id, budget_type, budget_amount, actual_amount, remaining_amount) VALUES
  (1, 'Expense Budget', 50000.00, 32390.00, 17610.00),
  (1, 'Income Budget',  200000.00, 195000.00, 5000.00);

INSERT IGNORE INTO categories (user_id, name, type, icon) VALUES
  (2, 'Salary',     'Income',  'fa-briefcase'),
  (2, 'Food',       'Expense', 'fa-utensils'),
  (2, 'Transport',  'Expense', 'fa-car'),
  (2, 'Rent',       'Expense', 'fa-home');

INSERT IGNORE INTO transactions (user_id, name, type, price, description, date) VALUES
  (2, 'Bob Salary',    'Income',  95000.00, 'Salary',    '2025-01-05'),
  (2, 'Rent Payment',  'Expense', 25000.00, 'Rent',      '2025-01-01'),
  (2, 'Food & Dining', 'Expense',  6000.00, 'Food',      '2025-01-15'),
  (2, 'Bus Pass',      'Expense',  2500.00, 'Transport', '2025-01-03');

INSERT IGNORE INTO goals (user_id, goal_name, target_amount, saved_amount, deadline) VALUES
  (2, 'Holiday Trip', 120000.00, 18000.00, '2025-09-01');
