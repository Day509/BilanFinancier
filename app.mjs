import fs from 'fs';
import path from 'path';

async function parcourirRepertoireNonRecursif(chemin) {
    let sommeTotale = 0;

    const pile = [chemin]; // Pile pour stocker les répertoires à parcourir

    while (pile.length > 0) {
        const repActuel = pile.pop(); // Récupérer le dernier répertoire de la pile

        // Lire le contenu du répertoire
        const fichiers = fs.readdirSync(repActuel, { withFileTypes: true });

        // Parcourir chaque fichier/dossier
        for (const entree of fichiers) {
            const cheminActuel = path.join(repActuel, entree.name);

            if (entree.isDirectory()) {
                // Si c'est un répertoire, ajouter à la pile pour parcourir ultérieurement
                pile.push(cheminActuel);
            } else if (entree.isFile() && cheminActuel.endsWith('.json')) {
                // Si c'est un fichier JSON, lire son contenu et analyser
                const data = fs.readFileSync(cheminActuel);

                try {
                    const objetJSON = JSON.parse(data);
                    if (objetJSON.hasOwnProperty('total')) {
                        sommeTotale += objetJSON['total'];
                    } else {
                        console.warn('Le fichier JSON ne contient pas de clé "total" :', cheminActuel);
                    }
                } catch (erreur) {
                    console.error('Erreur lors de l\'analyse du fichier JSON :', erreur);
                }
            }
        }
    }

    return sommeTotale;
}

// Exemple d'utilisation : spécifiez le chemin du répertoire à parcourir
const cheminDuRepertoire = process.argv[2] ||'./stores' // Par défaut, le répertoire 'stores' dans le répertoire actuel;
if (!fs.existsSync(path.resolve(cheminDuRepertoire))) {
    console.error('The provided path does not exist.');
    process.exit(1);
}
parcourirRepertoireNonRecursif(cheminDuRepertoire)
    .then(somme => {
        const filePath = 'salesTotals/total.txt';
        const data = `Total at 22/03/2024: ${somme} €\n`;
        if (fs.existsSync(filePath)) {
            console.log('The file already exists.');
        } else {
            fs.openSync(filePath, 'a+');
            console.log('The file has been created.');
        }
        fs.appendFileSync(filePath, data);
        console.log('Le total des ventes a été enregistré dans le fichier total.txt');
    })
    .catch(erreur => console.error('Erreur lors du parcours du répertoire', erreur));
