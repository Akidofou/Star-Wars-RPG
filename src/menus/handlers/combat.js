const playerDB = require('../../database/playerDB');
const combatEngine = require('../../game/combat');
const builder = require('../builder');
const zonesHelper = require('../../utils/zonesHelper');

module.exports = async (interaction, params) => {

    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const action = params[0];

    if (action === 'passertour') {
        const combatActif = combatEngine.getCombatActif(discord_id);
        if (!combatActif) {
            await interaction.reply({ content: '❌ Aucun combat actif.', flags: 64 });
            return;
        }
        const passerTourHandler = require('./passertour');
        await passerTourHandler(interaction, discord_id, joueur);
        return;
    }

    if (action === 'fuir') {
        const combatActif = combatEngine.getCombatActif(discord_id);
        if (combatActif) {
            combatEngine.terminerCombat(combatActif.id, 'fuite');
        }

        const duche = zonesHelper.getDuche(joueur.zone_actuelle);
        const comte = zonesHelper.getComte(joueur.zone_actuelle, joueur.secteur_actuel);
        const secteur = joueur.position === 'ville'
            ? null
            : zonesHelper.getSecteur(joueur.zone_actuelle, joueur.secteur_actuel, joueur.position);

        await interaction.update(builder.lieux(joueur, duche, comte, secteur, []));
        return;
    }

    await interaction.reply({
        content: '❌ Action inconnue.',
        flags: 64
    });
};