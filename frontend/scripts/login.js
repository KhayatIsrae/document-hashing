const form = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = 'index.html';
    } else {
      errorDiv.textContent = data.error || "Erreur lors de la connexion.";
    }
  } catch (err) {
    errorDiv.textContent = "Erreur de communication avec le serveur.";
  }
});
