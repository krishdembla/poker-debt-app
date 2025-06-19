// Optimal minimum-cash-flow settlement algorithm (recursive)
// This guarantees the minimum number of transactions.
// Reference: https://www.geeksforgeeks.org/minimize-cash-flow-among-given-set-friends-borrowed-money/
// Input: { playerName: netBalance }
// Output: Array of { from, to, amount }
// Positive net -> creditor, negative -> debtor
function calculateSettlement(nets) {
  const names = Object.keys(nets);
  const balance = names.map((n) => nets[n]);
  const transactions = [];

  const getMaxIndex = (arr) =>
    arr.reduce((maxIdx, val, idx) => (val > arr[maxIdx] ? idx : maxIdx), 0);
  const getMinIndex = (arr) =>
    arr.reduce((minIdx, val, idx) => (val < arr[minIdx] ? idx : minIdx), 0);

  function settle() {
    const mxCredit = getMaxIndex(balance);
    const mxDebit = getMinIndex(balance);

    if (
      Math.abs(balance[mxCredit]) < 1e-9 &&
      Math.abs(balance[mxDebit]) < 1e-9
    ) {
      return;
    }

    const amount = Math.min(-balance[mxDebit], balance[mxCredit]);
    balance[mxCredit] -= amount;
    balance[mxDebit] += amount;

    transactions.push({
      from: names[mxDebit],
      to: names[mxCredit],
      amount,
    });

    settle();
  }

  settle();
  return transactions;
}

module.exports = { calculateSettlement };


