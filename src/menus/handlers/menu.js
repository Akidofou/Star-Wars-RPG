const playerDB = require('../../database/playerDB');
const builder = require('../builder');

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

    const action = params[0];

    if (action === 'profil') {
        await interaction.update(builder.profil(joueur));
    } else if (action === 'lieux') {
        const zonesHelper = require('../../utils/zonesHelper');
        const duche = zonesHelper.getDuche(joueur.zone_actuelle);
        const comte = zonesHelper.getComte(joueur.zone_actuelle, joueur.secteur_actuel);
        await interaction.update(builder.lieux(joueur, duche, comte, null));
    } else if (action === 'codex') {
        const entrees = playerDB.getCodex(discord_id);
        await interaction.update(builder.codex(joueur, entrees));
    } else if (action === 'classement') {
        const classement = playerDB.getClassement();
        await interaction.update(builder.classement(classement, joueur));
    } else if (action === 'repos') {
        await interaction.update(builder.repos(joueur));
    } else {
        await interaction.update({
            content: '🚧 Cette section est en cours de construction.',
            embeds: [],
            components: [],
            flags: 64
        });
    }
};