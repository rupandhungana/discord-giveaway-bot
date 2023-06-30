const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
    host: String,
    winners: [String],
    users: [String],
    messageId: String,
    channelId: String,
    guildId: String,
    startAt: Date,
    endAt: Number,
    endAt_timestamp: Number,
    ended: Boolean,
    winnerCount: Number,
    prize: String,
});

const Giveaway = mongoose.model('giveaways', giveawaySchema);

module.exports = Giveaway;