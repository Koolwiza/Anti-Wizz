const Discord = require('discord.js'),
    Client = require('../struct/Client')

/**
 * 
 * @param {Client} client 
 * @param {Discord.Invite} invite 
 * @param {Discord.Guild} guild 
 */

module.exports = (client, invite, guild) => {

    let {
        invites
    } = client

    let guildInvites = invites[invite.guild.id]
    guildInvites.set(invite.code, invite)
    client.codeinvites[invite.guild.id] = guildInvites
}