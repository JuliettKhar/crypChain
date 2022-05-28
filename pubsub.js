const redis = require('redis')

const CHANNELS = {
    TEST: 'TEST'
}

class PubSub {
    constructor() {
        this.publisher = redis.createClient()
        this.subscriber = redis.createClient()

        this.subscriber.subscribe(CHANNELS.TEST)
        this.subscriber.on('message', (channel, message) => this.handleMessage(channel, message))

    }

    handleMessage(ch, message) {
        console.log(`message received. channel: ${ch}. message${message}`)
    }
}

module.exports = PubSub
