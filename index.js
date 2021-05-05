const { readdirSync } = require('fs');

const Discord = require('discord.js'),
    client = new Discord.Client(),
    {
        threshold,
        token,
        amount
    } = require('./config.json'),
    {
        promisify
    } = require('util'),
    Enmap = require('enmap')

client.wait = promisify(setTimeout)
client.invites = {}
client.commands = new Discord.Collection()
client.db = {}


let evtFiles = readdirSync('./events').filter(c => c.endsWith('.js'))

evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    client.on(eventName, event.bind(null, client));
});

let cmdFiles = readdirSync('./commands').filter(c => c.endsWith('.js'))

for (let file of cmdFiles) {
    let cmd = require(`./commands/${file}`)
    client.commands.set(cmd.name, cmd)
}

client.login(token)