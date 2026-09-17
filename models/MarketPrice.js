const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
    commodity: { type: String, required: true, lowercase: true, index: true },
    modalPrice: { type: Number, required: true }, // Price per Quintal in INR
    market: { type: String, default: 'Belgaum' },
    fetchDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);