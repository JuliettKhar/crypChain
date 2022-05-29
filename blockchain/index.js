const Block = require('./block');
const cryptoHash = require('../utils/crypto-hash')

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()]
    }

    addBlock({data}) {
        const newBlock = Block.minedBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        })

        this.chain.push(newBlock);
    }

    static isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) { return false }

        for (let i = 1; i < chain.length; i++) {
            const { timestamp, lastHash, hash, data, difficulty, nonce } = chain[i]
            const actualLastHash = chain[i - 1].hash;
            const validatedHash = cryptoHash(timestamp, lastHash, data, difficulty, nonce)
            const lastdifficulty = chain[i - 1].difficulty

            if (lastHash !== actualLastHash) { return false }

            if (hash !== validatedHash) { return false }

            if ((lastdifficulty - difficulty) > 1) { return false}
        }
        return true
    }

    replaceChain(chain) {
        if (chain.length <= this.chain.length) { return }
        if (!Blockchain.isValidChain(chain)) { return }

        this.chain = chain
    }
}

module.exports = Blockchain
