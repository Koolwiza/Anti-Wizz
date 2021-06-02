const Discord = require('discord.js'),
    Client = require('../struct/Client')

module.exports = {
    name: "help",
    description: `Lists all commands`,

    /**
     * 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @param {Client} client 
     */

    execute: async function (message, args, client) {
        let commandMessage = client.commands.map(c => `\`${c.name}\` - ${c.description}`).join('\n');
        return message.channel.send(`These are my commands:\n\n${commandMessage}`)
    }
}