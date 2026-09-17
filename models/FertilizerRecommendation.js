const mongoose = require('mongoose');

const fertilizerRecommendationSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    crop: {
        type: String,
        required: true
    },

    nitrogen: {
        type: Number,
        required: true
    },

    phosphorus: {
        type: Number,
        required: true
    },

    potassium: {
        type: Number,
        required: true
    },

    soilStatus: {
        nitrogen: String,
        phosphorus: String,
        potassium: String
    },

    priority: {
        nitrogen: Number,
        phosphorus: Number,
        potassium: Number
    },

    recommendedFertilizers: [{
        nutrient: String,
        fertilizer: String,
        alternatives: [String],
        why: String
    }],

    overallRecommendation: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports =
    mongoose.model(
        'FertilizerRecommendation',
        fertilizerRecommendationSchema
    );