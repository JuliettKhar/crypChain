const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')
const PubSub = require('./app/pubsub')
const TransactionPool = require('./wallet/transaction-pool')
const Wallet = require('./wallet/index')

const app = express()
const blockchain = new Blockchain();
const transactionPool = new TransactionPool()
const wallet = new Wallet()
const pubsub = new PubSub({ blockchain, transactionPool })

const  DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain)
})
app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data })
    pubsub.broadcastChain();
    res.redirect('/api/blocks')
})

app.post('/api/transact', ((req, res) => {
    const { amount, recipient } = req.body
    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey})

    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount })
        } else {
            transaction = wallet.createTransaction(({recipient, amount}))
        }
        transactionPool.setTransaction(transaction)
        pubsub.broadcastTransaction(transaction)

        res.json({type: 'success', transaction})
    } catch (e) {
        res.status(400).json({type: 'error', message: e.message})
    }
}))

app.get('/api/transaction-pool-map', (req, res) => {
res.json(transactionPool.transactionMap)
})

const syncChains = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (err, resp, body) => {
        if (!err && resp.statusCode === 200) {
            const rootChain = JSON.parse(body)

            blockchain.replaceChain(rootChain)
            console.log('replace chain on a sync with', rootChain)
        }
    })
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening localhost ${PORT}`)

    if (PORT !== DEFAULT_PORT) {
        syncChains();
    }
})
