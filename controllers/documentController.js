const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer')

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

        if (!req.session.user) {
            return res.status(401).json({ error: 'Utilisateur non authentifié.' });
        }

        const owner = req.session.user.username;
        const email = req.session.user.email
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
            let exists = false;
            try {
                const doc = await consulterDocument(hash);
                if (doc) exists = true;
            } catch (e) {
                // Si l’erreur vient du fait que le document n’existe pas → on continue
                if (!e.message.includes("aucun document trouve avec le hash")) {
                    // Sinon, c’est une vraie erreur qu’on doit remonter
                    throw e;
                }
            }

            if (exists) {
                return res.status(400).json({ error: 'Ce document est déjà enregistré.' });
            }

            // Sinon on enregistre
            try {
                await enregistrerDocument(hash, owner, timestamp);
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: '', // l'adresse Gmail
                        pass: '' // Le mot de passe généré dans Google
                    }
                });
                // Envoi de l’e-mail
                const info = await transporter.sendMail({
                    from: '<noreply@docchain.com>',
                    to: email,
                    subject: 'Confirmation d’enregistrement du document',
                    text: `Bonjour ${owner},\n\nVotre document a bien été enregistré.\n\nHash : ${hash}\nDate : ${timestamp}\n\nMerci d’avoir utilisé notre service.`
                });

                res.status(200).json({ message: 'Document enregistré et email de confirmation envoyé.' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: `Erreur : ${error.message}` });
            }

        } catch (error) {
            res.status(500).json({ error: `Erreur serveur : ${error.message}` });
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
            res.status(404).json({ message: `Document introuvable ou erreur : ${error.message}` });
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
