const Discord = require('discord.js'),
    Client = require('../struct/Client')

module.exports = {
    name: "lockdown",
    description: `Sets the server to highest security`,

    /**
     * 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @param {Client} client 
     */

    execute: async function (message, args, client) {
        if (!message.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) return message.channel.send("Missing perms")

        let lockdowned = client.db.locks.ensure('lockdown', false)
        if (!lockdowned) {
            client.db.locks.set('lockdown', true)
            let obj = {}

            await message.guild.members.fetch()

            message.guild.members.cache.forEach(member => {
                let mapped = member.roles.cache.map(c => c.id)
                obj[member.user.id] = mapped
                member.roles.set([]).catch(e => {})
            })
            message.guild.channels.cache.forEach(channel => {
                client.db.locks.set(`channel_${message.guild.id}_${channel.id}`, channel.permissionOverwrites)
                channel.overwritePermissions(channel.permissionOverwrites.map(c => c.update({
                    SEND_MESSAGES: false,
                    CONNECT: false,
                    ADD_REACTIONS: false,
                    USE_SLASH_COMMANDs: false
                })))
            })

            client.db.locks.set(`role_data_${message.guild.id}`, obj)

            return message.channel.send(":warning: SERVER IS NOW UNDER LOCKDOWN")
        } else {
            client.db.locks.set('lockdown', false)
            message.guild.members.cache.forEach(member => {
                let roles = client.db.locks.get(`role_data_${message.guild.id}`)[member.user.id]
                console.log(member.user.username, roles)
                member.roles.set(roles)
            })

            client.db.locks.delete(`role_data_${message.guild.id}`)

            message.guild.channels.cache.forEach(channel => {
                let data = client.db.locks.get(`channel_${message.guild.id}_${channel.id}`)
                channel.overwritePermissions(data).catch(e => {})
            })
            return message.channel.send("DISABLED LOCKDOWN")
        }
    }
}