const playerDB = require('../../database/playerDB');
const builder = require('../builder');

const PALIERS = {
    guerrier: {
        vitalite: [{ max: Infinity, cout: 1 }],
        sagesse:  [{ max: Infinity, cout: 3 }],
        terre:    [{ max: 100, cout: 1 }, { max: 200, cout: 2 }, { max: 300, cout: 3 }, { max: 400, cout: 4 }, { max: Infinity, cout: 5 }],
        feu:      [{ max: 50,  cout: 1 }, { max: 100, cout: 2 }, { max: 150, cout: 3 }, { max: 200, cout: 4 }, { max: Infinity, cout: 5 }],
        eau:      [{ max: 20,  cout: 1 }, { max: 40,  cout: 2 }, { max: 60,  cout: 3 }, { max: 80,  cout: 4 }, { max: Infinity, cout: 5 }],
        air:      [{ max: 50,  cout: 1 }, { max: 100, cout: 2 }, { max: 150, cout: 3 }, { max: 200, cout: 4 }, { max: Infinity, cout: 5 }]
    },
    gardien: {
        vitalite: [{ max: Infinity, cout: 0.5 }],
        sagesse:  [{ max: Infinity, cout: 3 }],
        terre:    [{ max: 100, cout: 3 }, { max: 150, cout: 4 }, { max: Infinity, cout: 5 }],
        feu:      [{ max: 100, cout: 3 }, { max: 150, cout: 4 }, { max: Infinity, cout: 5 }],
        eau:      [{ max: 100, cout: 3 }, { max: 150, cout: 4 }, { max: Infinity, cout: 5 }],
        air:      [{ max: 100, cout: 3 }, { max: 150, cout: 4 }, { max: Infinity, cout: 5 }]
    },
    archer: {
        vitalite: [{ max: Infinity, cout: 1 }],
        sagesse:  [{ max: Infinity, cout: 3 }],
        terre:    [{ max: 50,  cout: 1 }, { max: 150, cout: 2 }, { max: 250, cout: 3 }, { max: 350, cout: 4 }, { max: Infinity, cout: 5 }],
        feu:      [{ max: 50,  cout: 1 }, { max: 150, cout: 2 }, { max: 250, cout: 3 }, { max: 350, cout: 4 }, { max: Infinity, cout: 5 }],
        eau:      [{ max: 20,  cout: 1 }, { max: 40,  cout: 2 }, { max: 60,  cout: 3 }, { max: 80,  cout: 4 }, { max: Infinity, cout: 5 }],
        air:      [{ max: 50,  cout: 1 }, { max: 100, cout: 2 }, { max: 150, cout: 3 }, { max: 200, cout: 4 }, { max: Infinity, cout: 5 }]
    },
    arcaniste: {
        vitalite: [{ max: Infinity, cout: 1 }],
        sagesse:  [{ max: Infinity, cout: 3 }],
        terre:    [{ max: 50,  cout: 2 }, { max: 150, cout: 3 }, { max: 250, cout: 4 }, { max: Infinity, cout: 5 }],
        feu:      [{ max: 100, cout: 1 }, { max: 200, cout: 2 }, { max: 300, cout: 3 }, { max: 400, cout: 4 }, { max: Infinity, cout: 5 }],
        eau:      [{ max: 20,  cout: 1 }, { max: 40,  cout: 2 }, { max: 60,  cout: 3 }, { max: 80,  cout: 4 }, { max: Infinity, cout: 5 }],
        air:      [{ max: 20,  cout: 1 }, { max: 40,  cout: 2 }, { max: 60,  cout: 3 }, { max: 80,  cout: 4 }, { max: Infinity, cout: 5 }]
    }
};

function getCoutStat(classe, stat, valeurActuelle) {
    const paliers = PALIERS[classe]?.[stat];
    if (!paliers) return 1;
    for (const palier of paliers) {
        if (valeurActuelle < palier.max) return palier.cout;
    }
    return paliers[paliers.length - 1].cout;
}

module.exports = async (interaction, params) => {
    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const stat = params[0];

    const STATS_VALIDES = ['vitalite', 'sagesse', 'terre', 'feu', 'eau', 'air'];
    if (!STATS_VALIDES.includes(stat)) {
        await interaction.reply({ content: '❌ Statistique invalide.', flags: 64 });
        return;
    }

    const cout = getCoutStat(joueur.classe, stat, joueur[stat] || 0);

    if (joueur.points_stat < cout) {
        await interaction.update(builder.stats(joueur));
        return;
    }

    if (stat === 'vitalite') {
        // Gardien : 1p = 2 vitalité, autres : 1p = 1 vitalité
        const gainVitalite = joueur.classe === 'gardien' ? 2 : 1;
        playerDB.update(discord_id, {
            vitalite: joueur.vitalite + gainVitalite,
            hp_max: joueur.hp_max + (gainVitalite * 5),
            hp_actuel: joueur.hp_actuel + (gainVitalite * 5),
            points_stat: joueur.points_stat - 1
        });
    } else {
        playerDB.update(discord_id, {
            [stat]: (joueur[stat] || 0) + 1,
            points_stat: joueur.points_stat - cout
        });
    }

    const joueurMisAJour = playerDB.get(discord_id);
    await interaction.update(builder.stats(joueurMisAJour));
};

module.exports.getCoutStat = getCoutStat;
module.exports.PALIERS = PALIERS;