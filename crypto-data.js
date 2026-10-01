// ===== REAL-TIME CRYPTO DATA =====
// This file fetches live cryptocurrency data and updates the UI

class CryptoDataManager {
  constructor() {
    this.apiUrl = 'https://api.coingecko.com/api/v3';
    this.updateInterval = 10000; // Update every 10 seconds for near real-time feel
    this.tradeHandlersBound = false;
  }

  // Fetch live cryptocurrency data
  async fetchCryptoData(coinIds = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'ripple', 'usd-coin', 'dogecoin', 'cardano', 'solana']) {
    try {
      const idsParam = coinIds.join(',');
      const response = await fetch(
        `${this.apiUrl}/simple/price?ids=${idsParam}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (error) {
      console.warn('Crypto data unavailable, using placeholder data:', error);
      return this.getPlaceholderData();
    }
  }

  // Get placeholder data for demo (when API unavailable)
  getPlaceholderData() {
    return {
      bitcoin: {
        usd: 70290.76,
        usd_market_cap: 1410000000000,
        usd_24h_vol: 40210000000,
        usd_24h_change: -0.59
      },
      ethereum: {
        usd: 2066.59,
        usd_market_cap: 249470000000,
        usd_24h_vol: 18570000000,
        usd_24h_change: -0.47
      },
      tether: {
        usd: 1,
        usd_market_cap: 183980000000,
        usd_24h_vol: 77500000000,
        usd_24h_change: 0.01
      },
      binancecoin: {
        usd: 650.53,
        usd_market_cap: 88730000000,
        usd_24h_vol: 1570000000,
        usd_24h_change: -0.45
      },
      ripple: {
        usd: 1.3807,
        usd_market_cap: 84540000000,
        usd_24h_vol: 1940000000,
        usd_24h_change: -0.99
      }
    };
  }

  // Format currency values
  formatPrice(price) {
    if (price >= 1) {
      return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '$' + price.toFixed(4);
  }

  formatMarketCap(marketCap) {
    if (marketCap >= 1000000000000) {
      return '$' + (marketCap / 1000000000000).toFixed(2) + 'T';
    }
    if (marketCap >= 1000000000) {
      return '$' + (marketCap / 1000000000).toFixed(2) + 'B';
    }
    if (marketCap >= 1000000) {
      return '$' + (marketCap / 1000000).toFixed(2) + 'M';
    }
    return '$' + marketCap.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  formatVolume(volume) {
    if (volume >= 1000000000) {
      return '$' + (volume / 1000000000).toFixed(2) + 'B';
    }
    if (volume >= 1000000) {
      return '$' + (volume / 1000000).toFixed(2) + 'M';
    }
    return '$' + volume.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  // Update prices on page
  async updatePricesOnPage() {
    this.setLiveStatus('Live • syncing…');
    const data = await this.fetchCryptoData();
    this.updatePriceElements(data);
    this.updateUserDashboard(data);
    const liveStatus = document.getElementById('live-status');
    if (liveStatus) {
      const now = new Date();
      liveStatus.textContent = `Live • updated ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}`;
    }
  }

  setLiveStatus(message) {
    const liveStatus = document.getElementById('live-status');
    if (liveStatus) {
      liveStatus.textContent = message;
    }
  }

  updatePriceElements(data) {
    // Map API coin names to symbols used in HTML
    const coinMap = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'tether': 'USDT',
      'binancecoin': 'BNB',
      'ripple': 'XRP',
      'usd-coin': 'USDC',
      'dogecoin': 'DOGE',
      'cardano': 'ADA'
    };

    // Update price table rows
    document.querySelectorAll('tbody tr').forEach(row => {
      const coinCell = row.querySelector('.coin-cell');
      if (!coinCell) return;

      const ticker = coinCell.querySelector('.ticker')?.textContent || '';
      
      // Find matching coin data
      for (const [apiName, symbol] of Object.entries(coinMap)) {
        if (ticker.includes(symbol)) {
          const coinData = data[apiName];
          if (coinData) {
            const priceCell = row.cells[2];
            const changeCell = row.cells[3];
            const marketCapCell = row.cells[5];
            const volumeCell = row.cells[6];

            if (priceCell) priceCell.textContent = this.formatPrice(coinData.usd);
            
            if (changeCell) {
              const change = coinData.usd_24h_change;
              const changeText = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
              changeCell.textContent = changeText;
              changeCell.className = change >= 0 ? 'up' : 'down';
            }
            
            if (marketCapCell) marketCapCell.textContent = this.formatMarketCap(coinData.usd_market_cap);
            if (volumeCell) volumeCell.textContent = this.formatVolume(coinData.usd_24h_vol);
          }
          break;
        }
      }
    });

    // Update trending cards
    document.querySelectorAll('.trend-card').forEach(card => {
      const coinRows = card.querySelectorAll('.coin-row');
      coinRows.forEach(row => {
        const coinName = row.querySelector('.coin-name')?.textContent.trim();
        
        for (const [apiName, symbol] of Object.entries(coinMap)) {
          if (coinName === symbol) {
            const coinData = data[apiName];
            if (coinData) {
              const priceEl = row.querySelector('.coin-price');
              const changeEl = row.querySelector('.up, .down');
              const change = coinData.usd_24h_change;
              const changeText = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
              
              if (priceEl) priceEl.textContent = this.formatPrice(coinData.usd);
              if (changeEl) {
                changeEl.textContent = changeText;
                changeEl.className = change >= 0 ? 'up' : 'down';
              }
            }
            break;
          }
        }
      });
    });
  }

  updateUserDashboard(data) {
    const holdings = {
      bitcoin: { amount: 0.42, avgPrice: 69900 },
      ethereum: { amount: 2.10, avgPrice: 2050 },
      solana: { amount: 15, avgPrice: 84.50 },
      dogecoin: { amount: 5000, avgPrice: 0.087 }
    };

    let portfolioValue = 0;
    let portfolioPnl = 0;

    Object.entries(holdings).forEach(([asset, info]) => {
      const coinData = data[asset];
      if (!coinData) return;

      const currentValue = info.amount * coinData.usd;
      const changeValue = currentValue * ((coinData.usd_24h_change || 0) / 100);
      portfolioValue += currentValue;
      portfolioPnl += changeValue;

      const valueEl = document.querySelector(`[data-asset="${asset}"]`);
      const pnlEl = document.querySelector(`[data-asset-pnl="${asset}"]`);
      if (valueEl) valueEl.textContent = this.formatPrice(currentValue);
      if (pnlEl) {
        pnlEl.textContent = `${changeValue >= 0 ? '+' : ''}${this.formatPrice(changeValue)}`;
        pnlEl.className = `holding-pnl ${changeValue >= 0 ? 'up' : 'down'}`;
      }
    });

    document.querySelectorAll('[data-watch]').forEach(el => {
      const asset = el.getAttribute('data-watch');
      const coinData = data[asset];
      if (coinData) {
        el.textContent = this.formatPrice(coinData.usd);
        el.className = coinData.usd_24h_change >= 0 ? 'up' : 'down';
      }
    });

    const balanceEl = document.getElementById('portfolio-balance');
    const changeEl = document.getElementById('portfolio-change');
    const cashEl = document.getElementById('portfolio-cash');
    const positionsEl = document.getElementById('portfolio-positions');
    const pnlEl = document.getElementById('portfolio-pnl');

    if (balanceEl) balanceEl.textContent = this.formatPrice(portfolioValue);
    if (changeEl) {
      const pctChange = portfolioValue ? (portfolioPnl / (portfolioValue - portfolioPnl)) * 100 : 0;
      changeEl.textContent = `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%`;
      changeEl.className = `portfolio-pill ${pctChange >= 0 ? 'up' : 'down'}`;
    }
    if (cashEl) cashEl.textContent = this.formatPrice(9420);
    if (positionsEl) positionsEl.textContent = Object.keys(holdings).length;
    if (pnlEl) pnlEl.textContent = `${portfolioPnl >= 0 ? '+' : ''}${this.formatPrice(portfolioPnl)}`;

    this.updateTradeEstimate(data);
  }

  updateTradeEstimate(data) {
    const coinSelect = document.getElementById('trade-coin');
    const amountInput = document.getElementById('trade-amount');
    const estimateEl = document.getElementById('trade-estimate');

    if (!coinSelect || !amountInput || !estimateEl) return;

    const updateEstimate = () => {
      const coinKey = coinSelect.value;
      const amount = parseFloat(amountInput.value) || 0;
      const price = data[coinKey]?.usd || 0;
      estimateEl.textContent = this.formatPrice(price * amount);
    };

    if (!this.tradeHandlersBound) {
      coinSelect.addEventListener('change', updateEstimate);
      amountInput.addEventListener('input', updateEstimate);

      const tabs = document.querySelectorAll('.trade-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        });
      });

      const actionBtn = document.querySelector('.trade-action');
      actionBtn?.addEventListener('click', () => {
        const action = document.querySelector('.trade-tab.active')?.textContent || 'Trade';
        actionBtn.textContent = `${action} placed`;
        setTimeout(() => { actionBtn.textContent = 'Place order'; }, 1200);
      });

      this.tradeHandlersBound = true;
    }

    updateEstimate();
  }

  // Start automatic updates
  startAutoUpdate() {
    this.updatePricesOnPage();
    setInterval(() => this.updatePricesOnPage(), this.updateInterval);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updatePricesOnPage();
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Only start crypto updates on prices page
  if (document.querySelector('.prices-table')) {
    const cryptoManager = new CryptoDataManager();
    cryptoManager.startAutoUpdate();
  }
});

// ===== PLACEHOLDER IMAGE GENERATOR =====
// Creates crypto coin icons and charts dynamically

class ImagePlaceholder {
  // Generate coin icon SVG
  static generateCoinIcon(symbol, size = 48) {
    const colors = {
      'BTC': '#F7931A',
      'ETH': '#627EEA',
      'USDT': '#26A17B',
      'BNB': '#F3BA2F',
      'XRP': '#23292F',
      'USDC': '#2775CA',
      'DOGE': '#BA9F33',
      'ADA': '#0033ad',
      'SOL': '#00D4AA',
      'QNT': '#170E3E'
    };

    const color = colors[symbol] || '#1199FA';
    
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/>
        <text x="50%" y="50%" font-size="${size * 0.5}" font-weight="bold" fill="white" 
              text-anchor="middle" dominant-baseline="middle" font-family="Arial">
          ${symbol.substring(0, 1)}
        </text>
      </svg>
    `;
  }

  // Generate basket icon SVG
  static generateBasketIcon(basketType = 'meme') {
    const size = 80;
    const basketColors = {
      'meme': { bg: '#FF6B6B', icon: 'laughing' },
      'defi': { bg: '#4ECDC4', icon: 'coins' },
      'btc-eth': { bg: '#FFD93D', icon: 'exchange' },
      'big3': { bg: '#6C5CE7', icon: 'star' }
    };
    
    const config = basketColors[basketType.toLowerCase()] || basketColors['meme'];
    let iconSvg = '';
    
    // Different icon shapes for each basket
    if (config.icon === 'laughing') {
      iconSvg = `<circle cx="${size/2}" cy="${size/2.5}" r="8" fill="white"/>
                <circle cx="${size/2 - 6}" cy="${size/2.5}" r="3" fill="white"/>
                <circle cx="${size/2 + 6}" cy="${size/2.5}" r="3" fill="white"/>
                <path d="M ${size/2 - 8} ${size/2.2} Q ${size/2} ${size/2.4} ${size/2 + 8} ${size/2.2}" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    } else if (config.icon === 'coins') {
      iconSvg = `<circle cx="${size/2 - 4}" cy="${size/2}" r="6" fill="white" opacity="0.8"/>
                <circle cx="${size/2 + 4}" cy="${size/2}" r="6" fill="white" opacity="0.6"/>
                <path d="M ${size/2 - 8} ${size/2 + 3} L ${size/2 + 8} ${size/2 + 3}" stroke="white" stroke-width="1.5"/>`;
    } else if (config.icon === 'exchange') {
      iconSvg = `<path d="M ${size/2 - 8} ${size/2 - 4} L ${size/2 + 8} ${size/2 - 4}" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <path d="M ${size/2 + 6} ${size/2 - 6} L ${size/2 + 8} ${size/2 - 4} L ${size/2 + 6} ${size/2 - 2}" fill="white"/>
                <path d="M ${size/2 - 8} ${size/2 + 4} L ${size/2 + 8} ${size/2 + 4}" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <path d="M ${size/2 - 6} ${size/2 + 6} L ${size/2 - 8} ${size/2 + 4} L ${size/2 - 6} ${size/2 + 2}" fill="white"/>`;
    } else if (config.icon === 'star') {
      const cx = size/2, cy = size/2;
      iconSvg = `<polygon points="${cx},${cy - 8} ${cx + 3},${cy - 3} ${cx + 8},${cy - 2} ${cx + 4},${cy + 2} ${cx + 5},${cy + 8} ${cx},${cy + 4} ${cx - 5},${cy + 8} ${cx - 4},${cy + 2} ${cx - 8},${cy - 2} ${cx - 3},${cy - 3}" fill="white"/>`;
    }
    
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="12" fill="${config.bg}"/>
        <g transform="translate(0, 0)">
          ${iconSvg}
        </g>
      </svg>
    `;
  }

  // Generate earn icon SVG
  static generateEarnIcon(assetName = 'generic') {
    const size = 40;
    const assetColors = {
      'pol': '#E84E5A',
      'dydx': '#3B5998',
      'avax': '#E84142',
      'xtz': '#2C7DF7'
    };
    
    const assetKey = assetName.toLowerCase().split(' ')[0];
    const color = assetColors[assetKey] || '#1199FA';
    
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="white" opacity="0.1"/>
        <text x="50%" y="50%" font-size="${size * 0.6}" font-weight="bold" fill="white" 
              text-anchor="middle" dominant-baseline="middle" font-family="Arial">
          $
        </text>
      </svg>
    `;
  }

  // Generate price chart SVG
  static generateChart(points = 50, type = 'up') {
    const width = 80;
    const height = 40;
    
    // Generate random but realistic price data
    let data = [];
    let value = 50;
    for (let i = 0; i < points; i++) {
      value += (Math.random() - (type === 'up' ? 0.4 : 0.6)) * 5;
      value = Math.max(10, Math.min(90, value));
      data.push(value);
    }

    const xStep = width / (points - 1);
    let pathData = `M0,${height - data[0] * (height / 100)}`;
    
    for (let i = 1; i < data.length; i++) {
      const x = i * xStep;
      const y = height - data[i] * (height / 100);
      pathData += ` L${x},${y}`;
    }

    const color = type === 'up' ? '#00c896' : '#ff5555';
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
          </linearGradient>
        </defs>
        <path d="${pathData}" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="${pathData} L${width},${height} L0,${height} Z" fill="url(#grad)"/>
      </svg>
    `;
  }

  // Apply placeholders to page
  static applyToPage() {
    // Coin icons in table
    document.querySelectorAll('img[src*="assets/"]').forEach(img => {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt') || '';
      
      // Basket images
      if (src.includes('basket')) {
        const match = src.match(/basket/i);
        let basketType = 'meme';
        if (src.includes('defi')) basketType = 'defi';
        else if (src.includes('btceth')) basketType = 'btc-eth';
        else if (src.includes('big3')) basketType = 'big3';
        img.outerHTML = this.generateBasketIcon(basketType);
      }
      // Earn/asset icons
      else if (src.includes('icon') || alt.includes('pol') || alt.includes('dydx') || alt.includes('avax') || alt.includes('xtz')) {
        let assetName = 'generic';
        if (src.includes('pol') || alt.includes('pol')) assetName = 'pol';
        else if (src.includes('dydx') || alt.includes('dydx')) assetName = 'dydx';
        else if (src.includes('avax') || alt.includes('avax')) assetName = 'avax';
        else if (src.includes('xtz') || alt.includes('xtz')) assetName = 'xtz';
        img.outerHTML = this.generateEarnIcon(assetName);
      }
      // Crypto coin icons in table
      else {
        const match = src.match(/assets\/(btc|eth|usdt|bnb|xrp|usdc|doge|ada)\.png/i);
        if (match) {
          const symbol = match[1].toUpperCase();
          img.outerHTML = this.generateCoinIcon(symbol, 24);
        }
      }
    });

    // Price charts in table
    document.querySelectorAll('img[src*="chart"]').forEach(img => {
      const type = img.getAttribute('src').includes('up') ? 'up' : 
                   img.getAttribute('src').includes('down') ? 'down' : 'flat';
      img.outerHTML = this.generateChart(50, type);
    });

    // Crypto slider icons
    document.querySelectorAll('.card-top img').forEach(img => {
      const alt = img.getAttribute('alt') || 'BTC';
      const symbol = alt.toUpperCase();
      img.outerHTML = this.generateCoinIcon(symbol, 48);
    });
  }
}

// Initialize placeholders
document.addEventListener('DOMContentLoaded', function() {
  ImagePlaceholder.applyToPage();
});
