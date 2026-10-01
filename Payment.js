// ===== PAYMENT SYSTEM WITH ADVANCED FEATURES =====

// Store transactions and portfolio data in localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let portfolioData = JSON.parse(localStorage.getItem('portfolioData')) || {
  totalBalance: 0,
  totalInvested: 0,
  investments: []
};

let withdrawalTracker = JSON.parse(localStorage.getItem('withdrawalTracker')) || {
  count: 0,
  lastReset: new Date().toDateString()
};

// Expected returns percentage by investment type
const investmentReturns = {
  'crypto-portfolio': 15,
  'staking': 8,
  'lending': 12,
  'yield-farming': 25,
  'futures': 30
};

// Currency conversion rates to USD
const exchangeRates = {
  'USD': 1.0,
  'EUR': 1.09,
  'GBP': 1.27,
  'JPY': 0.0067,
  'AUD': 0.67,
  'CAD': 0.74,
  'CHF': 1.14,
  'CNY': 0.14,
  'INR': 0.012,
  'MXN': 0.058,
  'BRL': 0.20,
  'NGN': 0.00065
};

// Market rate tracker (starts at 100)
let marketRate = parseFloat(localStorage.getItem('marketRate')) || 100;
let rateHistory = JSON.parse(localStorage.getItem('rateHistory')) || [100];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  setupFormListeners();
  displayTransactionHistory();
  updatePortfolioDisplay();
  resetDailyWithdrawalLimit();
  updateWithdrawalCounter();
  
  // Start market rate updater (increases by 0.99% every minute)
  startMarketRateUpdater();
});

// ===== MARKET RATE UPDATER =====
function startMarketRateUpdater() {
  // Update every minute (60000 ms)
  setInterval(() => {
    // Increase market rate by 0.99%
    marketRate = marketRate * 1.0099;
    rateHistory.push(marketRate);
    
    // Keep only last 100 rates to avoid too much data
    if (rateHistory.length > 100) {
      rateHistory = rateHistory.slice(-100);
    }
    
    // Save to localStorage
    localStorage.setItem('marketRate', marketRate.toString());
    localStorage.setItem('rateHistory', JSON.stringify(rateHistory));
    
    // Update portfolio display
    updatePortfolioDisplay();
    
    // Update investment values
    updateInvestmentValues();
  }, 60000); // 60 seconds
  
  // Also update every 5 seconds for visual feedback in development
  setInterval(() => {
    updatePortfolioDisplay();
  }, 5000);
}

// ===== UPDATE INVESTMENT VALUES =====
function updateInvestmentValues() {
  if (portfolioData.investments.length === 0) return;
  
  const rateFactor = marketRate / 100;
  
  portfolioData.investments.forEach(investment => {
    const baseRate = (investmentReturns[investment.type] || 10) / 100;
    // Investment grows based on market rate + investment return rate
    investment.currentValue = investment.amount * (1 + baseRate) * rateFactor;
  });
  
  // Update total balance
  portfolioData.totalBalance = portfolioData.investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  
  localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
  updatePortfolioDisplay();
}

// ===== SETUP FORM LISTENERS =====
function setupFormListeners() {
  // Deposit Form
  document.getElementById('depositForm').addEventListener('submit', handleDeposit);

  // Investment Form
  document.getElementById('investForm').addEventListener('submit', handleInvestment);
  document.getElementById('investmentType').addEventListener('change', updateExpectedReturns);

  // Withdrawal Form
  document.getElementById('withdrawForm').addEventListener('submit', handleWithdrawal);
}

// ===== DEPOSIT HANDLER =====
function handleDeposit(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('depositAmount').value);
  const currency = document.getElementById('depositCurrency').value;
  const method = document.getElementById('depositMethod').value;
  const bankAccount = document.getElementById('depositBankAccount').value;

  if (amount <= 0) {
    showStatus('depositStatus', 'Please enter a valid amount', 'error');
    return;
  }

  if (!currency || !method || !bankAccount) {
    showStatus('depositStatus', 'Please fill in all fields', 'error');
    return;
  }

  // Validate bank account
  if (bankAccount.trim().length < 8) {
    showStatus('depositStatus', 'Please enter a valid bank account number', 'error');
    return;
  }

  // Simulate processing
  showStatus('depositStatus', 'Processing your deposit...', 'pending');

  setTimeout(() => {
    // Convert to USD for tracking
    const amountInUSD = amount * exchangeRates[currency];
    
    // Add to portfolio balance
    portfolioData.totalBalance += amountInUSD;
    
    // Add transaction
    const transaction = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      type: 'Deposit',
      amount: amount,
      currency: currency,
      status: 'Completed',
      method: method,
      amountUSD: amountInUSD
    };

    transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));

    showStatus('depositStatus', `✓ Successfully deposited ${amount} ${currency} (${amountInUSD.toFixed(2)} USD) via ${method}`, 'success');

    // Clear form
    document.getElementById('depositForm').reset();

    // Update displays
    displayTransactionHistory();
    updatePortfolioDisplay();
  }, 1500);
}

// ===== INVESTMENT HANDLER =====
function handleInvestment(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('investAmount').value);
  const currency = document.getElementById('investCurrency').value;
  const investmentType = document.getElementById('investmentType').value;
  const duration = document.getElementById('investDuration').value;
  const bankAccount = document.getElementById('investBankAccount').value;

  if (amount <= 0) {
    showStatus('investStatus', 'Please enter a valid investment amount', 'error');
    return;
  }

  if (!currency || !investmentType || !duration || !bankAccount) {
    showStatus('investStatus', 'Please fill in all fields', 'error');
    return;
  }

  if (bankAccount.trim().length < 8) {
    showStatus('investStatus', 'Please enter a valid bank account number', 'error');
    return;
  }

  // Check if user has enough balance
  const amountInUSD = amount * exchangeRates[currency];
  if (amountInUSD > portfolioData.totalBalance) {
    showStatus('investStatus', `Insufficient balance. You have ${portfolioData.totalBalance.toFixed(2)} USD`, 'error');
    return;
  }

  // Simulate processing
  showStatus('investStatus', 'Setting up your investment...', 'pending');

  setTimeout(() => {
    // Deduct from balance and add to investments
    portfolioData.totalBalance -= amountInUSD;
    portfolioData.totalInvested += amountInUSD;

    // Add investment tracking
    const investment = {
      id: Date.now(),
      type: investmentType,
      originalAmount: amountInUSD,
      amount: amountInUSD,
      currentValue: amountInUSD,
      currency: currency,
      duration: duration,
      startDate: new Date().toLocaleDateString(),
      rate: investmentReturns[investmentType] || 10
    };

    portfolioData.investments.push(investment);

    // Add transaction
    const transaction = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      type: `Investment (${investmentType})`,
      amount: amountInUSD,
      currency: 'USD',
      status: 'Active',
      duration: duration
    };

    transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));

    const expectedReturn = investmentReturns[investmentType] || 10;
    const estimatedEarnings = (amountInUSD * expectedReturn / 100).toFixed(2);

    showStatus('investStatus', 
      `✓ Investment started! Expected returns: ${expectedReturn}% (Est. ${estimatedEarnings} USD)`, 
      'success'
    );

    // Clear form
    document.getElementById('investForm').reset();
    document.getElementById('expectedReturn').textContent = '0%';

    // Update displays
    displayTransactionHistory();
    updatePortfolioDisplay();
  }, 1500);
}

// ===== WITHDRAWAL HANDLER =====
function handleWithdrawal(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('withdrawAmount').value);
  const currency = document.getElementById('withdrawCurrency').value;
  const method = document.getElementById('withdrawMethod').value;
  const wallet = document.getElementById('withdrawWallet').value;

  if (amount <= 0) {
    showStatus('withdrawStatus', 'Please enter a valid withdrawal amount', 'error');
    return;
  }

  if (!currency || !method || !wallet) {
    showStatus('withdrawStatus', 'Please fill in all withdrawal details', 'error');
    return;
  }

  // Validate wallet address
  if (wallet.trim().length < 5) {
    showStatus('withdrawStatus', 'Please enter a valid wallet/account address', 'error');
    return;
  }

  // Check withdrawal limits
  const amountInUSD = amount * exchangeRates[currency];

  // Check daily withdrawal limit (max 2 per day)
  if (withdrawalTracker.count >= 2) {
    showStatus('withdrawStatus', '❌ You have reached your daily withdrawal limit (2 per day). Try again tomorrow.', 'error');
    return;
  }

  // Check minimum withdrawal amount ($800 USD equivalent)
  // But allow more withdrawals if user has invested more
  let minWithdrawal = 800;
  if (portfolioData.totalInvested > 0) {
    minWithdrawal = Math.min(800, portfolioData.totalInvested * 0.1); // 10% of invested amount, min $800
  }

  if (amountInUSD < minWithdrawal) {
    showStatus('withdrawStatus', 
      `❌ Minimum withdrawal is $${minWithdrawal.toFixed(2)} USD (or 10% of your investment). Your requested amount: ${amountInUSD.toFixed(2)} USD`, 
      'error'
    );
    return;
  }

  // Check if user has enough balance
  if (amountInUSD > portfolioData.totalBalance) {
    showStatus('withdrawStatus', 
      `❌ Insufficient balance. You have ${portfolioData.totalBalance.toFixed(2)} USD`, 
      'error'
    );
    return;
  }

  // Simulate processing
  showStatus('withdrawStatus', 'Processing withdrawal request...', 'pending');

  setTimeout(() => {
    // Deduct from balance
    portfolioData.totalBalance -= amountInUSD;
    
    // Add transaction
    const transaction = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      type: 'Withdrawal',
      amount: amount,
      currency: currency,
      status: 'Completed',
      method: method,
      amountUSD: amountInUSD
    };

    transactions.unshift(transaction);
    
    // Update withdrawal tracker
    withdrawalTracker.count += 1;
    
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    localStorage.setItem('withdrawalTracker', JSON.stringify(withdrawalTracker));

    showStatus('withdrawStatus', 
      `✓ Withdrawal completed! ${amount} ${currency} has been sent to your ${method}`, 
      'success'
    );

    // Clear form
    document.getElementById('withdrawForm').reset();

    // Update displays
    displayTransactionHistory();
    updatePortfolioDisplay();
    updateWithdrawalCounter();
  }, 1500);
}

// ===== UPDATE EXPECTED RETURNS =====
function updateExpectedReturns() {
  const investmentType = document.getElementById('investmentType').value;
  const expectedReturn = investmentReturns[investmentType] || 0;
  document.getElementById('expectedReturn').textContent = expectedReturn + '%';
}

// ===== SHOW STATUS MESSAGE =====
function showStatus(elementId, message, type) {
  const statusElement = document.getElementById(elementId);
  statusElement.textContent = message;
  statusElement.className = `status-message show ${type}`;

  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusElement.classList.remove('show');
    }, 5000);
  }
}

// ===== DISPLAY TRANSACTION HISTORY =====
function displayTransactionHistory() {
  const tableBody = document.getElementById('transactionBody');

  if (transactions.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="no-data">No transactions yet. Start by making a deposit!</td></tr>';
    return;
  }

  tableBody.innerHTML = transactions.map((transaction, index) => `
    <tr>
      <td>${transaction.date} ${transaction.time || ''}</td>
      <td>${transaction.type}</td>
      <td>${transaction.amount.toFixed(2)}</td>
      <td>${transaction.currency}</td>
      <td><span class="status-badge ${transaction.status.toLowerCase()}">${transaction.status}</span></td>
    </tr>
  `).join('');
}

// ===== UPDATE PORTFOLIO DISPLAY =====
function updatePortfolioDisplay() {
  // Calculate current market performance
  const rateChange = ((marketRate - 100) / 100) * 100;
  
  // Update portfolio balance with current market values
  let currentBalance = portfolioData.totalBalance;
  
  portfolioData.investments.forEach(investment => {
    const rateFactor = marketRate / 100;
    const baseRate = (investment.rate || 10) / 100;
    investment.currentValue = investment.originalAmount * (1 + baseRate) * rateFactor;
    currentBalance += investment.currentValue;
  });
  
  const totalValue = currentBalance;
  
  // Update HTML
  document.getElementById('portfolioBalance').textContent = `$${totalValue.toFixed(2)}`;
  document.getElementById('totalInvested').textContent = `$${portfolioData.totalInvested.toFixed(2)}`;
  
  // Update market indicator
  const marketIndicator = document.getElementById('marketIndicator');
  const rateChangeDisplay = document.querySelector('.rate-change');
  
  if (rateChange >= 0) {
    marketIndicator.classList.add('up');
    marketIndicator.classList.remove('down');
    rateChangeDisplay.textContent = `↑ +${rateChange.toFixed(2)}%`;
  } else {
    marketIndicator.classList.add('down');
    marketIndicator.classList.remove('up');
    rateChangeDisplay.textContent = `↓ ${rateChange.toFixed(2)}%`;
  }
}

// ===== UPDATE WITHDRAWAL COUNTER =====
function updateWithdrawalCounter() {
  const remaining = Math.max(0, 2 - withdrawalTracker.count);
  document.getElementById('withdrawalCount').textContent = remaining;
}

// ===== RESET DAILY WITHDRAWAL LIMIT =====
function resetDailyWithdrawalLimit() {
  const today = new Date().toDateString();
  
  if (withdrawalTracker.lastReset !== today) {
    withdrawalTracker.count = 0;
    withdrawalTracker.lastReset = today;
    localStorage.setItem('withdrawalTracker', JSON.stringify(withdrawalTracker));
  }
}

// ===== INPUT VALIDATION =====
document.getElementById('depositAmount')?.addEventListener('input', function() {
  this.value = this.value.replace(/[^0-9.]/g, '');
});

document.getElementById('investAmount')?.addEventListener('input', function() {
  this.value = this.value.replace(/[^0-9.]/g, '');
});

document.getElementById('withdrawAmount')?.addEventListener('input', function() {
  this.value = this.value.replace(/[^0-9.]/g, '');
});

// Add navigation highlight
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active-nav');
    }
  });
});
