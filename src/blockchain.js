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

	while (hash.substr(0, 4) !== "0000") {
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
		console.log(hash);
	}
	console.log(nonce);
	return nonce;
};

/**
 * CONSENSUS ALGORITHM (longest chain rule)
 * @param {*} blockchain
 * @returns chain is valid or not
 */
Blockchain.prototype.isChainValid = function (blockchain) {
	let validChain = true;

	for (let i = 1; i < blockchain.length; i++) {
		const currentBlock = blockchain[i];
		const previousBlock = blockchain[i - 1];

		//Check if the hash is valid
		const blockHash = this.hashBlock(
			previousBlock["hash"],
			{
				transactions: currentBlock["transactions"],
				index: currentBlock["index"],
			},
			currentBlock["nonce"]
		);

		if (blockHash.substring(0, 4) !== "0000") validChain = false;

		//Check if the previous hash is valid
		if (currentBlock["previousBlockHash"] !== previousBlock["hash"])
			validChain = false;

		//Check if the genesis block is valid
		const genesisBlock = blockchain[0];
		const correctNonce = genesisBlock["nonce"] === 100;
		const correctPrevBlockHash = genesisBlock["previousBlockHash"] === "0";
		const correctHash = genesisBlock["hash"] === "0";
		const correctTransactions = genesisBlock["transactions"].length === 0;

		if (
			!correctNonce ||
			!correctPrevBlockHash ||
			!correctHash ||
			!correctTransactions
		)
			validChain = false;
	}
	return validChain;
};

module.exports = Blockchain;
