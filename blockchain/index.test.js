const Block = require('./block')
const Blockchain = require('./index')
const {cryptoHash} = require("../utils");


describe('blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain
    })

    it('should contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true)
    });

    it('should starts w the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis())
    });

    it('should add a new block to the chain', () => {
        const newData = 'foo bar'
        blockchain.addBlock({data: newData})
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData)
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start w the genesis block', () => {
            it('should returns false', () => {
                blockchain.chain[0] = {data: 'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
            });
        })

        describe('when the chain starts w the genesis block and has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({data: 'Bears'})
                blockchain.addBlock({data: 'Beets'})
                blockchain.addBlock({data: 'Battlestar Galactica'})
            })
            describe('and last hash reference has changed', () => {
                it('should returns false', () => {
                    blockchain.chain[2].lastHash = 'broken-lastHash'

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                });
            });
            describe('the chain contains a block w an invalid field', () => {
                it('should returns false', () => {
                    blockchain.chain[2].lastHash = 'bad-data'

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                });
            })
            describe('chain contains block with the jump difficulty', () => {
                it('should return false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1]
                    const lastHash = lastBlock.hash
                    const timestamp = Date.now()
                    const nonce = 0
                    const data = []
                    const difficulty = lastBlock.difficulty - 3
                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data)
                    const badBlock = new Block({
                        timestamp,
                        lastHash,
                        hash,
                        nonce,
                        difficulty,
                        data
                    })
                    blockchain.chain.push(badBlock)

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
                });
            })
            describe('the chain does not contains  any invalid blocks', () => {
                it('should returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
                });
            });
        })
    })

    describe('replaceChain()', () => {
        let errorMock;
        let logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock

        })
        describe('when is new chain is not longer', () => {
            beforeEach(() => {
                newChain.chain[0] = {new: 'chain'}
                blockchain.replaceChain(newChain.chain)
            })
            it('should not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain)
            });

            it('should logs err', () => {
                expect(errorMock).toHaveBeenCalled()
            });
        })
        describe('is the chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({data: 'Bears'})
                newChain.addBlock({data: 'Beets'})
                newChain.addBlock({data: 'Battlestar Galactica'})
            })

            describe('and the chain is invalid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'some-fake-hash'
                    blockchain.replaceChain(newChain.chain)
                })

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain)
                });
                it('should logs err', () => {
                    expect(errorMock).toHaveBeenCalled()
                });
            })
            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain)
                })
                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain)
                });
                it('should logs err', () => {
                    expect(logMock).toHaveBeenCalled()
                });
            })
        })
    })
})
