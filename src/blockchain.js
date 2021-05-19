const sha256 = require("sha256");
const { v4: uuidv4 } = require("uuid");

const currentNodeUrl = process.argv[3];

function Blockchain() {
	this.chain = [];
	this.pendingTransactions = [];

	this.createNewBlock(100, "0", "0"); //genesis block

	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];
}

Blockchain.prototype.createNewBlock = function (
	nonce,
	previousBlockHash,
	hash
) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		transactions: this.pendingTransactions,
		nonce: nonce,
		hash: hash,
		previousBlockHash: previousBlockHash,
	};

	this.pendingTransactions = [];
	this.chain.push(newBlock);

	return newBlock;
};

Blockchain.prototype.getLastBlock = function () {
	return this.chain[this.chain.length - 1];
};

/**
 *
 * @param {*} amount
 * @param {*} sender
 * @param {*} recipient
 * @returns transaction object
 */
Blockchain.prototype.createNewTransaction = function (
	amount,
	sender,
	recipient
) {
	const newTransaction = {
		amount: amount,
		sender: sender,
		recipient: recipient,
		transactionId: uuidv4().split("-").join(""),
	};

	return newTransaction;
};

/**
 *
 * @param {*} transactionObj
 * @returns Number of the block that this transaction returns to
 */
Blockchain.prototype.addTransactionToPendingTransactions = function (
	transactionObj
) {
	this.pendingTransactions.push(transactionObj);
	return this.getLastBlock()["index"] + 1;
};

Blockchain.prototype.hashBlock = function (
	previousBlockHash,
	currentBlockData,
	nonce
) {
	const dataAsStr =
		previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(dataAsStr);
	return hash;
};

Blockchain.prototype.proofOfWork = function (
	previousBlockHash,
	currentBlockData
) {
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

	while (hash.substr(0, 4) !== "000000") {
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
		console.log(hash);
	}
	console.log(nonce);
	return nonce;
};

module.exports = Blockchain;
