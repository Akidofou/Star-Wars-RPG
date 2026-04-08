const playerDB = require('../../database/playerDB');
const builder = require('../builder');
const { db } = require('../../database/database');

module.exports = async (interaction, params) => {

    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const action = params[0];

    if (action === 'start') {
        if (joueur.hp_actuel >= joueur.hp_max) {
            await interaction.update(builder.repos(joueur));
            return;
        }

        db.prepare(`
            INSERT INTO repos (discord_id, debut_repos, hp_depart, hp_cible)
            VALUES (?, datetime('now'), ?, ?)
        `).run(discord_id, joueur.hp_actuel, joueur.hp_max);

        playerDB.update(discord_id, { etat: 'repos' });

        const hpManquants = joueur.hp_max - joueur.hp_actuel;
        const tempsTotal = hpManquants * 5;

        await interaction.update(builder.reposEnCours(joueur, tempsTotal));
        return;
    }

    if (action === 'stop') {
        const reposActif = db.prepare(`
            SELECT * FROM repos WHERE discord_id = ? ORDER BY id DESC LIMIT 1
        `).get(discord_id);

        if (reposActif) {
            const debut = new Date(reposActif.debut_repos + ' UTC');
            const maintenant = new Date();
            const secondesEcoulees = Math.floor((maintenant - debut) / 1000);
            const hpRegagnes = Math.min(
                Math.floor(secondesEcoulees / 5),
                joueur.hp_max - joueur.hp_actuel
            );
            const nouveauHP = Math.min(joueur.hp_actuel + hpRegagnes, joueur.hp_max);

            playerDB.update(discord_id, {
                hp_actuel: nouveauHP,
                etat: 'libre'
            });

            const joueurMisAJour = playerDB.get(discord_id);
            await interaction.update(builder.repos(joueurMisAJour));
        } else {
            playerDB.update(discord_id, { etat: 'libre' });
            await interaction.update(builder.repos(joueur));
        }
        return;
    }

    await interaction.reply({
        content: '❌ Action inconnue.',
        flags: 64
    });
};