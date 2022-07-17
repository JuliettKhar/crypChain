import React, {Component} from "react";
import {Button} from 'react-bootstrap'
import Transaction from "./Transaction";

class Block extends Component {
    state = {
        displayTransaction: false
    };

    toggleTransaction = () => {
        this.setState({displayTransaction: !this.state.displayTransaction})
    }

    get displayTransaction() {
        const {data} = this.props.block;
        const stringifiedData = JSON.stringify(data);
        const dataDisplay = stringifiedData.length > 35 ?
            `${stringifiedData.substring(0, 35)}...` : stringifiedData;

        if (this.state.displayTransaction) {
            return (
                <div>
                    {
                        data.map(transaction => (
                            <div className="Transaction-Wrapper" key={transaction.id}>
                                <hr/>
                                <Transaction transaction={transaction}/>
                            </div>
                        ))
                    }
                    <br/>
                    <Button
                        bsstyle="danger"
                        bssize="small"
                        onClick={this.toggleTransaction}
                    >Show less</Button>
                </div>
            )
        }

        return (
            <div>
                <p>Data: {dataDisplay}</p>
                <Button
                    bsstyle="danger"
                    bssize="small"
                    onClick={this.toggleTransaction}
                >Show more</Button>
            </div>
        )
    }

    componentDidMount() {
        fetch('http://localhost:3000/api/blocks')
            .then(res => res.json())
            .then((data) => this.setState({blocks: data}));
    }

    render() {
        const {timestamp, hash} = this.props.block;
        const hashDisplay = `${hash.substring(0, 15)}...`

        return (
            <div className='Block'>
                <p>Hash: {hashDisplay}</p>
                <p>Timestamp: {new Date(timestamp).toLocaleDateString()}</p>
                {this.displayTransaction}
            </div>
        )
    }
}

export default Block;
