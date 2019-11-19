import React, { Component } from "react";
import Web3 from "web3";
import TruffleContract from "truffle-contract";
import Tokens from "./Tokens/all";
import Nav from "./Components/Nav";
import Description from "./Components/Description";
import Container from "./Components/Container";
import InstallMetamask from "./Components/InstallMetamask";
import UnlockMetamask from "./Components/UnlockMetamask";
import TokenZendR from "./contracts/WrappedETCToken.json";

class App extends Component {
  constructor() {
    super();

    this.tokens = Tokens;
    this.appName = "WETC Portal";
    this.isWeb3 = true; //If metamask is installed
    this.isWeb3Locked = false; //If metamask account is locked
    this.newTransfer = this.newTransfer.bind(this);
    this.closeTransfer = this.closeTransfer.bind(this);
    this.onInputChangeUpdateField = this.onInputChangeUpdateField.bind(this);

    this.state = {
      tzAddress: null,
      inProgress: false,
      tx: null,
      network: "Checking...",
      account: null,
      tokens: [],
      transferDetail: {},
      fields: {
        receiver: null,
        amount: null,
        gasPrice: null,
        gasLimit: null
      },
      defaultGasPrice: null,
      defaultGasLimit: 200000
    };

    let web3 = window.web3;
    if (typeof web3 !== "undefined") {
      // Use Mist/MetaMask's provider
      this.web3Provider = web3.currentProvider;
      this.web3 = new Web3(web3.currentProvider);

      this.tokenZendr = TruffleContract(TokenZendR);
      this.tokenZendr.setProvider(this.web3Provider);

      web3.eth.getCoinbase((err, coinbase) => {
        if (coinbase === null) this.isWeb3Locked = true;
      });
    } else {
      this.isWeb3 = false;
    }
  }

  setNetwork = () => {
    let networkName,
      that = this;

    this.web3.version.getNetwork(function(err, networkId) {
      switch (networkId) {
        case "1":
          networkName = "Main";
          break;
        case "2":
          networkName = "Morden";
          break;
        case "3":
          networkName = "Ropsten";
          break;
        case "4":
          networkName = "Rinkeby";
          break;
        case "6":
          networkName = "Kotti";
          break;
        case "42":
          networkName = "Kovan";
          break;
        default:
          networkName = networkId;
      }

      that.setState({
        network: networkName
      });
    });
  };

  newTransfer = index => {
    this.setState({
      transferDetail: this.state.tokens[index]
    });
  };

  closeTransfer = () => {
    this.setState({
      transferDetail: {},
      fields: {}
    });
  };

  setGasPrice = () => {
    this.web3.eth.getGasPrice((err, price) => {
      price = this.web3.fromWei(price, "gwei");
      if (!err) this.setState({ defaultGasPrice: price.toNumber() });
    });
  };

  setContractAddress = () => {
    this.tokenZendr.deployed().then(instance => {
      this.setState({ tzAddress: instance.address });
    });
  };

  resetApp = () => {
    this.setState({
      transferDetail: {},
      fields: {
        receiver: null,
        amount: null,
        gasPrice: null,
        gasLimit: null
      },
      defaultGasPrice: null
    });
  };

  Transfer = () => {
    this.setState({
      inProgress: true
    });

    let contract = this.web3.eth
      .contract(this.state.transferDetail.abi)
      .at(this.state.transferDetail.address);
    let transObj = {
      from: this.state.account,
      gas: this.state.defaultGasLimit,
      gasPrice: this.state.defaultGasPrice
    };
    let app = this;
    let amount =
      this.state.fields.amount + "e" + this.state.transferDetail.decimal;
    let symbol = this.state.transferDetail.symbol;
    let receiver = this.state.fields.receiver;

    amount = new this.web3.BigNumber(amount).toNumber();

    contract.approve(
      this.state.tzAddress,
      amount,
      transObj,
      (err, response) => {
        if (!err) {
          app.tokenZendr.deployed().then(instance => {
            this.tokenZendrInstance = instance;
            this.watchEvents();

            this.tokenZendrInstance
              .transferTokens(symbol, receiver, amount, transObj)
              .then((response, err) => {
                if (response) {
                  console.log(response);

                  app.resetApp();

                  app.setState({
                    tx: response.tx,
                    inProgress: false
                  });
                } else {
                  console.log(err);
                }
              });
          });
        } else {
          console.log(err);
        }
      }
    );
  };

  Wrap = () => {
    this.setState({
      inProgress: true
    });

    let app = this;
    let amount = this.state.fields.amount + "e18";

    amount = new this.web3.BigNumber(amount).toNumber();
    app.tokenZendr.deployed().then(instance => {
      this.tokenZendrInstance = instance;
      this.watchEvents();
      this.tokenZendrInstance
        .deposit({ value: amount, from: this.state.account })
        .then((response, err) => {
          if (response) {
            app.resetApp();

            app.setState({
              tx: response.tx,
              inProgress: false
            });
            this.updateBalance();
          } else {
            console.log(err);
          }
        });
    });
  };

  Unwrap = () => {
    this.setState({
      inProgress: true
    });

    let app = this;
    let amount = this.state.fields.amount + "e18";

    amount = new this.web3.BigNumber(amount).toNumber();
    app.tokenZendr.deployed().then(instance => {
      this.tokenZendrInstance = instance;
      this.watchEvents();
      this.tokenZendrInstance
        .withdraw(amount, { from: this.state.account })
        .then((response, err) => {
          if (response) {
            app.resetApp();

            app.setState({
              tx: response.tx,
              inProgress: false
            });
            this.updateBalance();
          } else {
            console.log(err);
          }
        });
    });
  };

  /**
   * @dev Just a console log to list all transfers
   */
  watchEvents() {
    // let param = {
    //   from: this.state.account,
    //   to: this.state.fields.receiver,
    //   amount: this.state.fields.amount
    // };
    // this.tokenZendrInstance
    //   .TransferSuccessful(param, {
    //     fromBlock: 0,
    //     toBlock: "latest"
    //   })
    //   .watch((error, event) => {
    //     console.log(event);
    //   });
  }

  onInputChangeUpdateField = (name, value) => {
    let fields = this.state.fields;

    fields[name] = value;

    this.setState({
      fields
    });
  };

  updateBalance = () => {
    this.web3.eth.getCoinbase((err, account) => {
      this.setState({ account });
      this.web3.eth.getBalance(account, (err, response) => {
        this.setState({
          etcBalance: this.web3.fromWei(response, "ether").toString()
        });
      });

      this.tokenZendr.deployed().then(instance => {
        this.tokenZendrInstance = instance;
        this.tokenZendrInstance.balanceOf(account).then(response => {
          this.setState({
            wetcBalance: this.web3.fromWei(response, "ether").toString()
          });
        });
      });
    });
  };

  componentDidMount() {
    this.setNetwork();
    this.setGasPrice();
    this.setContractAddress();
    this.updateBalance();
  }

  render() {
    if (this.isWeb3) {
      if (this.isWeb3Locked) {
        return (
          <div>
            <Nav appName={this.appName} network={this.state.network} />
            <UnlockMetamask message="Unlock Your Metamask/Mist Wallet" />
          </div>
        );
      } else {
        return (
          <div>
            <Nav appName={this.appName} network={this.state.network} />
            <Description />
            <Container
              onInputChangeUpdateField={this.onInputChangeUpdateField}
              transferDetail={this.state.transferDetail}
              closeTransfer={this.closeTransfer}
              newTransfer={this.newTransfer}
              Transfer={this.Transfer}
              Wrap={this.Wrap}
              Unwrap={this.Unwrap}
              account={this.state.account}
              wetcBalance={this.state.wetcBalance}
              etcBalance={this.state.etcBalance}
              defaultGasPrice={this.state.defaultGasPrice}
              defaultGasLimit={this.state.defaultGasLimit}
              tx={this.state.tx}
              inProgress={this.state.inProgress}
              fields={this.state.fields}
              tokens={this.state.tokens}
            />
          </div>
        );
      }
    } else {
      return <InstallMetamask />;
    }
  }
}

export default App;
