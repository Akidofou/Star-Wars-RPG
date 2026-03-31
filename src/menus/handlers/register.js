const playerDB = require('../../database/playerDB');
const builder = require('../builder');

module.exports = async (interaction, params) => {

    const discord_id = interaction.user.id;
    const username = interaction.user.username;

    if (playerDB.exists(discord_id)) {
        await interaction.update(builder.intro());
        return;
    }

    playerDB.create(discord_id, username);

    await interaction.update(builder.choixClasse());
};