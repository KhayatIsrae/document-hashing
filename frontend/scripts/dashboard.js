const enregisterBtn = document.getElementById('enregisterButton');
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
            window.location.href = 'login.html';
        }
    });
})();
