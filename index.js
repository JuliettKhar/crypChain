const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')
const PubSub = require('./app/pubsub')
const TransactionPool = require('./wallet/transaction-pool')
const Wallet = require('./wallet/index')
const TransactionMiner = require('./app/transaction-miner')
const path = require('path')

const app = express()
const blockchain = new Blockchain();
const transactionPool = new TransactionPool()
const wallet = new Wallet()
const pubsub = new PubSub({blockchain, transactionPool})
const transactionMiner = new TransactionMiner({blockchain, transactionPool, wallet, pubsub })

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/dist')))

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain)
})
app.post('/api/mine', (req, res) => {
    const {data} = req.body;

    blockchain.addBlock({data})
    pubsub.broadcastChain();
    res.redirect('/api/blocks')
})

app.post('/api/transact', ((req, res) => {
    const {amount, recipient} = req.body
    let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey})

    try {
        if (transaction) {
            transaction.update({senderWallet: wallet, recipient, amount})
        } else {
            transaction = wallet.createTransaction(({recipient, amount, chain: blockchain.chain}))
        }
    } catch (e) {
        return res.status(400).json({type: 'error', message: e.message})
    }

    transactionPool.setTransaction(transaction)
    pubsub.broadcastTransaction(transaction)
    res.json({type: 'success', transaction})
}))

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap)
})

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransaction()

    res.redirect('/api/blocks')
})

app.get('/api/wallet-info', (req, res) => {
    res.json({
        address: wallet.publicKey,
        balance: Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
        })
    })
})

app.get('*', ((req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'))
}))


const syncWithRootState = () => {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (err, resp, body) => {
        if (!err && resp.statusCode === 200) {
            const rootChain = JSON.parse(body)

            blockchain.replaceChain(rootChain)
            console.log('replace chain on a sync with', rootChain)
        }
    })

    request({url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`}, (err, resp, body) => {
        if (!err && resp.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body)

            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap)
            transactionPool.setMap(rootTransactionPoolMap)
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
        syncWithRootState();
    }
})
