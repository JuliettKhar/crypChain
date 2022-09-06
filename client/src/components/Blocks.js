import React, {Component} from "react";
import Block from "./Block";
import { Link } from 'react-router-dom';

class Blocks extends Component {
    state = { blocks: [] };

    componentDidMount() {
        fetch(`${document.location.origin}/api/blocks`)
            .then(res => res.json())
            .then((data) => this.setState({ blocks: data }));
    }

    render() {
        return (
            <div>
                <div><Link to='/'>Home</Link></div>
                <h3>Blocks</h3>
                <div className='Blocks-Wrapper'>
                    {
                        this.state.blocks.map(block => {
                            return (
                                <Block key={ block.hash } block={ block }/>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

export default Blocks;
