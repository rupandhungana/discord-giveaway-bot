const {
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} = require("discord.js");
const Giveaway = require("../database/schemas/Giveaway");
const client = require("../index");
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    // await interaction.deferReply({ephemeral: interaction.ephemeral}).catch(() => {});
    const data = {
        messageId: interaction.message.id,
        channelId: interaction.channel.id,
    }
    let gwData = await Giveaway.findOne(data);
    switch (interaction.customId) {
        case 'enter': {
            if (!gwData) return;
            const userData = await Giveaway.findOne({
                ...data,
                users: {
                    '$in': [interaction.user.id]
                }
            });
            if (userData) {
                return await interaction.reply({
                    content: 'You already joined this giveaway!',
                    ephemeral: true,
                })
            }
            gwData.users.push(interaction.user.id);
            await gwData.save();

            gwData = await Giveaway.findOne(data);

            const gw_msg = await client.channels.cache.get(gwData.channelId).messages.fetch(interaction.message.id, {
                force: true
            });
            const giveaway_enter_button = new ButtonBuilder()
                .setCustomId(`enter`)
                .setEmoji('🎉')
                .setLabel(`${gwData.users.length}`)
                .setStyle(ButtonStyle.Secondary)

            const giveaway_row = new ActionRowBuilder().addComponents(giveaway_enter_button);
            await gw_msg.edit({
                components: [giveaway_row]
            });
            await interaction.reply({
                content: `You successfully joined this giveaway`,
                ephemeral: true
            });
            break;
        }
    }
});