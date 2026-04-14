const playerDB = require('../../database/playerDB');
const spellsDB = require('../../database/spellsDB');
const builder = require('../builder');

module.exports = async (interaction, params) => {

    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const action = params[0];

    if (!joueur) {
        await interaction.reply({
            content: '❌ Joueur introuvable.',
            flags: 64
        });
        return;
    }

    if (action === 'stats') {
        await interaction.update(builder.stats(joueur));

    } else if (action === 'competences') {
        const sorts = spellsDB.getSortsDisponibles(discord_id, joueur.classe, joueur.niveau);
        await interaction.update(builder.competences(joueur, sorts));

    } else if (action === 'equipement') {
        await interaction.update({
            content: '🚧 Équipement — bientôt disponible !',
            embeds: [], components: [], flags: 64
        });

    } else if (action === 'inventaire') {
        const inventaireDB = require('../../database/inventaireDB');
        const inventaire = inventaireDB.getInventaire(discord_id);
        const inventaireEnrichi = inventaireDB.enrichir(inventaire);
        await interaction.update(builder.inventaire(joueur, inventaireEnrichi));

    } else if (action === 'quetes') {
        await interaction.update({
            content: '🚧 Journal de quêtes — bientôt disponible !',
            embeds: [], components: [], flags: 64
        });
        
    } else {
        await interaction.update({
            content: '❌ Action inconnue.',
            embeds: [], components: [], flags: 64
        });
    }
};