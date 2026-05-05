const playerDB = require('../database/playerDB');
const combatEngine = require('./combat');
const effects = require('./effects');
const spellsDB = require('../database/spellsDB');

module.exports = async function tourJoueur(discord_id, joueur, sortData, niveauSort, niveauData, enemyData, enemyStats, effetsJoueur, effetsEnnemi, journal) {

    const modStatJoueur = effects.getModificateursStats(effetsJoueur);
    const statsJoueurModifiees = { ...joueur };
    Object.entries(modStatJoueur.bonusStats).forEach(([stat, bonus]) => {
        statsJoueurModifiees[stat] = (statsJoueurModifiees[stat] || 0) + bonus;
    });

    const modDegatsJoueur = effects.getModificateursDegats(effetsJoueur);

    // Sort offensif joueur → ennemi
    if (sortData.type === 'attaque' || sortData.type === 'attaque_effet' || sortData.type === 'attaque_multiple' || sortData.type === 'attaque_buff') {
        const resultatJoueur = combatEngine.calculerDegats(sortData, niveauSort, statsJoueurModifiees);

        if (resultatJoueur.echec) {
            journal.push(`❌ **Échec !** Votre **${sortData.nom}** a raté !`);
        } else {
            let degatsJoueur = resultatJoueur.degats;
            if (modDegatsJoueur.bonusFlat > 0) degatsJoueur += modDegatsJoueur.bonusFlat;
            if (modDegatsJoueur.bonusPct > 0) degatsJoueur = Math.round(degatsJoueur * (1 + modDegatsJoueur.bonusPct / 100));

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

            if (sortData.type === 'attaque_effet') {
                const nouveauxEffets = effects.appliquerEffetSort(sortData, niveauData, statsJoueurModifiees, 'ennemi');
                nouveauxEffets.forEach(effet => journal.push(`✨ ${descriptionEffet(effet, enemyData.nom)}`));
                effetsEnnemi = [...effetsEnnemi, ...nouveauxEffets];
            }

            if (sortData.type === 'attaque_buff') {
                const nouveauxEffets = effects.appliquerEffetSort(sortData, niveauData, statsJoueurModifiees, 'joueur');
                for (const effet of nouveauxEffets) {
                    if (effet.type === 'soin') {
                        const joueurPourSoin = playerDB.get(discord_id);
                        const nouveauHP = Math.min(joueurPourSoin.hp_actuel + effet.valeur, joueurPourSoin.hp_max);
                        playerDB.update(discord_id, { hp_actuel: nouveauHP });
                        journal.push(`💚 **${sortData.nom}** vous soigne de **${effet.valeur}** HP !`);
                    } else {
                        journal.push(`✨ ${descriptionEffet(effet, 'vous')}`);
                        effetsJoueur = [...effetsJoueur, effet];
                    }
                }
            }
        }
    }

    // Sort debuff joueur → ennemi
    if (sortData.type === 'debuff') {
        const nouveauxEffets = effects.appliquerEffetSort(sortData, niveauData, statsJoueurModifiees, 'ennemi');
        nouveauxEffets.forEach(effet => journal.push(`✨ ${descriptionEffet(effet, enemyData.nom)}`));
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
            } else if (effet.type === 'bonus_vitalite') {
                const joueurPourVita = playerDB.get(discord_id);
                const nouveauHPMax = joueurPourVita.hp_max + effet.valeur;
                const nouveauHP = Math.min(joueurPourVita.hp_actuel + effet.valeur, nouveauHPMax);
                playerDB.update(discord_id, { hp_max: nouveauHPMax, hp_actuel: nouveauHP });
                journal.push(`❤️ **${sortData.nom}** augmente vos HP de **+${effet.valeur}** temporairement !`);
                effetsJoueur = [...effetsJoueur, effet];
            } else {
                journal.push(`✨ ${descriptionEffet(effet, 'vous')}`);
                effetsJoueur = [...effetsJoueur, effet];
            }
        }
    }

    return { enemyStats, effetsJoueur, effetsEnnemi };
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
        case 'serment': return `🛡️ **${effet.source_nom}** active le **Serment** sur **${cible}** — chaque coup reçu augmente **${NOMS_STATS[effet.stat] || effet.stat}** de **${effet.bonus_par_coup}** !`;
        default: return `✨ **${effet.source_nom}** applique un effet sur **${cible}** pendant **${effet.duree}** tours !`;
    }
}