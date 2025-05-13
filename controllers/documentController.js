const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

let contract = ''
let gateway = ''
const main = async () => {
    // Charger le fichier de connexion
    const ccpPath = path.resolve(__dirname, '../../connection', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Charger le wallet
    const walletPath = path.join(__dirname, '../../wallet');

    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get('appUser');
    if (!identity) throw new Error("Identité appUser non trouvée.");

    gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    contract = network.getContract('doccc');
}

// Fonction pour consulter un document à partir de son hash
const consulterDocument = async (hash) => {
    await main();
    const result = await contract.evaluateTransaction('ConsulterDocument', hash);
    await gateway.disconnect();
    return result.toString();
};

// Fonction pour enregistrer un document dans la blockchain
const enregistrerDocument = async (hash, owner, timestamp) => {
    await main();
    await contract.submitTransaction('EnregistrerDocument', hash, owner, timestamp);
    await gateway.disconnect();
};
module.exports = {
    // POST / => enregistrer un document
    post: async (req, res) => {
        const { hash } = req.body;
        const owner= req.session.user.username
        console.log(owner)
        const now = new Date();
        const timestamp = now.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        try {
            await enregistrerDocument(hash, owner, timestamp);
            res.status(200).json({ message: 'Document enregistré avec succès.' });
        } catch (error) {
            res.status(500).json({ error: `Erreur : ${error.message}` });
        }
    },

    // GET /document?hash=... => consulter un document
    get: async (req, res) => {
        const { hash } = req.query;
        try {
            const result = await consulterDocument(hash);
            console.log(result)
            res.status(200).json(JSON.parse(result));
        } catch (error) {
            res.status(404).json({ error: `Document introuvable ou erreur : ${error.message}` });
        }
    },
    getSess: async (req, res) => {
        if (!req.session.user || req.session.user == "") {
            res.json({ connected: false });
        } else {
            res.json({ connected: true });
        }

    }
};
