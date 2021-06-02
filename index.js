const { readdirSync } = require('fs');

const Client = require('./struct/Client'),
    client = new Client(),
    {
        token
    } = require('./config.json')

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

module.exports.client = client