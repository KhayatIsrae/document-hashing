const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    const walletPath = path.join(__dirname, '../../wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const certPath = path.join(walletPath, 'userCert.pem');
    const keyPath = path.join(walletPath, 'userKey.pem');

    const cert = fs.readFileSync(certPath, 'utf8');
    const key = fs.readFileSync(keyPath, 'utf8');

    const identity = {
        credentials: {
            certificate: cert,
            privateKey: key,
        },
        mspId: 'Org1MSP',
        type: 'X.509',
    };

    await wallet.put('appUser', identity);
    console.log('Identité appUser ajoutée avec succès !');
}

// main();
async function test() {
    const walletPath = path.join(__dirname, '../../wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identities = await wallet.list();
    console.log('Identities in wallet:', identities);
}
test();
