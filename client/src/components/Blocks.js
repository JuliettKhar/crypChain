import React, {Component} from "react";
import Block from "./Block";

class Blocks extends Component {
    state = { blocks: [] };

    componentDidMount() {
        fetch('http://localhost:3000/api/blocks')
            .then(res => res.json())
            .then((data) => this.setState({ blocks: data }));
    }

    render() {
        return (
            <div>
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
