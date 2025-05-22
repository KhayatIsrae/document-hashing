
const loginButton = document.getElementById('login-button');
const connected = async () => {
    const res = await fetch('http://localhost:3000/session');
    const data = await res.json();
    return data.connected;
};

(async () => {
    const isConnected = await connected();
    console.log(isConnected);
    if (isConnected) {
        loginButton.textContent = 'se deconnecter'
        loginButton.setAttribute('class', 'logoutBtn')
        const logoutBtn = document.querySelector('.logoutBtn');
        logoutBtn.addEventListener('click', async () => {
            await fetch('http://localhost:3000/logout', {
                method: 'GET'
            });
            window.location.href = 'login.html';
        });

    } else {
        window.location.href = 'login.html';
    }
})();


const form = document.getElementById('verifyForm');
const fileInput = document.getElementById('fileInput');
const resultDiv = document.getElementById('result');
const loader = document.getElementById('loader');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
        alert("Veuillez sélectionner un fichier.");
        return;
    }
    loader.classList.remove('hidden');
    try {
        // Lire le contenu du fichier
        const arrayBuffer = await file.arrayBuffer();
        //transforme le fichier en binaire
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        //calcule le hash en binaire
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        //transformer le hash du binaire en octet
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        //hash en hexadecimale
        console.log("Hash SHA-256 :", hashHex);

        // Envoi du hash au backend
        const res = await fetch('http://localhost:3000/document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                hash: hashHex
            })
        });

        const result = await res.json();

        if (res.ok) {
            resultDiv.setAttribute('class', 'resultmsg')
            resultDiv.textContent = result.message
        } else {
            resultDiv.setAttribute('class', 'errormsg')
            resultDiv.textContent = `Erreur : ${result.error || 'Échec de l’enregistrement.'}`;
        }
    } catch (error) {
        resultDiv.setAttribute('class', 'errormsg');
        resultDiv.textContent = "Erreur réseau ou serveur.";
    }
    finally { loader.classList.add('hidden'); }

});

