const xpTable = require('../../data/xp_table.json');
const spellsDB = require('../database/spellsDB');

const levelUp = {

    verifierLevelUp(joueur) {
        if (joueur.niveau >= 100) return null;

        const niveauActuel = xpTable.niveaux.find(n => n.niveau === joueur.niveau);
        if (!niveauActuel) return null;

        if (joueur.experience >= niveauActuel.xp_requis + niveauActuel.xp_prochain) {
            return joueur.niveau + 1;
        }

        return null;
    },

    appliquerLevelUp(playerDB, discord_id, joueur) {
        const nouveauNiveau = levelUp.verifierLevelUp(joueur);
        if (!nouveauNiveau) return null;

        const hpBonus = 10;
        const nouveauHpMax = joueur.hp_max + hpBonus;

        playerDB.update(discord_id, {
            niveau: nouveauNiveau,
            hp_max: nouveauHpMax,
            hp_actuel: nouveauHpMax,
            points_stat: joueur.points_stat + 5,
            points_competence: joueur.points_competence + 1
        });

        const sortsDebloques = spellsDB.getSortsClasse(joueur.classe)
            .filter(s => s.niveau_deblocage === nouveauNiveau);

        sortsDebloques.forEach(s => spellsDB.debloquerSort(discord_id, s.id));

        return {
            nouveauNiveau,
            hpBonus,
            sortsDebloques,
            pointsStat: 5,
            pointsCompetence: 1
        };
    },

    getXPProchain(niveau) {
        const niveauData = xpTable.niveaux.find(n => n.niveau === niveau);
        return niveauData ? niveauData.xp_prochain : 0;
    },

    getProgression(joueur) {
        if (joueur.niveau >= 100) return { pct: 100, xp_actuelle: 0, xp_prochain: 0 };
        const niveauData = xpTable.niveaux.find(n => n.niveau === joueur.niveau);
        const xpDansNiveau = joueur.experience - niveauData.xp_requis;
        const pct = Math.round((xpDansNiveau / niveauData.xp_prochain) * 100);
        return {
            pct,
            xp_actuelle: xpDansNiveau,
            xp_prochain: niveauData.xp_prochain
        };
    }

};

module.exports = levelUp;