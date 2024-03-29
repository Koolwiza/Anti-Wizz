const Discord = require('discord.js')
const {
    threshold,
    amount
} = require('../config.json'),
Client = require('../struct/Client'),
humanize = require('humanize-duration')

let userCacheInvite = {}

/**
 * 
 * @param {Client} client 
 * @param {Discord.GuildMember} member 
 * @returns 
 */

module.exports = async (client, member) => {

    let {
        invites
    } = client

    if (member.user.bot) {
        let audit = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 28
        })
        let a = audit.entries.first()
        let user = a.executor
        let bot = a.target

        let whitelisted = client.db.guild.ensure(`whitelisted_${member.guild.id}`, [client.user.id])
        if (whitelisted.includes(user.id)) return;

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
        let channel = client.db.guild.get(`logs_${member.guild.id}`)
        if (channel) await client.sendLog(channel, "Member Joined", `${person.username} has been invited`)

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
        coll.forEach(async C => {
            if (C.bannable) C.ban({
                reason: "Token raiding",
                days: 7
            }).catch(e => {
                console.log(e)
            })
            let channel = client.db.guild.get(`logs_${member.guild.id}`)
            if (channel) await client.sendLog(channel, "Member Banned", `${C.user.username} was banned for token raiding`)
        })
    }


    let data = client.db.antiAlt.ensure(member.guild.id, {
        ...client.config.settings
    })

    let dataAge = data.age * 24 * 60 * 60 * 1000

    let minAge = Date.now() + dataAge
    let userCreate = member.user.createdTimestamp

    if (userCreate < minAge) {
        let userTime = humanize(Date.now() - userCreate, {
            conjunction: " and ",
            serialComma: false
        })

        let ageTime = humanize(dataAge, {
            conjunction: " and ",
            serialComma: false
        })

        let neededTime = humanize(minAge - userCreate, {
            conjunction: " and ",
            serialComma: false
        })

        await member.user.send(new Discord.MessageEmbed()
            .setTitle("You were detected")
            .setDescription(`You were **${data.punishment === "kick" ? "kicked" : "banned"}** from ${member.guild.name}.\nMinimum Account Age: ${ageTime}\nYour Account Age: ${userTime}. \n\n*PS. Your account needs to be ${neededTime} older!*`)
            .setColor("RED")
            .setAuthor(member.user.tag, member.user.displayAvatarURL())
            .setFooter(client.user.username)
            )

        if (data.punishment.toLowerCase() === "kick") {
            await member.kick('Did not meet account age requirement: ' + ageTime).catch(async e => {
                let ch = member.guild.channels.cache.get(data.logs)
                await ch.send(
                    new Discord.MessageEmbed()
                    .setTitle("Error!")
                    .setDescription(`:warning: I had an error kicking ${member ?? member.user.tag}`)
                    .setColor("RED")
                    .setAuthor(member.user.tag, member.user.displayAvatarURL())
                    .setFooter(client.user.username)                )
            })
        } else if (data.punishment.toLowerCase() === "ban") {
            member.guild.members.ban(member, {
                reason: "Did not meet account age requirement: " + ageTime
            }).catch(async e => {
                let ch = member.guild.channels.cache.get(data.logs)
                await ch.send(
                    new Discord.MessageEmbed()
                    .setTitle("Error!")
                    .setDescription(`:warning: I had an error banning ${member ?? member.user.tag}`)
                    .setColor("RED")
                    .setAuthor(member.user.tag, member.user.displayAvatarURL())
                    .setFooter(client.user.username)                )
            })
        }
    }
    

}