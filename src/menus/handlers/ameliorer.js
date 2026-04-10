const playerDB = require('../../database/playerDB');
const spellsDB = require('../../database/spellsDB');
const builder = require('../builder');

module.exports = async (interaction, params) => {
    const discord_id = interaction.user.id;

    const sortId = interaction.values
        ? parseInt(interaction.values[0])
        : parseInt(params[0]);

    const resultat = spellsDB.ameliorerSort(discord_id, sortId);

    if (!resultat.succes) {
        await interaction.reply({ content: `❌ ${resultat.message}`, flags: 64 });
        return;
    }

    const joueurMisAJour = playerDB.get(discord_id);
    const sorts = spellsDB.getSortsDisponibles(discord_id, joueurMisAJour.classe, joueurMisAJour.niveau);
    await interaction.update(builder.competences(joueurMisAJour, sorts));
};