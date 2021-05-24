const Discord = require('discord.js'),
    Client = require('../struct/Client'),
    {
        pullAt
    } = require('lodash')

module.exports = {
    name: "balcklist",
    description: `Blacklist a whitelisted user (remove whitelist)`,

    /**
     * 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @param {Client} client 
     */

    execute: async function (message, args, client) {
        let user = await client.resolveUser(args[0])
        let whitelisted = client.db.guild.get(`whitelisted_${message.guild.id}`)
        let newArr = pullAt(whitelisted, whitelisted.indexOf(user.id))
        client.db.guild.set(`whitelisted_${message.guild.id}`, newArr)
        return message.channel.send(`I have removed **${user.tag}** from the whitelisted users`)
    }
}