import React, { Component } from 'react';
import './App.css';
import * as e from 'ethers';

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
    amount = e.utils.parseEther(amount.toString());
    var sendPromise = wallet.send(to, amount);
    sendPromise.then(transactionHash=>{
        console.log("Sent:", transactionHash);
        this.updateBalance();
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
  handleForm(e) {
    e.preventDefault();
     let to = this.refs.to.value;
     let amount = this.refs.amount.value;
     this.sendTo(to, amount)
     this.refs.to.value = '';
     this.refs.amount.value = '';
   }
  render() {
    return (
      <div className="card">
        <div className="address">
            {this.state.address}
        </div>
        <div className="info">
            <img src="https://raw.githubusercontent.com/cjdowner/cryptocurrency-icons/d31bf7c3/128/color/eth.png" alt="eth"></img>
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
              <input type="number" ref="amount" placeholder="Type amount"/>
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
        <Wallet />
        <div className="disc">
          Disclaimer: Use this at your own risk, everything is stored locally however the integrity of this data is unknown. You are fully responsible if you lose any funds stored in this wallet. On top of that, this wallet has not been fully tested, it was made for fun as a challenge to myself to see if i could make a functioning walled in less than an hour and a half. I did this all in 1 hour 28 minutes and 40 seconds.
        </div>
      </div>
    );
  }
}

export default App;
