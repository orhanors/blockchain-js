const Blockchain = require("./blockchain");
const bitcoin = new Blockchain();

// const previousBlockHash = "FDJSKALFJDSAL541f32FDSAFDx";

// const currentBlockData = [
// 	{
// 		amount: 10,
// 		sender: "ORHANFDSAFSAFDSA",
// 		recipient: "UGURFJDSKAŞJFDSLŞA32",
// 	},
// 	{
// 		amount: 15,
// 		sender: "fsdafdsafdsfdasfdsafdsa",
// 		recipient: "fdsafdasfdsafdsafdsa",
// 	},
// 	{
// 		amount: 38,
// 		sender: "fsdafdsafdsafdsfdsa",
// 		recipient: "fsafdsfdsafdasfdsafdas",
// 	},
// ];

// const pow = bitcoin.proofOfWork(previousBlockHash, currentBlockData);

// console.log(pow);

const b1 = {
	chain: [
		{
			index: 1,
			timestamp: 1621536092039,
			transactions: [],
			nonce: 100,
			hash: "0",
			previousBlockHash: "0",
		},
		{
			index: 2,
			timestamp: 1621536116776,
			transactions: [],
			nonce: 18140,
			hash: "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
			previousBlockHash: "0",
		},
		{
			index: 3,
			timestamp: 1621536155361,
			transactions: [
				{
					amount: 12.5,
					sender: "00",
					recipient: "812f57d2734a460ba9ebd4b81951ef99",
					transactionId: "1b84c6addf164b0e93e9002fb18469d7",
				},
				{ transactionId: "2ae7a27766c94b5ca7fdad1e200755fe" },
				{ transactionId: "526390bbac564d2a9e30c22efbb1ba35" },
			],
			nonce: 38394,
			hash: "00002bee2be82125c96f3566fc782d9626129204e84781d79d12400c365d429e",
			previousBlockHash:
				"0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
		},
		{
			index: 4,
			timestamp: 1621536187293,
			transactions: [
				{
					amount: 12.5,
					sender: "00",
					recipient: "812f57d2734a460ba9ebd4b81951ef99",
					transactionId: "1b430c7290b449558981ba66debc3ce3",
				},
				{ transactionId: "1caf6a570b794b789c988bc88aa85c71" },
				{ transactionId: "d9fd89d4b3a0463ea17380c34f580415" },
				{ transactionId: "70b0dd2008904f42ad70a0485fda8ea9" },
			],
			nonce: 122025,
			hash: "0000b2c73f04b98ce161fecb2023b99d8e95055bb1d986451aa1cd603ae0f59a",
			previousBlockHash:
				"00002bee2be82125c96f3566fc782d9626129204e84781d79d12400c365d429e",
		},
		{
			index: 5,
			timestamp: 1621536196146,
			transactions: [
				{
					amount: 12.5,
					sender: "00",
					recipient: "812f57d2734a460ba9ebd4b81951ef99",
					transactionId: "98431d2e014a46be9db7350341a93d4e",
				},
			],
			nonce: 112385,
			hash: "00007f34bfd4a1a815ab14a004bae49d433dd029177f715150219f4b9df6601b",
			previousBlockHash:
				"0000b2c73f04b98ce161fecb2023b99d8e95055bb1d986451aa1cd603ae0f59a",
		},
	],
	pendingTransactions: [
		{
			amount: 12.5,
			sender: "00",
			recipient: "812f57d2734a460ba9ebd4b81951ef99",
			transactionId: "4b4f23df47f94fe38f81322ccc7ddaef",
		},
	],
	currentNodeUrl: "http://localhost:3001",
	networkNodes: [],
};

console.log(bitcoin.isChainValid(b1.chain));
