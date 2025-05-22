const form = document.getElementById('registerForm');
const errorDiv = document.getElementById('error');



form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        username: form.username.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value.trim(),
        valPassword: form.valPassword.value.trim()
    };
    if (formData.password !== formData.valPassword) {
        errorDiv.setAttribute('class','error-message')
        errorDiv.textContent = 'le mot de passe et la validation ne sont pas identiques';
    } else {
        try {
            const res = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                errorDiv.setAttribute('class','success-message')
                errorDiv.textContent = data.message
            } else {
                errorDiv.setAttribute('class','error-message')
                errorDiv.textContent = data.error || 'Erreur lors de l’inscription.';
            }
        } catch (err) {
            errorDiv.textContent = 'Erreur de communication avec le serveur.';
        }
    }

});
