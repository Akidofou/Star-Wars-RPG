const playerDB = require('../../database/playerDB');
const builder = require('../builder');

module.exports = async (interaction, params) => {
    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const sortId = parseInt(params[0]);
    const niveau = parseInt(params[1]);

    const spellsData = require('../../../data/spells.json');
    const sort = spellsData.sorts.find(s => s.id === sortId);
    if (!sort) {
        await interaction.reply({ content: '❌ Sort introuvable.', flags: 64 });
        return;
    }

    await interaction.update(builder.codexFicheSort(joueur, sort, niveau));
};