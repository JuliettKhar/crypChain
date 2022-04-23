const Block = require ('./block')
const CryptoHash = require('./crypto-hash')
const {GENESIS_DATA} = require("./config");

describe('Block', () => {
    const timestamp = 'date';
    const lastHash = 'foo-lastHash';
    const hash = 'foo-hash';
    const data = ['chain', 'data'];

    const block = new Block({
        timestamp,
        lastHash,
        hash,
        data
    });

    it('block should has timestamp, lastHash, hash, data',  () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
    });

    describe('genesis()', () => {
       const genesisBlock = Block.genesis();
        console.log(genesisBlock)

        it('should returns a Block instance',  () => {
            expect(genesisBlock instanceof Block).toBe(true)
        });

        it('should return genesis data',  () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    })

    describe('mine block', () => {
        const lastBlock = Block.genesis()
        const data = 'mined data'
        const minedBlock = Block.minedBlock({ lastBlock, data })

        it('should return a block instance',  () => {
            expect(minedBlock instanceof Block).toBe(true)
        });

        it('should sets the `lastHash` to be the `hash` of the lastBlock ',  () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash)
        });

        it('should sets the `data`',  () => {
            expect(minedBlock.data).toEqual(data)
        });

        it('should sets the `timestamp`',  () => {
            expect(minedBlock.timestamp).not.toEqual(undefined)
        });

        it('should creates a SHA-256 `hash` based on proper inputs',  () => {
            expect(minedBlock.hash).toEqual(CryptoHash(minedBlock.timestamp, lastBlock.hash, data))
        });
    })
})
