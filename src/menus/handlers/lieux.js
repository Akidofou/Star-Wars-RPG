const playerDB = require('../../database/playerDB');
const builder = require('../builder');
const zonesHelper = require('../../utils/zonesHelper');
const combatEngine = require('../../game/combat');
const spellsDB = require('../../database/spellsDB');

module.exports = async (interaction, params) => {

    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const action = params[0];

    if (action === 'ville') {
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
            return;
        }

        playerDB.update(discord_id, { position: 'ville' });
        const joueurMisAJour = playerDB.get(discord_id);
        const duche = zonesHelper.getDuche(joueurMisAJour.zone_actuelle);
        const comte = zonesHelper.getComte(joueurMisAJour.zone_actuelle, joueurMisAJour.secteur_actuel);
        await interaction.update(builder.lieux(joueurMisAJour, duche, comte, null, []));
        return;
    }

    if (action === 'combat') {
        if (joueur.etat === 'repos') {
            await interaction.update({
                content: '❌ Vous êtes en repos ! Arrêtez le repos avant de combattre.',
                embeds: [],
                components: [],
                flags: 64
            });
            return;
        }

        const combatActif = combatEngine.getCombatActif(discord_id);
        const sorts = spellsDB.getSortsDisponibles(discord_id, joueur.classe, joueur.niveau);
        
        if (combatActif) {
            const enemyData = require('../../../data/enemies.json').enemies.find(e => e.id === combatActif.enemy_id);
            await interaction.update(builder.combat(joueur, combatActif, enemyData, sorts));
            return;
        }

        const resultat = combatEngine.choisirEnemyAleatoire(
            joueur.zone_actuelle,
            joueur.secteur_actuel,
            joueur.position
        );

        if (!resultat) {
            await interaction.update({
                content: '❌ Aucun ennemi disponible dans ce secteur.',
                embeds: [],
                components: [],
                flags: 64
            });
            return;
        }

        const nouveauCombat = combatEngine.creerCombat(discord_id, resultat.enemy, resultat.variante);
        const enemyData = require('../../../data/enemies.json').enemies.find(e => e.id === nouveauCombat.enemy_id);
        await interaction.update(builder.combat(joueur, nouveauCombat, enemyData, sorts));
        return;
    }

    await interaction.reply({
        content: '🚧 Cette action sera disponible prochainement.',
        flags: 64
    });

};