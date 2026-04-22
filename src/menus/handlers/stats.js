const playerDB = require('../../database/playerDB');
const builder = require('../builder');

module.exports = async (interaction, params) => {

    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const stat = params[0];

    if (joueur.points_stat <= 0) {
        await interaction.update(builder.stats(joueur));
        return;
    }

    const STATS_VALIDES = ['vitalite', 'sagesse', 'terre', 'feu', 'eau', 'air'];
    if (!STATS_VALIDES.includes(stat)) {
        await interaction.reply({ content: '❌ Statistique invalide.', flags: 64 });
        return;
    }

    if (stat === 'vitalite') {
        playerDB.update(discord_id, {
            vitalite: joueur.vitalite + 1,
            hp_max: joueur.hp_max + 5,
            hp_actuel: joueur.hp_actuel + 5,
            points_stat: joueur.points_stat - 1
        });
    } else {
        playerDB.update(discord_id, {
            [stat]: joueur[stat] + 1,
            points_stat: joueur.points_stat - 1
        });
    }

    const joueurMisAJour = playerDB.get(discord_id);
    await interaction.update(builder.stats(joueurMisAJour));
};