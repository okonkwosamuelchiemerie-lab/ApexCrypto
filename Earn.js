// ===== EARN PAGE FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
  setupEarnButtons();
  animateStats();
});

// ===== SETUP EARN BUTTONS =====
function setupEarnButtons() {
  const buttons = document.querySelectorAll('.btn-product, .btn-primary-large, .btn-cta');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (this.href === '#' || !this.href.includes('Payment')) {
        e.preventDefault();
        // In a real app, show a modal or redirect to payment
        console.log('Redirecting to payment page...');
      }
    });
  });
}

// ===== ANIMATE STATISTICS =====
function animateStats() {
  // Scroll reveal animations
  const cards = document.querySelectorAll('.benefit-card, .product-card, .testimonial-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease';
    observer.observe(card);
  });
}

// ===== TRACK EARNING PERFORMANCE =====
function trackEarningPerformance() {
  // Get user's earning data
  const earningData = {
    totalEarned: 0,
    currentBalance: 0,
    activeInvestments: [],
    allTransactions: []
  };

  // Load from localStorage
  const savedData = localStorage.getItem('earningPerformance');
  if (savedData) {
    Object.assign(earningData, JSON.parse(savedData));
  }

  return earningData;
}

// ===== CALCULATE POTENTIAL EARNINGS =====
function calculatePotentialEarnings(amount, apy, months) {
  // Formula: A = P(1 + r/n)^(nt)
  // P = Principal, r = annual rate, n = compounds per year, t = time in years
  
  const monthlyRate = (apy / 100) / 12;
  const periods = months;
  
  const futureValue = amount * Math.pow(1 + monthlyRate, periods);
  const earnings = futureValue - amount;
  
  return {
    futureValue: futureValue.toFixed(2),
    earnings: earnings.toFixed(2),
    monthlyEarning: (earnings / months).toFixed(2)
  };
}

// ===== COMPARE EARNING PRODUCTS =====
function compareEarningProducts(amount, months = 12) {
  const products = {
    staking: { min: 15, max: 25 },
    lending: { min: 12, max: 20 },
    yieldFarming: { min: 20, max: 30 },
    cryptoSavings: { min: 8, max: 15 },
    cryptoFutures: { min: 25, max: 35 },
    smartPortfolio: { min: 12, max: 18 }
  };

  const comparison = {};

  for (const [product, apyRange] of Object.entries(products)) {
    const avgAPY = (apyRange.min + apyRange.max) / 2;
    const earning = calculatePotentialEarnings(amount, avgAPY, months);
    comparison[product] = {
      apy: avgAPY,
      ...earning
    };
  }

  return comparison;
}

// ===== LOG EARNING ACTIVITY =====
function logEarningActivity(product, amount, type) {
  const activity = {
    id: Date.now(),
    product: product,
    amount: amount,
    type: type, // 'deposit', 'withdraw', 'earned'
    date: new Date().toLocaleString(),
    status: 'completed'
  };

  let activities = JSON.parse(localStorage.getItem('earningActivities')) || [];
  activities.unshift(activity);
  
  // Keep only last 100 activities
  if (activities.length > 100) {
    activities = activities.slice(0, 100);
  }

  localStorage.setItem('earningActivities', JSON.stringify(activities));
  
  return activity;
}

// ===== GET EARNING STATISTICS =====
function getEarningStatistics() {
  const activities = JSON.parse(localStorage.getItem('earningActivities')) || [];
  
  let totalDeposited = 0;
  let totalEarned = 0;
  let totalWithdrawn = 0;
  
  activities.forEach(activity => {
    switch(activity.type) {
      case 'deposit':
        totalDeposited += activity.amount;
        break;
      case 'withdraw':
        totalWithdrawn += activity.amount;
        break;
      case 'earned':
        totalEarned += activity.amount;
        break;
    }
  });

  return {
    totalDeposited: totalDeposited.toFixed(2),
    totalEarned: totalEarned.toFixed(2),
    totalWithdrawn: totalWithdrawn.toFixed(2),
    currentBalance: (totalDeposited + totalEarned - totalWithdrawn).toFixed(2),
    activitiesCount: activities.length
  };
}

// ===== PRODUCT DESCRIPTIONS =====
const productDescriptions = {
  staking: {
    name: 'Staking',
    description: 'Earn rewards by staking your crypto and supporting blockchain networks',
    advantages: [
      'Secure on-chain staking',
      'Daily reward payouts',
      'Multiple cryptocurrencies supported',
      'No lockup period required',
      'Low risk investment'
    ],
    risks: [
      'Market volatility affects underlying asset',
      'Network slashing (rare)',
      'Minimum stake requirements may apply'
    ]
  },
  lending: {
    name: 'Lending',
    description: 'Lend your crypto to borrowers and earn interest on your loans',
    advantages: [
      'Peer-to-peer lending',
      'Monthly interest payments',
      'Diversified loan portfolio',
      'Flexible loan terms available',
      'Moderate returns'
    ],
    risks: [
      'Borrower default risk',
      'Market volatility',
      'Lockup period commitment'
    ]
  },
  yieldFarming: {
    name: 'Yield Farming',
    description: 'Provide liquidity to decentralized exchanges and earn trading fees',
    advantages: [
      'High yield potential',
      'Weekly payouts',
      'Low impermanent loss',
      'Advanced strategies available',
      'Very profitable'
    ],
    risks: [
      'Impermanent loss risk',
      'Market volatility',
      'Smart contract risk',
      'High risk investment'
    ]
  },
  cryptoSavings: {
    name: 'Crypto Savings',
    description: 'Save your crypto in our secure vault and earn interest automatically',
    advantages: [
      'FDIC-style protection',
      'Daily interest accrual',
      'Withdraw anytime (flexible)',
      'No fees',
      'Very safe'
    ],
    risks: [
      'Lower returns',
      'Inflation may erode gains',
      'Platform risk'
    ]
  }
};

// ===== ESTIMATE EARNING POTENTIAL =====
function estimateEarningPotential(amount, apy) {
  const estimates = {
    oneMonth: calculatePotentialEarnings(amount, apy, 1),
    threeMonths: calculatePotentialEarnings(amount, apy, 3),
    sixMonths: calculatePotentialEarnings(amount, apy, 6),
    oneYear: calculatePotentialEarnings(amount, apy, 12),
    twoYears: calculatePotentialEarnings(amount, apy, 24)
  };

  return estimates;
}

// ===== CONSOLE HELPER FOR TESTING =====
console.log('Earn page functions loaded. Available functions:');
console.log('- compareEarningProducts(amount, months)');
console.log('- getEarningStatistics()');
console.log('- estimateEarningPotential(amount, apy)');
console.log('- logEarningActivity(product, amount, type)');
