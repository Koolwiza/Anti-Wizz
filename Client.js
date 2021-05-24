const {
    Client,
    Collection,
    MessageEmbed,
    User
} = require('discord.js'),
    util = require('util'),
    Enmap = require('enmap'),
    config = require('./config.json')

module.exports = class extends Client {
    constructor(options) {
        super(options)


        this.invites = {}
        this.roleCreateDelete = []
        this.channelCreateDelete = []
        this.commands = new Collection()
        this.db = {
            locks: new Enmap({
                name: "locks",
                fetchAll: true,
                autoFetch: true
            }),
            guild: new Enmap({
                name: "locks",
                fetchAll: true,
                autoFetch: true
            })
        }
        this.config = config
    }

    async sendLog(channel, title, desc) {
        let ch = await this.channels.fetch(channel).catch(e => {})
        let embed = new MessageEmbed()
            .setTitle(title)
            .setDescription(desc)
            .setColor(this.config.embedColor)
            .setFooter(this.user.username, this.user.displayAvatarURL())
            .setAuthor(channel.guild.name, channel.guild.iconURL({
                dynamic: true
            }))

        return ch.send(embed)
    }

    /**
     * 
     * @param {string} search 
     * @returns {User}
     */

    resolveUser(search) {
        let user = null;
		if(!search || typeof search !== "string") return;
		if(search.match(/^<@!?(\d+)>$/)){
			const id = search.match(/^<@!?(\d+)>$/)[1];
			user = this.users.fetch(id).catch(() => {});
			if(user) return user;
		}
		if(search.match(/^!?(\w+)#(\d+)$/)){
			const username = search.match(/^!?(\w+)#(\d+)$/)[0];
			const discriminator = search.match(/^!?(\w+)#(\d+)$/)[1];
			user = this.users.fetch({limit: 1, query: `${username}#${discriminator}`});
			if(user) return user;
		}
		user = await this.users.fetch(search).catch(() => {});
		return user;
    }

    wait = util.promisify(setTimeout)

}