const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const builder = {

    intro() {
        const embed = new EmbedBuilder()
            .setTitle('⚔️ Royaume d\'Asura')
            .setDescription(
                '**Bienvenue dans le Royaume d\'Asura...**\n\n' +
                'Un monde de chevaliers, de magie et de danger vous attend.\n' +
                'Forgez votre légende dans les terres du royaume.\n\n' +
                '© RPG Médiéval Fantasy'
            )
            .setColor(0x1a1a2e);
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('register_start')
                    .setLabel('Commencer l\'aventure')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⚔️')
            );

        return { embeds: [embed], components: [row], flags: 64  };
    },

    choixClasse() {
        const embed = new EmbedBuilder()
            .setTitle('⚔️ Choisissez votre classe')
            .setDescription(
                'Votre classe définit votre style de combat et vos compétences.\n' +
                'Ce choix est définitif - choisissez avec soin !\n\n' +
                '⚔️ **Guerrier** - Combattant offensif, maître du corps à corps\n' +
                '🛡️ **Gardien** - Tank résistant, absorbe les dégâts\n' +
                '🏹 **Archer** - Combattant à distance, précis et agile\n' +
                '🔮 **Arcaniste** - Mage de soutien, maîtrise des éléments'
            )
            .setColor(0x1a1a2e);
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('classe_guerrier')
                    .setLabel('Guerrier')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⚔️'),
                new ButtonBuilder()
                    .setCustomId('classe_gardien')
                    .setLabel('Gardien')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🛡️'),
                new ButtonBuilder()
                    .setCustomId('classe_archer')
                    .setLabel('Archer')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏹'),
                new ButtonBuilder()
                    .setCustomId('classe_arcaniste')
                    .setLabel('Arcaniste')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔮')
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
                `💰Pièces d'or : ${joueur.pieces_or}\n` +
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
                `❤️ Vitalité : ${joueur.vitalite}\n` +
                `📖 Sagesse : ${joueur.sagesse}\n` +
                `⚔️ Force : ${joueur.force_stat}\n` +
                `🔥 Intelligence : ${joueur.intelligence}\n` +
                `🍀 Chance : ${joueur.chance}\n` +
                `💨 Agilité : ${joueur.agilite}\n\n` +
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
                    .setEmoji('🎒')
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

    codex(joueur, entrees) {
        let description = '';

        if (entrees.length === 0) {
            description = '*Votre codex est vide. \nExplorez le royaume pour découvrir des créatures, des objets et des ressources !*';
        } else {
            const monstres = entrees.filter(e => e.type_entree === 'monstre');
            const item = entrees.filter(e => e.type_entree === 'item');
            const ressources = entrees.filter(e => e.type_entree === 'ressource');

            if (monstres.length > 0) {
                description += `**-- Monstres découverts (${monstres.length}) --**\n`;
                monstres.forEach(e => { description += `• ${e.entree_id}\n`; });
                description += '\n';
            }
            if (item.length > 0) {
                description += `**-- Items découverts (${item.length}) --**\n`;
                item.forEach(e => { description += `• ${e.entree_id}\n`; });
                description += '\n';
            }
            if (ressources.length > 0) {
                description += `**-- Ressources découvertes (${ressources.length}) --**\n`;
                ressources.forEach(e => { description += `• ${e.entree_id}\n`; });
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('📚 Codex')
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

    lieux(joueur, duche, comte, secteurActuel) {
        const estEnVille = secteurActuel === null;

        const embed = new EmbedBuilder()
            .setTitle(`🗺️ ${comte.villes.nom}`)
            .setDescription(
                `**${duche.nom}** - ${comte.nom}\n\n` +
                `${comte.villes.description}\n\n` +
                (estEnVille
                    ? `*Vous êtes en ville. Choisissez votre destination.*`
                    : `*Vous êtes dans : ${secteurActuel.nom}.*\n${secteurActuel.description}`)
            )
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
};

module.exports = builder;