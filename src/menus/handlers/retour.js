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

    const destination = params[0];

    if (destination === 'menu') {
        await interaction.update(builder.menuPrincipal(joueur));
    } else if (destination === 'profil') {
        await interaction.update(builder.profil(joueur));
    }
};