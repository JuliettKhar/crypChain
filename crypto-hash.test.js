const CryptoHash = require('./crypto-hash')

describe('cryptoHash()', () => {

    it('should generate a SHA-256 hashed output', () => {
        expect(CryptoHash('foo'))
            .toEqual('2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae')
    });

    it('should produces the same hash w the same input arguments in any order', () => {
        expect(CryptoHash('one', 'two', 'three'))
            .toEqual(CryptoHash('three', 'one', 'two'))
    });


})
