const {
    prefix
} = require('../config.json'),
    Discord = require('discord.js'),
    Client = require('../struct/Client')

let sentEveryones = []

/**
 * 
 * @param {Discord.Message} message 
 * @param {Client} client 
 * @returns 
 */


module.exports = async (client, message) => {
    if (!message.guild) return;

    let toxic = await client.toxic.init(message.content)
    if(toxic) {
        message.delete().catch(c => {})
        message.channel.send("You sent a toxic message!")
    }

    if (message.mentions.everyone) {

        let whitelisted = client.db.guild.ensure(`whitelisted_${message.guild.id}`, [])
        if (whitelisted.includes(message.author.id)) return;

        sentEveryones.push({
            guild: message.guild.id,
            author: message.author.id,
            channel: message.channel.id,
            timestamp: message.createdTimestamp
        })

        let channel = client.db.guild.get(`logs_${message.guild.id}`)
        if (channel) client.sendLog(channel, `Mentioned Everyone`, `${message.author.tag} has mentioned "everyone"`)

        let authorEntries = sentEveryones.filter(c => c.author === message.author.id)
        let filteredEntries = authorEntries.filter(c => c.content === message.content && (c.timestamp > (message.createdTimestamp - threshold)))

        if (filteredEntries >= amount) {
            if (message.member.bannable) await message.member.ban({
                days: 7,
                reason: "Spam ping"
            }).catch(e => {
                console.log(`Error banning ${message.author.username}`, e)
            })

            if (channel) client.sendLog(channel, `Member Banned`, `${message.author.username} has been banned for spamming @ everyone too many times`)
        }
    }
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    let args = message.content.slice(prefix.length).trim().split(/\s+/g)
    let commandName = args.shift().toLowerCase()

    let command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))
    if (!command) return;

    try {
        await command.execute(message, args, client)
    } catch (e) {
        console.log(e)
    }

}