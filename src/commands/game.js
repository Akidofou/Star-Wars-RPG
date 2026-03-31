const { SlashCommandBuilder } = require('discord.js');
const playerDB = require('../database/playerDB');
const builder = require('../menus/builder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game')
        .setDescription('Lancer le jeu Star Wars RPG'),

    async execute(interaction) {

        const discord_id = interaction.user.id;
        const username = interaction.user.username;

        if (playerDB.exists(discord_id)) {
            await interaction.reply({
                content: '✅ Vous êtes déjà enregistré .',
                flags: 64
            });
        } else {
            await interaction.reply(builder.intro());
        }
    
    },
};