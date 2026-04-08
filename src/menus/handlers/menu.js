const playerDB = require('../../database/playerDB');
const builder = require('../builder');
const levelUp = require('../../game/levelUp');

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
        const progression = levelUp.getProgression(joueur);
        await interaction.update(builder.profil(joueur, progression));
    } else if (action === 'lieux') {
        const zonesHelper = require('../../utils/zonesHelper');
        const duche = zonesHelper.getDuche(joueur.zone_actuelle);
        const comte = zonesHelper.getComte(joueur.zone_actuelle, joueur.secteur_actuel);
        const secteur = joueur.position === 'ville'
            ? null
            : zonesHelper.getSecteur(joueur.zone_actuelle, joueur.secteur_actuel, joueur.position);
        const voyages = zonesHelper.getVoyagesDisponibles(joueur.zone_actuelle, joueur.secteur_actuel);
        await interaction.update(builder.lieux(joueur, duche, comte, secteur, voyages));
    } else if (action === 'codex') {
        const entrees = playerDB.getCodex(discord_id);
        await interaction.update(builder.codex(joueur, entrees));
    } else if (action === 'classement') {
        const classement = playerDB.getClassement();
        await interaction.update(builder.classement(classement, joueur));
    } else if (action === 'repos') {
        if (joueur.etat === 'repos') {
            const { db } = require('../../database/database');
            const reposActif = db.prepare('SELECT * FROM repos WHERE discord_id = ? ORDER BY id DESC LIMIT 1').get(discord_id);
            const debut = new Date(reposActif.debut_repos + ' UTC');
            const maintenant = new Date();
            const secondesEcoulees = Math.floor((maintenant - debut) / 1000);
            const hpRegagnes = Math.min(Math.floor(secondesEcoulees / 5), joueur.hp_max - reposActif.hp_depart);
            const hpActuelEstime = Math.min(reposActif.hp_depart + hpRegagnes, joueur.hp_max);
            const hpRestants = joueur.hp_max - hpActuelEstime;
            const tempsRestant = hpRestants * 5;
            await interaction.update(builder.reposEnCours(joueur, tempsRestant, hpActuelEstime));
        } else {
            await interaction.update(builder.repos(joueur));
        } 
        
    } else {
        await interaction.update({
            content: '🚧 Cette section est en cours de construction.',
            embeds: [],
            components: [],
            flags: 64
        });
    }
};