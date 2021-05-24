module.exports = (client, invite, guild) => {

    let {
        invites
    } = client

    let guildInvites = invites[invite.guild.id]
    guildInvites.set(invite.code, invite)
    client.codeinvites[invite.guild.id] = guildInvites
}