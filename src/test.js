const Blockchain = require("./blockchain");
const bitcoin = new Blockchain();

const previousBlockHash = "FDJSKALFJDSAL541f32FDSAFDx";

const currentBlockData = [
	{
		amount: 10,
		sender: "ORHANFDSAFSAFDSA",
		recipient: "UGURFJDSKAŞJFDSLŞA32",
	},
	{
		amount: 15,
		sender: "fsdafdsafdsfdasfdsafdsa",
		recipient: "fdsafdasfdsafdsafdsa",
	},
	{
		amount: 38,
		sender: "fsdafdsafdsafdsfdsa",
		recipient: "fsafdsfdsafdasfdsafdas",
	},
];

const pow = bitcoin.proofOfWork(previousBlockHash, currentBlockData);

console.log(pow);
