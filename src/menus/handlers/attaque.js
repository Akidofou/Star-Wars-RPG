const playerDB = require('../../database/playerDB');
const spellsDB = require('../../database/spellsDB');
const combatEngine = require('../../game/combat');
const codexDB = require('../../database/codexDB');
const effects = require('../../game/effects');
const builder = require('../builder');
const dropsEngine = require('../../game/drops');
const tourJoueur = require('../../game/tourJoueur');

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
    const niveauData = sortData.niveaux[niveauSort - 1];

    // ============================================================
    // VÉRIFICATION DES PA
    // ============================================================

    const paRestants = combatActif.pa_joueur;
    const coutPA = niveauData.cout_pa || 3;
    if (paRestants < coutPA) {
        await interaction.reply({
            content: `❌ Pas assez de PA ! Ce sort coûte **${coutPA} PA** et vous n'en avez que **${paRestants}**.`,
            flags: 64
        });
        return;
    }

    const nouveauxPA = paRestants - coutPA;
    const enemyData = require('../../../data/enemies.json').enemies.find(e => e.id === combatActif.enemy_id);
    let enemyStats = combatActif.enemy_stats;
    const cooldownsJoueur = combatActif.cooldowns_joueur;
    const cooldownsEnnemi = combatActif.cooldowns_ennemi;
    let effetsJoueur = combatActif.effets_joueur;
    let effetsEnnemi = combatActif.effets_ennemi;
    let journal = [];

    // ============================================================
    // EFFETS DU JOUEUR — uniquement au premier sort du tour
    // ============================================================

    if (paRestants === (joueur.pa_max || 6)) {
        const { effetsRestants: effetsJoueurRestants, hpChange: hpChangeJoueur } =
            effects.traiterEffetsDebutTour(effetsJoueur, joueur, journal, joueur.username, effetsJoueur);
        effetsJoueur = effetsJoueurRestants;
        if (hpChangeJoueur !== 0) {
            const nouveauHP = Math.max(0, Math.min(joueur.hp_actuel + hpChangeJoueur, joueur.hp_max));
            playerDB.update(discord_id, { hp_actuel: nouveauHP });
        }

        const nouvelleDecouverte = codexDB.decouvrir(discord_id, 'monstre', combatActif.enemy_id);
        if (nouvelleDecouverte) journal.push(`📚 **Nouveau !** ${enemyData.nom} ajouté à votre Codex !`);

        // Défaite par effets du joueur
        const joueurApresEffets = playerDB.get(discord_id);
        if (joueurApresEffets.hp_actuel <= 0) {
            combatEngine.terminerCombat(combatActif.id, 'defaite');
            playerDB.update(discord_id, { hp_actuel: 0, position: 'ville' });
            journal.push(`\n💀 **Défaite !** Vous avez été vaincu par les effets et renvoyé en ville.`);
            await interaction.update(builder.resultatCombat(joueurApresEffets, journal, 'defaite'));
            return;
        }
    }

    const joueurApresEffets = playerDB.get(discord_id);

    // ============================================================
    // TOUR DU JOUEUR
    // ============================================================

    const resultatJoueur = await tourJoueur(
        discord_id, joueurApresEffets, sortData, niveauSort, niveauData,
        enemyData, enemyStats, effetsJoueur, effetsEnnemi, journal
    );
    enemyStats = resultatJoueur.enemyStats;
    effetsJoueur = resultatJoueur.effetsJoueur;
    effetsEnnemi = resultatJoueur.effetsEnnemi;

    if (niveauData.cooldown > 0) cooldownsJoueur[sortId] = niveauData.cooldown;

    // Victoire après attaque joueur
    if (enemyStats.hp <= 0) {
        combatEngine.terminerCombat(combatActif.id, 'victoire');
        const recompenses = combatEngine.calculerRecompenses(enemyData, combatActif.enemy_niveau);
        playerDB.update(discord_id, {
            experience: (parseInt(joueurApresEffets.experience) || 0) + recompenses.xp,
            pieces_or: (joueurApresEffets.pieces_or || 0) + recompenses.or
        });
        journal.push(`\n🏆 **Victoire !** ${enemyData.nom} est vaincu !`);
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

    // ============================================================
    // SAUVEGARDER ET ATTENDRE QUE LE JOUEUR PASSE SON TOUR
    // ============================================================

    db_update_combat(
        combatActif.id, enemyStats, cooldownsJoueur, cooldownsEnnemi,
        effetsJoueur, effetsEnnemi, combatActif.tour, nouveauxPA, combatActif.pa_ennemi
    );

    const combatMisAJour = combatEngine.getCombatActif(discord_id);
    const sorts = spellsDB.getSortsDisponibles(discord_id, joueur.classe, joueur.niveau);
    await interaction.update(builder.combat(playerDB.get(discord_id), combatMisAJour, enemyData, sorts, journal));
};

function db_update_combat(combatId, enemyStats, cooldownsJoueur, cooldownsEnnemi, effetsJoueur, effetsEnnemi, tour, pa_joueur, pa_ennemi) {
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
        JSON.stringify(enemyStats),
        JSON.stringify(cooldownsJoueur),
        JSON.stringify(cooldownsEnnemi),
        JSON.stringify(effetsJoueur),
        JSON.stringify(effetsEnnemi),
        tour,
        pa_joueur,
        pa_ennemi,
        combatId
    );
}