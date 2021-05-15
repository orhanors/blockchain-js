const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Blockchain = require("./blockchain");

const nodeAddress = uuidv4().split("-").join("");
console.log("nodeAddress: ", nodeAddress);
const server = express();
const bitcoin = new Blockchain();

const port = 3001;

server.use(express.json());

server.get("/blockchain", (req, res) => {
	res.send(bitcoin);
});

server.post("/transaction", (req, res) => {
	const { amount, sender, recipient } = req.body;

	const blockIndex = bitcoin.createNewTransaction(amount, sender, recipient);

	res.json({ note: `Transaction will be added in block ${blockIndex}` });
});

/**
 * Create new block and give award to miner of the block
 */
server.get("/mine", (req, res) => {
	const lastBlock = bitcoin.getLastBlock();
	const previousBlockHash = lastBlock["hash"];
	const currentBlockData = {
		transactions: bitcoin.pendingTransactions,
		index: lastBlock["index"] + 1,
	};
	const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = bitcoin.hashBlock(
		previousBlockHash,
		currentBlockData,
		nonce
	);

	bitcoin.createNewTransaction(12.5, "0", nodeAddress);
	const newBlock = bitcoin.createNewBlock(
		nonce,
		previousBlockHash,
		blockHash
	);

	res.json({
		note: "New block mined successfully",
		block: newBlock,
	});
});

server.listen(port, () => {
	console.log("Server is running on port: ", port);
});
