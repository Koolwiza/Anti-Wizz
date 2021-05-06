const Discord = require('discord.js')
const {
    threshold,
    amount
} = require('../config.json')

let userCacheInvite = {}

module.exports = async (client, member) => {

    let {
        invites
    } = client

    if (member.user.bot) {
        member.guild.fetchAuditLogs({
            limit: 1,
            type: 28
        }).then(async audit => {
            let a = audit.entries.first()
            let user = a.executor
            let bot = a.target

            let owner = await member.guild.members.fetch(member.guild.ownerID)
            let mem = await member.guild.members.fetch(bot.id)

            await mem.kick("Added bot without consent")
            await owner.send(
                new Discord.MessageEmbed()
                .setTitle(":warning: Bot added")
                .setDescription(`${user.toString()} has added the bot ${bot.toString()} to your server. The bot has been kicked `)
                .setColor("RED")
                .setFooter(client.user.username, client.user.displayAvatarURL())
            )
        })
    }

    let guildInvites = await member.guild.fetchInvites()
    const ei = invites[member.guild.id]
    client.invites[member.guild.id] = guildInvites
    const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
    if (!invite) return;

    let authorInvites = userCacheInvite[invite.inviter.id]
    if (!authorInvites) {
        userCacheInvite[invite.inviter.id] = [member.user.id]
    } else {
        userCacheInvite[invite.inviter.id] = [...userCacheInvite[invite.inviter.id], member.user.id]
    }

    let authorMembers = userCacheInvite[invite.inviter.id]
    let fromEntries = authorMembers.map(async c => {
        let foundMember = await member.guild.members.fetch(c)
        return [c, foundMember]
    })

    let coll = new Discord.Collection(await Promise.all(fromEntries))
    coll = coll.filter(c => c.joinedTimestamp > (Date.now() - threshold))

    if (coll.size >= amount) {
        coll.forEach(C => {
            if (C.bannable) C.kick({
                reason: "Token raiding",
                days: 7
            }).catch(e => {
                console.log(e)
            })
        })
    }

}