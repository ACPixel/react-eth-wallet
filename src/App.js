import React, { Component } from 'react';
import './App.css';
import * as e from 'ethers';
import QRCode from 'qrcode-react';

var wallet

class Wallet extends Component {
  constructor() {
    super();
    this.state = {
      address: "",
      privateKey: "",
      bal: 0,
      price: 0
    }
  }
  updateBalance() {
    wallet.getBalance().then(bal=>{
      this.setState({
        bal: e.utils.formatEther(bal)
      })
    })
    fetch("https://coincap.io/page/ETH")
      .then((res) => res.json() )
      .then((data) => {
        this.setState({
          price: data.price,
        })
      })
  }

  sendTo(to, amount) {
    wallet.provider.getGasPrice().then(function(gasPrice) {
        // gasPrice is a BigNumber; convert it to a decimal string
        let gasPriceString = e.utils.formatEther(gasPrice)
        console.log("Current gas price: " + gasPriceString);
    });
    amount = e.utils.parseEther(amount.toString());
    var options = {
      gasLimit: 21000,
      gasPrice: e.utils.bigNumberify("20000000000")
    };
    var sendPromise = wallet.send(to, amount, options);
    sendPromise.then(transactionHash=>{
        console.log("Sent:", transactionHash);
        this.setState({
          bal: this.state.bal-Number(transactionHash.toString())
        })
        this.updateBalance();
    })
    .catch(er=>{
      console.info(er);
    });
  }

  componentWillMount() {
    if (localStorage.privKey !== undefined) {
      wallet = new e.Wallet(localStorage.privKey)
    } else {
      wallet = e.Wallet.createRandom();
      localStorage.privKey = wallet.privateKey;
    }
    wallet.provider = e.providers.getDefaultProvider();
    this.updateBalance();
    setInterval(this.updateBalance.bind(this), 10000);
    this.setState({
      address: wallet.address,
      privateKey: wallet.privateKey
    });
  }

  handleForm(t) {
    t.preventDefault();
     let to = this.refs.to.value;
     let amount = this.refs.amount.value;
     if (!isNaN(Number(amount))) {
      this.sendTo(to, Number(amount))
      this.refs.to.value = '';
      this.refs.amount.value = '';
     }
     
   }
  render() {
    return (
      <div className="card">
        <div className="address">
            {this.state.address}
        </div>
        <div className="info">
            <img src="https://raw.githubusercontent.com/cjdowner/cryptocurrency-icons/d31bf7c3/128/color/eth.png" alt="eth"></img>
            <div className="qr">
              <QRCode value={this.state.address} bgColor="#51a1c0" size={200} fgColor="#444" />
            </div>
            <div className="bal">
                <div className="total">
                  ${(this.state.bal*this.state.price).toFixed(2)}
                </div>
                <div>
                  {this.state.bal} ETH
                </div>
            </div>
        </div>
        <div className="send">
          <form onSubmit={this.handleForm.bind(this)}>
              <input type="text" ref="to" placeholder="Type send address"/>
              <input type="text" ref="amount" placeholder="Type amount"/>
              <button type="submit">Send</button>
          </form>
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="title">
          React Etherium Wallet ~ ACPixel.
        </div>
        <div className="center">
          <Wallet />
        </div>
        <div className="disc">
          Disclaimer: Use this at your own risk, everything is stored locally however the integrity of this data is unknown. You are fully responsible if you lose any funds stored in this wallet. On top of that, this wallet has not been fully tested, it was made for fun as a challenge to myself to see if i could make a functioning walled in less than an hour and a half. I did this all in 1 hour 28 minutes and 40 seconds.
          <br />
          Private Key is stored in localStorage, don't wipe unless you want to lose it ;) or you can back it up, localStorage.privKey
        </div>
      </div>
    );
  }
}

export default App;
