const { calculateSettlement } = require('../utils/settlement');

describe('calculateSettlement', () => {
  it('simple 3-player -> 2 tx', () => {
    const nets = { A: 50, B: -30, C: -20 };
    const tx = calculateSettlement(nets);
    expect(tx).toHaveLength(2);
  });

  it('already balanced -> 0 tx', () => {
    const nets = { A: 0, B: 0 };
    expect(calculateSettlement(nets)).toHaveLength(0);
  });

  it('complex 8-player -> 7 tx', () => {
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
    expect(calculateSettlement(nets)).toHaveLength(7);
  });
});
