const Wallet = require('./index')
const {verifySignature} = require('../utils')
const Transaction = require("./transaction");

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
    })

    describe('calculateBalance()', () => {

    })
})
