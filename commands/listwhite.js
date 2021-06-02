const Discord = require('discord.js'),
    Client = require('../struct/Client')

module.exports = {
    name: "listwhite",
    description: `List the whitelisted people`,

    /**
     * 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @param {Client} client 
     */

    execute: async function (message, args, client) {
        let users = client.db.guild.ensure(`whitelisted_${message.guild.id}`, [client.user.id])

        let res = users.map(async c => {
            let user = await client.users.fetch(c)
            return user
        })

        let asdf = (await Promise.all(res)).map(c => c.tag)
        
        message.channel.send(`The whitelisted people are: \n\n${asdf.join('\n')}`)
    }
}