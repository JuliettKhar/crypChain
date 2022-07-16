import React, {Component} from "react";
import Blocks from "./Blocks";
import logo from '../assets/pentagon-logo.png'

class App extends Component {
    state = {walletInfo: {}};

    componentDidMount() {
        fetch('http://localhost:3000/api/wallet-info')
            .then(res => res.json())
            .then((data) => this.setState({walletInfo: data}));
    }


    render() {
        const {address, balance} = this.state.walletInfo;

        return (
            <div className='App'>
                <img src={logo} className='logo' alt=""/>
                <br/>
                <h1>Welcome to the blockchain...</h1>
                <br/>
                <div className='WalletInfo'>
                    <p>Address: {address}</p>
                    <p>Balance: {balance}</p>
                </div>
                <br/>
                <Blocks/>
            </div>
        );
    }
}

export default App;
