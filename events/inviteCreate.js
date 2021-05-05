module.exports = (invite, guild, client) => {

    let {
        invites
    } = client

    let guildInvites = invites[invite.guild.id]
    guildInvites.set(invite.code, invite)
    client.codeinvites[invite.guild.id] = guildInvites
}