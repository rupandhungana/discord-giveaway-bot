const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");
const {
    config
} = require("dotenv");
const connectDatabase = require("./database");

config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildIntegrations
    ],
});
module.exports = client;
connectDatabase(process.env.MONGOOSE_CONNECTION_STRING)
client.slashCommands = new Collection();
require("./handler/index")(client);
require("./manager")(client);

client.login(process.env.TOKEN);