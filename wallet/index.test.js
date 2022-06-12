const Wallet = require('./index')
const {verifySignature} = require('../utils')

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

    describe('signin data', () => {
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
})
