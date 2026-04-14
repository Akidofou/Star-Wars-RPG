const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname,'../../game.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const initDB = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS players (
        discord_id          TEXT PRIMARY KEY,
        username            TEXT NOT NULL,
        classe              TEXT DEFAULT 'aucune',
        faction             TEXT DEFAULT 'neutre',
        niveau              INTEGER DEFAULT 1,
        experience          INTEGER DEFAULT 0,
        pieces_or           INTEGER DEFAULT 500,
        hp_actuel           INTEGER DEFAULT 50,
        hp_max              INTEGER DEFAULT 50,
        vitalite            INTEGER DEFAULT 0,
        sagesse             INTEGER DEFAULT 0,
        force_stat          INTEGER DEFAULT 0,
        intelligence        INTEGER DEFAULT 0,
        chance              INTEGER DEFAULT 0,
        agilite             INTEGER DEFAULT 0,
        points_stat         INTEGER DEFAULT 0,
        points_competence   INTEGER DEFAULT 0,
        zone_actuelle       TEXT DEFAULT 'asure',
        secteur_actuel      TEXT DEFAULT 'asuria',
        position            TEXT DEFAULT 'ville',
        etat                TEXT DEFAULT 'libre',
        created_at          TEXT DEFAULT (datetime('now')),
        last_seen           TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS codex (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_id          TEXT NOT NULL,
        type_entree         TEXT NOT NULL,
        entree_id           TEXT NOT NULL,
        decouvert_at        TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (discord_id) REFERENCES players(discord_id)
        );

        CREATE TABLE IF NOT EXISTS competences_joueur (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_id    TEXT NOT NULL,
        competence_id INTEGER NOT NULL,
        niveau        INTEGER DEFAULT 1,
        FOREIGN KEY (discord_id) REFERENCES players(discord_id)
        );

        CREATE TABLE IF NOT EXISTS repos (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_id  TEXT NOT NULL,
        debut_repos TEXT NOT NULL,
        hp_depart   INTEGER NOT NULL,
        hp_cible    INTEGER NOT NULL,
        FOREIGN KEY (discord_id) REFERENCES players(discord_id)
        );

        CREATE TABLE IF NOT EXISTS combats (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_id          TEXT NOT NULL,
        enemy_id            INTEGER NOT NULL,
        enemy_niveau        INTEGER NOT NULL,
        enemy_hp            INTEGER NOT NULL,
        enemy_hp_max        INTEGER NOT NULL,
        enemy_stats         INTEGER NOT NULL,
        effets_joueur       TEXT DEFAULT '[]',
        effets_ennemi       TEXT DEFAULT '[]',
        cooldowns_joueur    TEXT DEFAULT '{}',
        cooldowns_ennemi    TEXT DEFAULT '{}',
        tour                INTEGER DEFAULT 1,
        statut              TEXT DEFAULT 'en_cours',
        created_at          TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (discord_id) REFERENCES players(discord_id)
        );

        CREATE TABLE IF NOT EXISTS inventaire (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_id      TEXT NOT NULL,
        item_type       TEXT NOT NULL,
        item_id         TEXT NOT NULL,
        quantite        INTEGER DEFAULT 1,
        created_at      TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (discord_id) REFERENCES players(discord_id)
        );

    `);
    
    console.log('✅ Base de données initialisée');
};

module.exports = { db, initDB };