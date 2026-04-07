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

        if (!niveauData.degats_min) return { degats: 0, critique: false, echec: false};

        const echecRoll = Math.floor(Math.random() * niveauData.ec) === 0;
        if (echecRoll) return { degats: 0, critique: false, echec: true };

        const critiqueRoll = niveauData.cc > 0 && Math.floor(Math.random()*niveauData.cc) === 0;

        const degatsBase = Math.floor(
            Math.random() * (niveauData.degats_max - niveauData.degats_min + 1)
        ) + niveauData.degats_min;

        let stat = 0;
        if (sort.stat_liee === 'meilleure_stat') {
            stat = Math.max(
                statsAttaquand.force || 0,
                statsAttaquand.intelligence || 0,
                statsAttaquand.chance || 0,
                statsAttaquand.agilite || 0
            );
        } else {
            stat = statsAttaquand[sort.stat_liee] || 0;
        }

        let degats = Math.round(degatsBase * (1 + stat / 100));
        if (critiqueRoll) degats = Math.round(degats * 1.5);

        return { degats, critique: critiqueRoll, echec: false };
    },

    creerCombat(discord_id, enemy, variante) {
        db.prepare(`
            INSERT INTO combats (discord_id, enemy_id, enemy_niveau, enemy_hp, enemy_hp_max, enemy_stats, cooldowns_ennemi)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            discord_id,
            enemy.id,
            variante.niveau,
            variante.hp,
            variante.hp,
            JSON.stringify(variante),
            JSON.stringify({})
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
};

module.exports = combat;