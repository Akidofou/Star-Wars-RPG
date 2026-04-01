const playerDB = require('../../database/playerDB');
const builder = require('../builder');
const zonesHelper = require('../../utils/zonesHelper');
const { setPosition } = require('discord.js');

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

    const secteurId = params.join('_');
    const duche = zonesHelper.getDuche(joueur.zone_actuelle);
    const comte = zonesHelper.getComte(joueur.zone_actuelle, joueur.secteur_actuel);
    const secteur = zonesHelper.getSecteur(joueur.zone_actuelle, joueur.secteur_actuel, secteurId);
    
    if (!secteur) {
        await interaction.reply({
            content: '❌ Secteur introuvable.',
            flags: 64
        });
        return;
    }

    playerDB.update(discord_id, { position: secteurId });

    const joueurMisAJour = playerDB.get(discord_id);
    await interaction.update(builder.lieux(joueurMisAJour, duche, comte, secteur, []));
};