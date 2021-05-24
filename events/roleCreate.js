const Discord = require('discord.js')
const {
    threshold,
    amount
} = require('../config.json')

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Role} role 
 */

module.exports = async (client, role) => {

    let audit = await role.guild.fetchAuditLogs({
        limit: 1,
        type: 30
    })

    let entry = audit.entries.first()
    let person = entry.executor

    client.roleCreateDelete.push({
        author: person.id,
        role: role.id,
        timestamp: Date.now(),
        guild: role.guild.id
    })

    let channel = client.db.guild.get(`logs_${role.guild.id}`)
    if (channel) await client.sendLog(channel, "Role Created", `${person.username} has created a role`)

    let filtered = client.roleCreateDelete.filter(c => c.timestamp > (Date.now() - threshold) && c.guild === role.guild.id)

    if (filtered.length > amount) {
        let member = await role.guild.members.fetch(person.id)
        if (member.banable) role.guild.members.ban(person.id).catch(e => {})

        if (channel) await client.sendLog(channel, "Member Banned", `${person.username} has been banned for creating too many roles`)
    }
}