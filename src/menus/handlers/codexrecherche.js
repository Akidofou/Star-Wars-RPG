const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = async (interaction, params) => {
    const categorie = params[0];

    const modal = new ModalBuilder()
        .setCustomId(`codexrechercheresultat_${categorie}`)
        .setTitle('🔍 Rechercher dans le Codex');

    const champRecherche = new TextInputBuilder()
        .setCustomId('recherche_texte')
        .setLabel('Tapez le nom à rechercher')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: Loup')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(50);

    modal.addComponents(new ActionRowBuilder().addComponents(champRecherche));

    await interaction.showModal(modal);
};