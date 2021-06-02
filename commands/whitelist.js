const Discord = require('discord.js'),
    Client = require('../struct/Client')

module.exports = {
    name: "whitelist",
    description: `Whitelist a user so they will not be affected by antiraid`,

    /**
     * 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @param {Client} client 
     */

    execute: async function (message, args, client) {
        let user = await client.resolveUser(args[0])
        if(!user) return message.channel.send(`Please provide a user`)
        client.db.guild.push(`whitelisted_${message.guild.id}`, user.id)
        return message.channel.send(`Whitelisted **${user.tag}**`)
    }
}