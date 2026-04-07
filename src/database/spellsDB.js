const { db } = require('./database');
const spellsData = require('../../data/spells.json');

const spellsDB = {

    getSortsJoueur(discord_id) {
        return db.prepare(`
            SELECT * FROM competences_joueur WHERE discord_id = ?
        `).all(discord_id);
    },

    getSortData(sort_id) {
        return spellsData.sorts.find(s => s.id === sort_id);
    },

    getSortsClasse(classe) {
        return spellsData.sorts.filter(s => s.classe === classe);
    },

    getSortsDisponibles(discord_id, classe, niveau_joueur) {
        const sortsClasse = spellsDB.getSortsClasse(classe);
        const sortsJoueur = spellsDB.getSortsJoueur(discord_id);
        return sortsClasse
            .filter(s => s.niveau_deblocage <= niveau_joueur)
            .map(s => {
                const sortJoueur = sortsJoueur.find(sj => sj.competence_id === s.id);
                return {
                    ...s,
                    niveau_actuel: sortJoueur ? sortJoueur.niveau : 1,
                    debloque: true
                };
            });
    },

    debloquerSort(discord_id, sort_id) {
        const existe = db.prepare(`
            SELECT 1 FROM competences_joueur WHERE discord_id = ? AND competence_id = ?
        `).get(discord_id, sort_id);
        if (!existe) {
            db.prepare(`
                INSERT INTO competences_joueur (discord_id, competence_id, niveau)
                VALUES (?, ?, 1)
            `).run(discord_id, sort_id);
        }
    },

    ameliorerSort(discord_id, sort_id) {
        const sortJoueur = db.prepare(`
            SELECT * FROM competences_joueur WHERE discord_id = ? AND competence_id = ?
        `).get(discord_id, sort_id);

        if (!sortJoueur) return { succes: false, message: 'Sort non débloqué.' };
        if (sortJoueur.niveau >= 5) return { succes: false, message: 'Sort déjà au niveau maximum.' };

        const coutNiveau = sortJoueur.niveau;
        const joueur = db.prepare('SELECT points_competence FROM players WHERE discord_id = ?').get(discord_id);

        if (joueur.points_competence < coutNiveau) {
            return { succes: false, message: `Il vous faut ${coutNiveau} points de compétence.` };
        }

        db.prepare(`
            UPDATE competences_joueur SET niveau = niveau + 1 WHERE discord_id = ? AND competence_id = ?
        `).run(discord_id, sort_id);

        db.prepare(`
            UPDATE players SET points_competence = points_competence - ? WHERE discord_id = ?
        `).run(coutNiveau, discord_id);

        return { succes: true, nouveau_niveau: sortJoueur.niveau + 1 };
    },

    initialiserSortsDepart(discord_id, classe) {
        const sortsNiveau1 = spellsDB.getSortsClasse(classe).filter(s => s.niveau_deblocage === 1);
        sortsNiveau1.forEach(s => spellsDB.debloquerSort(discord_id, s.id));
    },

};

module.exports = spellsDB;