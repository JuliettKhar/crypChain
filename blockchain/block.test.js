const Block = require('./block')
const CryptoHash = require('../utils/crypto-hash')
const {GENESIS_DATA, MINED_RATE} = require("../config");
const hexToBinary = require('hex-to-binary')

describe('Block', () => {
    const timestamp = 200;
    const lastHash = 'foo-lastHash';
    const hash = 'foo-hash';
    const data = ['chain', 'data'];
    const nonce = 1;
    const difficulty = 1;

    const block = new Block({
        timestamp,
        lastHash,
        hash,
        data,
        nonce,
        difficulty
    });

    it('block should has timestamp, lastHash, hash, data, difficulty, nonce', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('should returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true)
        });

        it('should return genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    })

    describe('mined block', () => {
        const lastBlock = Block.genesis()
        const data = 'mined data'
        const minedBlock = Block.minedBlock({lastBlock, data})

        it('should return a block instance', () => {
            expect(minedBlock instanceof Block).toBe(true)
        });

        it('should sets the `lastHash` to be the `hash` of the lastBlock ', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash)
        });

        it('should sets the `data`', () => {
            expect(minedBlock.data).toEqual(data)
        });

        it('should sets the `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined)
        });

        it('should creates a SHA-256 `hash` based on proper inputs', () => {
            expect(minedBlock.hash).toEqual(
                CryptoHash(
                    minedBlock.timestamp,
                    minedBlock.nonce,
                    minedBlock.difficulty,
                    lastBlock.hash,
                    data
                )
            )
        });

        it('should sets hash that matches the difficulty criteria', function () {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty))
        });

        describe('adjust difficulty',  () =>  {
            it('should raise the difficulty of quick mined block', function () {
                expect(Block.adjustDifficulty({
                    originalBlock: block ,
                    timestamp: block.timestamp + MINED_RATE - 100
                })).toEqual(block.difficulty + 1)
            });
            it('should lower the difficulty of slowly mined block', function () {
                expect(Block.adjustDifficulty({
                    originalBlock: block ,
                    timestamp: block.timestamp + MINED_RATE + 100
                })).toEqual(block.difficulty - 1)
            });
        });

        it('adjust the difficulty ', function () {
            const possibleRes = [lastBlock.difficulty + 1, lastBlock.difficulty - 1]

            expect(possibleRes.includes(minedBlock.difficulty)).toBe(true)
        });

        it('should has lower limit of 1', function () {
            block.difficulty = -1;

            expect(Block.adjustDifficulty({ originalBlock: block})).toEqual(1)
        });
    })
})
