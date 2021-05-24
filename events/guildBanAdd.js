const Discord = require('discord.js')
const {
    threshold,
    amount
} = require('../config.json')

let banned = []

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Guild} guild 
 * @param {Discord.User} user 
 */


module.exports = async (client, guild, user) => {

    let audit = await guild.fetchAuditLogs({
        type: 22,
        limit: 1
    })

    let entry = audit.entries.first()
    let banAuthor = entry.executor

    banned.push({
        member: user.id,
        guild: guild.id,
        timestamp: Date.now(),
        author: banAuthor.id
    })

    let channel = client.db.guild.get(`logs_${guild.id}`)
    if(channel) await client.sendLog(channel, "Member banned", `${person.username} has banned **${user.tag}**`)


    banned = banned.filter(c => c.timestamp > (Date.now() - threshold) && c.guild === guild.id)
    if(banned.length > amount) {
        banned.forEach(c => {
            guild.members.ban(c.author).catch(() => {})
            guild.members.unban(c.member).catch(() => {})
        })

        if(channel) await client.sendLog(channel, "Member banned", `${banAuthor.username} has been banned for banning too many members`)
    }
}