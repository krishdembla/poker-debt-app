// Greedy min-cash-flow settlement algorithm
// Input: { playerName: netBalance }
// Output: Array of { from, to, amount }
// Positive net -> creditor, negative -> debtor
function calculateSettlement(nets) {
  const debtors = [];
  const creditors = [];

  for (const [name, net] of Object.entries(nets)) {
    if (net < 0) {
      debtors.push({ name, amount: -net }); // owe amount
    } else if (net > 0) {
      creditors.push({ name, amount: net }); // to receive amount
    }
  }

  // Sort largest first for efficient matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];

  while (debtors.length && creditors.length) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    const settled = Math.min(debtor.amount, creditor.amount);

    transactions.push({ from: debtor.name, to: creditor.name, amount: settled });

    debtor.amount -= settled;
    creditor.amount -= settled;

    if (debtor.amount === 0) debtors.shift();
    if (creditor.amount === 0) creditors.shift();

    // keep lists sorted – simple because we only changed first elements
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
  }

  return transactions;
}

module.exports = { calculateSettlement };
