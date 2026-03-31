module.exports = {
    name: 'clientReady',
    one: true,
    execute(client) {
        console.log(`✅ Bot connecté en tant que ${client.user.tag}`);
        console.log(`📡 Serveurs connectés : ${client.guilds.cache.size}`);
    }
};