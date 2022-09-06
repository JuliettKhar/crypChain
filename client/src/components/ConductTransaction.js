import React, {Component} from "react";
import {FormGroup, FormControl, Button } from "react-bootstrap";
import {Link} from 'react-router-dom';
import history from "../history";

class ConductTransaction extends Component {
    state = {recipient: '', amount: 0};

    updateRecipient = ev => {
        this.setState({recipient: ev.target.value})
    }

    updateAmount = ev => {
        this.setState({amount: Number(ev.target.value)})
    }

    conductTransaction = () => {
        const { recipient, amount } = this.state;

        fetch(`${document.location.origin}/api/transact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ recipient, amount })
        })
            .then(resp => resp.json())
            .then(resp => {
                alert(resp.message || resp.type)
                history.push('/transaction-pool')
            })
    }

    render() {
        return (
            <div className='ConductTransaction'>
                <Link to='/'>Home</Link>
                <h3>Conduct a transaction</h3>
                <FormGroup>
                    <FormControl
                        inputMode='text'
                        placeholder='recipient'
                        value={this.state.recipient}
                        onChange={this.updateRecipient}
                    />
                </FormGroup>
                <FormGroup>
                    <FormControl
                        inputMode='numeric'
                        value={this.state.amount}
                        onChange={this.updateAmount}
                    />
                </FormGroup>
                <div>
                    <Button

                        onClick={ this.conductTransaction }
                    >Submit</Button>
                </div>
            </div>
        )
    }
}

export default ConductTransaction
