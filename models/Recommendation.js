const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    soilPh: Number,
    rainfall: Number,
    temperature: Number,
    humidity: Number,

    area: Number,
    season: String,

    recommendedCrop: String,

    investment: Number,
    grossRevenue: Number,
    netProfit: Number,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    'Recommendation',
    recommendationSchema
);