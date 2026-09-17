const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
    farmId: { type: String, required: true, unique: true },
    ownerName: String,
    soilPh: Number,
    moisture: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    temperature: Number,
    rainfall: Number,
    state: String,
    city: String,
});

module.exports = mongoose.model('Farm', FarmSchema);