const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Blockchain = require("./blockchain");

const nodeAddress = uuidv4().split("-").join("");

const port = process.argv[2];
const server = express();
const bitcoin = new Blockchain();

server.use(express.json());

server.get("/blockchain", (req, res) => {
	res.send(bitcoin);
});

server.post("/transaction", (req, res) => {
	const { newTransaction } = req.body;

	const blockIndex =
		bitcoin.addTransactionToPendingTransactions(newTransaction);

	res.json({ note: `Transaction will be added in block ${blockIndex}` });
});

server.post("/transaction/broadcast", (req, res) => {
	const { amount, sender, recipient } = req.body;

	const newTransaction = bitcoin.createNewTransaction(
		amount,
		sender,
		recipient
	);
	bitcoin.addTransactionToPendingTransactions(newTransaction);

	const transactionPromises = [];
	bitcoin.networkNodes.forEach((networkNodeUrl) => {
		const transactionOptions = {
			url: networkNodeUrl + "/transaction",
			method: "POST",
			data: { newTransaction },
		};
		const transactionPromise = axios(transactionOptions);
		transactionPromises.push(transactionPromise);
	});

	Promise.all(transactionPromises).then((data) => {
		res.json({ note: "Transaction created and broadcasted successfully" });
	});
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

	const newBlock = bitcoin.createNewBlock(
		nonce,
		previousBlockHash,
		blockHash
	);

	//broadcast the created block with network

	const newBlockCreationPromises = [];
	bitcoin.networkNodes.forEach((networkNodeUrl) => {
		const miningRequestOptions = {
			url: networkNodeUrl + "/receive-new-block",
			method: "POST",
			data: { newBlock },
		};

		newBlockCreationPromises.push(axios(miningRequestOptions));
	});

	Promise.all(newBlockCreationPromises)
		.then((data) => {
			//Give reward to miner
			const rewardRequestOption = {
				url: bitcoin.currentNodeUrl + "/transaction/broadcast",
				method: "POST",
				data: {
					amount: 12.5,
					sender: "00",
					recipient: nodeAddress,
				},
			};

			return axios(rewardRequestOption);
		})
		.then((data) => {
			res.json({
				note: "New block mined and broadcast successfully",
				block: newBlock,
			});
		})
		.catch((e) => {
			console.log("Mining error: ", e);
			res.json({ note: "Something went wrong :( ", error: e });
		});
});

//validate new block, if it's valid add to chain..
server.post("/receive-new-block", (req, res) => {
	const { newBlock } = req.body;

	const lastBlock = bitcoin.getLastBlock();
	const hasCorrectHash = lastBlock.hash === newBlock.previousBlockHash;
	const hasCorrectIndex = lastBlock["index"] + 1 === newBlock["index"];
	console.log("hasCorrectIndex: ", hasCorrectIndex);
	console.log("hasCorrectHash: ", hasCorrectHash);
	if (hasCorrectHash && hasCorrectIndex) {
		bitcoin.chain.push(newBlock);
		bitcoin.pendingTransactions = [];
		console.log("new block created");
		res.json({
			note: "New block received and accepted",
			newBlock,
		});
	} else {
		console.error("new block rejected");
		res.json({
			note: "New block rejected",
			newBlock,
		});
	}
});

server.post("/register-and-broadcast-node", (req, res) => {
	const { newNodeUrl } = req.body;

	if (bitcoin.networkNodes.indexOf(newNodeUrl) === -1) {
		bitcoin.networkNodes.push(newNodeUrl);
	}
	const registeredNodePromises = [];
	bitcoin.networkNodes.forEach((networkNodeUrl) => {
		const requestOptions = {
			url: networkNodeUrl + "/register-node",
			method: "POST",
			data: { newNodeUrl },
		};

		registeredNodePromises.push(axios(requestOptions));
	});

	Promise.all(registeredNodePromises)
		.then((data) => {
			const bulkRegisterOptions = {
				url: newNodeUrl + "/register-nodes-bulk",
				method: "POST",
				data: {
					allNetworkNodes: [
						...bitcoin.networkNodes,
						bitcoin.currentNodeUrl,
					],
				},
			};

			return axios(bulkRegisterOptions);
		})
		.then((data) =>
			res.json({ note: "New node registered with network successfully" })
		);
});

//register a node with network
server.post("/register-node", (req, res) => {
	const { newNodeUrl } = req.body;

	const nodeNotAlreadyPresent =
		bitcoin.networkNodes.indexOf(newNodeUrl) == -1;

	const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;

	if (nodeNotAlreadyPresent && notCurrentNode)
		bitcoin.networkNodes.push(newNodeUrl);

	res.json({ note: "New node registered successfully" });
});

//register multiple nodes at once
server.post("/register-nodes-bulk", (req, res) => {
	const { allNetworkNodes } = req.body;

	allNetworkNodes.forEach((networNodeUrl) => {
		const nodeNotAlreadyPresent =
			bitcoin.networkNodes.indexOf(networNodeUrl) == -1;
		const notCurrentNode = bitcoin.currentNodeUrl !== networNodeUrl;

		if (nodeNotAlreadyPresent && notCurrentNode)
			bitcoin.networkNodes.push(networNodeUrl);
	});

	res.json({ note: "Bulk registration successful" });
});

server.get("/consensus", (req, res) => {
	const requestPromises = [];
	//Get all blockchain info from each node
	bitcoin.networkNodes.forEach((networkNodeUrl) => {
		const chainRequestOptions = {
			url: networkNodeUrl + "/blockchain",
			method: "GET",
		};
		requestPromises.push(axios(chainRequestOptions));
	});

	Promise.all(requestPromises).then((blockchains) => {
		//see if there is a blockchain inside of the other
		//node that is longer than the copy of the blockchain hosted on the current node.

		const currentChainLength = bitcoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;
		blockchains.forEach((blockchain) => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			}
		});

		if (
			!newLongestChain ||
			(newLongestChain && !bitcoin.chainIsValid(newLongestChain))
		) {
			// if there is no newLongestChain
			// meaning, then the current chain is the longest. Alternatively, if there is a new longest chain
			// but that new chain is not valid, then in these two cases we don't want to replace the
			// blockchain that's hosted on the current node. So we're going to send back the note that says
			// 'Current chain has not been replaced'.
			res.json({
				note: "Current chain has not been replaced.",
				chain: bitcoin.chain,
			});
		} else {
			// if there is a newLongestChain and that chain is valid, now is when we want to
			// replace the blockchain that's hosted on the current node with the longest chain in the
			// network.
			bitcoin.chain = newLongestChain;
			bitcoin.pendingTransactions = newPendingTransactions;
			res.json({
				note: "This chain has been replaced.",
				chain: bitcoin.chain,
			});
		}
	});
});

server.listen(port, () => {
	console.log("Server is running on port: ", port);
});
