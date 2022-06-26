const Block = require('./block');
const {cryptoHash} = require('../utils')

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

    replaceChain(chain, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error('the incoming chain must be longer')
            return
        }
        if (!Blockchain.isValidChain(chain)) {
             console.error('the incoming chain must be valid')
            return
        }

        if(onSuccess) { onSuccess()}
         console.log(`replacing chain with ${chain}`)

         this.chain = chain
    }
}

module.exports = Blockchain
