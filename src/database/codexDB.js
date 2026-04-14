const { db } = require('./database');
const spellsData = require('../../data/spells.json');
const enemiesData = require('../../data/enemies.json');

const codexDB = {

    decouvrir(discord_id, type_entree, entree_id) {
        const existe = db.prepare(`
            SELECT 1 FROM codex WHERE discord_id = ? AND type_entree = ? AND entree_id = ?
        `).get(discord_id, type_entree, entree_id.toString());
        if (!existe) {
            db.prepare(`
                INSERT INTO codex (discord_id, type_entree, entree_id)
                VALUES (?, ?, ?)
            `).run(discord_id, type_entree, entree_id.toString());
            return true; 
        }
        return false; 
    },

    getEntrees(discord_id, type_entree) {
        return db.prepare(`
            SELECT * FROM codex WHERE discord_id = ? AND type_entree = ?
            ORDER BY decouvert_at ASC
        `).all(discord_id, type_entree);
    },

    estDecouvert(discord_id, type_entree, entree_id) {
        return !!db.prepare(`
            SELECT 1 FROM codex WHERE discord_id = ? AND type_entree = ? AND entree_id = ?
        `).get(discord_id, type_entree, entree_id.toString());
    },

    compterEntrees(discord_id) {
        const result = db.prepare(`
            SELECT type_entree, COUNT(*) as total FROM codex
            WHERE discord_id = ?
            GROUP BY type_entree
        `).all(discord_id);
        const counts = { monstre: 0, sort: 0, ressource: 0, item: 0, consommable: 0 };
        result.forEach(r => { counts[r.type_entree] = r.total; });
        return counts;
    },

    getFicheMonstre(enemy_id) {
        const enemy = enemiesData.enemies.find(e => e.id === parseInt(enemy_id));
        if (!enemy) return null;
        return enemy;
    },

    getSortsClasse(classe) {
        return spellsData.sorts.filter(s => s.classe === classe);
    },

    getFicheRessource(ressource_id) {
        const resourcesData = require('../../data/resources.json');
        return resourcesData.resources.find(r => r.id === ressource_id);
    },

    getFicheItem(item_id) {
        const itemsData = require('../../data/items.json');
        return itemsData.items.find(i => i.id === parseInt(item_id));
    },

    getPanoplie(panoplie_id) {
        const itemsData = require('../../data/items.json');
        return itemsData.panoplies.find(p => p.id === panoplie_id);
    }
};

module.exports = codexDB;