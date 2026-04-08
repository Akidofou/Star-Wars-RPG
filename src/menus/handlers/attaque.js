const playerDB = require('../../database/playerDB');
const spellsDB = require('../../database/spellsDB');
const combatEngine = require('../../game/combat');
const builder = require('../builder');

module.exports = async (interaction, params) => {

    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const sortId = parseInt(params[0]);

    const combatActif = combatEngine.getCombatActif(discord_id);
    if (!combatActif) {
        await interaction.reply({ content: '❌ Aucun combat actif.', flags: 64 });
        return;
    }

    const sortData = spellsDB.getSortData(sortId);
    const sortJoueur = spellsDB.getSortsJoueur(discord_id).find(s => s.competence_id === sortId);
    const niveauSort = sortJoueur ? sortJoueur.niveau : 1;

    const enemyStats = combatActif.enemy_stats;
    const cooldownsJoueur = combatActif.cooldowns_joueur;
    const cooldownsEnnemi = combatActif.cooldowns_ennemi;
    const effetsJoueur = combatActif.effets_joueur;
    const effetsEnnemi = combatActif.effets_ennemi;

    let journal = [];

    const resultatJoueur = combatEngine.calculerDegats(sortData, niveauSort, joueur);
    let degatsJoueur = resultatJoueur.degats;

    if (resultatJoueur.echec) {
        journal.push(`❌ **Échec critique !** Votre ${sortData.nom} a raté !`);
    } else if (resultatJoueur.critique) {
        journal.push(`💥 **Coup critique !** ${sortData.nom} inflige **${degatsJoueur}** dégâts !`);
        enemyStats.hp = Math.max(0, enemyStats.hp - degatsJoueur);
    } else {
        journal.push(`⚔️ ${sortData.nom} inflige **${degatsJoueur}** dégâts !`);
        enemyStats.hp = Math.max(0, enemyStats.hp - degatsJoueur);
    }

    if (sortData.niveaux[niveauSort - 1].cooldown > 0) {
        cooldownsJoueur[sortId] = sortData.niveaux[niveauSort - 1].cooldown;
    }

    if (enemyStats.hp <= 0) {
        const enemyData = require('../../../data/enemies.json').enemies.find(e => e.id === combatActif.enemy_id);
        combatEngine.terminerCombat(combatActif.id, 'victoire');
        const recompenses = combatEngine.calculerRecompenses(enemyData, combatActif.enemy_niveau);

        const nouvelleXP = (parseInt(joueur.experience) || 0) + recompenses.xp;
        const nouvelOr = (parseInt(joueur.pieces_or) || 0) + recompenses.or;

        playerDB.update(discord_id, {
            experience: nouvelleXP,
            pieces_or: nouvelOr
        });

        journal.push(`\n🏆 **Victoire !** ${enemyData.nom} est vaincu !`);
        journal.push(`✨ +${recompenses.xp} XP | 💰 +${recompenses.or} pièces d'or`);
        
        const joueurMisAJour = playerDB.get(discord_id);
        const levelUp = require('../../game/levelUp');
        const resultatLevelUp = levelUp.appliquerLevelUp(playerDB, discord_id, joueurMisAJour);

        if (resultatLevelUp) {
            journal.push(`\n🌟 **NIVEAU SUPÉRIEUR !** Vous passez niveau ${resultatLevelUp.nouveauNiveau} !`);
            journal.push(`❤️ +${resultatLevelUp.hpBonus} HP max | 📊 +1 point de stat | 📚 +1 point de compétence`);
            if (resultatLevelUp.sortsDebloques.length > 0) {
                resultatLevelUp.sortsDebloques.forEach(s => {
                    journal.push(`✨ Nouveau sort débloqué : **${s.nom}** !`);
                });
            }
        }

        const joueurFinal = playerDB.get(discord_id);
        await interaction.update(builder.resultatCombat(joueurFinal, journal, 'victoire'));
        return;
    }

    const enemyData = require('../../../data/enemies.json').enemies.find(e => e.id === combatActif.enemy_id);
    const sortsEnnemi = enemyData.sorts;
    const sortEnnemiId = sortsEnnemi[Math.floor(Math.random() * sortsEnnemi.length)];
    const sortEnnemi = spellsDB.getSortData(sortEnnemiId);
    const niveauSortEnnemi = 1;

    const resultatEnnemi = combatEngine.calculerDegats(sortEnnemi, niveauSortEnnemi, enemyStats);
    let degatsEnnemi = resultatEnnemi.degats;

    if (resultatEnnemi.echec) {
        journal.push(`❌ **${enemyData.nom}** rate son attaque !`);
    } else if (resultatEnnemi.critique) {
        journal.push(`💥 **${enemyData.nom}** coup critique ! Vous subissez **${degatsEnnemi}** dégâts !`);
        playerDB.update(discord_id, { hp_actuel: Math.max(0, joueur.hp_actuel - degatsEnnemi) });
    } else {
        journal.push(`🗡️ **${enemyData.nom}** attaque avec ${sortEnnemi.nom} et inflige **${degatsEnnemi}** dégâts !`);
        playerDB.update(discord_id, { hp_actuel: Math.max(0, joueur.hp_actuel - degatsEnnemi) });
    }

    Object.keys(cooldownsJoueur).forEach(k => { if (cooldownsJoueur[k] > 0) cooldownsJoueur[k]--; });
    Object.keys(cooldownsEnnemi).forEach(k => { if (cooldownsEnnemi[k] > 0) cooldownsEnnemi[k]--; });

    const joueurMisAJour = playerDB.get(discord_id);

    if (joueurMisAJour.hp_actuel <= 0) {
        combatEngine.terminerCombat(combatActif.id, 'defaite');
        playerDB.update(discord_id, {
            hp_actuel: 0,
            position: 'ville',
            secteur_actuel: joueur.zone_actuelle
        });
        journal.push(`\n💀 **Défaite !** Vous avez été vaincu et renvoyé en ville.`);
        await interaction.update(builder.resultatCombat(joueurMisAJour, journal, 'defaite'));
        return;
    }

    db_update_combat(combatActif.id, enemyStats, cooldownsJoueur, cooldownsEnnemi, combatActif.tour + 1);

    const sorts = spellsDB.getSortsDisponibles(discord_id, joueur.classe, joueur.niveau);
    const combatMisAJour = combatEngine.getCombatActif(discord_id);
    await interaction.update(builder.combat(joueurMisAJour, combatMisAJour, enemyData, sorts, journal));

};

function db_update_combat(combatId, enemyStats, cooldownsJoueur, cooldownsEnnemi, tour) {
    const { db } = require('../../database/database');
    db.prepare(`
        UPDATE combats SET
            enemy_stats = ?,
            cooldowns_joueur = ?,
            cooldowns_ennemi = ?,
            tour = ?
        WHERE id = ?
    `).run(
        JSON.stringify(enemyStats),
        JSON.stringify(cooldownsJoueur),
        JSON.stringify(cooldownsEnnemi),
        tour,
        combatId
    );
}