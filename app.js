//Je veux écrire et lire dans un fichier
const fs = require('fs');
fs.readFileSync('salesTotals/total.txt', 'utf-8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("coucou");
    console.log(data);
});
// Path: totals.txt