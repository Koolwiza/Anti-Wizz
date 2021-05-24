const Discord = require('discord.js')
const {
    threshold,
    amount
} = require('../config.json')

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.GuildChannel} channel 
 */

module.exports = async (client, channel) => {
    let audit = await channel.guild.fetchAuditLogs({
        type: 12,
        limit: 1
    })

    let entry = audit.entries.first()
    let person = entry.person

    let whitelisted = client.db.guild.ensure(`whitelisted_${channel.guild.id}`, [])
    if(whitelisted.includes(person.id)) return;

    client.guildChannelCreate.push({
        channel: channel.id,
        author: person,
        timestamp: Date.now(),
        guild: channel.guild.id
    })

    let ch = client.db.guild.get(`logs_${channel.guild.id}`)
    if (ch) await client.sendLog(ch, "Channel Deleted", `${person.username} has deleted a channel`)

    let filteredEntries = client.guildChannelCreate.filter(c => c.timestamp > (Date.now() - threshold) && c.guild === channel.guild.id)

    if (filteredEntries.length > amount) {
        let member = await channel.guild.members.fetch(person.id)
        if (member.banable) channel.guild.members.ban(person.id).catch(e => {})

        await client.sendLog(channel, "Channel Deleted", `${person.username} has deleted too many channels`)
    }
}