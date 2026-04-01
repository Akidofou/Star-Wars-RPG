const zones = require('../../data/zones.json');

const zonesHelper = {

    getDuche(ducheId) {
        return zones.duchies.find(d=> d.id === ducheId);
    },

    getComte(ducheId, comteId) {
        const duche = zonesHelper.getDuche(ducheId);
        if (!duche) return null;
        return duche.comtes.find(c => c.id === comteId);
    },

    getSecteur(ducheId, comteId, secteurId) {
        const comte = zonesHelper.getComte(ducheId, comteId);
        if (!comte) return null;
        return comte.secteurs.find(s => s.id === secteurId);
    },

    getVoyagesDisponibles(ducheId, comteId, secteurId) {
        const compte = zonesHelper.getComte(ducheId, comteId);
        if (!compte) return [];
        const autresComtes = zonesHelper.getDuche(ducheId).comtes.filter(c => c.id !== comteId);
        const voyages = autresComtes.map(c => ({
            id: c.id,
            nom: c.villes.nom,
            type: 'intra_duche'
        }));
        if (compte.villes.voyage_inter_duches) {
            const autresDuches = zones.duchies.filter(d => d.id !== ducheId);
            autresDuches.forEach(d => {
                const capitaleComte = d.comtes.find(c => c.capitale_ducale);
                if (capitaleComte) {
                    voyages.push({
                        id: capitaleComte.id,
                        duche_id: d.id,
                        nom: capitaleComte.villes.nom,
                        type: 'inter_duche'
                    });
                }
            });
        }
        return voyages;
    }

};

module.exports = zonesHelper;