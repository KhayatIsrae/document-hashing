const loginButton = document.getElementById('login-button');
const wrapper = document.getElementById('wrapper');

const connected = async () => {
    try {
        const res = await fetch('http://localhost:3000/session');
        const data = await res.json();
        return data.connected;
    } catch (err) {
        console.error("Erreur lors de la vérification de session :", err);
        return false;
    }
};


(async () => {
    const success = localStorage.getItem('loginSuccess');
    if (success === 'true') {
        localStorage.removeItem('loginSuccess');

        // Affichage du message (ex. en haut de la page)
        const messageDiv = document.createElement('div');
        messageDiv.textContent = 'Connecté avec succès !';
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.backgroundColor = '#22c55e';
        messageDiv.style.color = 'white';
        messageDiv.style.padding = '12px 20px';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
        messageDiv.style.zIndex = '999';

        document.body.appendChild(messageDiv);

        // Disparaît après 4s
        setTimeout(() => {
            messageDiv.remove();
        }, 4000);
    }

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
        loginButton.textContent = 'se connecter'
        loginButton.setAttribute('class', 'loginBtn')
        localStorage.setItem('redirectAfterLogin', 'enregistrer.html');
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
    wrapper.classList.add('blur');
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
    finally {
        wrapper.classList.remove('blur');
        loader.classList.add('hidden');
    }

});

