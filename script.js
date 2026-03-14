document.addEventListener('DOMContentLoaded', () => {
  const data = window.data || {};
  console.log('Data loaded:', data);

  // DOM Elements - Prices
  const elBcv = document.getElementById('price-bcv');
  const elP2p = document.getElementById('price-p2p');
  const elBtc = document.getElementById('price-btc');
  const elLastUpdate = document.getElementById('last-update');

  // DOM Elements - Standard Calc
  const usdInput = document.getElementById('usd-input');
  const vesOfficialOutput = document.getElementById('ves-official-output');

  // DOM Elements - Remittance Calc
  const targetUsd = document.getElementById('target-usd');
  const aedRate = document.getElementById('aed-rate');
  const aedTotalCost = document.getElementById('aed-total-cost');
  const usdtNeeded = document.getElementById('usdt-needed');

  // Load Data - Using fallbacks for keys
  const bcvPrice = data.bcv || data.dolar_oficial || 0;
  const p2pPrice = data.binancep2p || 0;
  const btcPrice = data.btc || 0;

  console.log('Prices parsed:', { bcvPrice, p2pPrice, btcPrice });

  if (elBcv) elBcv.textContent = bcvPrice.toFixed(2);
  if (elP2p) elP2p.textContent = p2pPrice.toFixed(2);
  if (elBtc) elBtc.textContent = btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2 });
  if (elLastUpdate) elLastUpdate.textContent = `${data.ultima_actualizacion_fecha || '--/--/--'} ${data.ultima_actualizacion_hora || '--:--:--'}`;

  // Standard Calc Logic
  const updateStandardCalc = () => {
    const valet = parseFloat(usdInput.value) || 0;
    const result = valet * bcvPrice;
    console.log('Standard calc:', valet, '*', bcvPrice, '=', result);
    vesOfficialOutput.textContent = result.toLocaleString('es-VE', { minimumFractionDigits: 2 });
  };

  // Remittance Calc Logic
  const updateRemittanceCalc = () => {
    const target = parseFloat(targetUsd.value) || 0;
    const rateAED = parseFloat(aedRate.value) || 3.81;
    const commission = 1.02; // 2%

    // 1. How much VES is needed to cover the target USD at Official rate?
    const vesNeeded = target * bcvPrice;

    // 2. How many USDT should I sell in P2P to get that amount of VES?
    const usdtToSell = p2pPrice > 0 ? vesNeeded / p2pPrice : 0;

    // 3. How many AED do I need to buy those USDT? (AED rate + 2% comm)
    const aedCost = (usdtToSell * rateAED) * commission;

    console.log('Remittance calc:', { target, rateAED, vesNeeded, usdtToSell, aedCost });

    aedTotalCost.textContent = aedCost.toLocaleString('en-US', { minimumFractionDigits: 2 });
    usdtNeeded.textContent = usdtToSell.toFixed(2);
  };

  // Event Listeners
  if (usdInput) usdInput.addEventListener('input', updateStandardCalc);
  if (targetUsd) targetUsd.addEventListener('input', updateRemittanceCalc);
  if (aedRate) aedRate.addEventListener('input', updateRemittanceCalc);

  // Initial Calculation
  updateStandardCalc();
  updateRemittanceCalc();

  // Decorative - Latency randomizer
  const elLatency = document.getElementById('latency');
  if (elLatency) {
    setInterval(() => {
      const lat = Math.floor(Math.random() * (45 - 18) + 18);
      elLatency.textContent = lat + 'ms';
    }, 5000);
  }
});