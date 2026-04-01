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
    `);
    
    console.log('✅ Base de données initialisée');
};

module.exports = { db, initDB };