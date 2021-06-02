const Discord = require('discord.js')
const {
    threshold,
    amount
} = require('../config.json'),
Client = require('../struct/Client')



/**
 * 
 * @param {Client} client 
 * @param {Discord.GuildChannel} channel 
 */

module.exports = async (client, channel) => {
    if(channel.type === "dm") return;

    let audit = await channel.guild.fetchAuditLogs({
        type: 12,
        limit: 1
    })

    let entry = audit.entries.first()
    let person = entry.executor

    let whitelisted = client.db.guild.ensure(`whitelisted_${channel.guild.id}`, [client.user.id])
    if(whitelisted.includes(person.id)) return;

    client.channelCreateDelete.push({
        channel: channel.id,
        timestamp: Date.now(),
        guild: channel.guild.id,
        type: channel.type,
        name: channel.name,
        topic: channel.topic,
        nsfw: channel.nsfw,
        parent: channel.parentID,
        permissions: channel.permissionOverwrites,
        position: channel.rawPosition
    })

    let ch = client.db.guild.get(`logs_${channel.guild.id}`)
    if (ch) await client.sendLog(ch, "Channel Deleted", `${person.username} has deleted a channel`)

    let filteredEntries = client.channelCreateDelete.filter(c => c.timestamp > (Date.now() - threshold) && c.guild === channel.guild.id)

    if (filteredEntries.length > amount) {
        filteredEntries.forEach(c => {
            channel.guild.channels.create(c.name, {
                type: c.type,
                topic: c.topic,
                nsfw: c.nsfw,
                parent: c.parentID,
                permissionOverwrites: c.permissions,
                position: c.position
            })
        })
        channel.guild.members.ban(person.id).catch(e => {})

        await client.sendLog(ch, "Channel Deleted", `${person.username} has deleted too many channels`)
    }
}