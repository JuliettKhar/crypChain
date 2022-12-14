const Wallet = require('./index')
const {verifySignature} = require('../utils')
const Transaction = require("./transaction");
const Blockchain = require("../blockchain");
const {STARTING_BALANCE} = require("../config");

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet()
    })

    it('should has a balance', () => {
        expect(wallet).toHaveProperty('balance')
    });
    it('should has a public key', () => {
        expect(wallet).toHaveProperty('publicKey')
    });

    describe('signing data', () => {
        const data = 'foobar'

        it('should verifies a signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true)
        });

        it('should  not verify an invalid signature', () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false)
        });
    })

    describe('createTransaction()', () => {
        describe('amount exceeds the balance', () => {
            it('should throws err',  () => {
                expect(() => wallet.createTransaction({ amount: 9999, recipient: 'foo-recipient'})).toThrow('amount exceeds balance')
            });
        })

        describe('amount is valid', () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 50;
                recipient = 'foo-recipient';
                transaction = wallet.createTransaction({ amount, recipient })
            })
            it('should creates an instance of Transaction',  () => {
                expect(transaction instanceof Transaction).toBe(true)
            });
            it('should matches the transaction input with the wallet',  () => {
                expect(transaction.input.address).toEqual(wallet.publicKey)
            });
            it('should outputs the amount the recipient',  () => {
                expect(transaction.outputMap[recipient]).toEqual(amount)
            });
        })

        describe('chain is passed', () => {
            it('should calls Wallet.calculateBalance', () => {
                const calculateBalanceMock = jest.fn()
                const originalCalculateBalance = Wallet.calculateBalance;

                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    recipient: 'foo',
                    amount: 50,
                    chain: new Blockchain().chain
                })

                expect(calculateBalanceMock).toHaveBeenCalled();
                Wallet.calculateBalance = originalCalculateBalance;
            });
        })
    })

    describe('calculateBalance()', () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain()
        })

        describe('and there are no outputs for the wallet', () => {
            it('should returns the STARTING_BALANCE', () => {
                expect(Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: wallet.publicKey
                })).toEqual(STARTING_BALANCE)
            });
        })
        describe('there are outputs for the wallet', () => {
            let transactionOne, transactionTwo;

            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50
                })

                transactionTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 60
                })

                blockchain.addBlock({ data: [transactionOne, transactionTwo ]})
            })

            it('should adds the sum of all outputs to the wallet balance', () => {
                expect(Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: wallet.publicKey
                })).toEqual(STARTING_BALANCE +
                    transactionOne.outputMap[wallet.publicKey] +
                    transactionTwo.outputMap[wallet.publicKey]
                )
            });
        })

        describe('wallet has made a transaction', () => {
            let recentTransaction;

            beforeEach(() => {
                recentTransaction = wallet.createTransaction({
                    recentTransaction: 'foo-address',
                    amount: 30
                })

                blockchain.addBlock({ data: [recentTransaction]})

            })

            it('should returns the output amount of the recent transaction', function () {
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(recentTransaction.outputMap[wallet.publicKey])

            });

            describe('outputs next to and after the recent transaction', () => {
                let sameBlockTransaction, nextBlockTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recipient: 'later-foo-address',
                        amount: 60
                    });

                    sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet})

                    blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction ]})

                    nextBlockTransaction = new Wallet().createTransaction({
                        recipient: wallet.publicKey,
                        amount: 75
                    })

                    blockchain.addBlock({ data: [nextBlockTransaction]});

                })

                it('should includes the output amounts in the returned balance', function () {
                    expect(
                        Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })
                    ).toEqual(
                        recentTransaction.outputMap[wallet.publicKey] +
                        sameBlockTransaction.outputMap[wallet.publicKey] +
                        nextBlockTransaction.outputMap[wallet.publicKey]
                    )
                });
            })
        })
    })
})
