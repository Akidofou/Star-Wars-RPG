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
        const entreeId = parseInt(interaction.values[0]);
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

    if (categorie === 'ressource' || categorie === 'item' || categorie === 'consommable') {
        entrees = [];
    }

    await interaction.update(builder.codexListe(joueur, categorie, entrees, page));
}

async function afficherFiche(interaction, joueur, categorie, entreeId, discord_id) {
    if (categorie === 'monstre') {
        const enemy = codexDB.getFicheMonstre(entreeId);
        if (!enemy) {
            await interaction.reply({ content: '❌ Monstre introuvable.', flags: 64 });
            return;
        }
        await interaction.update(builder.codexFicheMonstre(joueur, enemy, 0));
    }

    if (categorie === 'sort') {
        const spellsData = require('../../../data/spells.json');
        const sort = spellsData.sorts.find(s => s.id === entreeId);
        if (!sort) {
            await interaction.reply({ content: '❌ Sort introuvable.', flags: 64 });
            return;
        }
        await interaction.update(builder.codexFicheSort(joueur, sort, 1));
    }
}