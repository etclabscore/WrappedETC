import React, { Component } from "react";
import Web3 from "web3";
import TruffleContract from "truffle-contract";
import Nav from "./components/Nav";
import Description from "./components/Description";
import Container from "./components/Container";
import InstallMetamask from "./components/InstallMetamask";
import UnlockMetamask from "./components/UnlockMetamask";
import WrappedETCToken from "./contracts/WrappedETCToken.json";

class App extends Component {
  constructor() {
    super();

    this.appName = "WETC Portal";
    this.isWeb3 = true; //If metamask is installed
    this.isWeb3Locked = false; //If metamask account is locked
    this.onInputChangeUpdateField = this.onInputChangeUpdateField.bind(this);

    this.state = {
      tzAddress: null,
      inProgress: false,
      tx: null,
      network: "Checking...",
      account: null,
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

      this.WrappedETCToken = TruffleContract(WrappedETCToken);
      this.WrappedETCToken.setProvider(this.web3Provider);

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

  setGasPrice = () => {
    this.web3.eth.getGasPrice((err, price) => {
      price = this.web3.fromWei(price, "gwei");
      if (!err) this.setState({ defaultGasPrice: price.toNumber() });
    });
  };

  setContractAddress = () => {
    this.WrappedETCToken.deployed().then(instance => {
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

  Wrap = () => {
    this.setState({
      inProgress: true
    });

    let amount = this.state.fields.amount + "e18";
    amount = new this.web3.BigNumber(amount).toNumber();
    this.WrappedETCToken.deployed().then(instance => {
      this.watchEvents();
      instance
        .deposit({ value: amount, from: this.state.account })
        .then((response, err) => {
          if (response) {
            this.resetApp();

            this.setState({
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

    let amount = this.state.fields.amount + "e18";

    amount = new this.web3.BigNumber(amount).toNumber();
    this.WrappedETCToken.deployed().then(instance => {
      this.watchEvents();
      instance
        .withdraw(amount, { from: this.state.account })
        .then((response, err) => {
          if (response) {
            this.resetApp();

            this.setState({
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
  watchEvents() {}

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
      console.log(account)
      this.web3.eth.getBalance(account, (err, response) => {
        this.setState({
          etcBalance: this.web3.fromWei(response, "ether").toString()
        });
      });

      this.WrappedETCToken.deployed().then(instance => {
        instance.balanceOf(account).then(response => {
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
