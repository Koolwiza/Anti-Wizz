module.exports = async (client, guild) => {
    let {
        invites
    } = client

    let guildInvites = await guild.fetchInvites()
    if (guild.vanityURLCode) guildInvites.set(guild.vanityURLCode, await guild.fetchVanityData())
    invites[guild.id] = guildInvites
}