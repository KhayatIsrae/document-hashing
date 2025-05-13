const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'usersDB'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connecté à la base de données MySQL (usersDB)');
});

module.exports = db;
