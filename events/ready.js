const client = require("../index");
const { ActivityType } = require('discord.js')

client.on("ready", () => {
    console.log(`${client.user.tag} is online.`);
});
