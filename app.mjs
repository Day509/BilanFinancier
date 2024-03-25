import fs from 'fs';
import path from 'path';

async function parcourirRepertoireNonRecursif(chemin) {
    let sommeTotale = 0;

    const pile = [chemin]; // Pile pour stocker les répertoires à parcourir

    while (pile.length > 0) {
        const repActuel = pile.pop(); // Récupérer le dernier répertoire de la pile

        // Lire le contenu du répertoire
        const fichiers = await fs.readdir(repActuel, { withFileTypes: true });

        // Parcourir chaque fichier/dossier
        for (const entree of fichiers) {
            const cheminActuel = path.join(repActuel, entree.name);

            if (entree.isDirectory()) {
                // Si c'est un répertoire, ajouter à la pile pour parcourir ultérieurement
                pile.push(cheminActuel);
            } else if (entree.isFile() && cheminActuel.endsWith('.json')) {
                // Si c'est un fichier JSON, lire son contenu et analyser
                const data = await fs.readFile(cheminActuel);

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
try {
    await fs.promises.access(cheminDuRepertoire, fs.constants.R_OK | fs.constants.X_OK);
} catch (erreur) {
    console.error('Le répertoire spécifié n\'existe pas ou n\'est pas accessible en lecture.');
    process.exit(1);
}

parcourirRepertoireNonRecursif(cheminDuRepertoire)
    .then(async (somme) => {
        const filePath = 'salesTotals/total.txt';
        const data = `Total at 22/03/2024: ${somme} €\n`;

        try {
            await fs.access(filePath);
            console.log('The file already exists.');
        } catch (error) {
            await fs.writeFile(filePath, '', (err) => {
                if (err) {
                    console.error('Error while creating the file', err);
                }
                console.log('The file has been created.');
            })
        }
        fs.appendFileSync(filePath, data);
        console.log('Le total des ventes a été enregistré dans le fichier total.txt');
    })
    .catch(erreur => console.error('Erreur lors du parcours du répertoire', erreur));