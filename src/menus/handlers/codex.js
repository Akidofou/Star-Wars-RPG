const playerDB = require('../../database/playerDB');
const codexDB = require('../../database/codexDB');
const builder = require('../builder');

module.exports = async (interaction, params) => {
    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const action = params[0];

    if (action === 'retourliste') {
        const categorie = params[1];
        return await afficherListe(interaction, joueur, categorie, discord_id, 0);
    }

    if (action === 'categorie') {
        const categorie = interaction.values[0];
        return await afficherListe(interaction, joueur, categorie, discord_id, 0);
    }

    if (action === 'fiche') {
        const categorie = params[1];
        const entreeId = interaction.values[0];
        return await afficherFiche(interaction, joueur, categorie, entreeId, discord_id);
    }

    await interaction.reply({ content: '❌ Action inconnue.', flags: 64 });
};

async function afficherListe(interaction, joueur, categorie, discord_id, page) {
    let entrees = [];

    if (categorie === 'monstre') {
        const enemiesData = require('../../../data/enemies.json');
        const decouverts = codexDB.getEntrees(discord_id, 'monstre');
        entrees = decouverts.map(d => {
            const enemy = enemiesData.enemies.find(e => e.id === parseInt(d.entree_id));
            return enemy ? { id: enemy.id, nom: enemy.nom, description_courte: enemy.description || '' } : null;
        }).filter(Boolean);
    }

    if (categorie === 'sort') {
        const sortsClasse = codexDB.getSortsClasse(joueur.classe);
        entrees = sortsClasse.map(s => ({
            id: s.id,
            nom: s.nom,
            description_courte: `Débloqué niveau ${s.niveau_deblocage}`
        }));
    }

    if (categorie === 'ressource') {
        const resourcesData = require('../../../data/resources.json');
        const decouverts = codexDB.getEntrees(discord_id, 'ressource');
        entrees = decouverts.map(d => {
            const ressource = resourcesData.resources.find(r => r.id === d.entree_id);
            return ressource ? {
                id: ressource.id,
                nom: ressource.nom,
                description_courte: ressource.categorie
            } : null;
        }).filter(Boolean);
    }

    if (categorie === 'item') {
        const itemsData = require('../../../data/items.json');
        const decouverts = codexDB.getEntrees(discord_id, 'item');
        entrees = decouverts.map(d => {
            const item = itemsData.items.find(i => i.id === parseInt(d.entree_id));
            return item ? {
                id: item.id,
                nom: item.nom,
                description_courte: item.categorie
            } : null;
        }).filter(Boolean);
    }

    if (categorie === 'consommable') {
        entrees = [];
    }

    await interaction.update(builder.codexListe(joueur, categorie, entrees, page));
}

async function afficherFiche(interaction, joueur, categorie, entreeId, discord_id) {
    if (categorie === 'monstre') {
        const enemy = codexDB.getFicheMonstre(parseInt(entreeId));
        if (!enemy) {
            await interaction.reply({ content: '❌ Monstre introuvable.', flags: 64 });
            return;
        }
        await interaction.update(builder.codexFicheMonstre(joueur, enemy, 0));
    }

    if (categorie === 'sort') {
        const spellsData = require('../../../data/spells.json');
        const sort = spellsData.sorts.find(s => s.id === parseInt(entreeId));
        if (!sort) {
            await interaction.reply({ content: '❌ Sort introuvable.', flags: 64 });
            return;
        }
        await interaction.update(builder.codexFicheSort(joueur, sort, 1));
    }

    if (categorie === 'ressource') {
        const ressource = codexDB.getFicheRessource(entreeId.toString());
        if (!ressource) {
            await interaction.reply({ content: '❌ Ressource introuvable.', flags: 64 });
            return;
        }
        const enemiesData = require('../../../data/enemies.json');
        await interaction.update(builder.codexFicheRessource(joueur, ressource, enemiesData));
    }

    if (categorie === 'item') {
        const item = codexDB.getFicheItem(parseInt(entreeId));
        if (!item) {
            await interaction.reply({ content: '❌ Item introuvable.', flags: 64 });
            return;
        }
        const panoplie = item.panoplie_id ? codexDB.getPanoplie(item.panoplie_id) : null;
        await interaction.update(builder.codexFicheItem(joueur, item, panoplie));
    }
}