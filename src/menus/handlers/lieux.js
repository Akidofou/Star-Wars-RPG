const playerDB = require('../../database/playerDB');
const builder = require('../builder');
const zonesHelper = require('../../utils/zonesHelper');

module.exports = async (interaction, params) => {

    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const action = params[0];

    if (action === 'ville') {
        playerDB.update(discord_id, { position: 'ville' });
        const joueurMisAJour = playerDB.get(discord_id);
        const duche = zonesHelper.getDuche(joueurMisAJour.zone_actuelle);
        const comte = zonesHelper.getComte(joueurMisAJour.zone_actuelle, joueurMisAJour.secteur_actuel);
        await interaction.update(builder.lieux(joueurMisAJour, duche, comte, null, []));
        return;
    }

    await interaction.reply({
        content: '🚧 Cette action sera disponible prochainement.',
        flags: 64
    });

};