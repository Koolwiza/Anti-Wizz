const Discord = require('discord.js'),
    Client = require('../struct/Client')

module.exports = {
    name: "delchannel",
    description: `Delete the channels with the same name`,

    /**
     * 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @param {Client} client 
     */

    execute: async function (message, args, client) {
        let name = args.join('-')
        let channels = message.guild.channels.cache.filter(c => c.name.toLowerCase() === name)
        let length = channels.size

        channels.forEach(a => a.delete().catch(c => {
            console.log(`Failed to delete ${c.name}`)
        }))

        return message.channel?.send(`Deleted ${length} channel${length > 1 ? "s" : ""} with the name including ${name}`)
    }
}