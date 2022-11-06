#!/usr/bin/node

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes, IntentsBitField } = require('discord.js');
require('dotenv').config()

const clientId = process.env.CLIENT_ID
const token = process.env.TOKEN

function Deploy(){

  const commands = [];
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
  	const filePath = path.join(commandsPath, file);
  	const command = require(filePath);
  	commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(token);

  rest.put(Routes.applicationCommands(clientId), { body: commands })
  	.then(() => console.log('Commandes enregistré avec succes'))
  	.catch(console.error)

  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

}

const myIntents = new IntentsBitField(32767);
const client = new Client({
	intents: [
    myIntents 
	],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  client.user.setPresence({ activities: [{name : "hentais", type : 3}], status: 'online'})
	console.log('Bot lancé')
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Erreure en traitant la commande!', ephemeral: true });
	}
});

client.login(token);
Deploy()
