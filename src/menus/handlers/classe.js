const playerDB = require('../../database/playerDB');
const builder = require('../builder');
const spellsDB = require('../../database/spellsDB');

const CLASSES_VALIDES = ['guerrier', 'gardien', 'archer', 'arcaniste'];

module.exports = async (interaction, params) => {

    const discord_id = interaction.user.id;
    const classeId = params[0];

    if (!CLASSES_VALIDES.includes(classeId)) {
        await interaction.reply({
            content: '❌ Classe invalide.',
            flags: 64
        });
        return;
    }

    const joueur = playerDB.get(discord_id);

    if (joueur.classe !== 'aucune') {
        await interaction.update(builder.menuPrincipal(joueur));
        return;
    }

    playerDB.update(discord_id, { classe: classeId });
    spellsDB.initialiserSortsDepart(discord_id, classeId);

    const joueurMisAJour = playerDB.get(discord_id);
    await interaction.update(builder.menuPrincipal(joueurMisAJour));
    
};