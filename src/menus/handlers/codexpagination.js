const playerDB = require('../../database/playerDB');
const codexDB = require('../../database/codexDB');
const builder = require('../builder');
const codexHandler = require('./codex');

module.exports = async (interaction, params) => {
    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const categorie = params[0];
    const page = parseInt(params[1]);

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

    await interaction.update(builder.codexListe(joueur, categorie, entrees, page));
};