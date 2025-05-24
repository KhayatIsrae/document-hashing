const form = document.getElementById('registerForm');
const errorDiv = document.getElementById('error');
const otpSection = document.getElementById('otp-section');
const otpInput = document.getElementById('otp-input');
const otpBtn = document.getElementById('otp-validate-btn');
const renvoyer = document.getElementById('renvoyer');
const loader = document.getElementById('loader');
const wrapper = document.getElementById('login-wrapper');


let tempUserData = {};

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const valPassword = form.valPassword.value.trim();

    if (password.length < 8) {
        errorDiv.setAttribute('class', 'error-message');
        errorDiv.textContent = 'Le mot de passe doit avoir au moin 8 caractères';
        return;
    }

    if (password !== valPassword) {
        errorDiv.setAttribute('class', 'error-message');
        errorDiv.textContent = 'Le mot de passe et la validation ne sont pas identiques';
        return;
    }

    try {
        // Étape 1 : valider les infos
        const validationRes = await fetch('http://localhost:3000/signup/validateInfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        wrapper.classList.add('blur');
        loader.classList.remove('hidden');

        if (!validationRes.ok) {
            const error = await validationRes.json();
            wrapper.classList.remove('blur');
            loader.classList.add('hidden');
            errorDiv.setAttribute('class', 'error-message');
            errorDiv.textContent = error.error, 'Informations invalides.';
            return;
        } else {
            // Étape 2 : envoyer OTP
            const otpRes = await fetch('http://localhost:3000/signup/sendOTP', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!otpRes.ok) {
                wrapper.classList.remove('blur');
                loader.classList.add('hidden');
                errorDiv.setAttribute('class', 'error-message');
                errorDiv.textContent = 'Erreur lors de l’envoi du code.';
                return;
            } else {
                // Affiche le champ OTP
                wrapper.classList.remove('blur');
                loader.classList.add('hidden');
                form.setAttribute('class', 'hidden')
                otpSection.classList.remove('hidden');
                errorDiv.textContent = '';
                tempUserData = { username, email, password }; // stocke temporairement
                renvoyer.addEventListener('click', async () => {
                    wrapper.classList.add('blur');
                    loader.classList.remove('hidden');
                    const otpRes = await fetch('http://localhost:3000/signup/sendOTP', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });

                    if (!otpRes.ok) {
                        wrapper.classList.remove('blur');
                        loader.classList.add('hidden');
                        errorDiv.setAttribute('class', 'error-message');
                        errorDiv.textContent = 'Erreur lors du renvoi du code.';
                        return;
                    } else {
                        wrapper.classList.remove('blur');
                        loader.classList.add('hidden');
                        renvoyer.setAttribute('class', 'hidden')
                        const messageDiv = document.getElementById('messageDiv');
                        messageDiv.classList.remove('hidden')
                        // Disparaît après 4s
                        setTimeout(() => {
                            messageDiv.remove();
                        }, 4000);
                    }
                })
            }


        }
        wrapper.classList.remove('blur');
        loader.classList.add('hidden');
    } catch (err) {
        wrapper.classList.remove('blur');
        loader.classList.add('hidden');
        errorDiv.setAttribute('class', 'error-message');
        errorDiv.textContent = 'Erreur de communication avec le serveur.';
    }
});

// Étape 3 : valider OTP manuellement depuis le champ
otpBtn.addEventListener('click', async () => {
    wrapper.classList.add('blur');
    loader.classList.remove('hidden');

    const otp = otpInput.value.trim();
    if (!otp) {
        wrapper.classList.remove('blur');
        loader.classList.add('hidden');
        errorDiv.textContent = 'Veuillez entrer le code.';
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/signup/validateOTP', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp })
        });

        const data = await res.json();

        if (!res.ok) {
            wrapper.classList.remove('blur');
            loader.classList.add('hidden')
            errorDiv.textContent = data.error || 'code invalide.';
            return;
        }

        // Étape 4 : inscrire l’utilisateur
        const registerRes = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tempUserData)
        });

        const result = await registerRes.json();

        if (registerRes.ok) {
            wrapper.classList.remove('blur');
            loader.classList.add('hidden');
            errorDiv.setAttribute('class', 'success-message');
            errorDiv.textContent = result.message;
            form.reset();
            otpSection.classList.add('hidden');
        } else {
            wrapper.classList.remove('blur');
            loader.classList.add('hidden');
            errorDiv.setAttribute('class', 'error-message');
            errorDiv.textContent = result.error || 'Erreur lors de l’inscription.';
        }
        wrapper.classList.remove('blur');
        loader.classList.add('hidden');
    } catch (err) {
        errorDiv.textContent = 'Erreur lors de la validation.';
    }
});

