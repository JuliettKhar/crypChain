const cryptoHash = require("./crypto-hash");
const EllipticCrypto = require('elliptic').ec

const ec = new EllipticCrypto('secp256k1');

const verifySignature = ({publicKey, data, signature}) => {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex')

    return keyFromPublic.verify(cryptoHash(data), signature)
}

module.exports = {ec, verifySignature}
