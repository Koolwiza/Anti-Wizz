const {
    threshold,
    amount
} = require('../config.json'),
    Client = require('../struct/Client')

/**
 * 
 * @param {Client} client 
 * @param {Discord.Channel} channel 
 */

module.exports = async (client, channel) => {

    let ch = client.db.guild.get(`logs_${channel.guild.id}`)
    if (ch) await client.sendLog(ch, "Webhook Created", `A webhook as been created`)

    let webhooks = await channel.fetchWebhooks()
    let inTimeWebhook = webhooks.filter(c => {
        return c.createdTimestamp > (Date.now() - threshold)
    })

    if (inTimeWebhook.size >= amount) {
        let owners = inTimeWebhook.map(c => c.owner.id)

        inTimeWebhook.forEach(c => c.delete("Webhook spam").catch(e => {
            console.log(`Had an error deleting webhooks. \n${e}`)
        }))
        owners.forEach(async c => {
            let member = await channel.guild.members.fetch(c)
            if (ch) await client.sendLog(ch, `Member Banned`, `${member.user.username} has been banned for creating too many webhooks`)

            member.ban({
                days: 7,
                reason: "Webhook spamming"
            }).catch(e => {
                console.log(`Had an error banning ${member.user.username}\n${e}`)
            })

        })
    }
}