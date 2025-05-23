const enregisterBtn = document.getElementById('enregisterButton');
const loginButton = document.getElementById('login-button');
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
            });
            window.location.href = 'login.html';
        });

    } else {
        loginButton.textContent = 'se connecter'
        loginButton.setAttribute('class', 'loginBtn')
        loginButton.addEventListener('click', () => window.location.href = 'login.html')
    }

    enregisterBtn.addEventListener('click', () => {
        if (isConnected) {
            window.location.href = 'enregistrer.html';
        } else {
            localStorage.setItem('redirectAfterLogin', 'enregistrer.html');
            window.location.href = 'login.html';
        }
    });
})();
