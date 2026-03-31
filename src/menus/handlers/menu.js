const playerDB = require('../../database/playerDB');
const builder = require('../builder');

module.exports = async (interaction, params) => {

    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);

    if (!joueur) {
        await interaction.reply({
            content: '❌ Joueur introuvable. Utilisez /game pour commencer.',
            flags: 64
        });
        return;
    }

    const action = params[0];

    if (action === 'profil') {
        await interaction.update(builder.profil(joueur));
    }
};