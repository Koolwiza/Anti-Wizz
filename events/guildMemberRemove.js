const Discord = require('discord.js')
const {
    threshold,
    amount
} = require('../config.json')

let kicked = []

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.GuildMember} member 
 */

module.exports = async (client, member) => {
    let audit = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 20
    })

    let entry = audit.entries.first()
    let authorKick = entry.executor

    kicked.push({
        member: member.id,
        author: authorKick.id,
        timestamp: Date.now(),
        guild: member.guild.id
    })

    let channel = client.db.guild.get(`logs_${member.guild.id}`)
    if (channel) await client.sendLog(channel, "Member Kicked", `${member.user.username} has been kicked by ${authorKick.username}`)


    kicked = kicked.filter(c => c.guild === member.guild.id && c.timestamp > (Date.now() - threshold))

    if (kicked.length > amount) {
        let mem = await member.guild.members.fetch(authorKick.id)
        if (mem.banable) member.guild.members.ban(authorKick.id).catch(e => {})
        if (channel) await client.sendLog(channel, "Member Banned", `${member.user.username} has been banned for kicking too many members`)
    }
}