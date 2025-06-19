// Quick simulation to test calculateSettlement with 6 players
// Run with: node backend/simulateSettlement.js

const { calculateSettlement } = require('./utils/settlement');

// Advanced example: 8 players, larger varied balances (positive => receive, negative => owe)
// Sum must equal 0
const nets = {
  Alice: 500,   
  Bob: -220,
  Charlie: -180,
  Dave: 100,    
  Eve: -50,
  Frank: -150,
  Grace: 300,   
  Hank: -300,
};

console.log('Net balances:', nets);
const transactions = calculateSettlement(nets);

console.log('\nSettlement transactions (minimum number):');
transactions.forEach(({ from, to, amount }) => {
  console.log(`${from} -> ${to}: $${amount}`);
});

console.log(`\nTotal transactions: ${transactions.length}`);
