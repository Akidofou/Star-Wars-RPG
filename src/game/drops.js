const inventaireDB = require('../database/inventaireDB');
const codexDB = require('../database/codexDB');
const resourcesData = require('../../data/resources.json');
const itemsData = require('../../data/items.json');

const drops = {

    calculerDrops(enemy) {
        if (!enemy.drops || enemy.drops.length === 0) return [];

        const resultat = [];

        enemy.drops.forEach(drop => {
            const roll = Math.random() * 100;
            if (roll < drop.chance) {
                const quantite = Math.floor(
                    Math.random() * (drop.quantite_max - drop.quantite_min + 1)
                ) + drop.quantite_min;
                resultat.push({
                    id: drop.id,
                    type: drop.type,
                    quantite
                });
            }
        });

        return resultat;
    },

    appliquerDrops(discord_id, enemy, journal) {
        const dropsObtenus = drops.calculerDrops(enemy);

        if (dropsObtenus.length === 0) {
            return dropsObtenus;
        }

        journal.push(`\n📦 **Butin :**`);

        dropsObtenus.forEach(drop => {
            inventaireDB.ajouter(discord_id, drop.type, drop.id, drop.quantite);

            const nouvelleDecouverte = codexDB.decouvrir(discord_id, drop.type, drop.id.toString());

            let nom = drop.id;
            if (drop.type === 'ressource') {
                const data = resourcesData.resources.find(r => r.id === drop.id);
                nom = data?.nom || drop.id;
            } else if (drop.type === 'item') {
                const data = itemsData.items.find(i => i.id === parseInt(drop.id));
                nom = data?.nom || drop.id;
            }

            const nouveauTag = nouvelleDecouverte ? ' *(nouveau !)*' : '';
            journal.push(`• ${nom} ×${drop.quantite}${nouveauTag}`);
        });

        return dropsObtenus;
    }
};

module.exports = drops;