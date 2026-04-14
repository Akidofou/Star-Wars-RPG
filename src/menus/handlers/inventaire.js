const playerDB = require('../../database/playerDB');
const inventaireDB = require('../../database/inventaireDB');
const builder = require('../builder');

module.exports = async (interaction, params) => {
    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const action = params[0];

    if (action === 'categorie') {
        const categorie = interaction.values[0];
        const inventaire = inventaireDB.getInventaire(discord_id);
        const inventaireEnrichi = inventaireDB.enrichir(inventaire);
        const categorieFiltree = categorie === 'tout' ? null : categorie;
        await interaction.update(builder.inventaire(joueur, inventaireEnrichi, categorieFiltree));
        return;
    }

    await interaction.reply({ content: '❌ Action inconnue.', flags: 64 });
};