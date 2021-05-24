const Discord = require('discord.js')
const {
    threshold,
    amount
} = require('../config.json')

let roleUpdate = []

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Role} oldRole 
 * @param {Discord.Role} newRole 
 */


module.exports = async (client, oldRole, newRole) => {
    let oldPerms = oldRole.permissions
    let newPerms = oldRole.permissions

    if (!oldPerms.has("ADMINISTRATOR") && newPerms.has("ADMINISTRATOR")) {

        let audit = newRole.guild.fetchAuditLogs({
            limit: 1,
            type: 31
        })
        let entry = audit.entries.first()
        let person = entry.executor

        let whitelisted = client.db.guild.ensure(`whitelisted_${newRole.guild.id}`, [])
        if (whitelisted.includes(person.id)) return;

        roleUpdate.push({
            author: person,
            role: newRole.id,
            timestamp: Date.now(),
            guild: newRole.guild.id
        })

        let channel = client.db.guild.get(`logs_${oldRole.guild.id}`)
        if (channel) await client.sendLog(channel, `Role Updated`, `${person.username} has given the ${newRole.toString} role ADMINISTRATOR permissions :warning: `)

        let filteredRoles = roleUpdate.filter(c => c.timestamp > (Date.now() - threshold))
        if (filteredRoles.length > amount) {
            let member = await newRole.guild.members.fetch(person.id)
            if (member.banable) newRole.guild.members.ban(person.id).catch(e => {})
            if (channel) await client.sendLog(channel, `Member Banned`, `${person.username} has been banned for giving too many roles administrator`)
        }
    }
}