const { BN, expectEvent, singletons } = require('@openzeppelin/test-helpers');

const WrappedETCToken = artifacts.require('WrappedETCToken');

contract('WrappedETCToken', function ([_, registryFunder, creator, operator]) {
  beforeEach(async function () {
    this.erc1820 = await singletons.ERC1820Registry(registryFunder);
    this.token = await WrappedETCToken.new({ from: creator });
  });

  it('has a name', async function () {
    (await this.token.name()).should.equal('WrappedETC');
  });

  it('has a symbol', async function () {
    (await this.token.symbol()).should.equal('WETC');
  });

  it('increase total supply and balance when deposit', async function () {
    const value = new BN(10000000);
    const deposit = await this.token.deposit({ from: creator, value });

    const totalSupply = await this.token.totalSupply();
    const creatorBalance = await this.token.balanceOf(creator);

    totalSupply.should.be.bignumber.equal(value);
    creatorBalance.should.be.bignumber.equal(value);

    await expectEvent(deposit, 'Deposit', {
      _owner: creator,
      _value: value,
    });
  });

  it('decrease total supply and balance when withdraw', async function () {
    const value = new BN(3000000);
    await this.token.deposit({ from: creator, value: new BN(10000000) });
    const withdraw = await this.token.withdraw(value, { from: creator });

    const totalSupply = await this.token.totalSupply();
    const creatorBalance = await this.token.balanceOf(creator);

    totalSupply.should.be.bignumber.equal(new BN(7000000));
    creatorBalance.should.be.bignumber.equal(new BN(7000000));

    await expectEvent(withdraw, 'Withdrawal', {
      _owner: creator,
      _value: value,
    });
  });
});
