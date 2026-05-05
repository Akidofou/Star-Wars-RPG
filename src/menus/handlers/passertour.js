const playerDB = require('../../database/playerDB');
const spellsDB = require('../../database/spellsDB');
const combatEngine = require('../../game/combat');
const builder = require('../builder');
const dropsEngine = require('../../game/drops');
const tourEnnemi = require('../../game/tourEnnemi');

module.exports = async (interaction, discord_id, joueur) => {

    const combatActif = combatEngine.getCombatActif(discord_id);
    if (!combatActif) {
        await interaction.reply({ content: '❌ Aucun combat actif.', flags: 64 });
        return;
    }

    const enemyData = require('../../../data/enemies.json').enemies.find(e => e.id === combatActif.enemy_id);
    let enemyStats = combatActif.enemy_stats;
    const cooldownsJoueur = combatActif.cooldowns_joueur;
    const cooldownsEnnemi = combatActif.cooldowns_ennemi;
    let effetsJoueur = combatActif.effets_joueur;
    let effetsEnnemi = combatActif.effets_ennemi;
    let journal = [];

    journal.push(`⏭️ **Vous passez votre tour.**`);

    // ============================================================
    // TOUR DE L'ENNEMI
    // ============================================================

    const resultatEnnemi = await tourEnnemi(
        discord_id, combatActif, enemyData, enemyStats,
        cooldownsJoueur, cooldownsEnnemi, effetsJoueur, effetsEnnemi, journal
    );

    // Victoire par effets sur le monstre
    if (resultatEnnemi.victoireEffets) {
        combatEngine.terminerCombat(combatActif.id, 'victoire');
        const recompenses = combatEngine.calculerRecompenses(enemyData, combatActif.enemy_niveau);
        playerDB.update(discord_id, {
            experience: (parseInt(joueur.experience) || 0) + recompenses.xp,
            pieces_or: (joueur.pieces_or || 0) + recompenses.or
        });
        journal.push(`\n🏆 **Victoire !** ${enemyData.nom} est vaincu par les effets !`);
        journal.push(`✨ +${recompenses.xp} XP | 💰 +${recompenses.or} pièces d'or`);
        dropsEngine.appliquerDrops(discord_id, enemyData, journal);
        const joueurMisAJour = playerDB.get(discord_id);
        const levelUp = require('../../game/levelUp');
        const resultatLevelUp = levelUp.appliquerLevelUp(playerDB, discord_id, joueurMisAJour);
        if (resultatLevelUp) {
            journal.push(`\n🌟 **NIVEAU SUPÉRIEUR !** Vous passez niveau ${resultatLevelUp.nouveauNiveau} !`);
            journal.push(`❤️ +${resultatLevelUp.hpBonus} HP max | 📊 +5 points de stat | 📚 +1 point de compétence`);
            resultatLevelUp.sortsDebloques.forEach(s => journal.push(`✨ Nouveau sort débloqué : **${s.nom}** !`));
        }
        await interaction.update(builder.resultatCombat(playerDB.get(discord_id), journal, 'victoire'));
        return;
    }

    // Défaite
    if (resultatEnnemi.defaite) {
        combatEngine.terminerCombat(combatActif.id, 'defaite');
        playerDB.update(discord_id, { hp_actuel: 0, position: 'ville' });
        journal.push(`\n💀 **Défaite !** Vous avez été vaincu et renvoyé en ville.`);
        await interaction.update(builder.resultatCombat(resultatEnnemi.joueurFinal, journal, 'defaite'));
        return;
    }

    // ============================================================
    // FIN DE TOUR — Réinitialiser les PA et cooldowns
    // ============================================================

    Object.keys(cooldownsJoueur).forEach(k => { if (cooldownsJoueur[k] > 0) cooldownsJoueur[k]--; });
    Object.keys(resultatEnnemi.cooldownsEnnemi).forEach(k => { if (resultatEnnemi.cooldownsEnnemi[k] > 0) resultatEnnemi.cooldownsEnnemi[k]--; });

    const joueurFinal = playerDB.get(discord_id);
    const paMaxJoueur = joueurFinal.pa_max || 6;

    const { db } = require('../../database/database');
    db.prepare(`
        UPDATE combats SET
            enemy_stats = ?,
            cooldowns_joueur = ?,
            cooldowns_ennemi = ?,
            effets_joueur = ?,
            effets_ennemi = ?,
            tour = ?,
            pa_joueur = ?,
            pa_ennemi = ?
        WHERE id = ?
    `).run(
        JSON.stringify(resultatEnnemi.enemyStats),
        JSON.stringify(cooldownsJoueur),
        JSON.stringify(resultatEnnemi.cooldownsEnnemi),
        JSON.stringify(resultatEnnemi.effetsJoueur),
        JSON.stringify(resultatEnnemi.effetsEnnemi),
        combatActif.tour + 1,
        paMaxJoueur,
        resultatEnnemi.paMaxEnnemi,
        combatActif.id
    );

    const sorts = spellsDB.getSortsDisponibles(discord_id, joueur.classe, joueur.niveau);
    const combatMisAJour = combatEngine.getCombatActif(discord_id);
    await interaction.update(builder.combat(joueurFinal, combatMisAJour, enemyData, sorts, journal));
};