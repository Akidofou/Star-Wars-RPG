const { SlashCommandBuilder } = require('discord.js');
const playerDB = require('../database/playerDB');
const spellsDB = require('../database/spellsDB');
const { db } = require('../database/database');

const ADMIN_ID = '176794979274981378';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Commandes administrateur')
        .addSubcommand(sub => sub
            .setName('stats')
            .setDescription('Modifier les stats du joueur')
            .addStringOption(opt => opt.setName('stat').setDescription('Stat à modifier').setRequired(true)
                .addChoices(
                    { name: 'terre', value: 'terre' },
                    { name: 'feu', value: 'feu' },
                    { name: 'eau', value: 'eau' },
                    { name: 'air', value: 'air' },
                    { name: 'vitalite', value: 'vitalite' },
                    { name: 'sagesse', value: 'sagesse' }
                ))
            .addIntegerOption(opt => opt.setName('valeur').setDescription('Valeur à définir').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('niveau')
            .setDescription('Définir le niveau du joueur')
            .addIntegerOption(opt => opt.setName('valeur').setDescription('Niveau').setRequired(true).setMinValue(1).setMaxValue(100))
        )
        .addSubcommand(sub => sub
            .setName('xp')
            .setDescription('Ajouter de l\'XP')
            .addIntegerOption(opt => opt.setName('valeur').setDescription('XP à ajouter').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('or')
            .setDescription('Ajouter de l\'or')
            .addIntegerOption(opt => opt.setName('valeur').setDescription('Or à ajouter').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('points')
            .setDescription('Donner des points')
            .addStringOption(opt => opt.setName('type').setDescription('Type de points').setRequired(true)
                .addChoices(
                    { name: 'stat', value: 'points_stat' },
                    { name: 'competence', value: 'points_competence' }
                ))
            .addIntegerOption(opt => opt.setName('valeur').setDescription('Nombre de points').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('hp')
            .setDescription('Remettre les HP au maximum')
        )
        .addSubcommand(sub => sub
            .setName('sorts')
            .setDescription('Débloquer tous les sorts de la classe actuelle')
        )
        .addSubcommand(sub => sub
            .setName('reset')
            .setDescription('Remettre le joueur à zéro')
        )
        .addSubcommand(sub => sub
            .setName('combat')
            .setDescription('Lancer un combat contre un monstre spécifique')
            .addIntegerOption(opt => opt.setName('enemy_id').setDescription('ID du monstre (1=Loup, 2=Braconnier, 3=Araignée)').setRequired(true).setMinValue(1).setMaxValue(3))
            .addIntegerOption(opt => opt.setName('variante').setDescription('Numéro de variante (1-5)').setRequired(true).setMinValue(1).setMaxValue(5))
        )
        .addSubcommand(sub => sub
            .setName('monstre')
            .setDescription('Modifier le monstre en combat actuel')
            .addStringOption(opt => opt.setName('stat').setDescription('Stat à modifier').setRequired(true)
                .addChoices(
                    { name: 'hp', value: 'hp' },
                    { name: 'terre', value: 'terre' },
                    { name: 'feu', value: 'feu' },
                    { name: 'eau', value: 'eau' },
                    { name: 'air', value: 'air' }
                ))
            .addIntegerOption(opt => opt.setName('valeur').setDescription('Valeur à définir').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('sort_monstre')
            .setDescription('Définir le niveau des sorts du monstre en combat')
            .addIntegerOption(opt => opt.setName('niveau').setDescription('Niveau des sorts (1-5)').setRequired(true).setMinValue(1).setMaxValue(5))
        )
        .addSubcommand(sub => sub
            .setName('terminer_combat')
            .setDescription('Terminer le combat actif')
        ),

    async execute(interaction) {
        if (interaction.user.id !== ADMIN_ID) {
            await interaction.reply({ content: '❌ Accès refusé.', flags: 64 });
            return;
        }

        const discord_id = interaction.user.id;
        const joueur = playerDB.get(discord_id);

        if (!joueur) {
            await interaction.reply({ content: '❌ Joueur introuvable.', flags: 64 });
            return;
        }

        const sub = interaction.options.getSubcommand();

        if (sub === 'stats') {
            const stat = interaction.options.getString('stat');
            const valeur = interaction.options.getInteger('valeur');
            const update = { [stat]: valeur };
            if (stat === 'vitalite') {
                const niveauxGagnes = joueur.niveau - 1;
                const nouveauHpMax = 50 + (niveauxGagnes * 10) + (valeur * 5);
                update.hp_max = nouveauHpMax;
                update.hp_actuel = nouveauHpMax;
            }
            playerDB.update(discord_id, update);
            await interaction.reply({ content: `✅ **${stat}** défini à **${valeur}**`, flags: 64 });
        }

        else if (sub === 'niveau') {
            const niveau = interaction.options.getInteger('valeur');
            const xpTable = require('../../data/xp_table.json');
            const niveauData = xpTable.niveaux.find(n => n.niveau === niveau);
            const niveauxGagnes = niveau - 1;
            const hpMax = 50 + (niveauxGagnes * 10) + (joueur.vitalite * 5);
            playerDB.update(discord_id, {
                niveau,
                experience: niveauData ? niveauData.xp_requis : 0,
                hp_max: hpMax,
                hp_actuel: hpMax
            });
            const sortsDebloques = spellsDB.getSortsClasse(joueur.classe)
                .filter(s => s.niveau_deblocage <= niveau);
            sortsDebloques.forEach(s => spellsDB.debloquerSort(discord_id, s.id));
            await interaction.reply({ content: `✅ Niveau défini à **${niveau}** | HP max : **${hpMax}** | Sorts débloqués !`, flags: 64 });
        }

        else if (sub === 'xp') {
            const valeur = interaction.options.getInteger('valeur');
            playerDB.update(discord_id, {
                experience: (parseInt(joueur.experience) || 0) + valeur
            });
            await interaction.reply({ content: `✅ **+${valeur} XP** ajouté !`, flags: 64 });
        }

        else if (sub === 'or') {
            const valeur = interaction.options.getInteger('valeur');
            playerDB.update(discord_id, {
                pieces_or: (joueur.pieces_or || 0) + valeur
            });
            await interaction.reply({ content: `✅ **+${valeur} or** ajouté !`, flags: 64 });
        }

        else if (sub === 'points') {
            const type = interaction.options.getString('type');
            const valeur = interaction.options.getInteger('valeur');
            playerDB.update(discord_id, {
                [type]: (joueur[type] || 0) + valeur
            });
            await interaction.reply({ content: `✅ **+${valeur} points** de ${type} ajoutés !`, flags: 64 });
        }

        else if (sub === 'hp') {
            playerDB.update(discord_id, { hp_actuel: joueur.hp_max });
            await interaction.reply({ content: `✅ HP remis à **${joueur.hp_max}/${joueur.hp_max}** !`, flags: 64 });
        }

        else if (sub === 'sorts') {
            const sortsClasse = spellsDB.getSortsClasse(joueur.classe);
            sortsClasse.forEach(s => spellsDB.debloquerSort(discord_id, s.id));
            await interaction.reply({ content: `✅ Tous les sorts de **${joueur.classe}** débloqués !`, flags: 64 });
        }

        else if (sub === 'reset') {
            db.prepare('DELETE FROM competences_joueur WHERE discord_id = ?').run(discord_id);
            db.prepare('DELETE FROM combats WHERE discord_id = ?').run(discord_id);
            db.prepare('DELETE FROM repos WHERE discord_id = ?').run(discord_id);
            db.prepare('DELETE FROM players WHERE discord_id = ?').run(discord_id);
            await interaction.reply({ content: `✅ Joueur réinitialisé !`, flags: 64 });
        }

        else if (sub === 'combat') {
            const enemyId = interaction.options.getInteger('enemy_id');
            const varianteNum = interaction.options.getInteger('variante');
            const enemiesData = require('../../data/enemies.json');
            const combatEngine = require('../game/combat');

            const enemy = enemiesData.enemies.find(e => e.id === enemyId);
            if (!enemy) {
                await interaction.reply({ content: '❌ Monstre introuvable.', flags: 64 });
                return;
            }

            const variante = enemy.variantes[varianteNum - 1];
            if (!variante) {
                await interaction.reply({ content: '❌ Variante introuvable.', flags: 64 });
                return;
            }

            db.prepare('UPDATE combats SET statut = ? WHERE discord_id = ? AND statut = ?')
                .run('annule', discord_id, 'en_cours');

            const nouveauCombat = combatEngine.creerCombat(discord_id, enemy, variante);
            await interaction.reply({ 
                content: `✅ Combat lancé contre **${enemy.nom}** variante ${varianteNum} (Nv.${variante.niveau}, ${variante.hp} HP) ! Allez dans /game → Lieux → Combat pour jouer.`, 
                flags: 64 
            });
        }

        else if (sub === 'monstre') {
            const stat = interaction.options.getString('stat');
            const valeur = interaction.options.getInteger('valeur');

            const combatActif = db.prepare(`SELECT * FROM combats WHERE discord_id = ? AND statut = 'en_cours' ORDER BY id DESC LIMIT 1`).get(discord_id);
            if (!combatActif) {
                await interaction.reply({ content: '❌ Aucun combat actif.', flags: 64 });
                return;
            }

            const enemyStats = JSON.parse(combatActif.enemy_stats);
            enemyStats[stat] = valeur;
            if (stat === 'hp') enemyStats.hp_depart = valeur;

            db.prepare('UPDATE combats SET enemy_stats = ? WHERE id = ?')
                .run(JSON.stringify(enemyStats), combatActif.id);

            await interaction.reply({ 
                content: `✅ **${stat}** du monstre défini à **${valeur}** !`, 
                flags: 64 
            });
        }

        else if (sub === 'sort_monstre') {
            const niveau = interaction.options.getInteger('niveau');

            const combatActif = db.prepare(`SELECT * FROM combats WHERE discord_id = ? AND statut = 'en_cours' ORDER BY id DESC LIMIT 1`).get(discord_id);
            if (!combatActif) {
                await interaction.reply({ content: '❌ Aucun combat actif.', flags: 64 });
                return;
            }

            db.prepare('UPDATE combats SET enemy_niveau = ? WHERE id = ?')
                .run(niveau, combatActif.id);

            await interaction.reply({ 
                content: `✅ Niveau des sorts du monstre défini à **${niveau}** !`, 
                flags: 64 
            });
        }

        else if (sub === 'terminer_combat') {
            const result = db.prepare(`UPDATE combats SET statut = 'annule' WHERE discord_id = ? AND statut = 'en_cours'`).run(discord_id);
            if (result.changes > 0) {
                await interaction.reply({ content: '✅ Combat terminé !', flags: 64 });
            } else {
                await interaction.reply({ content: '❌ Aucun combat actif.', flags: 64 });
            }
        }
    }
};