const playerDB = require('../../database/playerDB');
const spellsDB = require('../../database/spellsDB');
const combatEngine = require('../../game/combat');
const effects = require('../../game/effects');
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
    const niveauData = sortData.niveaux[niveauSort - 1];

    const enemyStats = combatActif.enemy_stats;
    const cooldownsJoueur = combatActif.cooldowns_joueur;
    const cooldownsEnnemi = combatActif.cooldowns_ennemi;
    let effetsJoueur = combatActif.effets_joueur;
    let effetsEnnemi = combatActif.effets_ennemi;

    let journal = [];

    // ============================================================
    // EFFETS DE DÉBUT DE TOUR
    // ============================================================

    const { effetsRestants: effetsJoueurRestants, hpChange: hpChangeJoueur } =
        effects.traiterEffetsDebutTour(effetsJoueur, joueur, journal, joueur.username, effetsJoueur);
    effetsJoueur = effetsJoueurRestants;
    if (hpChangeJoueur !== 0) {
        const nouveauHP = Math.max(0, Math.min(joueur.hp_actuel + hpChangeJoueur, joueur.hp_max));
        playerDB.update(discord_id, { hp_actuel: nouveauHP });
    }

    const enemyData = require('../../../data/enemies.json').enemies.find(e => e.id === combatActif.enemy_id);
    const { effetsRestants: effetsEnnemiRestants, hpChange: hpChangeEnnemi } =
        effects.traiterEffetsDebutTour(effetsEnnemi, enemyStats, journal, enemyData.nom, effetsEnnemi);
    effetsEnnemi = effetsEnnemiRestants;
    if (hpChangeEnnemi !== 0) {
        enemyStats.hp = Math.max(0, enemyStats.hp + hpChangeEnnemi);
    }

    // Victoire par effets de début de tour
    if (enemyStats.hp <= 0) {
        combatEngine.terminerCombat(combatActif.id, 'victoire');
        const recompenses = combatEngine.calculerRecompenses(enemyData, combatActif.enemy_niveau);
        playerDB.update(discord_id, {
            experience: (parseInt(joueur.experience) || 0) + recompenses.xp,
            pieces_or: (joueur.pieces_or || 0) + recompenses.or
        });
        journal.push(`\n🏆 **Victoire !** ${enemyData.nom} est vaincu par les effets !`);
        journal.push(`✨ +${recompenses.xp} XP | 💰 +${recompenses.or} pièces d'or`);
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

    // Défaite par effets de début de tour
    const joueurApresEffets = playerDB.get(discord_id);
    if (joueurApresEffets.hp_actuel <= 0) {
        combatEngine.terminerCombat(combatActif.id, 'defaite');
        playerDB.update(discord_id, { hp_actuel: 0, position: 'ville' });
        journal.push(`\n💀 **Défaite !** Vous avez été vaincu par les effets et renvoyé en ville.`);
        await interaction.update(builder.resultatCombat(joueurApresEffets, journal, 'defaite'));
        return;
    }

    // ============================================================
    // TOUR DU JOUEUR
    // ============================================================

    // Stats joueur modifiées par les effets actifs
    const modStatJoueur = effects.getModificateursStats(effetsJoueur);
    const statsJoueurModifiees = { ...joueurApresEffets };
    Object.entries(modStatJoueur.bonusStats).forEach(([stat, bonus]) => {
        statsJoueurModifiees[stat] = (statsJoueurModifiees[stat] || 0) + bonus;
    });

    const modDegatsJoueur = effects.getModificateursDegats(effetsJoueur);

    // Sort offensif joueur → ennemi
    if (sortData.type === 'attaque' || sortData.type === 'attaque_effet' || sortData.type === 'attaque_multiple') {
        const resultatJoueur = combatEngine.calculerDegats(sortData, niveauSort, statsJoueurModifiees);

        if (resultatJoueur.echec) {
            journal.push(`❌ **Échec !** Votre **${sortData.nom}** a raté !`);
        } else {
            let degatsJoueur = resultatJoueur.degats;
            if (modDegatsJoueur.bonusPct > 0) {
                degatsJoueur = Math.round(degatsJoueur * (1 + modDegatsJoueur.bonusPct / 100));
            }

            const element = sortData.composantes ? sortData.composantes[0].element : 'neutre';
            const resultatDefenseEnnemi = effects.appliquerDegatsAvecDefense(degatsJoueur, element, effetsEnnemi);

            if (resultatDefenseEnnemi.esquive) {
                journal.push(`💨 **${enemyData.nom}** esquive **${sortData.nom}** !`);
            } else if (resultatDefenseEnnemi.immune) {
                journal.push(`🛡️ **${enemyData.nom}** est immunisé ! **${sortData.nom}** est bloqué !`);
            } else {
                const degatsApresDefense = resultatDefenseEnnemi.degats;
                enemyStats.hp = Math.max(0, enemyStats.hp - degatsApresDefense);
                const ligneDetail = resultatJoueur.detail && resultatJoueur.detail.length > 1
                    ? `\n　　*(${resultatJoueur.detail.map(d => `${d.degats} ${d.element}`).join(' + ')})*`
                    : '';
                if (resultatJoueur.critique) {
                    journal.push(`💥 **Coup critique !** ${sortData.nom} inflige **${degatsApresDefense}** dégâts !${ligneDetail}`);
                } else {
                    journal.push(`⚔️ **${sortData.nom}** inflige **${degatsApresDefense}** dégâts !${ligneDetail}`);
                }
                if (resultatDefenseEnnemi.montantTotalBloque > 0) {
                    journal.push(`　　*🛡️ ${enemyData.nom} bloque **${resultatDefenseEnnemi.montantTotalBloque}** dégâts sur **${resultatDefenseEnnemi.montantTotalBloque + degatsApresDefense}** !*`);
                }
            }

            // Effets du sort offensif sur l'ennemi
            if (sortData.type === 'attaque_effet') {
                const nouveauxEffets = effects.appliquerEffetSort(sortData, niveauData, statsJoueurModifiees, 'ennemi');
                nouveauxEffets.forEach(effet => {
                    journal.push(`✨ ${descriptionEffet(effet, enemyData.nom)}`);
                });
                effetsEnnemi = [...effetsEnnemi, ...nouveauxEffets];
            }
        }
    }

    // Sort debuff joueur → ennemi
    if (sortData.type === 'debuff') {
        const nouveauxEffets = effects.appliquerEffetSort(sortData, niveauData, statsJoueurModifiees, 'ennemi');
        nouveauxEffets.forEach(effet => {
            journal.push(`✨ ${descriptionEffet(effet, enemyData.nom)}`);
        });
        effetsEnnemi = [...effetsEnnemi, ...nouveauxEffets];
    }

    // Sort buff/soin joueur → soi-même
    if (sortData.type === 'buff' || sortData.type === 'soin') {
        const nouveauxEffets = effects.appliquerEffetSort(sortData, niveauData, statsJoueurModifiees, 'joueur');
        for (const effet of nouveauxEffets) {
            if (effet.type === 'soin') {
                const joueurPourSoin = playerDB.get(discord_id);
                const nouveauHP = Math.min(joueurPourSoin.hp_actuel + effet.valeur, joueurPourSoin.hp_max);
                playerDB.update(discord_id, { hp_actuel: nouveauHP });
                journal.push(`💚 **${sortData.nom}** vous soigne de **${effet.valeur}** HP !`);
            } else if (effet.type === 'perte_hp_immediate') {
                const joueurPourHP = playerDB.get(discord_id);
                const nouveauHP = Math.max(0, joueurPourHP.hp_actuel - effet.valeur);
                playerDB.update(discord_id, { hp_actuel: nouveauHP });
                journal.push(`💔 **${sortData.nom}** vous coûte **${effet.valeur}** HP !`);
            } else {
                journal.push(`✨ ${descriptionEffet(effet, 'vous')}`);
                effetsJoueur = [...effetsJoueur, effet];
            }
        }
    }

    // Cooldown sort joueur
    if (niveauData.cooldown > 0) {
        cooldownsJoueur[sortId] = niveauData.cooldown;
    }

    // Victoire après tour joueur
    if (enemyStats.hp <= 0) {
        combatEngine.terminerCombat(combatActif.id, 'victoire');
        const recompenses = combatEngine.calculerRecompenses(enemyData, combatActif.enemy_niveau);
        playerDB.update(discord_id, {
            experience: (parseInt(joueurApresEffets.experience) || 0) + recompenses.xp,
            pieces_or: (joueurApresEffets.pieces_or || 0) + recompenses.or
        });
        journal.push(`\n🏆 **Victoire !** ${enemyData.nom} est vaincu !`);
        journal.push(`✨ +${recompenses.xp} XP | 💰 +${recompenses.or} pièces d'or`);
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
    // TOUR DE L'ENNEMI
    // ============================================================

    const sortsEnnemiDispo = enemyData.sorts.filter(sid => !cooldownsEnnemi[sid] || cooldownsEnnemi[sid] <= 0);
    const sortEnnemiId = sortsEnnemiDispo.length > 0
        ? sortsEnnemiDispo[Math.floor(Math.random() * sortsEnnemiDispo.length)]
        : enemyData.sorts[0];
    const sortEnnemi = spellsDB.getSortData(sortEnnemiId);
    const niveauSortEnnemi = combatActif.enemy_niveau;
    const niveauDataEnnemi = sortEnnemi.niveaux.find(n => n.niveau === niveauSortEnnemi) || sortEnnemi.niveaux[0];

    // Stats ennemi modifiées par les effets actifs
    const modStatEnnemi = effects.getModificateursStats(effetsEnnemi);
    const statsEnnemiModifiees = { ...enemyStats };
    Object.entries(modStatEnnemi.bonusStats).forEach(([stat, bonus]) => {
        statsEnnemiModifiees[stat] = (statsEnnemiModifiees[stat] || 0) + bonus;
    });

    const modDegatsEnnemi = effects.getModificateursDegats(effetsEnnemi);
    const joueurAvantTourEnnemi = playerDB.get(discord_id);

    // Sort offensif ennemi → joueur
    if (sortEnnemi.type === 'attaque' || sortEnnemi.type === 'attaque_effet' || sortEnnemi.type === 'attaque_multiple') {
        const resultatEnnemi = combatEngine.calculerDegats(sortEnnemi, niveauSortEnnemi, statsEnnemiModifiees);

        if (resultatEnnemi.echec) {
            journal.push(`❌ **${enemyData.nom}** rate son attaque !`);
        } else {
            let degatsEnnemi = resultatEnnemi.degats;
            if (modDegatsEnnemi.bonusPct > 0) {
                degatsEnnemi = Math.round(degatsEnnemi * (1 + modDegatsEnnemi.bonusPct / 100));
            }

            const elementEnnemi = sortEnnemi.composantes ? sortEnnemi.composantes[0].element : 'neutre';
            const resultatDefenseJoueur = effects.appliquerDegatsAvecDefense(degatsEnnemi, elementEnnemi, effetsJoueur);
            const degatsApresDefenseJoueur = resultatDefenseJoueur.degats;

            if (resultatDefenseJoueur.esquive) {
                journal.push(`💨 Vous esquivez l'attaque de **${enemyData.nom}** !`);
            } else if (resultatDefenseJoueur.immune) {
                journal.push(`🛡️ Vous êtes immunisé ! L'attaque de **${enemyData.nom}** est bloquée !`);
            } else {
                const nouveauHPJoueur = Math.max(0, joueurAvantTourEnnemi.hp_actuel - degatsApresDefenseJoueur);
                playerDB.update(discord_id, { hp_actuel: nouveauHPJoueur });
                const ligneDetailEnnemi = resultatEnnemi.detail && resultatEnnemi.detail.length > 1
                    ? `\n　　*(${resultatEnnemi.detail.map(d => `${d.degats} ${d.element}`).join(' + ')})*`
                    : '';
                if (resultatEnnemi.critique) {
                    journal.push(`💥 **${enemyData.nom}** coup critique avec **${sortEnnemi.nom}** ! Vous subissez **${degatsApresDefenseJoueur}** dégâts !${ligneDetailEnnemi}`);
                } else {
                    journal.push(`🗡️ **${enemyData.nom}** attaque avec **${sortEnnemi.nom}** et inflige **${degatsApresDefenseJoueur}** dégâts !${ligneDetailEnnemi}`);
                }
                if (resultatDefenseJoueur.montantTotalBloque > 0) {
                    journal.push(`　　*🛡️ Vous bloquez **${resultatDefenseJoueur.montantTotalBloque}** dégâts sur **${resultatDefenseJoueur.montantTotalBloque + degatsApresDefenseJoueur}** !*`);
                }
            }

            // Effets du sort offensif ennemi sur le joueur
            if (sortEnnemi.type === 'attaque_effet') {
                const nouveauxEffets = effects.appliquerEffetSort(sortEnnemi, niveauDataEnnemi, statsEnnemiModifiees, 'joueur');
                nouveauxEffets.forEach(effet => {
                    journal.push(`✨ ${descriptionEffet(effet, 'vous')}`);
                });
                effetsJoueur = [...effetsJoueur, ...nouveauxEffets];
            }
        }
    }

    // Sort debuff ennemi → joueur
    if (sortEnnemi.type === 'debuff') {
        const nouveauxEffets = effects.appliquerEffetSort(sortEnnemi, niveauDataEnnemi, statsEnnemiModifiees, 'joueur');
        nouveauxEffets.forEach(effet => {
            journal.push(`✨ ${descriptionEffet(effet, 'vous')}`);
        });
        effetsJoueur = [...effetsJoueur, ...nouveauxEffets];
    }

    // Sort buff/soin ennemi → soi-même
    if (sortEnnemi.type === 'buff' || sortEnnemi.type === 'soin') {
        const nouveauxEffets = effects.appliquerEffetSort(sortEnnemi, niveauDataEnnemi, statsEnnemiModifiees, 'ennemi');
        for (const effet of nouveauxEffets) {
            if (effet.type === 'soin') {
                enemyStats.hp = Math.min(enemyStats.hp + effet.valeur, enemyStats.hp_depart || enemyStats.hp_max);
                journal.push(`💚 **${enemyData.nom}** se soigne de **${effet.valeur}** HP !`);
            } else if (effet.type === 'perte_hp_immediate') {
                enemyStats.hp = Math.max(0, enemyStats.hp - effet.valeur);
                journal.push(`💔 **${enemyData.nom}** perd **${effet.valeur}** HP !`);
            } else {
                journal.push(`✨ ${descriptionEffet(effet, enemyData.nom)}`);
                effetsEnnemi = [...effetsEnnemi, effet];
            }
        }
    }

    // Cooldown sort ennemi
    if (niveauDataEnnemi.cooldown > 0) {
        cooldownsEnnemi[sortEnnemiId] = niveauDataEnnemi.cooldown;
    }

    // ============================================================
    // FIN DE TOUR
    // ============================================================

    Object.keys(cooldownsJoueur).forEach(k => { if (cooldownsJoueur[k] > 0) cooldownsJoueur[k]--; });
    Object.keys(cooldownsEnnemi).forEach(k => { if (cooldownsEnnemi[k] > 0) cooldownsEnnemi[k]--; });

    const joueurFinal = playerDB.get(discord_id);

    if (joueurFinal.hp_actuel <= 0) {
        combatEngine.terminerCombat(combatActif.id, 'defaite');
        playerDB.update(discord_id, { hp_actuel: 0, position: 'ville' });
        journal.push(`\n💀 **Défaite !** Vous avez été vaincu et renvoyé en ville.`);
        await interaction.update(builder.resultatCombat(joueurFinal, journal, 'defaite'));
        return;
    }

    db_update_combat(combatActif.id, enemyStats, cooldownsJoueur, cooldownsEnnemi, effetsJoueur, effetsEnnemi, combatActif.tour + 1);

    const sorts = spellsDB.getSortsDisponibles(discord_id, joueur.classe, joueur.niveau);
    const combatMisAJour = combatEngine.getCombatActif(discord_id);
    await interaction.update(builder.combat(joueurFinal, combatMisAJour, enemyData, sorts, journal));
};

function db_update_combat(combatId, enemyStats, cooldownsJoueur, cooldownsEnnemi, effetsJoueur, effetsEnnemi, tour) {
    const { db } = require('../../database/database');
    db.prepare(`
        UPDATE combats SET
            enemy_stats = ?,
            cooldowns_joueur = ?,
            cooldowns_ennemi = ?,
            effets_joueur = ?,
            effets_ennemi = ?,
            tour = ?
        WHERE id = ?
    `).run(
        JSON.stringify(enemyStats),
        JSON.stringify(cooldownsJoueur),
        JSON.stringify(cooldownsEnnemi),
        JSON.stringify(effetsJoueur),
        JSON.stringify(effetsEnnemi),
        tour,
        combatId
    );
}

function descriptionEffet(effet, cible) {
    const NOMS_STATS = {
        force_stat: 'Force',
        intelligence: 'Intelligence',
        chance: 'Chance',
        agilite: 'Agilité',
        vitalite: 'Vitalité'
    };

    switch (effet.type) {
        case 'brulure':
            return `🔥 **${effet.source_nom}** brûle **${cible}** de **${effet.valeur}** dégâts/tour pendant **${effet.duree}** tours !`;
        case 'poison':
            return `☠️ **${effet.source_nom}** empoisonne **${cible}** de **${effet.valeur}** dégâts/tour pendant **${effet.duree}** tours !`;
        case 'saignement':
            return `🩸 **${effet.source_nom}** fait saigner **${cible}** de **${effet.valeur}** dégâts/tour pendant **${effet.duree}** tours !`;
        case 'debuff_stat':
            return `📉 **${effet.source_nom}** réduit la **${NOMS_STATS[effet.stat] || effet.stat}** de **${cible}** de **${Math.abs(effet.valeur)}** pendant **${effet.duree}** tours !`;
        case 'debuff_toutes_stats':
            return `📉 **${effet.source_nom}** réduit toutes les stats de **${cible}** de **${Math.abs(effet.valeur)}** pendant **${effet.duree}** tours !`;
        case 'bonus_degats_pct':
            return `⚡ **${effet.source_nom}** augmente les dégâts de **${cible}** de **${effet.valeur}%** pendant **${effet.duree}** tours !`;
        case 'bonus_stat':
            return `📈 **${effet.source_nom}** augmente la **${NOMS_STATS[effet.stat] || effet.stat}** de **${cible}** de **${effet.valeur}** pendant **${effet.duree}** tours !`;
        case 'bonus_vitalite':
            return `❤️ **${effet.source_nom}** augmente la Vitalité de **${cible}** de **${effet.valeur}** pendant **${effet.duree}** tours !`;
        case 'bonus_cc':
            return `🎯 **${effet.source_nom}** améliore les critiques de **${cible}** pendant **${effet.duree}** tours !`;
        case 'resistance_element':
            return `🛡️ **${effet.source_nom}** réduit les dégâts **${effet.element}** reçus par **${cible}** de **${Math.abs(effet.valeur)}** pendant **${effet.duree}** tours !`;
        case 'resistance_tous':
            return `🛡️ **${effet.source_nom}** réduit tous les dégâts reçus par **${cible}** de **${Math.abs(effet.valeur)}** pendant **${effet.duree}** tours !`;
        case 'resistance_tous_pct':
            return `🛡️ **${effet.source_nom}** réduit tous les dégâts reçus par **${cible}** de **${effet.valeur}%** pendant **${effet.duree}** tours !`;
        case 'absorption_degats':
            return `🛡️ **${effet.source_nom}** absorbe jusqu'à **${effet.valeur}** dégâts pour **${cible}** pendant **${effet.duree}** tours !`;
        case 'perte_hp_par_tour':
            return `💔 **${effet.source_nom}** inflige **${effet.valeur}** HP/tour à **${cible}** pendant **${effet.duree}** tours !`;
        case 'soin_par_tour':
            return `💚 **${effet.source_nom}** soigne **${cible}** de **${effet.valeur}** HP/tour pendant **${effet.duree}** tours !`;
        case 'vol_stat':
            return `🔄 **${effet.source_nom}** vole **${effet.valeur}** points de **${NOMS_STATS[effet.stat] || effet.stat}** à **${cible}** pendant **${effet.duree}** tours !`;
        case 'bonus_degats_hp_manquants':
            return `⚡ **${effet.source_nom}** augmente les dégâts de **${cible}** selon ses HP manquants pendant **${effet.duree}** tours !`;
        case 'immunite_degats':
            return `🛡️ **${effet.source_nom}** rend **${cible}** immunisé aux dégâts pendant **${effet.duree}** tours !`;
        case 'esquive_attaques':
            return `💨 **${effet.source_nom}** permet à **${cible}** d'esquiver **${effet.nb_esquives}** attaque(s) pendant **${effet.duree}** tours !`;
        case 'multiplicateur_effets':
            return `✨ **${effet.source_nom}** multiplie l'efficacité des sorts de **${cible}** par **${effet.valeur}** pendant **${effet.duree}** tours !`;
        case 'reduction_ec':
            return `🎯 **${effet.source_nom}** réduit les chances d'échec de **${cible}** pendant **${effet.duree}** tours !`;
        case 'bonus_degats_element_pct':
            return `⚡ **${effet.source_nom}** augmente les dégâts **${effet.element}** de **${cible}** de **${effet.valeur}%** pendant **${effet.duree}** tours !`;
        default:
            return `✨ **${effet.source_nom}** applique un effet sur **${cible}** pendant **${effet.duree}** tours !`;
    }
}