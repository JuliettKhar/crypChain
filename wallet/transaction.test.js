const Transaction = require('./transaction')
const Wallet = require("./index");
const {verifySignature} = require("../utils");

describe('Transaction', () => {
    let transaction;
    let senderWallet;
    let recipient;
    let amount;

    beforeEach(() => {
        senderWallet = new Wallet()
        recipient = 'recipient-public-key'
        amount = 50;

        transaction = new Transaction({senderWallet, recipient, amount})
    })

    it('should has an id', () => {
        expect(transaction).toHaveProperty('id')
    });

    describe('output Map', () => {
        it('should has an output Map', () => {
            expect(transaction).toHaveProperty('outputMap')
        });

        it('should outputs the amount to the recipient ', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount)
        });

        it('should outputs the remaining balance for the sender wallet', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount)
        });
    })

    describe('input', () => {
        it('should has an input', () => {
            expect(transaction).toHaveProperty('input')
        });

        it('should has a timestamp in the input', () => {
            expect(transaction.input).toHaveProperty(('timestamp'))
        });

        it('should sets the amount to the senderWallet balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance)
        });

        it('should sets the address to the senderWallet public key', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey)
        });

        it('should signs the input', () => {
            expect(
                verifySignature({
                    publicKey: senderWallet.publicKey,
                    data: transaction.outputMap,
                    signature: transaction.input.signature
                })
            ).toBe(true)
        });
    })

    describe('validTransaction()', () => {
        let errorMock;
        beforeEach(() => {
            errorMock = jest.fn()

            global.console.error = errorMock
        })

        describe('when transaction is invalid',  () =>  {
            it('should returns false when transaction output map is invalid',  () =>  {
                transaction.outputMap[senderWallet.publicKey] = 999

                expect(Transaction.validTransaction(transaction)).toBe(false)
                expect(errorMock).toHaveBeenCalled()
            });
            it('should returns false when transaction input signature is invalid',  () =>  {
                transaction.input.signature = new Wallet().sign(('data'))

                expect(Transaction.validTransaction(transaction)).toBe(false)
                expect(errorMock).toHaveBeenCalled()
            });
        });

        describe('transaction signature is valid',  () =>  {
            it('should returns true',  () =>  {
                expect(Transaction.validTransaction(transaction)).toBe(true)
            });
        });
    })

    describe('update()', () => {
        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

        beforeEach(() => {
            originalSignature = transaction.input.signature;
            originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
            nextRecipient = 'next-recipient';
            nextAmount = 50;

            transaction.update({
                senderWallet,
                recipient: nextRecipient,
                amount: nextAmount
            })
        })

        it('should outputs the amount to the next recipient',  () => {
            expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount)
        });

        it('should subtracts the amount from the original sender output amount',  () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount)
        });

        it('should maintains a total output that matches the input amount',  () => {
          expect(Object.values(transaction.outputMap)
              .reduce((total, outputAmount) => total + outputAmount)
          ).toEqual(transaction.input.amount)
        });

        it('re-signs the transaction',  () => {
            expect(transaction.input.signature).not.toEqual(originalSignature)
        });
    })
})
