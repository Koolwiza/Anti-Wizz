const Discord = require('discord.js')
const Client = require('../struct/Client')
const {
    threshold,
    amount
} = require('../config.json')

/**
 * 
 * @param {Client} client 
 * @param {Discord.GuildChannel} channel 
 */

module.exports = async (client, channel) => {
    if(channel.type === "dm") return;
    let audit = await channel.guild.fetchAuditLogs({
        type: 10,
        limit: 1
    })

    let entry = audit.entries.first()
    let person = entry.executor

    let whitelisted = client.db.guild.ensure(`whitelisted_${channel.guild.id}`, [client.user.id])
    if(whitelisted.includes(person.id)) return;

    client.channelCreateDelete.push({
        channel: channel.id,
        author: person,
        timestamp: Date.now(),
        guild: channel.guild.id
    })

    let ch = client.db.guild.get(`logs_${channel.guild.id}`)
    if (ch) await client.sendLog(ch, "Channel Created", `${person.username} has created a channel`)

    let filteredEntries = client.channelCreateDelete.filter(c => c.timestamp > (Date.now() - threshold) && c.guild === channel.guild.id)

    if (filteredEntries.length > amount) {
        filteredEntries.forEach(c => {
            let createChannel = channel.guild.channels.cache.get(c.channel)
            if(createChannel) createChannel.delete().catch(c => {})
        })
        channel.guild.members.ban(person.id).catch(e => {})
        await client.sendLog(ch, "Too many channels", `${person} was banned for creating too many channels`)
    }
}