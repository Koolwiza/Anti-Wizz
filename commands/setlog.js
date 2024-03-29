const Discord = require('discord.js'),
    Client = require('../struct/Client')

module.exports = {
    name: "setlog",
    description: `Sets the server log channel`,

    /**
     * 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @param {Client} client 
     */

    execute: async function (message, args, client) {
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel
        client.db.guild.set(`logs_${message.guild.id}`, channel.id)
        return message.channel.send(`Set logs channel as ${channel.toString()}`)
    }
}