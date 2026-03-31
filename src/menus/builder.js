const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const builder = {

    intro() {
        const embed = new EmbedBuilder()
            .setTitle('⚔️ Star Wars RPG')
            .setDescription(
                '**Bienvenue dans la galaxie lointaine, très lointaine...**\n\n' +
                'Un univers de conflits, de Force et d\'aventure vous attend. \n' +
                'Choisissez votre voie : lumière, obscurité ou entre les deux. \n\n' +
                '© Star Wars RPG Bot'
            )
            .setColor(0x1a1a2e);
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('register_start')
                    .setLabel('S\'enregistrer')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🚀')
            );

        return { embeds: [embed], components: [row], flags: 64  };
    },

    choixClasse() {
        const embed = new EmbedBuilder()
            .setTitle('⚔️ Choisissez votre classe')
            .setDescription(
                'Votre classe définit votre style de combat et vos compétences.\n' +
                'Ce choix est définitif - choisissez avec soin !\n\n' +
                '🔵 **Jedi** - Maître de la Force, équlibré attaque/défense\n' +
                '🔴 **Sith** - Puissance brute du côté obscur\n' +
                '⚔️ **Soldat** - Combattant résistant, expert en armes\n' +
                '🎲 **Contrebandier** - Rusé, taux de critique élevé\n' +
                '🎯 **Chasseur de primes** - Précis et redoutable à distance'
            )
            .setColor(0x1a1a2e);
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('classe_jedi')
                    .setLabel('Jedi')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔵'),
                new ButtonBuilder()
                    .setCustomId('classe_sith')
                    .setLabel('Sith')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔴'),
                new ButtonBuilder()
                    .setCustomId('classe_soldat')
                    .setLabel('Soldat')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚔️'),
                new ButtonBuilder()
                    .setCustomId('classe_contrebandier')
                    .setLabel('Contrebandier')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎲'),
                new ButtonBuilder()
                    .setCustomId('classe_chasseur')
                    .setLabel('Chasseur de primes')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎯')
            );

        return { embeds: [embed], components: [row], flags: 64 };
    },

    menuPrincipal(joueur) {
        const barre = this.barreVie(joueur.hp_actuel, joueur.hp_max);

        const embed = new EmbedBuilder()
            .setTitle('Menu Principal')
            .setDescription(
                `Bienvenue, **${joueur.username}** !\n\n` +
                `${barre}\n` +
                `HP : ${joueur.hp_actuel} / ${joueur.hp_max}\n` +
                `Niveau : ${joueur.niveau}\n` +
                `XP : ${joueur.experience}\n` +
                `Crédits : ${joueur.credits}\n` +
                `Zone : ${joueur.zone_actuelle}\n\n` +
                `*Que souhaitez-vous faire ?*`
            )
            .setColor(0x1a1a2e);
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('menu_profil')
                    .setLabel('Profil')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('👤'),
                new ButtonBuilder()
                    .setCustomId('menu_lieux')
                    .setLabel('Lieux')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🗺️'),
                new ButtonBuilder()
                    .setCustomId('menu_codex')
                    .setLabel('Codex')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📚'),
                new ButtonBuilder()
                    .setCustomId('menu_classement')
                    .setLabel('Classement')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏆'),
                new ButtonBuilder()
                    .setCustomId('menu_repos')
                    .setLabel('Repos')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🛌')
            );

        return { embeds: [embed], components: [row], flags: 64 };
    },

    barreVie(actuel, max) {
        const pct = Math.round((actuel / max) * 10);
        const plein = '🟥';
        const vide = '⬛';
        return plein.repeat(pct) + vide.repeat(10 - pct);
    },

    profil(joueur) {
        const barre = this.barreVie(joueur.hp_actuel, joueur.hp_max);

        const embed = new EmbedBuilder()
            .setTitle(`👤 Profil de ${joueur.username}`)
            .setDescription(
                `**Classe :** ${joueur.classe}\n` +
                `**Faction :** ${joueur.faction}\n` +
                `**Niveau :** ${joueur.niveau}\n` +
                `**XP :** ${joueur.experience}\n` +
                `${barre}\n` +
                `❤️ **HP :** ${joueur.hp_actuel} / ${joueur.hp_max}\n\n` +
                `** --Statistiques-- **\n` +
                `🛡️ Endurance : ${joueur.endurance}\n` +
                `⚔️ Maîtrise : ${joueur.maitrise}\n` +
                `🎯 Précision : ${joueur.precision_stat}\n` +
                `✨ Pouvoir : ${joueur.pouvoir}\n` +
                `💨 Esquive : ${joueur.esquive}\n` +
                `🎲 Critique : ${joueur.critique}\n\n` +
                `** --Points disponibles-- **\n` +
                `📊 Point de stat : ${joueur.points_stat}\n` +
                `📚 Point de compétence : ${joueur.points_competence}`
            )
            .setColor(0x1a1a2e);
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('profil_stats')
                    .setLabel('Statistiques')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📊'),
                new ButtonBuilder()
                    .setCustomId('profil_competences')
                    .setLabel('Compétences')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📚'),
                new ButtonBuilder()
                    .setCustomId('profil_equipement')
                    .setLabel('Équipement')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🛡️'),
                new ButtonBuilder()
                    .setCustomId('profil_inventaire')
                    .setLabel('Inventaire')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎒'),
            );
        
        const rowRetour = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('retour_menu')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔙')
            );

        return { embeds: [embed], components: [row, rowRetour], flags: 64 };
    },

    classement(joueurs, joueurActuel) {
        let description = '';

        if (joueurs.length === 0) {
            description = '*Aucun joueur pour le moment.*';
        } else {
            joueurs.forEach((joueur, index) => {
                const medaille = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                const estMoi = joueur.username === joueurActuel.username ? ' ◄ Vous' : '';
                description += `${medaille} **${joueur.username}** - ${joueur.classe} - Nv. ${joueur.niveau} - ${joueur.experience} XP${estMoi}\n`;
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 Classement')
            .setDescription(description)
            .setColor(0x1a1a2e);

        const rowRetour = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('retour_menu')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔙')
            );
        
        return { embeds: [embed], components: [rowRetour], flags: 64 };
    },

    repos(joueur) {
        const barre = this.barreVie(joueur.hp_actuel, joueur.hp_max);
        const hpManquants = joueur.hp_max - joueur.hp_actuel;
        const tempsRepos = hpManquants * 5;

        const embed = new EmbedBuilder()
            .setTitle('💤 Repos')
            .setDescription(
                `${barre}\n` +
                `❤️ **HP :** ${joueur.hp_actuel} / ${joueur.hp_max}\n\n` +
                (joueur.hp_actuel >= joueur.hp_max
                    ? '✅ Vous êtes en pleine forme, aucun repos nécessaire !'
                    : `⏱️ Temps de repos estimé : **${tempsRepos} secondes** pour récupérer complètement votre santé.\n` +
                      `*(+1HP toutes les 5 secondes)*\n\n` +
                      `Pendant le repos vous pouvez consulter\n` +
                      `votre profil ou le classement.`)
            )
            .setColor(0x1a1a2e);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('repos_start')
                    .setLabel('Se reposer')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💤')
                    .setDisabled(joueur.hp_actuel === joueur.hp_max),
                new ButtonBuilder()
                    .setCustomId('retour_menu')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔙')
            );
        
        return { embeds: [embed], components: [row], flags: 64 };
        
    },

};

module.exports = builder;