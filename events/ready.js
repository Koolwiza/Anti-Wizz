const Client = require('../struct/Client')

/**
 * 
 * @param {Client} client 
 */

module.exports = (client) => {

    let {
        invites
    } = client

    console.clear()
    console.log(`${client.user.username} is online!`)

    client.guilds.cache.forEach(async guild => {
        await client.wait(2000) // to prevent api spamming
        let guildInvites = await guild.fetchInvites()
        if (guild.vanityURLCode) guildInvites.set(guild.vanityURLCode, await guild.fetchVanityData())
        invites[guild.id] = guildInvites
    })
}