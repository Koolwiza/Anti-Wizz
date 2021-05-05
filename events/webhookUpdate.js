const {threshold, amount} = require('../config.json')

module.exports = (channel, client) => {
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
            if (member.bannable) {
                member.ban({
                    days: 7,
                    reason: "Webhook spamming"
                }).catch(e => {
                    console.log(`Had an error banning ${member.user.username}\n${e}`)
                })
            }
        })
    }
}