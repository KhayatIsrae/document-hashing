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
        }).finally(()=>{
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