const db = require('./backend/configDB');

db.query('SELECT username FROM users WHERE id = ?', [1], (err, results) => {
    if (err) throw err;
    console.log(results);
    process.exit(); // ← pour fermer le programme proprement
});
