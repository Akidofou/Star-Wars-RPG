const { db } = require('./database');

const playerDB = {

    exists(discord_id) {
        const row = db.prepare('SELECT 1 FROM players WHERE discord_id = ?').get(discord_id);
        return !!row;
    },

    create(discord_id, username) {
        db.prepare(`
            INSERT INTO players (discord_id, username)
            VALUES (?, ?)
        `).run(discord_id, username);
        return playerDB.get(discord_id);
    },

    get(discord_id) {
        return db.prepare('SELECT * FROM players WHERE discord_id = ?').get(discord_id);
    },

    update(discord_id, champs) {
        const keys = Object.keys(champs);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(champs), discord_id];
        db.prepare(`
            UPDATE players SET ${setClause}, last_seen = datetime('now')
            WHERE discord_id = ?
        `).run(...values);
    },

};

module.exports = playerDB;