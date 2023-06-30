const {
    Client,
    CommandInteraction,
    ApplicationCommandType,
    ApplicationCommandOptionType,
    ChannelType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const ms = require("ms");
const Giveaway = require("../database/schemas/Giveaway");

module.exports = {
    name: "giveaway",
    description: "Manage giveaways",
    type: ApplicationCommandType.ChatInput,
    options: [{
            name: 'create',
            description: 'Create a new giveaway.',
            type: 1,
            options: [{
                    name: "channel",
                    description: "Channel to create giveaway in.",
                    type: ApplicationCommandOptionType.Channel,
                    channelTypes: [ChannelType.GuildText],
                    required: true
                },
                {
                    name: 'winners',
                    description: "number of winners of the giveaway",
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                },
                {
                    name: 'duration',
                    description: "duration of the giveaway",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'prize',
                    description: 'Prize for the giveaway',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                }
            ]
        },
        {
            name: 'end',
            description: 'Immediately end a running giveaway.',
            type: 1,
            options: [{
                name: 'id',
                required: true,
                description: 'Enter giveaway message id',
                type: ApplicationCommandOptionType.String,
            }]
        },
        {
            name: 'reroll',
            description: 'Rolls a new winner for a ended giveaway.',
            type: 1,
            options: [{
                name: 'id',
                description: 'Enter giveaway message id',
                type: ApplicationCommandOptionType.String,
                required: true
            }]
        },
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const data = interaction.options.getSubcommand();

        const errorEmbed = new EmbedBuilder().setColor("Red");
        const sucessEmbed = new EmbedBuilder().setColor("Green");
        switch (data) {
            case 'create': {
                const channel = interaction.options.get('channel', true).channel;
                const winners = interaction.options.get('winners', true).value;
                let duration = interaction.options.get('duration', true).value;
                duration = ms(duration);
                const prize = interaction.options.get('prize', true).value;

                const noChannelEmbed = errorEmbed.setDescription(`Invalid channel formate.`)
                const invalidWinnersCountEmbed = errorEmbed.setDescription(`Invalid winners count.`)
                const invalidDurationEmbed = errorEmbed.setDescription(`Invalid duration formate \`1s, 1m, 1h, 1d, 1w\` `)
                if (!channel) return interaction.reply({
                    embeds: [noChannelEmbed]
                });
                if (parseInt(winners) <= 0) {
                    return interaction.reply({
                        embeds: [invalidWinnersCountEmbed]
                    })
                };
                if (isNaN(duration)) return interaction.reply({
                    embeds: [invalidDurationEmbed]
                });
                let endTimestamp = String(Date.now() + duration);
                endTimestamp = endTimestamp.substring(0, endTimestamp.length - 3)

                const giveaway_embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user.username} Giveaways`
                    })
                    .setColor("Blurple")
                    .setDescription(`
                    __**Giveaway Details**__
                        Prize: ${prize}
                        No. of winners: ${winners}
                        Host: <@!${interaction.user.id}>
                        Ends: <t:${endTimestamp}:R>
                    `)
                const giveaway_enter_button = new ButtonBuilder()
                    .setCustomId(`enter`)
                    .setEmoji('🎉')
                    .setLabel(`0`)
                    .setStyle(ButtonStyle.Secondary)

                const giveaway_row = new ActionRowBuilder().addComponents(giveaway_enter_button);

                const message = await channel.send({
                    embeds: [giveaway_embed],
                    components: [giveaway_row]
                })
                const giveaway = await Giveaway.create({
                    host: interaction.user.id,
                    users: [],
                    winners: [],
                    messageId: message.id,
                    channelId: message.channelId,
                    guildId: message.guildId,
                    startAt: message.createdTimestamp,
                    endAt: duration,
                    endAt_timestamp: parseInt(endTimestamp),
                    ended: false,
                    winnerCount: winners,
                    prize: prize
                })
                const giveaway_sucess_embed = sucessEmbed.setDescription(`Giveaway has been created sucessfully.`)
                interaction.reply({
                    embeds: [giveaway_sucess_embed]
                })
                break;
            }
            case 'reroll': {
                const id = interaction.options.get('id', true).value;
                const data = await Giveaway.findOne({
                    messageId: id,
                    ended: true
                });
                if (!data) {
                    return interaction.reply({
                        embeds: [errorEmbed.setDescription(`Unable to fild giveaway or it is currently running.`)],
                        ephemeral: true
                    })
                }
                data.ended = false;
                data.endAt = 0;
                await data.save();
                interaction.reply({
                    embeds: [sucessEmbed.setDescription(`Sucessfully rerolled the giveaway.`)],
                })
                break;
            }
            case 'end': {
                const id = interaction.options.get('id', true).value;
                const data = await Giveaway.findOne({
                    messageId: id,
                    ended: false
                });
                if (!data) {
                    return interaction.reply({
                        embeds: [errorEmbed.setDescription(`Unable to fild giveaway or it is already ended.`)],
                        ephemeral: true
                    })
                }
                const date_str = Date.now().toString();
                data.endAt = 0;
                data.endAt_timestamp = parseInt(date_str.substring(0, date_str.length - 3));
                await data.save();
                interaction.reply({
                    embeds: [sucessEmbed.setDescription(`Sucessfully ended the giveaway.`)],
                })
                break;
            }
        }
    }
}