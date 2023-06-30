const mongoose = require('mongoose');

const connectDatabase = (string) => {
    mongoose.connect(string)
        .then(() => {
            console.log('Connected to database.')
        })
        .catch(() => {
            console.log('Failed to connect to database.')
        })
};

module.exports = connectDatabase;