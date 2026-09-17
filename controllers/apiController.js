const axios = require('axios');

const {
    fetchDistrictPrices,
    fetchLatestCropPrice,
    KARNATAKA_DISTRICTS
} = require('../services/apmcService');

exports.getKarnatakaDistricts = (req, res) => {

    res.json({
        success: true,
        districts: KARNATAKA_DISTRICTS
    });

};
exports.getMarketPrices = async (req, res) => {

    try {

        const district =
            req.query.district || 'Belagavi';

        const records =
            await fetchDistrictPrices(district);

        if (records.length === 0) {

            return res.json({
                success: true,
                district,
                count: 0,
                prices: []
            });
        }


        // Convert DD/MM/YYYY → Date
        const parseDate = (dateString) => {

            if (!dateString) {
                return new Date(0);
            }

            const [day, month, year] =
                dateString.split('/');

            return new Date(`${year}-${month}-${day}`);
        };


        // =====================================
        // REMOVE NON-AGRICULTURAL COMMODITIES
        // =====================================

        const excludedCommodities = [

    // Animals
    'Ox',
    'Cow',
    'Buffalo',
    'Bull',
    'Horse',
    'Goat',
    'Sheep',
    'Camel',
    'Pig',
    'Donkey',
    'Mule',
    'He Buffalo',
    'She Buffalo',

    // Dairy / Animal products
    'Cow Milk',
    'Buffalo Milk',
    'Milk',
    'Egg',

    // Other non-crop commodities
    'Fish',
    'Meat',
    'Chicken'
];


        const agriculturalRecords =
            records.filter(record => {

                const commodity =
                record.Commodity?.trim().toLowerCase();

            if (!commodity) return false;

            return !excludedCommodities.some(item =>
                commodity.toLowerCase().includes(item.toLowerCase())
            );

            });


        const latestCommodityRecords = {};

        agriculturalRecords.forEach(record => {

            const commodity =
                record.Commodity.trim();

            const currentDate =
                parseDate(record.Arrival_Date);


            // If commodity doesn't exist yet,
            // store this record
            if (!latestCommodityRecords[commodity]) {

                latestCommodityRecords[commodity] =
                    record;

                return;
            }


            const existingDate =
                parseDate(
                    latestCommodityRecords[commodity]
                        .Arrival_Date
                );


            // Replace only if this record is newer
            if (currentDate > existingDate) {

                latestCommodityRecords[commodity] =
                    record;

            }

        });


        // Convert object → array
        const latestRecords =
            Object.values(latestCommodityRecords);


        // Sort newest commodities first
        latestRecords.sort((a, b) =>

            parseDate(b.Arrival_Date) -
            parseDate(a.Arrival_Date)

        );


        res.json({

            success: true,

            district,

            count:
                latestRecords.length,

            prices:

                latestRecords.map(record => ({

                    commodity:
                        record.Commodity,

                    variety:
                        record.Variety,

                    market:
                        record.Market,

                    modalPrice:
                        Number(record.Modal_Price),

                    minPrice:
                        Number(record.Min_Price),

                    maxPrice:
                        Number(record.Max_Price),

                    arrivalDate:
                        record.Arrival_Date

                }))

        });

    } catch (error) {

        console.error(
            'Error fetching market prices:',
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                'Unable to fetch market prices'

        });

    }

};
const Recommendation = require('../models/Recommendation');
const FertilizerRecommendation = require("../models/FertilizerRecommendation");
const Feedback = require('../models/Feedback');
const { spawn } = require('child_process'); 
const path = require('path'); 
const dummyFarms = [

    {
        farmId: 'FARM101',
        ownerName: 'Ramesh Kumar',
        soilPh: 6.5,
        moisture: 82,
        nitrogen: 100,
        phosphorus: 50,
        potassium: 50
    },

    {
        farmId: 'FARM202',
        ownerName: 'Sita Devi',
        soilPh: 6.8,
        moisture: 75,
        nitrogen: 90,
        phosphorus: 55,
        potassium: 45
    },

    {
        farmId: 'FARM303',
        ownerName: 'Arjun Patel',
        soilPh: 6.7,
        moisture: 65,
        nitrogen: 80,
        phosphorus: 50,
        potassium: 40
    },

    {
        farmId: 'FARM404',
        ownerName: 'Lakshmi Nair',
        soilPh: 6.2,
        moisture: 80,
        nitrogen: 180,
        phosphorus: 60,
        potassium: 90
    },

    {
        farmId: 'FARM505',
        ownerName: 'Vikram Singh',
        soilPh: 6.7,
        moisture: 70,
        nitrogen: 85,
        phosphorus: 50,
        potassium: 45
    },

    {
        farmId: 'FARM606',
        ownerName: 'Priya Sharma',
        soilPh: 6.5,
        moisture: 65,
        nitrogen: 75,
        phosphorus: 55,
        potassium: 40
    },

    {
        farmId: 'FARM707',
        ownerName: 'Mohammed Iqbal',
        soilPh: 6.2,
        moisture: 60,
        nitrogen: 55,
        phosphorus: 65,
        potassium: 65
    },

    {
        farmId: 'FARM808',
        ownerName: 'Anita Rao',
        soilPh: 7.0,
        moisture: 80,
        nitrogen: 90,
        phosphorus: 60,
        potassium: 45
    }

];

// ==========================================
// APPROXIMATE CROP ECONOMICS
// Values are per hectare
// ==========================================

const CROP_ECONOMICS = {

    rice: {
        yieldPerHectare: 3.5,
        seed: 2500,
        fertilizer: 7000,
        pesticide: 2500,
        labour: 12000,
        machinery: 5000,
        irrigation: 4000,
        other: 2500
    },

    wheat: {
        yieldPerHectare: 3.5,
        seed: 1800,
        fertilizer: 6000,
        pesticide: 1800,
        labour: 9000,
        machinery: 4500,
        irrigation: 3000,
        other: 2000
    },

    maize: {
        yieldPerHectare: 4.5,
        seed: 3000,
        fertilizer: 6500,
        pesticide: 2500,
        labour: 9000,
        machinery: 4500,
        irrigation: 3000,
        other: 2000
    },

    cotton: {
        yieldPerHectare: 1.8,
        seed: 2200,
        fertilizer: 7000,
        pesticide: 7000,
        labour: 12000,
        machinery: 4500,
        irrigation: 3500,
        other: 2500
    },

    sugarcane: {
        yieldPerHectare: 80,
        seed: 8000,
        fertilizer: 12000,
        pesticide: 3000,
        labour: 18000,
        machinery: 7000,
        irrigation: 7000,
        other: 4000
    },

    coffee: {
        yieldPerHectare: 1.2,
        seed: 5000,
        fertilizer: 10000,
        pesticide: 5000,
        labour: 18000,
        machinery: 4000,
        irrigation: 3000,
        other: 5000
    },

    potato: {
        yieldPerHectare: 20,
        seed: 18000,
        fertilizer: 9000,
        pesticide: 4000,
        labour: 12000,
        machinery: 5000,
        irrigation: 4000,
        other: 3000
    },

    tomato: {
        yieldPerHectare: 25,
        seed: 5000,
        fertilizer: 9000,
        pesticide: 6000,
        labour: 18000,
        machinery: 4000,
        irrigation: 5000,
        other: 3000
    },

    watermelon: {
        yieldPerHectare: 25,
        seed: 4500,
        fertilizer: 7000,
        pesticide: 4000,
        labour: 14000,
        machinery: 4000,
        irrigation: 5000,
        other: 2500
    },

    apple: {
        yieldPerHectare: 10,
        seed: 8000,
        fertilizer: 10000,
        pesticide: 7000,
        labour: 18000,
        machinery: 5000,
        irrigation: 4000,
        other: 5000
    },

    cabbage: {
        yieldPerHectare: 25,
        seed: 3500,
        fertilizer: 7000,
        pesticide: 4000,
        labour: 14000,
        machinery: 4000,
        irrigation: 4000,
        other: 2500
    },

    cauliflower: {
        yieldPerHectare: 20,
        seed: 3500,
        fertilizer: 7000,
        pesticide: 4000,
        labour: 14000,
        machinery: 4000,
        irrigation: 4000,
        other: 2500
    },

    default: {
        yieldPerHectare: 3,
        seed: 3000,
        fertilizer: 7000,
        pesticide: 3000,
        labour: 12000,
        machinery: 5000,
        irrigation: 3000,
        other: 2500
    }
};

// ==========================================
// MARKET PRICE NAME MATCHING
// ==========================================

const CROP_MARKET_ALIASES = {

    rice: [
        'rice'
    ],

    wheat: [
        'wheat'
    ],

    maize: [
        'maize',
        'corn'
    ],

    cotton: [
        'cotton'
    ],

    sugarcane: [
        'sugarcane'
    ],

    coffee: [
        'coffee'
    ],

    potato: [
        'potato'
    ],

    tomato: [
        'tomato'
    ],

    watermelon: [
        'watermelon'
    ],

    apple: [
        'apple'
    ],

    cabbage: [
        'cabbage'
    ],

    cauliflower: [
        'cauliflower'
    ]
};


// ==========================================
// SMART IRRIGATION THRESHOLDS
// Prototype values for system testing
// ==========================================

const IRRIGATION_THRESHOLDS = {
    apple: 30,
    banana: 40,
    barley: 30,
    blackgram: 30,
    blackpepper: 35,
    brinjal: 35,
    cabbage: 35,
    cardamom: 40,
    cauliflower: 35,
    chickpea: 30,
    coconut: 40,
    coffee: 35,
    coriander: 35,
    cotton: 30,
    garlic: 35,
    grapes: 35,
    horsegram: 30,
    jute: 35,
    kidneybeans: 35,
    lentil: 30,
    maize: 30,
    mango: 30,
    mothbeans: 30,
    mungbean: 30,
    muskmelon: 35,
    okra: 35,
    onion: 35,
    orange: 30,
    papaya: 35,
    pigeonpeas: 30,
    pomegranate: 30,
    potato: 35,
    ragi: 30,
    rapeseed: 30,
    rice: 40,
    sorghum: 30,
    soybean: 35,
    sunflower: 30,
    sweet_potato: 35,
    tomato: 35,
    turmeric: 35,
    watermelon: 35,
    wheat: 30
};

// ==========================================
// SMART IRRIGATION CHECK
// ==========================================

exports.checkIrrigation = async (req, res) => {

    try {

        const { crop, moisture } = req.body;

        // ------------------------------
        // VALIDATE INPUT
        // ------------------------------

        if (!crop || moisture === undefined) {

            return res.status(400).json({
                success: false,
                message: 'Crop and soil moisture are required.'
            });

        }

        // ------------------------------
        // NORMALIZE CROP
        // ------------------------------

        const cropKey =
            crop.toLowerCase().trim();

        // ------------------------------
        // CONVERT MOISTURE TO NUMBER
        // ------------------------------

        const moistureValue =
            Number(moisture);

        if (
            Number.isNaN(moistureValue) ||
            moistureValue < 0 ||
            moistureValue > 100
        ) {

            return res.status(400).json({
                success: false,
                message: 'Soil moisture must be between 0 and 100%.'
            });

        }

        // ------------------------------
        // GET CROP THRESHOLD
        // ------------------------------

        const threshold =
            IRRIGATION_THRESHOLDS[cropKey];

        if (threshold === undefined) {

            return res.status(400).json({
                success: false,
                message:
                    `No irrigation threshold configured for ${crop}.`
            });

        }

        // ------------------------------
        // IRRIGATION DECISION
        // ------------------------------

        const irrigationRequired =
            moistureValue < threshold;

        const status =
            irrigationRequired
                ? 'Irrigation Required'
                : 'Irrigation Not Required';

        const message =
            irrigationRequired
                ? `Soil moisture is below the recommended level for ${crop}. Irrigation is required.`
                : `Soil moisture is adequate for ${crop}. Irrigation is not required.`;

        // ------------------------------
        // SEND RESPONSE
        // ------------------------------

        res.status(200).json({

            success: true,

            crop,

            soilMoisture:
                moistureValue,

            threshold,

            irrigationRequired,

            status,

            message

        });

    }

    catch (error) {

        console.error(
            'Smart irrigation error:',
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                'Unable to process irrigation decision.'

        });

    }

};

exports.postRecommendation = async (req, res, next) => {
    try {
        const {
            nitrogen,
            phosphorus,
            potassium,
            temperature,
            humidity,
            soilPh,
            rainfall
        } = req.body;

        const scriptPath = path.join(
            __dirname,
            '..',
            'ml',
            'predict_v5_final_xai.py'
        );

        console.log('--- Calling Python AI Model ---');
        const inputArgs = [
            scriptPath,
            nitrogen,
            phosphorus,
            potassium,
            temperature,
            humidity,
            soilPh,
            rainfall
        ];

        const pythonProcess = spawn('py', inputArgs, {
            env: {
                ...process.env,
                PYTHONIOENCODING: 'utf-8'
            }
        });

        let predictionResult = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            predictionResult += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`Python script error: ${errorData}`);
                return res.status(500).json({ message: 'Error getting AI recommendation' });
            }

            try {
                const resultJson = JSON.parse(predictionResult);

                const recommendedCrop = resultJson.crop;
                const reasons = resultJson.reasons || [];

                if (!recommendedCrop) {
                    throw new Error('AI model did not return a "crop" key.');
                }
                
                console.log(`AI Success! Recommended crop: ${recommendedCrop}`); 

                // ==========================================
                // 2. CALCULATE DYNAMIC CROP ECONOMICS
                // ==========================================

                const cropKey =
                    recommendedCrop.toLowerCase().trim();

                const economics =
                    CROP_ECONOMICS[cropKey] ||
                    CROP_ECONOMICS.default;


                // ------------------------------------------
                // AREA
                // ------------------------------------------

                const areaValue =
                    Number(req.body.area);

                if (!areaValue || areaValue <= 0) {

                    throw new Error(
                        'Valid farm area is required.'
                    );

                }


                // ------------------------------------------
                // TOTAL YIELD
                // ------------------------------------------

                const yieldPerHectare =
                    economics.yieldPerHectare;

                const totalYield =
                    yieldPerHectare * areaValue;


                // ------------------------------------------
                // INVESTMENT BREAKDOWN
                // ------------------------------------------

                const investmentPerHectare =
                    economics.seed
                    + economics.fertilizer
                    + economics.pesticide
                    + economics.labour
                    + economics.machinery
                    + economics.irrigation
                    + economics.other;

                const investment =
                    investmentPerHectare * areaValue;
                // ------------------------------------------
// FETCH LATEST MARKET PRICE
// ------------------------------------------

let marketPrice = null;
let marketPriceDate = null;
let marketName = null;
let marketDistrict = null;
let marketCommodity = null;
let marketScope = null;

try {

    const state =
        req.body.state;

    const district =
        req.body.city;


    const aliases =
        CROP_MARKET_ALIASES[cropKey] || [cropKey];


    if (!state || !district) {

        throw new Error(
            'State and city are required for market price lookup.'
        );

    }


    const priceResult =
        await fetchLatestCropPrice(
            state,
            district,
            aliases
        );


    if (priceResult.found) {

        marketPrice =
            priceResult.modalPrice;

        marketPriceDate =
            priceResult.arrivalDate;

        marketName =
            priceResult.market;

        marketDistrict =
            priceResult.district;

        marketCommodity =
            priceResult.commodity;

        marketScope =
            priceResult.scope;

    }


} catch (marketError) {

    console.error(
        'Market price lookup failed:',
        marketError.message
    );

}


                // ------------------------------------------
                // GROSS REVENUE
                // ------------------------------------------

                // APMC modal price is per quintal.
                // 1 tonne = 10 quintals.

                let grossRevenue = null;

                if (marketPrice) {

                    grossRevenue =
                        totalYield *
                        10 *
                        marketPrice;

                }


                // ------------------------------------------
                // NET PROFIT
                // ------------------------------------------

                const netProfit =
                    grossRevenue !== null
                        ? grossRevenue - investment
                        : null;

                // --- 3. SAVE TO DATABASE ---
                const newRecommendation = new Recommendation({

                ...req.body,

                userId:
                    req.session.user._id,

                recommendedCrop:
                    recommendedCrop,

                investment:
                    investment,

                grossRevenue:
                    grossRevenue,

                netProfit:
                    netProfit
            });

                await newRecommendation.save();
                
                res.status(201).json({

            ...newRecommendation.toObject(),

            // Existing crop explanation
            reasons: reasons,

            // V5 Model XAI
            rawPrediction: resultJson.rawPrediction,
            rawConfidence: resultJson.rawConfidence,
            modelXAI: resultJson.modelXAI || [],
            shapContributions: resultJson.shapContributions || [],

            // Agronomic validation
            validationStatus: resultJson.validationStatus,
            validationWarning: resultJson.validationWarning,
            validationCheckedCrop: resultJson.validationCheckedCrop,
            validationViolations:
                resultJson.validationViolations || [],

            // ==========================================
            // DYNAMIC CROP ECONOMICS
            // ==========================================

            cropEconomics: {

    area: areaValue,

    yieldPerHectare:
        Number(yieldPerHectare.toFixed(2)),

    totalYield:
        Number(totalYield.toFixed(2)),

    investmentPerHectare:
        Number(investmentPerHectare.toFixed(2)),

    investment:
        Number(investment.toFixed(2)),

    marketPrice:
        marketPrice,

    marketPriceUnit:
        '₹/quintal',

    marketPriceDate:
        marketPriceDate,

    market:
        marketName,

    marketDistrict:
        marketDistrict,

    marketCommodity:
        marketCommodity,

    marketScope:
        marketScope,

    grossRevenue:
        grossRevenue !== null
            ? Number(grossRevenue.toFixed(2))
            : null,

    netProfit:
        netProfit !== null
            ? Number(netProfit.toFixed(2))
            : null,

    approximate:
        true,

    yieldComparison: Object.entries(CROP_ECONOMICS)
        .filter(([crop]) => crop !== 'default')
        .map(([crop, data]) => ({
            crop: crop,
            yieldPerHectare: data.yieldPerHectare
        }))
}

        });
            } catch (parseOrDbErr) {
                console.error('Error processing AI result:', parseOrDbErr.message);
                res.status(500).json({ message: 'Error processing AI result' });
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error processing recommendation' });
    }
};

// ... (Keep the rest of your exports: postFeedback, getAnalyticsData, etc.)
exports.postFeedback = async (req, res, next) => {
    try {
        const { name, comment, rating } = req.body; 
        if (!name || !comment || !rating) return res.status(400).json({ message: 'Details required' });
        const newFeedback = new Feedback({ name, comment, rating });
        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted', feedback: newFeedback });
    } catch (err) { res.status(500).json({ message: 'Error' }); }
};

exports.getFeedback = async (req, res, next) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.status(200).json(feedbacks);
    } catch (err) { res.status(500).json({ message: 'Error' }); }
};

exports.getAnalyticsData = async (req, res, next) => {
    try {

        // ==========================================
        // 1. MOST RECOMMENDED CROPS
        // ==========================================
        
       const mostRecommendedCrops =
        await Recommendation.aggregate([
            {
                $match: {
                    recommendedCrop: {
                        $exists: true,
                        $ne: null,
                        $ne: ""
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $toLower: {
                            $trim: {
                                input: "$recommendedCrop"
                            }
                        }
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ]);


        // ==========================================
        // 2. RECOMMENDATIONS BY SEASON
        // ==========================================
        //
        // IMPORTANT:
        // Your current Recommendation schema does not
        // store season yet.
        //
        // We will add this in the next step.
        //
        const recommendationsBySeason =
    await Recommendation.aggregate([
        {
            $match: {
                season: {
                    $exists: true,
                    $ne: null,
                    $ne: ""
                }
            }
        },
        {
            $group: {
                _id: "$season",
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                count: -1
            }
        }
    ]);


        // ==========================================
        // 3. NPK NUTRIENT ANALYSIS
        // ==========================================

        const npkData = await Recommendation.aggregate([

            {
                $facet: {

                    nitrogen: [
                        {
                            $match: {
                                nitrogen: {
                                    $exists: true,
                                    $ne: null
                                }
                            }
                        },
                        {
                            $bucket: {
                                groupBy: "$nitrogen",
                                boundaries: [0, 30, 70, Infinity],
                                default: "unknown",
                                output: {
                                    count: {
                                        $sum: 1
                                    }
                                }
                            }
                        }
                    ],

                    phosphorus: [
                        {
                            $match: {
                                phosphorus: {
                                    $exists: true,
                                    $ne: null
                                }
                            }
                        },
                        {
                            $bucket: {
                                groupBy: "$phosphorus",
                                boundaries: [0, 30, 70, Infinity],
                                default: "unknown",
                                output: {
                                    count: {
                                        $sum: 1
                                    }
                                }
                            }
                        }
                    ],

                    potassium: [
                        {
                            $match: {
                                potassium: {
                                    $exists: true,
                                    $ne: null
                                }
                            }
                        },
                        {
                            $bucket: {
                                groupBy: "$potassium",
                                boundaries: [0, 30, 70, Infinity],
                                default: "unknown",
                                output: {
                                    count: {
                                        $sum: 1
                                    }
                                }
                            }
                        }
                    ]

                }
            }

        ]);


        // ==========================================
        // 4. FORMAT NPK DATA
        // ==========================================

        const formatNPK = (data) => {

            const result = {
                low: 0,
                medium: 0,
                high: 0
            };

            data.forEach(item => {

                if (item._id === 0) {
                    result.low = item.count;
                }

                else if (item._id === 30) {
                    result.medium = item.count;
                }

                else if (item._id === 70) {
                    result.high = item.count;
                }

            });

            return result;
        };


        const nitrogen = formatNPK(
            npkData[0]?.nitrogen || []
        );

        const phosphorus = formatNPK(
            npkData[0]?.phosphorus || []
        );

        const potassium = formatNPK(
            npkData[0]?.potassium || []
        );

        // ==========================================
// 5. FERTILIZER ANALYSIS
// ==========================================

const fertilizerAnalysis =
    await FertilizerRecommendation.aggregate([
        {
            $unwind: "$recommendedFertilizers"
        },
        {
            $group: {
                _id: "$recommendedFertilizers.fertilizer",
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                count: -1
            }
        }
    ]);

    res.status(200).json({

    success: true,

    mostRecommendedCrops,

    recommendationsBySeason,

    npkAnalysis: {

        nitrogen,

        phosphorus,

        potassium

    },

    fertilizerAnalysis

});

    }

    catch (error) {

        console.error(
            "Analytics error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to load analytics data."

        });

    }
};

exports.getRecentRecommendations = async (req, res, next) => {
    try {
        const recommendations = await Recommendation.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(3);
        res.status(200).json(recommendations);
    } catch (err) { res.status(500).json({ message: 'Error fetching history' }); }
};

exports.getFarmDataById = async (req, res, next) => {
    try {
        const farmIdToFind = req.params.farmId.toUpperCase(); 
        const farm = dummyFarms.find(f => f.farmId === farmIdToFind);
        if (farm) res.status(200).json(farm);
        else res.status(404).json({ message: 'Farm ID not found.' });
    } catch (err) { res.status(500).json({ message: 'Server error.' }); }
};

// ==========================================
// GET SEASONAL AVERAGE TEMPERATURE
// ==========================================

exports.getSeasonalTemperature = async (req, res) => {

    try {

        const { state, city, season } = req.query;


        // ==============================
        // VALIDATE INPUT
        // ==============================

        if (!state || !city || !season) {

            return res.status(400).json({
                success: false,
                message: 'State, city and season are required.'
            });

        }


        // ==============================
        // 1. GET LOCATION COORDINATES
        // ==============================

        const locationQuery =
            `${city}, ${state}, India`;


        const geoResponse = await axios.get(
            'https://nominatim.openstreetmap.org/search',
            {

                params: {
                    q: locationQuery,
                    format: 'json',
                    limit: 1
                },

                headers: {
                    'User-Agent': 'AgriMind Crop Recommendation Project'
                }

            }
        );


        if (!geoResponse.data.length) {

            return res.status(404).json({
                success: false,
                message: `Location not found: ${locationQuery}`
            });

        }


        const latitude =
            geoResponse.data[0].lat;

        const longitude =
            geoResponse.data[0].lon;


        // ==============================
        // 2. GET NASA CLIMATE DATA
        // ==============================

        const nasaResponse = await axios.get(
            'https://power.larc.nasa.gov/api/temporal/climatology/point',
            {

                params: {

                    parameters: 'T2M',

                    community: 'AG',

                    longitude: longitude,

                    latitude: latitude,

                    format: 'JSON'

                }

            }
        );


        // ==============================
        // 3. GET MONTHLY TEMPERATURES
        // ==============================

        const monthlyTemperature =
            nasaResponse.data.properties
                .parameter.T2M;


        // ==============================
        // 4. DEFINE AGRICULTURAL SEASONS
        // ==============================

        const seasonMonths = {

            Kharif: [
                'JUN',
                'JUL',
                'AUG',
                'SEP',
                'OCT'
            ],

            Rabi: [
                'NOV',
                'DEC',
                'JAN',
                'FEB',
                'MAR'
            ],

            Zaid: [
                'APR',
                'MAY',
                'JUN'
            ]

        };


        const months =
            seasonMonths[season];


        if (!months) {

            return res.status(400).json({
                success: false,
                message: 'Invalid season.'
            });

        }


        // ==============================
        // 5. CALCULATE SEASONAL AVERAGE
        // ==============================

        const temperatures =
            months
                .map(month =>
                    monthlyTemperature[month]
                )
                .filter(temp =>
                    temp !== undefined &&
                    temp !== null
                );


        if (!temperatures.length) {

            throw new Error(
                'Temperature data unavailable.'
            );

        }


        const averageTemperature =

            temperatures.reduce(
                (sum, temp) =>
                    sum + temp,
                0
            )

            / temperatures.length;


        // ==============================
        // 6. RETURN RESULT
        // ==============================

        res.json({

            success: true,

            location: {
                state,
                city
            },

            season,

            temperature:
                Number(
                    averageTemperature.toFixed(2)
                ),

            coordinates: {
                latitude,
                longitude
            }

        });


    } catch (error) {

        console.error(
            'Seasonal temperature error:',
            error.message
        );


        res.status(500).json({

            success: false,

            message:
                'Unable to fetch seasonal temperature.'

        });

    }

};

// ==========================================
// GET SEASONAL AVERAGE HUMIDITY 💧
// ==========================================

exports.getSeasonalHumidity = async (req, res) => {

    try {

        const { state, city, season } = req.query;


        // ==============================
        // VALIDATE INPUT
        // ==============================

        if (!state || !city || !season) {

            return res.status(400).json({
                success: false,
                message: 'State, city and season are required.'
            });

        }


        // ==============================
        // 1. GET LOCATION COORDINATES
        // ==============================

        const locationQuery =
            `${city}, ${state}, India`;


        const geoResponse = await axios.get(
            'https://nominatim.openstreetmap.org/search',
            {

                params: {
                    q: locationQuery,
                    format: 'json',
                    limit: 1
                },

                headers: {
                    'User-Agent':
                        'AgriMind Crop Recommendation Project'
                }

            }
        );


        if (!geoResponse.data.length) {

            return res.status(404).json({
                success: false,
                message:
                    `Location not found: ${locationQuery}`
            });

        }


        const latitude =
            geoResponse.data[0].lat;

        const longitude =
            geoResponse.data[0].lon;


        // ==============================
        // 2. GET HISTORICAL HUMIDITY DATA
        // ==============================

        const weatherResponse = await axios.get(

            'https://archive-api.open-meteo.com/v1/archive',

            {

                params: {

                    latitude,
                    longitude,

                    start_date: '2021-01-01',
                    end_date: '2025-12-31',

                    hourly:
                        'relative_humidity_2m',

                    timezone:
                        'Asia/Kolkata'

                }

            }

        );


        const hourlyData =
            weatherResponse.data.hourly;


        if (
            !hourlyData ||
            !hourlyData.time ||
            !hourlyData.relative_humidity_2m
        ) {

            throw new Error(
                'Historical humidity data unavailable.'
            );

        }


        // ==============================
        // 3. DEFINE AGRICULTURAL SEASONS
        // ==============================

        const seasonMonths = {

            Kharif: [6, 7, 8, 9, 10],

            Rabi: [11, 12, 1, 2, 3],

            Zaid: [4, 5, 6]

        };


        const selectedMonths =
            seasonMonths[season];


        if (!selectedMonths) {

            return res.status(400).json({

                success: false,

                message: 'Invalid season.'

            });

        }


        // ==============================
        // 4. CALCULATE SEASONAL HUMIDITY
        // ==============================

        let humiditySum = 0;
        let humidityCount = 0;


        hourlyData.time.forEach(
            (dateTime, index) => {

                const month =
                    new Date(
                        dateTime
                    ).getMonth() + 1;

                const humidity =
                    hourlyData
                        .relative_humidity_2m[index];


                if (
                    selectedMonths.includes(month) &&
                    humidity !== null &&
                    humidity !== undefined
                ) {

                    humiditySum += humidity;
                    humidityCount++;

                }

            }
        );


        if (humidityCount === 0) {

            throw new Error(
                'No seasonal humidity values found.'
            );

        }


        const averageHumidity =
            humiditySum / humidityCount;


        // ==============================
        // 5. RETURN RESULT
        // ==============================

        res.json({

            success: true,

            location: {
                state,
                city
            },

            season,

            humidity:
                Number(
                    averageHumidity.toFixed(2)
                ),

            coordinates: {
                latitude,
                longitude
            }

        });


    } catch (error) {

        console.error(
            'Seasonal humidity error:',
            error.message
        );


        res.status(500).json({

            success: false,

            message:
                'Unable to fetch seasonal humidity.'

        });

    }

};

// ==========================================
// GET EXPECTED ANNUAL RAINFALL 🌧️
// ==========================================

exports.getHistoricalRainfall = async (req, res) => {

    try {

        const { state, city, season } = req.query;


        // ==============================
        // VALIDATE INPUT
        // ==============================

        if (!state || !city || !season) {

            return res.status(400).json({

                success: false,

                message:
                    'State, city and season are required.'

            });

        }


        // ==============================
        // VALIDATE SEASON
        // ==============================

        const seasonMonths = {

            Kharif: [6, 7, 8, 9, 10],

            Rabi: [11, 12, 1, 2, 3],

            Zaid: [4, 5, 6]

        };


        const selectedSeasonMonths =
            seasonMonths[season];


        if (!selectedSeasonMonths) {

            return res.status(400).json({

                success: false,

                message: 'Invalid season.'

            });

        }


        // ==============================
        // 1. GET LOCATION COORDINATES
        // ==============================

        const locationQuery =
            `${city}, ${state}, India`;


        const geoResponse = await axios.get(

            'https://nominatim.openstreetmap.org/search',

            {

                params: {

                    q: locationQuery,

                    format: 'json',

                    limit: 1

                },

                headers: {

                    'User-Agent':
                        'AgriMind Crop Recommendation Project'

                }

            }

        );


        if (!geoResponse.data.length) {

            return res.status(404).json({

                success: false,

                message:
                    `Location not found: ${locationQuery}`

            });

        }


        const latitude =
            geoResponse.data[0].lat;

        const longitude =
            geoResponse.data[0].lon;


        // ==============================
        // 2. FETCH HISTORICAL RAINFALL
        // ==============================

        const rainfallResponse = await axios.get(

            'https://archive-api.open-meteo.com/v1/archive',

            {

                params: {

                    latitude,

                    longitude,

                    start_date: '2021-01-01',

                    end_date: '2025-12-31',

                    daily: 'precipitation_sum',

                    timezone: 'Asia/Kolkata'

                }

            }

        );


        const dailyData =
            rainfallResponse.data.daily;


        if (

            !dailyData ||

            !dailyData.time ||

            !dailyData.precipitation_sum

        ) {

            throw new Error(
                'Historical rainfall data unavailable.'
            );

        }


        // ==============================
        // 3. CALCULATE YEARLY TOTALS
        // ==============================

        const yearlyRainfall = {};


        dailyData.time.forEach(

            (date, index) => {

                const year =
                    date.substring(0, 4);


                const rainfall =
                    dailyData.precipitation_sum[index] || 0;


                if (!yearlyRainfall[year]) {

                    yearlyRainfall[year] = 0;

                }


                yearlyRainfall[year] += rainfall;

            }

        );


        // ==============================
        // 4. ROUND YEARLY VALUES
        // ==============================

        Object.keys(yearlyRainfall).forEach(

            year => {

                yearlyRainfall[year] = Number(

                    yearlyRainfall[year]
                        .toFixed(2)

                );

            }

        );


        // ==============================
        // 5. CALCULATE 5-YEAR ANNUAL AVERAGE
        // ==============================

        const rainfallValues =
            Object.values(yearlyRainfall);


        if (!rainfallValues.length) {

            throw new Error(
                'No historical rainfall values found.'
            );

        }


        const totalRainfall =
            rainfallValues.reduce(

                (sum, rainfall) =>
                    sum + rainfall,

                0

            );


        const historicalRainfall =
            totalRainfall /
            rainfallValues.length;


        // ==============================
        // 6. FETCH SEASONAL FORECAST
        // ==============================

        const seasonalResponse = await axios.get(

            'https://seasonal-api.open-meteo.com/v1/seasonal',

            {

                params: {

                    latitude,

                    longitude,

                    monthly:
                        'precipitation_mean,precipitation_anomaly',

                    timezone:
                        'Asia/Kolkata'

                }

            }

        );


        const monthlyData =
            seasonalResponse.data.monthly;


        if (

            !monthlyData ||

            !monthlyData.time ||

            !monthlyData.precipitation_anomaly

        ) {

            throw new Error(
                'Seasonal forecast data unavailable.'
            );

        }


        // ==============================
        // 7. FILTER FORECAST BY SEASON
        // ==============================

        const seasonalForecast = [];


        monthlyData.time.forEach(

            (date, index) => {

                const month =
                    new Date(
                        `${date}T00:00:00`
                    ).getMonth() + 1;


                if (
                    selectedSeasonMonths.includes(month)
                ) {

                    seasonalForecast.push({

                        date,

                        precipitation:
                            monthlyData
                                .precipitation_mean[index],

                        anomaly:
                            monthlyData
                                .precipitation_anomaly[index]

                    });

                }

            }

        );


        // ==============================
        // 8. CALCULATE SEASONAL ADJUSTMENT
        // ==============================

        const seasonalAdjustment =
            seasonalForecast.reduce(

                (sum, month) =>
                    sum + (month.anomaly || 0),

                0

            );


        // ==============================
        // 9. CALCULATE EXPECTED RAINFALL
        // ==============================

        const expectedRainfall =

            historicalRainfall +
            seasonalAdjustment;


        // ==============================
        // 10. RETURN RESULT
        // ==============================

        res.json({

            success: true,


            location: {

                state,

                city

            },


            season,


            historicalRainfall:

                Number(
                    historicalRainfall.toFixed(2)
                ),


            seasonalAdjustment:

                Number(
                    seasonalAdjustment.toFixed(2)
                ),


            rainfall:

                Number(
                    expectedRainfall.toFixed(2)
                ),


            yearlyRainfall,


            seasonalForecast,


            coordinates: {

                latitude,

                longitude

            }

        });


    } catch (error) {

        console.error(

            'Rainfall calculation error:',

            error.message

        );


        res.status(500).json({

            success: false,

            message:
                'Unable to calculate expected rainfall.'

        });

    }

};

