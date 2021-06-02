const {
    Client,
    Collection,
    MessageEmbed,
    User
} = require('discord.js'),
    util = require('util'),
    Enmap = require('enmap'),
    config = require('../config.json'),
    AntiToxic = require('./AntiToxic')

module.exports = class extends Client {
    constructor(options) {
        super(options)


        this.invites = {}
        this.roleCreateDelete = []
        this.channelCreateDelete = []
        this.commands = new Collection()
        this.toxic = new AntiToxic(config.perspective)
        this.db = {
            locks: new Enmap({
                name: "locks",
                fetchAll: true,
                autoFetch: true
            }),
            guild: new Enmap({
                name: "guild",
                fetchAll: true,
                autoFetch: true
            }),
            antiAlt: new Enmap({
                name: "antialt",
                fetchAll: true,
                autoFetch: true
            })
        }
        this.config = config

    }

    async sendLog(channel, title, desc) {
        let ch = await this.channels.fetch(channel).catch(e => {})
        if(!ch) return;
        let embed = new MessageEmbed()
            .setTitle(title)
            .setDescription(desc)
            .setColor(this.config.embedColor)
            .setFooter(this.user.username, this.user.displayAvatarURL())
            
        return ch.send(embed)
    }

    /**
     * 
     * @param {string} search 
     * @returns {Promise<User>}
     */

    async resolveUser(search) {
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