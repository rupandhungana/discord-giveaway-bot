const ms = require("ms");
const Giveaway = require("./database/schemas/Giveaway");
const {
    Client,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonStyle
} = require("discord.js");

/**
 * 
 * @param {Client} client 
 */

module.exports = (client) => {
    setInterval(async () => {
        const gdata = await Giveaway.find({
            ended: false
        });
        if (!gdata && !gdata.length) return;
        gdata.forEach(async (data) => {
            if (data.ended === true) return;
            // finding cahnnels,message, host if they are unable to fetch it will delte itself
            const gw_channel = await client.channels.fetch(data.channelId, {
                force: true
            }).catch(async () => await deleteGw(data._id));
            const gw_message = await gw_channel.messages.fetch(data.messageId, {
                force: true
            }).catch(async () => await deleteGw(data._id));
            const gw_host = await client.guilds.cache.get(data.guildId).members.fetch(data.host).catch(async () => await deleteGw(data._id));
            const date = data.startAt.getTime();

            if (Date.now() - data.endAt < date) return false;
            const winners = getWinners(client, data.users, data.winnerCount);
            let textFormate;
            if (winners.length <= 0) {
                textFormate = `Unable to determin winners. looks like nobody joined the giveaway :(`
            } else {
                textFormate = `Congratulations, ${winners.join(',')}! You won **${data.prize}**🎉🎉`
            }
            data.winners = winners;
            data.ended = true;
            await data.save();
            const giveaway_ended_button = new ButtonBuilder()
                .setCustomId(`enter`)
                .setEmoji('🎉')
                .setLabel(`${gdata.length}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
            const ge_message_link = new ButtonBuilder()
                .setURL(`https://discord.com/channels/${data.guildId}/${data.channelId}/${data.messageId}`)
                .setLabel(`Giveaway message`)
                .setStyle(ButtonStyle.Link)
            const giveaway_ended_embed = new EmbedBuilder()
                .setAuthor({
                    name: `${client.user.username} Giveaways`
                })
                .setColor("Red")
                .setDescription(`
                __**Giveaway Details**__
                    Prize: ${data.prize}
                    Winners: ${data.winners}
                    Host: ${gw_host}
                    Ends: <t:${data.endAt_timestamp}:R>
                `)
                .setFooter({
                    text: `Giveaway has been ended.`
                })
            await gw_message.edit({
                embeds: [giveaway_ended_embed],
                components: [new ActionRowBuilder().addComponents(giveaway_ended_button)]
            });
            await gw_channel.send({
                content: textFormate,
                components: [new ActionRowBuilder().addComponents(ge_message_link)],
            })
        })
    }, ms('2s'));
};

/**
 * 
 * @param {Client} client 
 * @returns <@!userid>
 */
function getWinners(client, data, length) {
    let winners = [];
    if (length > data) length = data.length;
    for (let i = 0; i < length; i++) {
        const w = client.users.cache.get(data[Math.floor(Math.random() * data.length)])
        data.filter(d => d !== w.id)
        winners.push(w)
    }
    return winners;
}

async function deleteGw(_id) {
    return await Giveaway.findByIdAndDelete(_id);
}