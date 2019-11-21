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
    this.state = {
      isWeb3: true,
      isWeb3Locked: false,
      inProgress: false,
      tx: null,
      network: "Checking...",
      account: { address: null },
      fields: {
        receiver: null,
        amount: null
      }
    };

    this.handleWrap = this.handleWrap.bind(this);
    this.handleUnwrap = this.handleUnwrap.bind(this);
  }

  componentDidMount = async () => {
    let web3 = window.web3;
    if (typeof web3 !== "undefined") {
      this.web3 = new Web3(web3.currentProvider);
    } else {
      this.setState({ isWeb3: false });
      return;
    }
    await this.setNetwork();
    await this.updateBalance();
  };

  setNetwork = async () => {
    const networkId = await this.web3.eth.net.getId();
    let network;
    switch (networkId) {
      case 6:
        network = "Kotti";
        break;
      default:
        this.setState({ network: "Unavailable", isWeb3Locked: true });
        return;
    }
    const instance = TruffleContract(WrappedETCToken);
    instance.setProvider(this.web3.currentProvider);
    this.WrappedETCToken = await instance.deployed();
    this.setState({ network });
  };

  updateBalance = async () => {
    let account = await this.web3.eth.getCoinbase();
    if (!account || this.isWeb3Locked) {
      this.setState({ isWeb3Locked: true });
      return;
    }

    let etcBalance = await this.web3.eth.getBalance(account);
    if (!this.WrappedETCToken) return;
    let wetcBalance = await this.WrappedETCToken.balanceOf(account);
    this.setState({
      account: {
        address: account,
        etcBalance: this.web3.utils.fromWei(etcBalance, "ether").toString(),
        wetcBalance: this.web3.utils
          .fromWei(wetcBalance.toString(), "ether")
          .toString()
      }
    });
  };

  onUpdateField = (name, value) => {
    let fields = this.state.fields;
    fields[name] = value;
    this.setState({ fields });
  };

  resetApp = () => {
    this.setState({
      fields: {
        receiver: null,
        amount: null
      }
    });
  };

  async handleWrap() {
    this.setState({ inProgress: true });
    let amount = this.web3.utils.toWei(this.state.fields.amount, "ether");
    try {
      let response = await this.WrappedETCToken.deposit({
        value: amount,
        from: this.state.account.address
      });
      this.resetApp();
      this.setState({ tx: response.tx, inProgress: false });
      this.updateBalance();
    } catch (err) {
      console.log(err);
    }
  }

  async handleUnwrap() {
    this.setState({ inProgress: true });
    let amount = this.web3.utils.toWei(this.state.fields.amount, "ether");
    try {
      let response = await this.WrappedETCToken.withdraw(amount, {
        from: this.state.account.address
      });
      this.resetApp();
      this.setState({ tx: response.tx, inProgress: false });
      this.updateBalance();
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    if (this.state.isWeb3) {
      if (this.state.isWeb3Locked) {
        return (
          <div>
            <Nav appName={this.appName} network={this.state.network} />
            <UnlockMetamask
              message={
                this.state.network === "Unavailable"
                  ? "Wetc not available on current network"
                  : "Unlock Your Metamask/Mist Wallet"
              }
            />
          </div>
        );
      } else {
        return (
          <div>
            <Nav appName={this.appName} network={this.state.network} />
            <Description />
            <Container
              onUpdateField={this.onUpdateField}
              handleWrap={this.handleWrap}
              handleUnwrap={this.handleUnwrap}
              account={this.state.account}
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
