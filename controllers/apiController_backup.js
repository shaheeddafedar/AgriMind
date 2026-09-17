const axios = require('axios');

const {
    fetchDistrictPrices,
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
const Feedback = require('../models/Feedback');
const { spawn } = require('child_process'); 
const path = require('path'); 
const dummyFarms = [
    {
        farmId: 'FARM101',
        ownerName: 'Ramesh Kumar',
        soilPh: 6.5,
        moisture: 82,
        nitrogen: 90,
        phosphorus: 42,
        potassium: 43,
        rainfall: 205,
    },

    {

        farmId: 'FARM202',
        ownerName: 'Sita Devi',
        soilPh: 7.0,
        moisture: 68,
        nitrogen: 75,
        phosphorus: 50,
        potassium: 42,
    rainfall: 130,
    },

    {

        farmId: 'FARM303',
        ownerName: 'Arjun Patel',
        soilPh: 7.2,
        moisture: 50,
        nitrogen: 70,
        phosphorus: 45,
        potassium: 22,
        rainfall: 90,
    },

    {

        farmId: 'FARM404',
        ownerName: 'Lakshmi Nair',
        soilPh: 6.2,
        moisture: 88,
        nitrogen: 110,
        phosphorus: 32,
        potassium: 31,
        rainfall: 1900,
    },

    {

        farmId: 'FARM505',
        ownerName: 'Vikram Singh',
        soilPh: 6.7,
        moisture: 66,
        nitrogen: 70,
        phosphorus: 48,
        potassium: 43,
        rainfall: 125,
    },

    {

        farmId: 'FARM606',
        ownerName: 'Priya Sharma',
        soilPh: 7.5,
        moisture: 55,
        nitrogen: 80,
        phosphorus: 50,
        potassium: 25,
        rainfall: 95,
    },

    {

        farmId: 'FARM707',
        ownerName: 'Mohammed Iqbal',
        soilPh: 6.2,
        moisture: 18,
        nitrogen: 20,
        phosphorus: 65,
        potassium: 62,
        rainfall: 75,
    },

    {

        farmId: 'FARM808',
        ownerName: 'Anita Rao',
        soilPh: 7.0,
        moisture: 83,
        nitrogen: 85,
        phosphorus: 58,
        potassium: 41,
        rainfall: 226,

   

    }

];


const CROP_FINANCIALS = {
    'rice':       { investment: 25000, revenue: 65000 },
    'wheat':      { investment: 22000, revenue: 55000 },
    'maize':      { investment: 18000, revenue: 45000 },
    'cotton':     { investment: 30000, revenue: 80000 },
    'sugarcane':  { investment: 45000, revenue: 120000 },
    'coffee':     { investment: 40000, revenue: 90000 },
    'watermelon': { investment: 20000, revenue: 60000 },
    'default':    { investment: 20000, revenue: 50000 }
};

exports.postRecommendation = async (req, res, next) => {
    try {
        const {
            nitrogen, phosphorus, potassium, temperature,
            moisture, soilPh, rainfall
        } = req.body;

        const scriptPath = path.join(__dirname, '..', 'ml', 'predict.py');

        console.log('--- Calling Python AI Model ---');
        const inputArgs = [
            scriptPath, nitrogen, phosphorus, potassium,
            temperature, moisture, soilPh, rainfall
        ];

        const pythonProcess = spawn('py', inputArgs);

        let predictionResult = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            predictionResult += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0 || errorData) {
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

                // --- 2. CALCULATE FINANCIALS (Logic Added Here) ---
                const cropKey = recommendedCrop.toLowerCase();
                const finData = CROP_FINANCIALS[cropKey] || CROP_FINANCIALS['default'];
                
                const investment = finData.investment;
                const grossRevenue = finData.revenue;
                const netProfit = grossRevenue - investment;

                // --- 3. SAVE TO DATABASE ---
                const newRecommendation = new Recommendation({
                    // Spread the user inputs (N, P, K, etc.)
                    ...req.body,
                    
                    // Link to the logged-in User
                    userId: req.session.user._id, 
                    
                    // Save the AI Prediction
                    recommendedCrop: recommendedCrop,
                    
                    // Save the Calculated Money Values
                    investment: investment,
                    grossRevenue: grossRevenue,
                    netProfit: netProfit
                });

                await newRecommendation.save();
                
                res.status(201).json({
                    ...newRecommendation.toObject(),
                    reasons: reasons
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
    // 1. Get the year parameter
    const { year } = req.query; 

    const allFarmerGrowth = [
        { label: 'Oct 2024', count: 85, year: '2024' },
        { label: 'Nov 2024', count: 89, year: '2024' },
        { label: 'Dec 2024', count: 94, year: '2024' },
        { label: 'Jan 2025', count: 101, year: '2025' },
        { label: 'Feb 2025', count: 105, year: '2025' },
        { label: 'Mar 2025', count: 108, year: '2025' },
        { label: 'Apr 2025', count: 112, year: '2025' },
        { label: 'May 2025', count: 115, year: '2025' },
    ];

    // 2. LOGIC FIX: If year is missing OR 'all', show everything. 
    // Otherwise, filter by the specific year.
    const filteredGrowth = (!year || year === 'all')
        ? allFarmerGrowth
        : allFarmerGrowth.filter(item => item.year === year);

    const mockData = {
        // These keys MUST match what analytics.js expects
        mostRecommendedCrops: [
            { _id: 'Wheat', count: 150 }, 
            { _id: 'Rice', count: 120 },
            { _id: 'Cotton', count: 90 }, 
            { _id: 'Sugarcane', count: 75 }
        ],
        recommendationsBySeason: [
            { _id: 'Kharif', count: 210 }, 
            { _id: 'Rabi', count: 180 }, 
            { _id: 'Zaid', count: 45 }
        ],
        farmerGrowthByMonth: filteredGrowth,
    };

    // 3. Send the full object (NOT just a message)
    res.status(200).json(mockData);
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