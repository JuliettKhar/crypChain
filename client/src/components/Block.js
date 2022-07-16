import React, {Component} from "react";

class Block extends Component {
    state = { blocks: [] };

    componentDidMount() {
        fetch('http://localhost:3000/api/blocks')
            .then(res => res.json())
            .then((data) => this.setState({ blocks: data }));
    }

    render() {
        const { timestamp, hash, data } = this.props.block;

        const hashDisplay = `${hash.substring(0, 15)}...`
        const stringifiedData = JSON.stringify(data);
        const dataDisplay = stringifiedData.length > 35 ?
                            `${stringifiedData.substring(0, 35)}...` : stringifiedData;

        return (
          <div className='Block'>
              <p>Hash: { hashDisplay }</p>
              <p>Timestamp:{new Date(timestamp).toLocaleDateString()}</p>
              <p>Data: { dataDisplay }</p>
          </div>
        )
    }
}

export default Block;
