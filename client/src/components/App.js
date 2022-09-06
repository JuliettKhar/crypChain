import React, {Component} from "react";
import logo from '../assets/pentagon-logo.png'
import { Link } from 'react-router-dom';

class App extends Component {
    state = {walletInfo: {}};

    componentDidMount() {
        fetch(`${document.location.origin}/api/wallet-info`)
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
                <div><Link to='/blocks'>Blocks</Link></div>
                <div><Link to='/conduct-transaction'>Conduct a transaction</Link></div>
                <div><Link to='/transaction-pool'>Transaction Pool</Link></div>
                <div className='WalletInfo'>
                    <p>Address: {address}</p>
                    <p>Balance: {balance}</p>
                </div>
            </div>
        );
    }
}

export default App;
