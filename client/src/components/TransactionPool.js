import React, {Component} from "react";
import {Link} from 'react-router-dom';
import Transaction from "./Transaction";
import { Button } from "react-bootstrap";
import history from "../history";

const POOL_INTERVAL_MS = 10000

class TransactionPool extends Component{
    state = {
        transactionPoolMap: {}
    }

    fetchTransactionMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(resp => resp.json())
            .then(resp => {
               this.setState({ transactionPoolMap: resp})
            })
    }

    fetchMineTransactions =() => {
        fetch(`${document.location.origin}/api/mine-transactions`)
            .then(resp => {
                if (resp.status === 200) {
                    alert('success')
                    history.push('/blocks')
                } else {
                    alert('Request did not complete')
                }
            })

    }

    componentDidMount() {
        this.fetchTransactionMap();

        this.interval = setInterval(() => this.fetchTransactionMap(), POOL_INTERVAL_MS)
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    render() {
        return(
            <div className='TransactionPool'>
                <div><Link to='/'>Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction => {
                        return(
                            <div key={transaction.id}>
                                <hr/>
                                <Transaction transaction={transaction} />
                            </div>
                        )
                    })
                }
                <hr/>
                <Button bsStyle="danger" onClick={this.fetchMineTransactions} >Mine the Transactions</Button>
            </div>
        )
    }
}

export default TransactionPool
