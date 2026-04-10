const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
    require('../commands/game.js').data.toJSON(),
    require('../commands/admin.js').data.toJSON()
];  

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('📡 Enregistrement des commandes...');
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );
        console.log('✅ Commandes enregistrées avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des commandes :', error);
    }
})();