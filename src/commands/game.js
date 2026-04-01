const { SlashCommandBuilder } = require('discord.js');
const playerDB = require('../database/playerDB');
const builder = require('../menus/builder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game')
        .setDescription('Lancer le jeu - Royaume d\'Asura'),

    async execute(interaction) {

        const discord_id = interaction.user.id;

        if (playerDB.exists(discord_id)) {
            const joueur = playerDB.get(discord_id);
            await interaction.reply(builder.menuPrincipal(joueur));
        } else {
            await interaction.reply(builder.intro());
        }
    
    },
};