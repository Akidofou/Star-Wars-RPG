const { db } = require('../database/database');
const enemiesData = require('../../data/enemies.json');
const spellsData = require('../../data/spells.json');

const combat = {

    getSort(sortId, niveau) {
        const sort = spellsData.sorts.find(s => s.id === sortId);
        if (!sort) return null;
        const niveauData = sort.niveaux.find(n => n.niveau === niveau) || sort.niveaux[0];
        return { ...sort, niveauActuel: niveauData };
    },

    getEnemy(enemyId) {
        return enemiesData.enemies.find(e => e.id === enemyId);
    },

    getVariante(enemy, niveau) {
        return enemy.variantes.find(v => v.niveau === niveau) || enemy.variantes[0];
    },

    getEnemiesDuSecteur(ducheId, comteId, secteurId) {
        return enemiesData.enemies.filter(e => 
            e.apparitions.some(a =>
                a.duche === ducheId &&
                a.comte === comteId &&
                a.secteur === secteurId
            )
        );
    },

    choisirEnemyAleatoire(ducheId, comteId, secteurId) {
        const enemiesDispo = combat.getEnemiesDuSecteur(ducheId, comteId, secteurId);
        if (enemiesDispo.length === 0) return null;

        const total = enemiesDispo.reduce((sum, e) => {
            const apparition = e.apparitions.find(a =>
                a.duche === ducheId && 
                a.comte === comteId &&
                a.secteur === secteurId
            );
            return sum + (apparition ? apparition.taux_apparition : 0);
        }, 0);

        let rand = Math.random() * total;

        for (const e of enemiesDispo) {
            const apparition = e.apparitions.find(a =>
                a.duche === ducheId &&
                a.comte === comteId &&
                a.secteur === secteurId
            );
            rand -= apparition ? apparition.taux_apparition : 0;
            if (rand <= 0) {
                const variantesDispos = apparition.variantes_disponibles;
                const indexVariante = variantesDispos[Math.floor(Math.random() * variantesDispos.length)];
                const variante = e.variantes[indexVariante - 1];
                return { enemy: e, variante };
            }
        }

        return null;
    },

    calculerDegats(sort, niveauSort, statsAttaquand) {
        const niveauData = sort.niveaux.find(n => n.niveau === niveauSort) || sort.niveaux[0];

        const aDegatsDirects = niveauData.degats_min || niveauData.composantes_degats;
        if (!aDegatsDirects) return { degats: 0, critique: false, echec: false };

        const echecRoll = niveauData.ec > 0 && Math.floor(Math.random() * niveauData.ec) === 0;
        if (echecRoll) return { degats: 0, critique: false, echec: true };

        const bonusCC = statsAttaquand.bonus_cc || 0;
        const ccApresBonus = Math.max(2, niveauData.cc - bonusCC);
        const air = statsAttaquand.air || 0;
        const ccEffectif = air >= 8
            ? Math.max(2, Math.floor(ccApresBonus * 2.9901 / Math.log(air + 12)))
            : ccApresBonus;
        const critiqueRoll = niveauData.cc > 0 && Math.floor(Math.random() * ccEffectif) === 0;

        let degatsTotal = 0;
        let detailDegats = [];

        if (niveauData.composantes_degats) {
            niveauData.composantes_degats.forEach(composante => {
                const elemComposante = composante.element;
                let statValeur = 0;
                if (elemComposante === 'neutre' || !elemComposante) {
                    statValeur = Math.max(
                        statsAttaquand.terre || 0,
                        statsAttaquand.feu || 0,
                        statsAttaquand.eau || 0,
                        statsAttaquand.air || 0
                    );
                } else {
                    statValeur = statsAttaquand[elemComposante] || 0;
                }
                const degatsBase = Math.floor(
                    Math.random() * (composante.degats_max - composante.degats_min + 1)
                ) + composante.degats_min;
                const degatsComposante = Math.round(degatsBase * (1 + statValeur / 100));
                degatsTotal += degatsComposante;
                detailDegats.push({ element: composante.element, degats: degatsComposante });
            });
        } else {
            let stat = 0;
            const element = sort.composantes && sort.composantes[0]?.element;

            if (element === 'neutre' || !element) {
                stat = Math.max(
                    statsAttaquand.terre || 0,
                    statsAttaquand.feu || 0,
                    statsAttaquand.eau || 0,
                    statsAttaquand.air || 0
                );
            } else if (element) {
                stat = statsAttaquand[element] || 0;
            }
            const degatsBase = Math.floor(
                Math.random() * (niveauData.degats_max - niveauData.degats_min + 1)
            ) + niveauData.degats_min;
            degatsTotal = Math.round(degatsBase * (1 + stat / 100));
        }

        if (critiqueRoll) degatsTotal = Math.round(degatsTotal * 1.5);
        return { degats: degatsTotal, critique: critiqueRoll, echec: false, detail: detailDegats };
    },

    creerCombat(discord_id, enemy, variante) {
        const joueur = db.prepare('SELECT pa_max FROM players WHERE discord_id = ?').get(discord_id);
        const paJoueur = joueur ? joueur.pa_max : 6;
        const paEnnemi = variante.pa || 6;

        db.prepare(`
            INSERT INTO combats (discord_id, enemy_id, enemy_niveau, enemy_hp, enemy_hp_max, enemy_stats, cooldowns_ennemi, pa_joueur, pa_ennemi)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            discord_id,
            enemy.id,
            variante.niveau,
            variante.hp,
            variante.hp,
            JSON.stringify({ ...variante, hp_depart: variante.hp }),
            JSON.stringify({}),
            paJoueur,
            paEnnemi
        );
        return db.prepare(`SELECT * FROM combats WHERE discord_id = ? ORDER BY id DESC LIMIT 1`).get(discord_id);
    },

    getCombatActif(discord_id) {
        const combat = db.prepare(`
            SELECT * FROM combats WHERE discord_id = ? AND statut = 'en_cours' ORDER BY id DESC LIMIT 1
        `).get(discord_id);
        if (!combat) return null;
        combat.enemy_stats = JSON.parse(combat.enemy_stats);
        combat.effets_joueur = JSON.parse(combat.effets_joueur);
        combat.effets_ennemi = JSON.parse(combat.effets_ennemi);
        combat.cooldowns_joueur = JSON.parse(combat.cooldowns_joueur);
        combat.cooldowns_ennemi = JSON.parse(combat.cooldowns_ennemi);
        return combat;
    },

    terminerCombat(combatId, statut) {
        db.prepare(`UPDATE combats SET statut = ? WHERE id = ?`).run(statut, combatId);
    },

    calculerRecompenses(enemy, niveau) {
        const variante = enemy.variantes.find(v => v.niveau === niveau) || enemy.variantes[0];
        const xp = variante.xp || 0;
        const or = Math.floor(Math.random() * (variante.or_max - variante.or_min + 1)) + variante.or_min;
        return { xp, or };
    }
};

module.exports = combat;