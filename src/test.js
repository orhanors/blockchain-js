const Blockchain = require("./blockchain");
const bitcoin = new Blockchain();

bitcoin.createNewBlock(2123132, "fjdsalkfjsdlak", "kljfdslakjfdlsa");

bitcoin.createNewTransaction(15, "Orhanfdsafdas", "Ugurfdsafdsa");
bitcoin.createNewTransaction(35, "Orhanfdsafdas", "Ugurfdsafdsa");
bitcoin.createNewTransaction(20, "Orhanfdsafdas", "Ugurfdsafdsa");

bitcoin.createNewBlock(2123132, "fjdsalkfjsdlak", "kljfdslakjfdlsa");

//bitcoin.createNewBlock(121, "fdsafdsafdsa", "gfdsgfsagsdgsda");
console.log(bitcoin);
