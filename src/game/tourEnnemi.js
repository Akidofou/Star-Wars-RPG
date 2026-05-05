const playerDB = require('../database/playerDB');
const spellsDB = require('../database/spellsDB');
const combatEngine = require('./combat');
const effects = require('./effects');

module.exports = async function tourEnnemi(discord_id, combatActif, enemyData, enemyStats, cooldownsJoueur, cooldownsEnnemi, effetsJoueur, effetsEnnemi, journal) {

    // ============================================================
    // EFFETS DU MONSTRE — au début de son tour
    // ============================================================

    const { effetsRestants: effetsEnnemiRestants, hpChange: hpChangeEnnemi } =
        effects.traiterEffetsDebutTour(effetsEnnemi, enemyStats, journal, enemyData.nom, effetsEnnemi);
    effetsEnnemi = effetsEnnemiRestants;
    if (hpChangeEnnemi !== 0) {
        enemyStats.hp = Math.max(0, enemyStats.hp + hpChangeEnnemi);
    }

    // Victoire par effets sur le monstre
    if (enemyStats.hp <= 0) {
        return {
            victoireEffets: true,
            defaite: false,
            enemyStats, cooldownsJoueur, cooldownsEnnemi, effetsJoueur, effetsEnnemi,
            paMaxEnnemi: 6
        };
    }

    // ============================================================
    // TOUR DE L'ENNEMI
    // ============================================================

    const variante = enemyData.variantes.find(v => v.niveau === combatActif.enemy_niveau) || enemyData.variantes[0];
    let paEnnemi = variante.pa || 6;

    while (paEnnemi > 0) {
        const sortsEnnemiDispo = enemyData.sorts.filter(sid => {
            if (cooldownsEnnemi[sid] > 0) return false;
            const sortEnnemiData = spellsDB.getSortData(sid);
            const niveauEnnemiData = sortEnnemiData.niveaux.find(n => n.niveau === combatActif.enemy_niveau) || sortEnnemiData.niveaux[0];
            return (niveauEnnemiData.cout_pa || 3) <= paEnnemi;
        });

        if (sortsEnnemiDispo.length === 0) break;

        const sortEnnemiId = sortsEnnemiDispo[Math.floor(Math.random() * sortsEnnemiDispo.length)];
        const sortEnnemi = spellsDB.getSortData(sortEnnemiId);
        const niveauSortEnnemi = combatActif.enemy_niveau;
        const niveauDataEnnemi = sortEnnemi.niveaux.find(n => n.niveau === niveauSortEnnemi) || sortEnnemi.niveaux[0];
        const coutPAEnnemi = niveauDataEnnemi.cout_pa || 3;
        paEnnemi -= coutPAEnnemi;

        const modStatEnnemi = effects.getModificateursStats(effetsEnnemi);
        const statsEnnemiModifiees = { ...enemyStats };
        Object.entries(modStatEnnemi.bonusStats).forEach(([stat, bonus]) => {
            statsEnnemiModifiees[stat] = (statsEnnemiModifiees[stat] || 0) + bonus;
        });

        const modDegatsEnnemi = effects.getModificateursDegats(effetsEnnemi);
        const joueurAvantTourEnnemi = playerDB.get(discord_id);

        if (sortEnnemi.type === 'attaque' || sortEnnemi.type === 'attaque_effet' || sortEnnemi.type === 'attaque_multiple' || sortEnnemi.type === 'attaque_buff') {
            const resultatEnnemi = combatEngine.calculerDegats(sortEnnemi, niveauSortEnnemi, statsEnnemiModifiees);

            if (resultatEnnemi.echec) {
                journal.push(`❌ **${enemyData.nom}** rate son attaque !`);
            } else {
                let degatsEnnemi = resultatEnnemi.degats;
                if (modDegatsEnnemi.bonusFlat > 0) degatsEnnemi += modDegatsEnnemi.bonusFlat;
                if (modDegatsEnnemi.bonusPct > 0) degatsEnnemi = Math.round(degatsEnnemi * (1 + modDegatsEnnemi.bonusPct / 100));

                const malusSerment = effects.getSermentMalus(effetsJoueur);
                if (malusSerment > 0) degatsEnnemi = Math.round(degatsEnnemi * (1 + malusSerment / 100));

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

                    // Serment — +1 stat par HP perdu avec cap par tour
                    const sermentActif = effetsJoueur.find(e => e.type === 'serment' && e.duree > 0);
                    if (sermentActif && degatsApresDefenseJoueur > 0) {
                        const bonusRestant = sermentActif.bonus_par_coup - (sermentActif.bonus_ce_tour || 0);
                        const bonusGagne = Math.min(degatsApresDefenseJoueur, bonusRestant);
                        if (bonusGagne > 0) {
                            sermentActif.bonus_ce_tour = (sermentActif.bonus_ce_tour || 0) + bonusGagne;
                            sermentActif.bonus_total += bonusGagne;
                            if (sermentActif.stat === 'vitalite') {
                                const joueurPourVita = playerDB.get(discord_id);
                                playerDB.update(discord_id, { hp_max: joueurPourVita.hp_max + bonusGagne });
                                journal.push(`🛡️ **Serment de Vitalité** ! +${bonusGagne} HP max (total : +${sermentActif.bonus_total}) !`);
                            } else {
                                journal.push(`🛡️ **Serment** ! +${bonusGagne} ${sermentActif.stat} (total : +${sermentActif.bonus_total}) !`);
                            }
                        }
                    }

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

                if (sortEnnemi.type === 'attaque_effet') {
                    const nouveauxEffets = effects.appliquerEffetSort(sortEnnemi, niveauDataEnnemi, statsEnnemiModifiees, 'joueur');
                    nouveauxEffets.forEach(effet => journal.push(`✨ ${descriptionEffet(effet, 'vous')}`));
                    effetsJoueur = [...effetsJoueur, ...nouveauxEffets];
                }

                if (sortEnnemi.type === 'attaque_buff') {
                    const nouveauxEffets = effects.appliquerEffetSort(sortEnnemi, niveauDataEnnemi, statsEnnemiModifiees, 'ennemi');
                    for (const effet of nouveauxEffets) {
                        if (effet.type === 'soin') {
                            enemyStats.hp = Math.min(enemyStats.hp + effet.valeur, enemyStats.hp_depart || enemyStats.hp_max);
                            journal.push(`💚 **${enemyData.nom}** se soigne de **${effet.valeur}** HP !`);
                        } else {
                            journal.push(`✨ ${descriptionEffet(effet, enemyData.nom)}`);
                            effetsEnnemi = [...effetsEnnemi, effet];
                        }
                    }
                }
            }
        }

        if (sortEnnemi.type === 'debuff') {
            const nouveauxEffets = effects.appliquerEffetSort(sortEnnemi, niveauDataEnnemi, statsEnnemiModifiees, 'joueur');
            nouveauxEffets.forEach(effet => journal.push(`✨ ${descriptionEffet(effet, 'vous')}`));
            effetsJoueur = [...effetsJoueur, ...nouveauxEffets];
        }

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

        if (niveauDataEnnemi.cooldown > 0) cooldownsEnnemi[sortEnnemiId] = niveauDataEnnemi.cooldown;

        // Vérifier défaite après chaque sort ennemi
        const joueurApresSort = playerDB.get(discord_id);
        if (joueurApresSort.hp_actuel <= 0) {
            return {
                victoireEffets: false,
                defaite: true,
                joueurFinal: joueurApresSort,
                enemyStats, cooldownsJoueur, cooldownsEnnemi, effetsJoueur, effetsEnnemi,
                paMaxEnnemi: variante.pa || 6
            };
        }
    }

    return {
        victoireEffets: false,
        defaite: false,
        enemyStats, cooldownsJoueur, cooldownsEnnemi, effetsJoueur, effetsEnnemi,
        paMaxEnnemi: variante.pa || 6
    };
};

function descriptionEffet(effet, cible) {
    const NOMS_STATS = {
        terre: 'Terre', feu: 'Feu', eau: 'Eau', air: 'Air',
        vitalite: 'Vitalité', sagesse: 'Sagesse'
    };
    switch (effet.type) {
        case 'brulure': return `🔥 **${effet.source_nom}** brûle **${cible}** de **${effet.valeur}** dégâts/tour pendant **${effet.duree}** tours !`;
        case 'poison': return `☠️ **${effet.source_nom}** empoisonne **${cible}** de **${effet.valeur}** dégâts/tour pendant **${effet.duree}** tours !`;
        case 'saignement': return `🩸 **${effet.source_nom}** fait saigner **${cible}** de **${effet.valeur}** dégâts/tour pendant **${effet.duree}** tours !`;
        case 'debuff_stat': return `📉 **${effet.source_nom}** réduit la **${NOMS_STATS[effet.stat] || effet.stat}** de **${cible}** de **${Math.abs(effet.valeur)}** pendant **${effet.duree}** tours !`;
        case 'debuff_toutes_stats': return `📉 **${effet.source_nom}** réduit toutes les stats de **${cible}** de **${Math.abs(effet.valeur)}** pendant **${effet.duree}** tours !`;
        case 'bonus_degats_pct': return `⚡ **${effet.source_nom}** augmente les dégâts de **${cible}** de **${effet.valeur}%** pendant **${effet.duree}** tours !`;
        case 'bonus_stat': return `📈 **${effet.source_nom}** augmente la **${NOMS_STATS[effet.stat] || effet.stat}** de **${cible}** de **${effet.valeur}** pendant **${effet.duree}** tours !`;
        case 'bonus_vitalite': return `❤️ **${effet.source_nom}** augmente la Vitalité de **${cible}** de **${effet.valeur}** pendant **${effet.duree}** tours !`;
        case 'bonus_cc': return `🎯 **${effet.source_nom}** améliore les critiques de **${cible}** pendant **${effet.duree}** tours !`;
        case 'resistance_element': return `🛡️ **${effet.source_nom}** réduit les dégâts **${effet.element}** reçus par **${cible}** de **${Math.abs(effet.valeur)}** pendant **${effet.duree}** tours !`;
        case 'resistance_element_pct': return `🛡️ **${effet.source_nom}** réduit les dégâts **${effet.element}** reçus par **${cible}** de **${effet.valeur}%** pendant **${effet.duree}** tours !`;
        case 'resistance_tous': return `🛡️ **${effet.source_nom}** réduit tous les dégâts reçus par **${cible}** de **${Math.abs(effet.valeur)}** pendant **${effet.duree}** tours !`;
        case 'resistance_tous_pct': return `🛡️ **${effet.source_nom}** réduit tous les dégâts reçus par **${cible}** de **${effet.valeur}%** pendant **${effet.duree}** tours !`;
        case 'absorption_degats': return `🛡️ **${effet.source_nom}** absorbe jusqu'à **${effet.valeur}** dégâts pour **${cible}** pendant **${effet.duree}** tours !`;
        case 'perte_hp_par_tour': return `💔 **${effet.source_nom}** inflige **${effet.valeur}** HP/tour à **${cible}** pendant **${effet.duree}** tours !`;
        case 'perte_hp_par_tour_pct': return `💔 **${effet.source_nom}** inflige **${effet.valeur}%** des HP max à **${cible}** pendant **${effet.duree}** tours !`;
        case 'soin_par_tour': return `💚 **${effet.source_nom}** soigne **${cible}** de **${effet.valeur}** HP/tour pendant **${effet.duree}** tours !`;
        case 'vol_stat': return `🔄 **${effet.source_nom}** vole **${effet.valeur}** points de **${NOMS_STATS[effet.stat] || effet.stat}** à **${cible}** pendant **${effet.duree}** tours !`;
        case 'bonus_degats_hp_manquants': return `⚡ **${effet.source_nom}** augmente les dégâts de **${cible}** selon ses HP manquants pendant **${effet.duree}** tours !`;
        case 'immunite_degats': return `🛡️ **${effet.source_nom}** rend **${cible}** immunisé aux dégâts pendant **${effet.duree}** tours !`;
        case 'esquive_attaques': return `💨 **${effet.source_nom}** permet à **${cible}** d'esquiver **${effet.nb_esquives}** attaque(s) pendant **${effet.duree}** tours !`;
        case 'multiplicateur_effets': return `✨ **${effet.source_nom}** multiplie l'efficacité des sorts de **${cible}** par **${effet.valeur}** pendant **${effet.duree}** tours !`;
        case 'reduction_ec': return `🎯 **${effet.source_nom}** réduit les chances d'échec de **${cible}** pendant **${effet.duree}** tours !`;
        case 'bonus_degats_element_pct': return `⚡ **${effet.source_nom}** augmente les dégâts **${effet.element}** de **${cible}** de **${effet.valeur}%** pendant **${effet.duree}** tours !`;
        case 'bonus_degats_flat': return `⚡ **${effet.source_nom}** augmente les dégâts de **${cible}** de **+${effet.valeur}** pendant **${effet.duree}** tours !`;
        case 'serment': return `🛡️ **${effet.source_nom}** active le **Serment** sur **${cible}** — chaque HP perdu augmente **${NOMS_STATS[effet.stat] || effet.stat}** (cap : +${effet.bonus_par_coup}/tour) !`;
        default: return `✨ **${effet.source_nom}** applique un effet sur **${cible}** pendant **${effet.duree}** tours !`;
    }
}