function renderSidebar(activePage) {
  const pages = [
    { href: 'dashboard.html', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { href: 'transaction.html', icon: 'fa-exchange-alt', label: 'Transactions' },
    { href: 'report.html', icon: 'fa-chart-bar', label: 'Reports' },
    { href: 'category.html', icon: 'fa-tags', label: 'Categories' },
    { href: 'budget.html', icon: 'fa-wallet', label: 'Budget' },
    { href: 'receipts.html', icon: 'fa-file-invoice', label: 'Receipts' },
    { href: 'goals.html', icon: 'fa-bullseye', label: 'Goals' },
  ];

  const logo = `<svg viewBox="0 0 129 129" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M86.8467 11.5997H42.1533C22.74 11.5997 11.1667 23.173 11.1667 42.5863V87.2263C11.1667 106.693 22.74 118.266 42.1533 118.266H86.7933C106.207 118.266 117.78 106.693 117.78 87.2797V42.5863C117.833 23.173 106.26 11.5997 86.8467 11.5997ZM41.1933 97.733C41.1933 99.9197 39.38 101.733 37.1933 101.733C35.0067 101.733 33.1933 99.9197 33.1933 97.733V86.693C33.1933 84.5063 35.0067 82.693 37.1933 82.693C39.38 82.693 41.1933 84.5063 41.1933 86.693V97.733ZM68.5 97.733C68.5 99.9197 66.6867 101.733 64.5 101.733C62.3133 101.733 60.5 99.9197 60.5 97.733V75.5997C60.5 73.413 62.3133 71.5997 64.5 71.5997C66.6867 71.5997 68.5 73.413 68.5 75.5997V97.733ZM95.8067 97.733C95.8067 99.9197 93.9933 101.733 91.8067 101.733C89.62 101.733 87.8067 99.9197 87.8067 97.733V64.5597C87.8067 62.373 89.62 60.5597 91.8067 60.5597C93.9933 60.5597 95.8067 62.373 95.8067 64.5597V97.733ZM95.8067 47.7063C95.8067 49.893 93.9933 51.7063 91.8067 51.7063C89.62 51.7063 87.8067 49.893 87.8067 47.7063V42.533C74.2067 56.5063 57.1933 66.373 38.1533 71.1197C37.8333 71.2263 37.5133 71.2263 37.1933 71.2263C35.38 71.2263 33.78 69.9997 33.3 68.1863C32.7667 66.053 34.0467 63.8663 36.2333 63.333C54.2067 58.853 70.2067 49.413 82.9 36.0797H76.2333C74.0467 36.0797 72.2333 34.2663 72.2333 32.0797C72.2333 29.893 74.0467 28.0797 76.2333 28.0797H91.86C92.0733 28.0797 92.2333 28.1863 92.4467 28.1863C92.7133 28.2397 92.98 28.2397 93.2467 28.3463C93.5133 28.453 93.7267 28.613 93.9933 28.773C94.1533 28.8797 94.3133 28.933 94.4733 29.0397C94.5267 29.093 94.5267 29.1463 94.58 29.1463C94.7933 29.3597 94.9533 29.573 95.1133 29.7863C95.2733 29.9997 95.4333 30.1597 95.4867 30.373C95.5933 30.5863 95.5933 30.7997 95.6467 31.0663C95.7 31.333 95.8067 31.5997 95.8067 31.9197C95.8067 31.973 95.86 32.0263 95.86 32.0797V47.7063H95.8067Z" fill="#2CD7AE"/>
  </svg>`;

  const navItems = pages.map(p => `
    <a href="${p.href}" class="nav-item ${activePage === p.href ? 'active' : ''}">
      <i class="fas ${p.icon}"></i> ${p.label}
    </a>`).join('');

  const isDark = localStorage.getItem('darkMode') !== 'false';

  document.body.insertAdjacentHTML('afterbegin', `
    <aside class="sidebar">
      <div>
        <div class="sidebar-logo">${logo}<span>Track My Cash</span></div>
        <div class="nav-section-label">Manage</div>
        ${navItems}
        <div class="nav-section-label" style="margin-top:16px">Preferences</div>
        <a href="#" class="nav-item" onclick="toggleDark(event)">
          <i class="fas fa-moon" id="dark-icon"></i> <span id="dark-label">Dark Mode</span>
        </a>
      </div>
      <div class="sidebar-bottom">
        <a href="login.html" class="nav-item" onclick="return confirm('Log out?')" style="color:#ef4444">
          <i class="fas fa-sign-out-alt"></i> Logout
        </a>
      </div>
    </aside>
    <div id="toast-container"></div>
  `);

  if (!isDark) {
    document.body.classList.add('light-mode');
    document.getElementById('dark-icon').className = 'fas fa-sun';
    document.getElementById('dark-label').textContent = 'Light Mode';
  }
}

function toggleDark(e) {
  e.preventDefault();
  const isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('darkMode', !isLight);
  const icon = document.getElementById('dark-icon');
  const label = document.getElementById('dark-label');
  icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
  label.textContent = isLight ? 'Light Mode' : 'Dark Mode';
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${msg}`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function confirmDelete(msg, cb) {
  if (confirm(msg || 'Are you sure you want to delete this?')) cb();
}

function fmt(amount) {
  return 'LKR ' + parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
