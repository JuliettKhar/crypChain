const Block = require('./block')
const Blockchain = require('./index')
const {cryptoHash} = require("../utils");
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");


describe('blockchain', () => {
    let blockchain, newChain, originalChain, errorMock;

    beforeEach(() => {
        errorMock = jest.fn();
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain;
        global.console.error = errorMock;
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
        let logMock;

        beforeEach(() => {
            logMock = jest.fn();

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
        describe('and the validateTransaction flag is true',  () => {
            it('should calls validTransactionData()', function () {
                const validTransactionDataMock = jest.fn();

                blockchain.validTransactionData = validTransactionDataMock;

                newChain.addBlock({ data: 'foo'})
                blockchain.replaceChain(newChain.chain, true)

                expect(validTransactionDataMock).toHaveBeenCalled()
            });
        });
    })

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({recipient: 'foo-address', amount: 65})
            rewardTransaction = Transaction.rewardTransaction({minerWallet: wallet})
        })

        describe('transaction data is Valid', () => {
            it('should returns true', () => {
                newChain.addBlock({
                    data: [transaction, rewardTransaction]
                })

                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(true)
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe('transaction data has multiple rewards', () => {
            it('should returns false and logs an error', () => {
                newChain.addBlock({data: [transaction, rewardTransaction, rewardTransaction]})

                expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false)
                expect(errorMock).toHaveBeenCalled();
            });

        });

        describe('transaction data has at least one malformed outputMap', () => {
            describe('transaction is not a reward transaction', () => {
                it('should returns false logs an error', () => {
                    transaction.outputMap[wallet.publicKey] = 9999;

                    newChain.addBlock({data: [transaction, rewardTransaction]})
                    expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(false)
                    expect(errorMock).toHaveBeenCalled();
                });
            });


            describe('transaction is a reward transaction', () => {
                it('should returns false logs an error', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 9999;
                    newChain.addBlock({ data: [transaction, rewardTransaction]})

                    expect(blockchain.validTransactionData({ chain: newChain.chain})).toBe(false)
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('transaction data has at least one malformed input', () => {
                it('should returns false logs an error', () => {
                    wallet.balance = 9000;

                    const evilOutputMap = {
                        [wallet.publicKey]: 8900,
                        fooRecipient: 100
                    }
                    const evilTransaction = {
                        input: {
                            timestamp: Date.now(),
                            amount: wallet.balance,
                            address: wallet.publicKey,
                            signature: wallet.sign(evilOutputMap)
                        },
                        outputMap: evilOutputMap
                    }

                    newChain.addBlock({ data: [evilTransaction, rewardTransaction]});

                    expect(blockchain.validTransactionData({ chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });

                describe('block contains multiple identical transactions', () => {
                    it('should returns false logs an error', () => {
                        newChain.addBlock({
                            data: [transaction, transaction, rewardTransaction]
                        })

                    expect(blockchain.validTransactionData({ chain: newChain.chain})).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                    });
                });

            });
        })
    })
})
