const db = require('../backend/configDB');
const crypto = require('crypto');

// Fonction pour hasher un mot de passe
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};
// Fonction pour valider l'email
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};


// Fonction principale d'enregistrement
const register = async (email, password, username) => {
    // Vérifier unicité
    const [results] = await db.promise().query(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, username]
    );

    if (results.length > 0) {
        throw new Error('Email ou nom d’utilisateur déjà utilisé.');
    }

    const hashedPassword = hashPassword(password);

    await db.promise().query(
        'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
        [email, username, hashedPassword]
    );

    return { message: 'Utilisateur enregistré avec succès.' };
};

// 🔐 Fonction de connexion
const login = async (email, password) => {
    const hashedPassword = hashPassword(password);

    const [results] = await db.promise().query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    if (results.length === 0) {
        throw new Error('Aucun utilisateur trouvé avec cet email.');
    }

    const user = results[0];

    if (user.password !== hashedPassword) {
        throw new Error('Mot de passe incorrect.');
    }

    return { message: 'Connexion réussie.', user: { email: user.email, username: user.username } };
};


module.exports = {
    post: async (req, res) => {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Tous les champs sont requis.' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Adresse e-mail invalide.' });
        }

        try {
            const result = await register(email, password, username);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis.' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Adresse e-mail invalide.' });
        }

        try {
            const result = await login(email, password);
            req.session.user = result.user;
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    },
    getout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la déconnexion.' });
            }
            res.clearCookie('connect.sid'); // facultatif si tu veux aussi supprimer le cookie
            res.status(200).json({ message: 'Déconnexion réussie.' });
        })
    }
}

