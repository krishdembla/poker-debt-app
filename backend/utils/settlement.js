// backend/utils/settlement.js
function calculateSettlement(nets) {
  const names = Object.keys(nets);
  const balance = names.map((n) => nets[n]);
  const transactions = [];
  let totalImbalance = 0;

  const getMaxIndex = (arr) => 
    arr.reduce((maxIdx, val, idx) => (val > arr[maxIdx] ? idx : maxIdx), 0);
  const getMinIndex = (arr) => 
    arr.reduce((minIdx, val, idx) => (val < arr[minIdx] ? idx : minIdx), 0);

  function settle() {
    const mxCredit = getMaxIndex(balance);
    const mxDebit = getMinIndex(balance);

    if (Math.abs(balance[mxCredit]) < 1e-9 && 
        Math.abs(balance[mxDebit]) < 1e-9) {
      return;
    }

    if (balance[mxCredit] < 1e-9 || -balance[mxDebit] < 1e-9) {
      totalImbalance = balance.reduce((sum, b) => sum + b, 0);
      return;
    }

    const amount = Math.min(-balance[mxDebit], balance[mxCredit]);
    balance[mxCredit] -= amount;
    balance[mxDebit] += amount;

    transactions.push({
      from: names[mxDebit],
      to: names[mxCredit],
      amount: parseFloat(amount.toFixed(2))
    });

    settle();
  }

  settle();
  return { 
    transactions, 
    imbalance: Math.abs(totalImbalance) > 1e-9 ? parseFloat(totalImbalance.toFixed(2)) : 0 
  };
}

module.exports = { calculateSettlement };