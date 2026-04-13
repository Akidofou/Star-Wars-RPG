const playerDB = require('../../database/playerDB');
const codexDB = require('../../database/codexDB');
const builder = require('../builder');

module.exports = async (interaction, params) => {
    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const enemyId = parseInt(params[0]);
    const varianteIndex = parseInt(params[1]);

    const enemy = codexDB.getFicheMonstre(enemyId);
    if (!enemy) {
        await interaction.reply({ content: '❌ Monstre introuvable.', flags: 64 });
        return;
    }

    await interaction.update(builder.codexFicheMonstre(joueur, enemy, varianteIndex));
};