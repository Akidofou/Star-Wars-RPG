module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error('Erreur commande:', error);
                await interaction.reply({
                    content: '❌ Une erreur est survenue.',
                    flags: 64
                });
            }
        }

        if (interaction.isButton()) {
            const parts = interaction.customId.split('_');
            const action = parts[0];
            const params = parts.slice(1);
            try {
                const handler = require(`../menus/handlers/${action}`);
                await handler(interaction, params, client);
            } catch (error) {
                console.error('ERREUR COMPLETE:', error);
                if (error.code === 'MODULE_NOT_FOUND' && error.requireStack && error.requireStack[0] && error.requireStack[0].includes(`handlers/${action}`)) {
                    console.warn('Handler manquant pour:', interaction.customId);
                    await interaction.reply({
                        content: '❌ Action non reconnue.',
                        flags: 64
                    });
                } else {
                    console.error('Erreur bouton:', error);
                    console.error('Stack:', error.stack);
                    await interaction.reply({
                        content: '❌ Une erreur est survenue.',
                        flags: 64
                    });
                }
            }
        }

    },
};