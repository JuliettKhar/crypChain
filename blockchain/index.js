const Block = require('./block');
const {cryptoHash} = require('../utils')
const {REWARD_INPUT, MINING_REWARD} = require("../config");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");

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

    validTransactionData({ chain }) {
        for (let i =  1; i < chain.length; i++) {
            const block = chain[i];
            let rewardTransactionCount = 0;

            for (let transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1

                    if (rewardTransactionCount > 1) {
                        console.error('Miner rewards exceed limit')
                        return false;
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner rewards amount is invalid')
                        return false;
                    }
                } else {
                    if (!Transaction.validTransaction(transaction)) {
                        console.error('Invalid transaction')
                        return false
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    })

                    if (transaction.input.amount !== trueBalance) {
                        console.error('Invalid input amount')
                        return false
                    }
                }
            }
        }

        return true
    }
}

module.exports = Blockchain
