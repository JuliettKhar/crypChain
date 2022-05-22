const {GENESIS_DATA, MINED_RATE } = require("./config");
const cryptoHash = require('./crypto-hash')
const hexToBinary = require('hex-to-binary')

class Block {
    constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty
    }

    static genesis() {
        return new this(GENESIS_DATA)
    }

    static minedBlock({ lastBlock, data }) {
        let hash, timestamp;
        let nonce = 0;
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp})
            hash = cryptoHash(timestamp, nonce, difficulty, data, lastHash)
        }while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty))

        return new this({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash,
        })
    }

    static adjustDifficulty({originalBlock, timestamp}) {
        const { difficulty } = originalBlock;
        const difference = timestamp - originalBlock.timestamp

        if (difficulty < 1) { return 1}

        if (difference > MINED_RATE) { return difficulty - 1 }

        return difficulty + 1
    }


}

module.exports = Block;
