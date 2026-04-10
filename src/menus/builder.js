const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

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

    profil(joueur, progression = null) {
        const barre = this.barreVie(joueur.hp_actuel, joueur.hp_max);

        const embed = new EmbedBuilder()
            .setTitle(`👤 Profil de ${joueur.username}`)
            .setDescription(
                `**Classe :** ${joueur.classe}\n` +
                `**Faction :** ${joueur.faction}\n` +
                `**Niveau :** ${joueur.niveau}\n` +
                `**XP :** ${progression ? `${progression.xp_actuelle} / ${progression.xp_prochain} (${progression.pct}%)` : joueur.experience}\n` +
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

    stats(joueur) {
        const embed = new EmbedBuilder()
            .setTitle(`📊 Statistiques de ${joueur.username}`)
            .setDescription(
                `📊 **Points de stat disponibles : ${joueur.points_stat}**\n\n` +
                `❤️ Vitalité : **${joueur.vitalite}**\n` +
                `📖 Sagesse : **${joueur.sagesse}**\n` +
                `⚔️ Force (terre) : **${joueur.force_stat}**\n` +
                `🔥 Intelligence (feu) : **${joueur.intelligence}**\n` +
                `🍀 Chance (eau) : **${joueur.chance}**\n` +
                `💨 Agilité (air) : **${joueur.agilite}**\n\n` +
                `*1 point de stat = +1 dans la statistique choisie.*\n` +
                `*La Vitalité augmente vos points de vie maximum.*\n` +
                `*La Sagesse augmente votre gain d'expérience.*\n` +
                `*La Force amplifie les dégâts terre.*\n` +
                `*L'Intelligence amplifie les dégâts feu.*\n` +
                `*La Chance amplifie les dégâts eau.*\n` +
                `*L'Agilité amplifie les dégâts air et améliore les critiques.*`
            )
            .setColor(0x1a1a2e);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('stats_vitalite')
                    .setLabel('Vitalité +1')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('❤️')
                    .setDisabled(joueur.points_stat <= 0),
                new ButtonBuilder()
                    .setCustomId('stats_sagesse')
                    .setLabel('Sagesse +1')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📖')
                    .setDisabled(joueur.points_stat <= 0),
                new ButtonBuilder()
                    .setCustomId('stats_force')
                    .setLabel(`Force +1`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⚔️')
                    .setDisabled(joueur.points_stat <= 0),
                new ButtonBuilder()
                    .setCustomId('stats_intelligence')
                    .setLabel(`Intelligence +1`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔥')
                    .setDisabled(joueur.points_stat <= 0)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('stats_chance')
                    .setLabel(`Chance +1`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🍀')
                    .setDisabled(joueur.points_stat <= 0),
                new ButtonBuilder()
                    .setCustomId('stats_agilite')
                    .setLabel(`Agilité +1`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💨')
                    .setDisabled(joueur.points_stat <= 0)
            );

        const rowRetour = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('retour_profil')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔙')
            );

        return { embeds: [embed], components: [row, row2, rowRetour], flags: 64 };
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

    reposEnCours(joueur, tempsRestant, hpActuelEstime = null) {
        const hpAffiche = hpActuelEstime || joueur.hp_actuel;
        const barre = this.barreVie(hpAffiche, joueur.hp_max);

        const embed = new EmbedBuilder()
            .setTitle('💤 Repos en cours...')
            .setDescription(
                `${barre}\n` +
                `❤️ **HP estimés :** ${hpAffiche} / ${joueur.hp_max}\n\n` +
                `⏱️ Temps restant estimé : **${tempsRestant} secondes**\n` +
                `*(+1 HP toutes les 5 secondes)*\n\n` +
                `⚠️ **Pendant le repos vous ne pouvez pas :**\n` +
                `• 🚫 Vous déplacer entre secteurs\n` +
                `• 🚫 Lancer un combat\n` +
                `• 🚫 Voyager vers un autre comté\n\n` +
                `Vous pouvez consulter votre profil, codex et classement.\n` +
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

    reposTermine(joueur, hpRegagnes) {
        const barre = this.barreVie(joueur.hp_actuel, joueur.hp_max);

        const embed = new EmbedBuilder()
            .setTitle('✅ Repos terminé')
            .setDescription(
                `${barre}\n` +
                `❤️ **HP :** ${joueur.hp_actuel} / ${joueur.hp_max}\n\n` +
                `💚 Vous avez récupéré **+${hpRegagnes} HP** pendant votre repos !`
            )
            .setColor(0x00ff00);

        const row = new ActionRowBuilder()
            .addComponents(
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
                    .setEmoji('🏰')
                    .setDisabled(joueur.etat === 'repos' && !estEnVille),
                ...comte.secteurs.map(s =>
                    new ButtonBuilder()
                        .setCustomId(`secteur_${s.id}`)
                        .setLabel(s.nom)
                        .setStyle(secteurActuel && secteurActuel.id === s.id
                            ? ButtonStyle.Success
                            : ButtonStyle.Secondary)
                        .setEmoji('⚔️')
                        .setDisabled(joueur.etat === 'repos')
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
                    .setDisabled(!estEnVille || joueur.etat === 'repos'),
                new ButtonBuilder()
                    .setCustomId('lieux_combat')
                    .setLabel('Combat !')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⚔️')
                    .setDisabled(estEnVille || joueur.etat === 'repos'),
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
                description += `*${this.genererDescriptionSort(sort, niveauData)}*\n`;
                if (niveauData.degats_min) {
                    description += `⚔️ Dégâts : ${niveauData.degats_min} à ${niveauData.degats_max}`;
                    if (sort.composantes) description += ` (${sort.composantes.map(c => c.element).join(' + ')})`;
                    description += `\n`;
                }
                if (niveauData.valeur) description += `✨ Effet : ${niveauData.valeur}\n`;
                if (niveauData.duree) description += `⏱️ Durée : ${niveauData.duree} tours\n`;
                if (niveauData.cooldown > 0) description += `🔄 Cooldown : ${niveauData.cooldown} tours\n`;
                if (coutProchain) {
                    description += `💡 Améliorer : **${coutProchain}** point(s) de compétence *(vous avez ${joueur.points_competence})*\n`;
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
        
        const sortsAmeliorables = sorts.filter(s => s.niveau_actuel < 5);

        const components = [];

        if (sortsAmeliorables.length > 0) {
            const selectAmeliorer = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('ameliorer_sort')
                        .setPlaceholder('⬆️ Choisissez un sort à améliorer...')
                        .setDisabled(joueur.points_competence <= 0)
                        .addOptions(
                            sortsAmeliorables.map(sort => {
                                const cout = sort.niveau_actuel;
                                const peutAmeliorer = joueur.points_competence >= cout;
                                return {
                                    label: `${sort.nom} Nv.${sort.niveau_actuel} → Nv.${sort.niveau_actuel + 1}`,
                                    description: peutAmeliorer
                                        ? `Coût : ${cout} point(s) — Vous avez ${joueur.points_competence} point(s)`
                                        : `Coût : ${cout} point(s) — Pas assez de points !`,
                                    value: `${sort.sort_id}`,
                                    emoji: peutAmeliorer ? '⬆️' : '❌'
                                };
                            })
                        )
                );
            components.push(selectAmeliorer);
        }

        const rowRetour = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('retour_profil')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔙')
            );

        components.push(rowRetour);
        return { embeds: [embed], components, flags: 64 };
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

        const selectSorts = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('combatselect_sort')
                    .setPlaceholder('⚔️ Choisissez un sort...')
                    .addOptions(
                        sorts.map(sort => {
                            const enCooldown = cooldowns[sort.sort_id] > 0;
                            const niveauData = sort.niveaux.find(n => n.niveau === sort.niveau_actuel);
                            let description = '';

                            if (enCooldown) {
                                description = `⏳ Cooldown : ${cooldowns[sort.sort_id]} tour(s)`;
                            } else {
                                description = this.genererDescriptionSort(sort, niveauData);
                            }

                            return {
                                label: `${sort.nom} (Nv.${sort.niveau_actuel})`,
                                description: description.substring(0, 100),
                                value: `${sort.sort_id}`,
                                emoji: enCooldown ? '⏳' : '⚔️'
                            };
                        })
                    )
            );

        const rowFuite = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('combat_fuir')
                    .setLabel('Fuir')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏃')
            );
        
        const components = sorts.length > 0 ? [selectSorts, rowFuite] : [rowFuite];
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

    genererDescriptionSort(sort, niveauData) {
        const NOMS_STATS = {
            force_stat: 'Force',
            intelligence: 'Intelligence',
            chance: 'Chance',
            agilite: 'Agilité',
            vitalite: 'Vitalité'
        };

        if (sort.type === 'attaque' || sort.type === 'attaque_multiple') {
            const element = sort.composantes ? sort.composantes[0].element : sort.element || 'neutre';
            if (niveauData.composantes_degats) {
                const parties = niveauData.composantes_degats.map(c => `${c.degats_min} à ${c.degats_max} (${c.element})`);
                return `Inflige ${parties.join(' + ')} dégâts.`;
            }
            return `Inflige ${niveauData.degats_min} à ${niveauData.degats_max} dégâts ${element}.`;
        }

        if (sort.type === 'attaque_effet') {
            const element = sort.composantes ? sort.composantes[0].element : sort.element || 'neutre';
            let desc = '';
            if (niveauData.composantes_degats) {
                const parties = niveauData.composantes_degats.map(c => `${c.degats_min} à ${c.degats_max} (${c.element})`);
                desc = `Inflige ${parties.join(' + ')} dégâts`;
            } else {
                desc = `Inflige ${niveauData.degats_min} à ${niveauData.degats_max} dégâts ${element}`;
            }
            if (sort.effets) {
                sort.effets.forEach(effet => {
                    switch (effet.type) {
                        case 'brulure': desc += ` + brûlure de ${niveauData.brulure_par_tour} dégâts/tour pendant ${effet.duree} tours`; break;
                        case 'poison': desc += ` + poison de ${niveauData.poison_par_tour} dégâts/tour pendant ${effet.duree} tours`; break;
                        case 'saignement': desc += ` + saignement de ${niveauData.saignement_par_tour} dégâts/tour pendant ${effet.duree} tours`; break;
                        case 'debuff_stat': desc += ` + réduit ${NOMS_STATS[effet.stat] || effet.stat} de ${Math.abs(niveauData.valeur_effet)} pendant ${effet.duree} tours`; break;
                        case 'debuff_toutes_stats': desc += ` + réduit toutes les stats de ${Math.abs(niveauData.valeur_effet)} pendant ${effet.duree} tours`; break;
                    }
                });
            }
            return desc + '.';
        }

        if (sort.type === 'buff') {
            const parties = [];
            sort.effets.forEach(effet => {
                switch (effet.type) {
                    case 'bonus_degats_pct': parties.push(`+${niveauData.valeur || niveauData.valeur_degats}% dégâts`); break;
                    case 'bonus_stat': parties.push(`+${niveauData.valeur_stat || niveauData[`valeur_${effet.stat}`]} ${NOMS_STATS[effet.stat] || effet.stat}`); break;
                    case 'bonus_vitalite': parties.push(`+${niveauData.valeur_min} à ${niveauData.valeur_max} vitalité`); break;
                    case 'bonus_cc': parties.push(`+${niveauData.valeur_cc} CC`); break;
                    case 'resistance_element': parties.push(`-${Math.abs(niveauData.valeur)} dégâts ${effet.element} reçus`); break;
                    case 'resistance_tous': parties.push(`-${Math.abs(niveauData.valeur || niveauData.valeur_resistance)} dégâts reçus`); break;
                    case 'resistance_tous_pct': parties.push(`-${niveauData.valeur}% dégâts reçus`); break;
                    case 'absorption_degats': parties.push(`absorbe ${niveauData.valeur} dégâts`); break;
                    case 'perte_hp_immediate': parties.push(`-${niveauData.perte_hp} HP immédiat`); break;
                    case 'perte_hp_par_tour': parties.push(`-${niveauData.perte_hp} HP/tour`); break;
                    case 'soin_par_tour': parties.push(`+${niveauData.soin_par_tour} HP/tour`); break;
                    case 'soin_fin_effet': parties.push(`+${niveauData.soin_fin} HP en fin d'effet`); break;
                    case 'immunite_degats': parties.push(`immunité aux dégâts`); break;
                    case 'esquive_attaques': parties.push(`esquive ${niveauData.nb_esquives} attaque(s)`); break;
                    case 'multiplicateur_effets': parties.push(`×${niveauData.valeur} effets`); break;
                    case 'reduction_ec': parties.push(`-${niveauData.valeur_ec} EC`); break;
                    case 'bonus_degats_element_pct': parties.push(`+${niveauData.valeur}% dégâts ${effet.element}`); break;
                    case 'bonus_degats_hp_manquants': parties.push(`+${niveauData.valeur}% dégâts par % HP manquant`); break;
                    case 'vol_stat': parties.push(`vole ${niveauData.valeur_effet} ${NOMS_STATS[effet.stat] || effet.stat}`); break;
                }
            });
            return `${parties.join(', ')} pendant ${niveauData.duree} tours.`;
        }

        if (sort.type === 'soin') {
            return `Soigne ${niveauData.valeur_min} à ${niveauData.valeur_max} HP.`;
        }

        if (sort.type === 'debuff') {
            const parties = [];
            sort.effets.forEach(effet => {
                switch (effet.type) {
                    case 'debuff_stat': parties.push(`-${Math.abs(niveauData.valeur_effet)} ${NOMS_STATS[effet.stat] || effet.stat}`); break;
                    case 'debuff_toutes_stats': parties.push(`-${Math.abs(niveauData.valeur)} à toutes les stats`); break;
                }
            });
            return `${parties.join(', ')} pendant ${niveauData.duree || sort.effets[0].duree} tours.`;
        }

        return sort.description;
    } 

};

module.exports = builder;