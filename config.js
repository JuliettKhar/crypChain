const INITIAL_DIFFICULTY = 3;
const MINED_RATE = 1000;

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '------',
    hash: 'hash-one',
    data: [],
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0
};

const STARTING_BALANCE = 1000

module.exports = {
    GENESIS_DATA,
    MINED_RATE,
    STARTING_BALANCE
};
