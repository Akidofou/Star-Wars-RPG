const combatEngine = require('../../game/combat');

module.exports = async (interaction, params) => {
    const discord_id = interaction.user.id;
    const action = params[0];

    if (action === 'sort') {
        const sortId = parseInt(interaction.values[0]);

        const combatActif = combatEngine.getCombatActif(discord_id);
        if (!combatActif) {
            await interaction.reply({ content: '❌ Aucun combat actif.', flags: 64 });
            return;
        }

        const cooldowns = combatActif.cooldowns_joueur;
        if (cooldowns[sortId] > 0) {
            await interaction.reply({ 
                content: `❌ Ce sort est en cooldown encore **${cooldowns[sortId]}** tour(s) !`, 
                flags: 64 
            });
            return;
        }

        const attaqueHandler = require('./attaque');
        await attaqueHandler(interaction, [sortId.toString()]);
    }
};