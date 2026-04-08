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
                    .setEmoji('🎒'),
                new ButtonBuilder()
                    .setCustomId('profil_quetes')
                    .setLabel('Journal de quêtes')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📖')
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

    reposEnCours(joueur, tempsTotal) {
        const barre = this.barreVie(joueur.hp_actuel, joueur.hp_max);

        const embed = new EmbedBuilder()
            .setTitle('💤 Repos en cours...')
            .setDescription(
                `${barre}\n` +
                `❤️ **HP :** ${joueur.hp_actuel} / ${joueur.hp_max}\n\n` +
                `⏱️ Temps estimé : **${tempsTotal} secondes**\n` +
                `*(+1 HP toutes les 5 secondes)*\n\n` +
                `Vous pouvez naviguer dans vos menus.\n` +
                `Cliquez sur **Arrêter** pour récupérer vos HP.`
            )
            .setColor(0x1a1a2e);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('repos_stop')
                    .setLabel('Arrêter le repos')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️'),
                new ButtonBuilder()
                    .setCustomId('retour_menu')
                    .setLabel('Menu principal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
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

    lieux(joueur, duche, comte, secteurActuel, voyages) {
        const estEnVille = secteurActuel === null;

        const embed = new EmbedBuilder()
            .setTitle(estEnVille ? `🏰 ${comte.villes.nom}` : `⚔️ ${secteurActuel.nom}`)
            .setDescription(
                `**${duche.nom}** — ${comte.nom}\n\n` +
                (estEnVille
                    ? `${comte.villes.description}\n\n*Vous êtes en ville. Choisissez votre destination.*`
                    : `${secteurActuel.description}\n\n` +
                      `📍 Ville la plus proche : **${comte.villes.nom}**\n` +
                      `⚠️ Niveau recommandé : **${secteurActuel.niveau_recommande}**\n\n` +
                      `*Lancez un combat ou retournez en ville.*`)
            )
            .setColor(0x1a1a2e);
        
        const rowSecteurs = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('lieux_ville')
                    .setLabel(comte.villes.nom)
                    .setStyle(estEnVille ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setEmoji('🏰'),
                ...comte.secteurs.map(s =>
                    new ButtonBuilder()
                        .setCustomId(`secteur_${s.id}`)
                        .setLabel(s.nom)
                        .setStyle(secteurActuel && secteurActuel.id === s.id
                            ? ButtonStyle.Success
                            : ButtonStyle.Secondary)
                        .setEmoji('⚔️')
                )
            );
        
        const rowServices = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('lieux_marchand')
                    .setLabel('Marchand')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🛒')
                    .setDisabled(!estEnVille),
                new ButtonBuilder()
                    .setCustomId('lieux_pnj')
                    .setLabel('Quêtes')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📜')
                    .setDisabled(!estEnVille),
                new ButtonBuilder()
                    .setCustomId('lieux_marche')
                    .setLabel('Marché joueur')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('💰')
                    .setDisabled(!estEnVille)
            );
        
        const rowNavigation = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('lieux_voyages')
                    .setLabel('Voyages')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🛫')
                    .setDisabled(!estEnVille),
                new ButtonBuilder()
                    .setCustomId('lieux_combat')
                    .setLabel('Combat !')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⚔️')
                    .setDisabled(estEnVille),
                new ButtonBuilder()
                    .setCustomId('retour_menu')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔙')
            );
        
        return { embeds: [embed], components: [rowSecteurs, rowServices, rowNavigation], flags: 64 };
    },

    competences(joueur, sorts) {
        let description = '';

        if (sorts.length === 0) {
            description = '*Aucun sort disponible.*';
        } else {
            sorts.forEach(sort => {
                const niveauData = sort.niveaux.find(n => n.niveau === sort.niveau_actuel);
                const coutProchain = sort.niveau_actuel < 5 ? sort.niveau_actuel : null;
                description += `**${sort.nom}** — Nv.${sort.niveau_actuel}/5`;
                description += sort.niveau_deblocage > 1 ? ` *(débloqué lvl ${sort.niveau_deblocage})*` : '';
                description += `\n`;
                description += `*${sort.description}*\n`;
                if (niveauData.degats_min) {
                    description += `⚔️ Dégâts : ${niveauData.degats_min} à ${niveauData.degats_max}`;
                    if (sort.composantes) description += ` (${sort.composantes.map(c => c.element).join(' + ')})`;
                    description += `\n`;
                }
                if (niveauData.valeur) description += `✨ Effet : ${niveauData.valeur}\n`;
                if (niveauData.duree) description += `⏱️ Durée : ${niveauData.duree} tours\n`;
                if (niveauData.cooldown > 0) description += `🔄 Cooldown : ${niveauData.cooldown} tours\n`;
                if (coutProchain) {
                    description += `💡 Améliorer : ${coutProchain} point(s) de compétence\n`;
                } else {
                    description += `✅ Sort au niveau maximum\n`;
                }
                description += `\n`;
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`📚 Compétences de ${joueur.username}`)
            .setDescription(
                `📊 Points de compétence disponibles : **${joueur.points_competence}**\n\n` +
                description
            )
            .setColor(0x1a1a2e);
        
        const rowRetour = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('retour_profil')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔙')
            );
        
        return { embeds: [embed], components: [rowRetour], flags: 64 };
    },

    combat(joueur, combatData, enemyData, sorts, journal = []) {
        const barreJoueur = this.barreVie(joueur.hp_actuel, joueur.hp_max);
        const enemyStats = typeof combatData.enemy_stats === 'string'
            ? JSON.parse(combatData.enemy_stats)
            : combatData.enemy_stats;
        const barreEnemy = this.barreVie(enemyStats.hp, enemyStats.hp_max || enemyStats.hp_depart || enemyStats.hp);
        const cooldowns = typeof combatData.cooldowns_joueur === 'string'
            ? JSON.parse(combatData.cooldowns_joueur)
            : combatData.cooldowns_joueur;

        const embed = new EmbedBuilder()
            .setTitle('⚔️ Combat !')
            .setDescription(
                `**- Vous -**\n` +
                `${barreJoueur}\n` +
                `❤️ HP : ${joueur.hp_actuel} / ${joueur.hp_max}\n\n` +
                `⭐ Niveau : ${joueur.niveau}\n\n` +
                `**- ${enemyData ? enemyData.nom : 'Ennemi'} (Nv.${combatData.enemy_niveau}) -**\n` +
                `${barreEnemy}\n` +
                `❤️ HP : ${enemyStats.hp} / ${enemyStats.hp_max || enemyStats.hp_depart || enemyStats.hp}\n\n` +
                (journal.length > 0 ? journal.join('\n') + '\n\n' : '') +
                `*Tour ${combatData.tour} - Choisissez votre action !*`
            )
            .setColor(0x8b0000);

        const rowAttaques = new ActionRowBuilder()
            .addComponents(
                ...sorts.slice(0, 4).map(sort => {
                    const enCooldown = cooldowns[sort.sort_id] > 0;
                    return new ButtonBuilder()
                        .setCustomId(`attaque_${sort.sort_id}`)
                        .setLabel(enCooldown
                            ? `${sort.nom} (${cooldowns[sort.sort_id]})`
                            : sort.nom)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('⚔️')
                        .setDisabled(enCooldown);
                })
            );

        const rowFuite = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('combat_fuir')
                    .setLabel('Fuir')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏃‍♂️')
            );
        
        const components = sorts.length > 0 ? [rowAttaques, rowFuite] : [rowFuite];
        return { embeds: [embed], components, flags: 64 };
    },

    resultatCombat(joueur, journal, resultat) {
        const estVictoire = resultat === 'victoire';
        const barre = this.barreVie(joueur.hp_actuel, joueur.hp_max);

        const embed = new EmbedBuilder()
            .setTitle(estVictoire ? '🏆 Victoire !' : '💀 Défaite !')
            .setDescription(
                journal.join('\n') + '\n\n' +
                `${barre}\n` +
                `❤️ HP : ${joueur.hp_actuel} / ${joueur.hp_max}`
            )
            .setColor(estVictoire ? 0x00ff00 : 0xff0000);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('menu_lieux')
                    .setLabel('Retour aux lieux')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🗺️'),
                new ButtonBuilder()
                    .setCustomId('retour_menu')
                    .setLabel('Menu principal')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏠')
            );

        return { embeds: [embed], components: [row], flags: 64 };
    },

};

module.exports = builder;