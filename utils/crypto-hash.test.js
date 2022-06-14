const CryptoHash = require('./crypto-hash')
const {cryptoHash} = require("./index");

describe('cryptoHash()', () => {

    it('should generate a SHA-256 hashed output', () => {
        expect(CryptoHash('foo'))
            .toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b')
    });

    it('should produces the same hash w the same input arguments in any order', () => {
        expect(CryptoHash('one', 'two', 'three'))
            .toEqual(CryptoHash('three', 'one', 'two'))
    });

    it('should produces a unique hash when the properties have changed on an input', function () {
        const foo = {};
        const originalHash = cryptoHash(foo)
        foo['a'] = 'a'

        expect(cryptoHash(foo)).not.toEqual(originalHash)
    });


})
