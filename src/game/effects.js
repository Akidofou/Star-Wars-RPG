const effects = {

    appliquerEffetSort(sort, niveauData, statsAttaquant, cible) {
        if (!sort.effets || sort.effets.length === 0) return [];

        const effetsAppliques = [];

        sort.effets.forEach(effet => {
            const nouvelEffet = {
                type: effet.type,
                duree: effet.duree || niveauData.duree || 1,
                source_sort_id: sort.id,
                source_nom: sort.nom
            };

            switch (effet.type) {

                case 'brulure':
                    nouvelEffet.valeur = niveauData.brulure_par_tour || 0;
                    nouvelEffet.element = 'feu';
                    nouvelEffet.stats_attaquant = {
                        feu: statsAttaquant.feu || 0
                    };
                    break;

                case 'poison':
                    nouvelEffet.valeur = niveauData.poison_par_tour || 0;
                    nouvelEffet.element = null;
                    break;

                case 'saignement':
                    nouvelEffet.valeur = niveauData.saignement_par_tour || 0;
                    nouvelEffet.element = 'terre';
                    nouvelEffet.stats_attaquant = {
                        terre: statsAttaquant.terre || 0
                    };
                    break;

                case 'debuff_stat':
                    nouvelEffet.stat = effet.stat;
                    nouvelEffet.valeur = niveauData.valeur_effet || 0;
                    break;

                case 'debuff_toutes_stats':
                    nouvelEffet.valeur = niveauData.valeur_effet || 0;
                    break;

                case 'bonus_degats_pct':
                    nouvelEffet.valeur = niveauData.valeur || niveauData.valeur_degats || 0;
                    break;
                
                case 'bonus_degats_flat':
                    if (niveauData.valeur_min !== undefined && niveauData.valeur_max !== undefined) {
                        nouvelEffet.valeur = Math.floor(
                            Math.random() * (niveauData.valeur_max - niveauData.valeur_min + 1)
                        ) + niveauData.valeur_min;
                    } else {
                        nouvelEffet.valeur = niveauData.valeur || niveauData.valeur_degats_flat || 0;
                    }
                    break;

                case 'bonus_stat':
                    nouvelEffet.stat = effet.stat;
                    nouvelEffet.valeur = niveauData.valeur_stat || niveauData[`valeur_${effet.stat}`] || 0;
                    break;

                case 'bonus_vitalite':
                    nouvelEffet.valeur_min = niveauData.valeur_min || 0;
                    nouvelEffet.valeur_max = niveauData.valeur_max || 0;
                    nouvelEffet.valeur = Math.floor(
                        Math.random() * (nouvelEffet.valeur_max - nouvelEffet.valeur_min + 1)
                    ) + nouvelEffet.valeur_min;
                    break;

                case 'bonus_cc':
                    nouvelEffet.valeur = niveauData.valeur_cc || 0;
                    break;

                case 'resistance_element':
                    nouvelEffet.element = effet.element;
                    nouvelEffet.valeur = niveauData.valeur || 0;
                    nouvelEffet.stat_liee = effet.stat_liee || null;
                    nouvelEffet.stat_valeur = effet.stat_liee ? (statsAttaquant[effet.stat_liee] || 0) : 0;
                    break;

                case 'resistance_tous':
                    nouvelEffet.valeur = niveauData.valeur || niveauData.valeur_resistance || 0;
                    nouvelEffet.stat_liee = effet.stat_liee || null;
                    nouvelEffet.stat_valeur = effet.stat_liee ? (statsAttaquant[effet.stat_liee] || 0) : 0;
                    break;
                
                case 'resistance_element_pct':
                    nouvelEffet.element = effet.element;
                    nouvelEffet.valeur = niveauData.valeur || 0;
                    break;

                case 'resistance_tous_pct':
                    nouvelEffet.valeur = niveauData.valeur || 0;
                    break;

                case 'absorption_degats':
                    nouvelEffet.valeur = niveauData.valeur || 0;
                    nouvelEffet.restant = niveauData.valeur || 0;
                    break;

                case 'perte_hp_immediate':
                    nouvelEffet.valeur = niveauData.perte_hp || 0;
                    break;

                case 'perte_hp_par_tour':
                    nouvelEffet.valeur = niveauData.perte_hp || 0;
                    break;

                case 'perte_hp_par_tour_pct':
                    nouvelEffet.valeur = niveauData.perte_hp_pct || 0;
                    break;

                case 'soin':
                    nouvelEffet.valeur_min = niveauData.valeur_min || 0;
                    nouvelEffet.valeur_max = niveauData.valeur_max || 0;
                    nouvelEffet.valeur = Math.floor(
                        Math.random() * (nouvelEffet.valeur_max - nouvelEffet.valeur_min + 1)
                    ) + nouvelEffet.valeur_min;
                    break;

                case 'soin_par_tour':
                    nouvelEffet.valeur = niveauData.soin_par_tour || 0;
                    break;

                case 'soin_fin_effet':
                    nouvelEffet.valeur = niveauData.soin_fin || 0;
                    break;

                case 'vol_stat':
                    nouvelEffet.stat = effet.stat;
                    nouvelEffet.valeur = niveauData.valeur_effet || 0;
                    break;

                case 'bonus_degats_hp_manquants':
                    nouvelEffet.valeur = niveauData.valeur || 0;
                    break;

                case 'immunite_degats':
                    break;

                case 'esquive_attaques':
                    nouvelEffet.nb_esquives = niveauData.nb_esquives || 1;
                    break;

                case 'multiplicateur_effets':
                    nouvelEffet.valeur = niveauData.valeur || 1;
                    break;

                case 'reduction_ec':
                    nouvelEffet.valeur = niveauData.valeur_ec || 0;
                    break;

                case 'bonus_degats_element_pct':
                    nouvelEffet.element = effet.element;
                    nouvelEffet.valeur = niveauData.valeur || 0;
                    break;
                case 'serment':
                    nouvelEffet.stat = effet.stat;
                    nouvelEffet.bonus_par_coup = niveauData.bonus_par_coup || 0;
                    nouvelEffet.malus_degats_pct = effet.malus_degats_pct || 0;
                    nouvelEffet.affaiblit = effet.affaiblit || false;
                    nouvelEffet.stacks = 0;
                    nouvelEffet.bonus_total = 0;
                    break;
            }

            effetsAppliques.push(nouvelEffet);
        });

        return effetsAppliques;
    },

    traiterEffetsDebutTour(effetsActifs, cible, journal, nomCible, effetsDefenseur = []) {
        const effetsRestants = [];
        let hpChange = 0;

        const { estImmune, absorption } = effects.getModificateursDefense(effetsDefenseur.length > 0 ? effetsDefenseur : effetsActifs);
        let absorptionRestante = absorption;

        effetsActifs.forEach(effet => {
            if (effet.duree <= 0) return;

            switch (effet.type) {

                case 'brulure': {
                    if (estImmune) {
                        journal.push(`🛡️ **${nomCible}** est immunisé à la brûlure !`);
                        break;
                    }
                    let degats = effet.valeur;
                    if (effet.stats_attaquant) {
                        const stat = effet.stats_attaquant.feu || 0;
                        degats = Math.round(degats * (1 + stat / 100));
                    }
                    if (absorptionRestante > 0) {
                        const absorbe = Math.min(degats, absorptionRestante);
                        absorptionRestante -= absorbe;
                        degats = Math.max(0, degats - absorbe);
                        if (degats === 0) {
                            journal.push(`🛡️ L'absorption bloque la brûlure sur **${nomCible}** !`);
                            break;
                        }
                    }
                    hpChange -= degats;
                    journal.push(`🔥 **${nomCible}** subit **${degats}** dégâts de brûlure ! (${effet.duree - 1} tour(s) restant)`);
                    break;
                }

                case 'poison': {
                    if (estImmune) {
                        journal.push(`🛡️ **${nomCible}** est immunisé au poison !`);
                        break;
                    }
                    let degats = effet.valeur;
                    if (absorptionRestante > 0) {
                        const absorbe = Math.min(degats, absorptionRestante);
                        absorptionRestante -= absorbe;
                        degats = Math.max(0, degats - absorbe);
                        if (degats === 0) {
                            journal.push(`🛡️ L'absorption bloque le poison sur **${nomCible}** !`);
                            break;
                        }
                    }
                    hpChange -= degats;
                    journal.push(`☠️ **${nomCible}** subit **${degats}** dégâts de poison ! (${effet.duree - 1} tour(s) restant)`);
                    break;
                }

                case 'saignement': {
                    if (estImmune) {
                        journal.push(`🛡️ **${nomCible}** est immunisé au saignement !`);
                        break;
                    }
                    let degats = effet.valeur;
                    if (absorptionRestante > 0) {
                        const absorbe = Math.min(degats, absorptionRestante);
                        absorptionRestante -= absorbe;
                        degats = Math.max(0, degats - absorbe);
                        if (degats === 0) {
                            journal.push(`🛡️ L'absorption bloque le saignement sur **${nomCible}** !`);
                            break;
                        }
                    }
                    hpChange -= degats;
                    journal.push(`🩸 **${nomCible}** subit **${degats}** dégâts de saignement ! (${effet.duree - 1} tour(s) restant)`);
                    break;
                }

                case 'perte_hp_par_tour': {
                    if (estImmune) break;
                    hpChange -= effet.valeur;
                    journal.push(`💔 **${nomCible}** perd **${effet.valeur}** HP ! (${effet.duree - 1} tour(s) restant)`);
                    break;
                }

                case 'perte_hp_par_tour_pct': {
                    if (estImmune) break;
                    const perteHP = Math.round((cible.hp_max || cible.hp_actuel) * effet.valeur / 100);
                    hpChange -= perteHP;
                    journal.push(`💔 **${nomCible}** perd **${perteHP}** HP (${effet.valeur}% HP max) ! (${effet.duree - 1} tour(s) restant)`);
                    break;
                }

                case 'soin_par_tour': {
                    hpChange += effet.valeur;
                    journal.push(`💚 **${nomCible}** récupère **${effet.valeur}** HP ! (${effet.duree - 1} tour(s) restant)`);
                    break;
                }
            }

            const effetMisAJour = { ...effet, duree: effet.duree - 1 };
            if (effetMisAJour.duree > 0) {
                effetsRestants.push(effetMisAJour);
            } else {
                effects.traiterFinEffet(effetMisAJour, journal, nomCible);
                if (effetMisAJour.type === 'bonus_vitalite') {
                    hpChange -= effetMisAJour.valeur;
                }
                if (effetMisAJour.type === 'serment' && effetMisAJour.stat === 'vitalite') {
                    hpChange -= effetMisAJour.bonus_total;
                }
            }
        });

        return { effetsRestants, hpChange };
    },

    traiterFinEffet(effet, journal, nomCible) {
        switch (effet.type) {
            case 'soin_fin_effet':
                journal.push(`✨ L'effet de **${effet.source_nom}** se termine — **${nomCible}** récupère **${effet.valeur}** HP !`);
                break;
            case 'immunite_degats':
                journal.push(`🛡️ L'immunité aux dégâts de **${nomCible}** se termine !`);
                break;
            case 'absorption_degats':
                journal.push(`🛡️ L'absorption de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'bonus_degats_pct':
                journal.push(`⚡ Le bonus de dégâts de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'bonus_degats_flat':
                journal.push(`⚡ Le bonus de dégâts flat de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'bonus_stat':
                journal.push(`📈 Le bonus de stat de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'bonus_vitalite':
                journal.push(`❤️ Le bonus de vitalité de **${effet.source_nom}** sur **${nomCible}** se termine ! (-${effet.valeur} HP max)`);
                break;
            case 'bonus_cc':
                journal.push(`🎯 Le bonus de critique de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'resistance_element':
                journal.push(`🛡️ La résistance **${effet.element}** de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'resistance_element_pct':
                journal.push(`🛡️ La résistance **${effet.element}** % de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'resistance_tous':
            case 'resistance_tous_pct':
                journal.push(`🛡️ La résistance de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'esquive_attaques':
                journal.push(`💨 Le bonus d'esquive de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'multiplicateur_effets':
                journal.push(`✨ Le multiplicateur de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'reduction_ec':
                journal.push(`🎯 La réduction d'échec de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'bonus_degats_element_pct':
                journal.push(`⚡ Le bonus de dégâts **${effet.element}** de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'bonus_degats_hp_manquants':
                journal.push(`⚡ Le bonus de dégâts selon les HP manquants de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'debuff_stat':
                journal.push(`📉 Le debuff de stat de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'debuff_toutes_stats':
                journal.push(`📉 Le debuff de toutes les stats de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'brulure':
                journal.push(`🔥 La brûlure de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'poison':
                journal.push(`☠️ Le poison de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'saignement':
                journal.push(`🩸 Le saignement de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'perte_hp_par_tour':
                journal.push(`💔 L'effet de perte de HP de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'perte_hp_par_tour_pct':
                journal.push(`💔 L'effet de perte de HP % de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'soin_par_tour':
                journal.push(`💚 L'effet de soin de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'vol_stat':
                journal.push(`🔄 Le vol de stat de **${effet.source_nom}** sur **${nomCible}** se termine !`);
                break;
            case 'serment':
                if (effet.stat === 'vitalite' && effet.bonus_total > 0) {
                    journal.push(`🛡️ Le Serment de Vitalité de **${effet.source_nom}** se termine ! (-${effet.bonus_total} HP max)`);
                } else {
                    journal.push(`🛡️ Le Serment de **${effet.source_nom}** se termine ! (+${effet.bonus_total} ${effet.stat} accumulé)`);
                }
                break;
        }
    },

    getModificateursDegats(effetsActifs) {
        let bonusPct = 0;
        let bonusFlat = 0;
        let bonusElementPct = {};
        let estImmune = false;
        let multiplicateur = 1;

        effetsActifs.forEach(effet => {
            if (effet.duree <= 0) return;
            switch (effet.type) {
                case 'bonus_degats_pct':
                    bonusPct += effet.valeur;
                    break;
                case 'bonus_degats_flat':
                    bonusFlat += effet.valeur;
                    break;
                case 'bonus_degats_element_pct':
                    bonusElementPct[effet.element] = (bonusElementPct[effet.element] || 0) + effet.valeur;
                    break;
                case 'immunite_degats':
                    estImmune = true;
                    break;
                case 'multiplicateur_effets':
                    multiplicateur = effet.valeur;
                    break;
                case 'serment':
                    if (effet.affaiblit && effet.stacks > 0) {
                        bonusPct -= Math.min(effet.stacks * 5, 30);
                    }
                    break;
            }
        });

        return { bonusPct, bonusFlat, bonusElementPct, estImmune, multiplicateur };
    },

    getSermentMalus(effetsActifs) {
        let malusDegats = 0;
        effetsActifs.forEach(effet => {
            if (effet.duree <= 0) return;
            if (effet.type === 'serment') {
                malusDegats += effet.malus_degats_pct || 0;
            }
        });
        return malusDegats;
    },

    getModificateursDefense(effetsActifs) {
        let reductionFlat = 0;
        let reductionPct = 0;
        let reductionElement = {};
        let reductionElementPct = {};
        let absorption = 0;
        let nbEsquives = 0;
        let estImmune = false;

        effetsActifs.forEach(effet => {
            if (effet.duree <= 0) return;
            switch (effet.type) {
                case 'resistance_tous':
                    if (effet.stat_valeur > 0) {
                        reductionFlat += Math.round(Math.abs(effet.valeur) * (1 + effet.stat_valeur / 100));
                    } else {
                        reductionFlat += Math.abs(effet.valeur);
                    }
                    break;
                case 'resistance_tous_pct':
                    reductionPct += effet.valeur;
                    break;
                case 'resistance_element':
                    const reductionElem = effet.stat_valeur > 0
                        ? Math.round(Math.abs(effet.valeur) * (1 + effet.stat_valeur / 100))
                        : Math.abs(effet.valeur);
                    reductionElement[effet.element] = (reductionElement[effet.element] || 0) + reductionElem;
                    break;
                case 'resistance_element_pct':
                    reductionElementPct[effet.element] = (reductionElementPct[effet.element] || 0) + effet.valeur;
                    break;
                case 'absorption_degats':
                    absorption += effet.restant || effet.valeur;
                    break;
                case 'esquive_attaques':
                    nbEsquives += effet.nb_esquives || 1;
                    break;
                case 'immunite_degats':
                    estImmune = true;
                    break;
            }
        });

        return { reductionFlat, reductionPct, reductionElement, reductionElementPct, absorption, nbEsquives, estImmune };
    },

    getModificateursStats(effetsActifs) {
        const bonusStats = {};
        let bonusCC = 0;
        let reductionEC = 0;

        effetsActifs.forEach(effet => {
            if (effet.duree <= 0) return;
            switch (effet.type) {
                case 'bonus_stat':
                case 'vol_stat':
                    bonusStats[effet.stat] = (bonusStats[effet.stat] || 0) + effet.valeur;
                    break;
                case 'debuff_stat':
                    bonusStats[effet.stat] = (bonusStats[effet.stat] || 0) + effet.valeur;
                    break;
                case 'debuff_toutes_stats':
                    ['terre', 'feu', 'eau', 'air'].forEach(stat => {
                        bonusStats[stat] = (bonusStats[stat] || 0) + effet.valeur;
                    });
                    break;
                case 'bonus_cc':
                    bonusCC += effet.valeur;
                    break;
                case 'reduction_ec':
                    reductionEC += effet.valeur;
                    break;
                case 'serment':
                    if (effet.stat !== 'vitalite') {
                        bonusStats[effet.stat] = (bonusStats[effet.stat] || 0) + effet.bonus_total;
                    }
                    if (effet.affaiblit) {
                        bonusPct -= Math.min(effet.stacks * 5, 30);
                    }
                    break;
            }
        });

        return { bonusStats, bonusCC, reductionEC };
    },

    appliquerDegatsAvecDefense(degats, element, effetsDefenseur) {
        const { reductionFlat, reductionPct, reductionElement, reductionElementPct, absorption, nbEsquives, estImmune } = effects.getModificateursDefense(effetsDefenseur);

        if (estImmune) return { degats: 0, esquive: false, absorbe: false, immune: true, reduit: false, montantReduit: 0, montantTotalBloque: 0 };

        if (nbEsquives > 0) return { degats: 0, esquive: true, absorbe: false, immune: false, reduit: false, montantReduit: 0, montantTotalBloque: 0 };

        let degatsFinaux = degats;

        // Résistance flat élémentaire
        if (reductionElement[element]) degatsFinaux -= reductionElement[element];

        // Résistance % élémentaire
        if (reductionElementPct[element]) {
            degatsFinaux = Math.round(degatsFinaux * (1 - reductionElementPct[element] / 100));
        }

        // Résistance flat globale
        if (reductionFlat > 0) degatsFinaux -= reductionFlat;

        // Résistance % globale
        if (reductionPct > 0) degatsFinaux = Math.round(degatsFinaux * (1 - reductionPct / 100));

        degatsFinaux = Math.max(0, degatsFinaux);

        const montantReduit = degats - degatsFinaux;

        if (absorption > 0) {
            const degatsAbsorbes = Math.min(degatsFinaux, absorption);
            degatsFinaux = Math.max(0, degatsFinaux - degatsAbsorbes);
            const montantTotalBloque = montantReduit + degatsAbsorbes;
            return { degats: degatsFinaux, esquive: false, absorbe: true, montantAbsorbe: degatsAbsorbes, immune: false, reduit: montantReduit > 0, montantReduit, montantTotalBloque };
        }

        return { degats: degatsFinaux, esquive: false, absorbe: false, immune: false, reduit: montantReduit > 0, montantReduit, montantTotalBloque: montantReduit };
    }
};

module.exports = effects;