const form = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');
const loader = document.getElementById('loader');
const wrapper = document.getElementById('wrapper');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim()

  try {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    wrapper.classList.add('blur');
    loader.classList.remove('hidden');
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('loginSuccess', 'true');
      const redirectPage = localStorage.getItem('redirectAfterLogin');
      if (redirectPage) {
        wrapper.classList.remove('blur');
        loader.classList.add('hidden');
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPage;
      } else {
        wrapper.classList.remove('blur');
        loader.classList.add('hidden');
        window.location.href = 'index.html';
      }
    } else {
      wrapper.classList.remove('blur');
      loader.classList.add('hidden');
      errorDiv.textContent = data.error || "Erreur lors de la connexion.";
    }
  } catch (err) {
    wrapper.classList.remove('blur');
    loader.classList.add('hidden');
    errorDiv.textContent = "Erreur de communication avec le serveur.";
  } finally {
    wrapper.classList.remove('blur');
    loader.classList.add('hidden');
  }
});
