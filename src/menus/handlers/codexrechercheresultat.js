const playerDB = require('../../database/playerDB');
const codexDB = require('../../database/codexDB');
const builder = require('../builder');

module.exports = async (interaction, params) => {
    const discord_id = interaction.user.id;
    const joueur = playerDB.get(discord_id);
    const categorie = params[0];
    const texte = interaction.fields.getTextInputValue('recherche_texte').toLowerCase();

    let entrees = [];

    if (categorie === 'monstre') {
        const enemiesData = require('../../../data/enemies.json');
        const decouverts = codexDB.getEntrees(discord_id, 'monstre');
        entrees = decouverts.map(d => {
            const enemy = enemiesData.enemies.find(e => e.id === parseInt(d.entree_id));
            return enemy ? { id: enemy.id, nom: enemy.nom, description_courte: enemy.description || '' } : null;
        }).filter(Boolean);
    }

    if (categorie === 'sort') {
        const sortsClasse = codexDB.getSortsClasse(joueur.classe);
        entrees = sortsClasse.map(s => ({
            id: s.id,
            nom: s.nom,
            description_courte: `Débloqué niveau ${s.niveau_deblocage}`
        }));
    }

    // Filtrer par texte
    const entreesFiltrees = entrees.filter(e => e.nom.toLowerCase().includes(texte));

    if (entreesFiltrees.length === 0) {
        await interaction.reply({
            content: `🔍 Aucun résultat pour **"${texte}"** dans la catégorie **${categorie}**.`,
            flags: 64
        });
        return;
    }

    await interaction.update(builder.codexListe(joueur, categorie, entreesFiltrees, 0));
};