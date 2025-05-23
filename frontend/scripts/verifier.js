const fileInput = document.getElementById('hashFile');
const hashInput = document.getElementById('hashInput');
const loginButton = document.getElementById('login-button');
const form = document.getElementById('verifyForm');
const resultDiv = document.getElementById('result');
const loader = document.getElementById('loader');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    const hash = hashInput.value.trim();
    let document = ''
    if (hash) {
        document = hash;
    } else if (!file) {
        resultDiv.setAttribute('class', 'errormsg')
        resultDiv.textContent = "Veuillez sélectionner un fichier ou entrer un hash.";
    } else {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        document = hashHex
    }
    if (document !== '') {
        const URL = `http://localhost:3000/document?hash=${document}`
        loader.classList.remove('hidden');
        fetch(URL).then(res => res.json()).then(data => {
            if (!data.message) {
                resultDiv.setAttribute('class', 'resultmsg')
                resultDiv.innerHTML = `
          <strong>Document trouvé :</strong><br>
          Hash : ${data.hash}<br>
          Auteur : ${data.owner}<br>
          Date : ${data.timestamp}<br>
        `;
            } else {
                resultDiv.setAttribute('class', 'errormsg')
                resultDiv.textContent = ` ${data.message}`;
            }

        }).catch(err => {
            resultDiv.setAttribute('class', 'errormsg')
            resultDiv.textContent = ` ${err.message}`;
            console.log(err)
        }).finally(() => {
            loader.classList.add('hidden')
        })
    }
});

const connected = async () => {
    try {
        const res = await fetch('http://localhost:3000/session');
        const data = await res.json();
        return data.connected;
    } catch (err) {
        resultDiv.setAttribute('class', 'errormsg')
        resultDiv.textContent = ` ${err.message}`;
        console.log(err)
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
                method: 'GET',
                credentials: 'include'
            }).catch(err => {
                resultDiv.setAttribute('class', 'errormsg')
                resultDiv.textContent = ` ${err.message}`;
                console.log(err)
            })
            window.location.href = 'login.html';
        });

    } else {
        loginButton.textContent = 'se connecter'
        loginButton.setAttribute('class', 'loginBtn')
        localStorage.setItem('redirectAfterLogin', 'verifier.html');
        loginButton.addEventListener('click', () => window.location.href = 'login.html')
    }
})();

// Quand l'utilisateur sélectionne un fichier
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        hashInput.disabled = true;
        hashInput.placeholder = "Désactivé (fichier sélectionné)";
    } else {
        hashInput.disabled = false;
        hashInput.placeholder = "Entrer le hash du document";
    }
});

// Quand l'utilisateur commence à taper un hash
hashInput.addEventListener('input', () => {
    if (hashInput.value.trim() !== "") {
        fileInput.disabled = true;
    } else {
        fileInput.disabled = false;
    }
});