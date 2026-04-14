const { db } = require('./database');
const resourcesData = require('../../data/resources.json');
const itemsData = require('../../data/items.json');

const inventaireDB = {

    ajouter(discord_id, item_type, item_id, quantite = 1) {
        const existing = db.prepare(`
            SELECT * FROM inventaire WHERE discord_id = ? AND item_type = ? AND item_id = ?
        `).get(discord_id, item_type, item_id.toString());

        if (existing) {
            db.prepare(`
                UPDATE inventaire SET quantite = quantite + ? WHERE id = ?
            `).run(quantite, existing.id);
        } else {
            db.prepare(`
                INSERT INTO inventaire (discord_id, item_type, item_id, quantite)
                VALUES (?, ?, ?, ?)
            `).run(discord_id, item_type, item_id.toString(), quantite);
        }
    },

    retirer(discord_id, item_type, item_id, quantite = 1) {
        const existing = db.prepare(`
            SELECT * FROM inventaire WHERE discord_id = ? AND item_type = ? AND item_id = ?
        `).get(discord_id, item_type, item_id.toString());

        if (!existing) return { succes: false, message: 'Item non trouvé dans l\'inventaire.' };
        if (existing.quantite < quantite) return { succes: false, message: 'Quantité insuffisante.' };

        if (existing.quantite === quantite) {
            db.prepare(`DELETE FROM inventaire WHERE id = ?`).run(existing.id);
        } else {
            db.prepare(`UPDATE inventaire SET quantite = quantite - ? WHERE id = ?`).run(quantite, existing.id);
        }
        return { succes: true };
    },

    getInventaire(discord_id) {
        return db.prepare(`
            SELECT * FROM inventaire WHERE discord_id = ? ORDER BY item_type, item_id
        `).all(discord_id);
    },

    getParType(discord_id, item_type) {
        return db.prepare(`
            SELECT * FROM inventaire WHERE discord_id = ? AND item_type = ?
        `).all(discord_id, item_type);
    },

    possede(discord_id, item_type, item_id, quantite = 1) {
        const existing = db.prepare(`
            SELECT quantite FROM inventaire WHERE discord_id = ? AND item_type = ? AND item_id = ?
        `).get(discord_id, item_type, item_id.toString());
        return existing ? existing.quantite >= quantite : false;
    },

    enrichir(entries) {
        return entries.map(entry => {
            if (entry.item_type === 'ressource') {
                const data = resourcesData.resources.find(r => r.id === entry.item_id);
                return { ...entry, nom: data?.nom || entry.item_id, description: data?.description || '', categorie: data?.categorie || '' };
            }
            if (entry.item_type === 'item') {
                const data = itemsData.items.find(i => i.id === parseInt(entry.item_id));
                return { ...entry, nom: data?.nom || entry.item_id, description: data?.description || '', categorie: data?.categorie || '' };
            }
            return entry;
        });
    }
};

module.exports = inventaireDB;