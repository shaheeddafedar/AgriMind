const axios = require('axios');

const API_KEY = process.env.AGMARKNET_API_KEY;

const RESOURCE_ID =
    '35985678-0d79-46b4-9ed6-6f13308a1d24';

// Same Government of India API endpoint
const BASE_URL =
    `https://www.data.gov.in/backend/dataapi/v1/resource/${RESOURCE_ID}`;


// ==========================================
// DATE PARSER
// ==========================================

const parseDate = (dateString) => {

    if (!dateString) {
        return new Date(0);
    }

    const parts =
        dateString.split('/');

    if (parts.length !== 3) {
        return new Date(0);
    }

    // DD/MM/YYYY → YYYY-MM-DD

    return new Date(
        `${parts[2]}-${parts[1]}-${parts[0]}`
    );
};


// ==========================================
// FETCH DISTRICT PRICES
// ==========================================

const fetchDistrictPrices = async (district) => {

    try {

        console.log(
            `🌾 Fetching live prices for: ${district}`
        );


        const response =
            await axios.get(BASE_URL, {

                params: {

                    'api-key':
                        API_KEY,

                    format:
                        'json',

                    'filters[State]':
                        'Karnataka',

                    'filters[District]':
                        district,

                    limit:
                        1000

                }

            });


        console.log(
            'API Status:',
            response.data.status
        );


        console.log(
            'API Total:',
            response.data.total
        );


        console.log(
            'Records received:',
            response.data.records?.length || 0
        );


        const records =
            response.data.records || [];


        // Sort newest arrival date first

        records.sort((a, b) => {

            return (
                parseDate(b.Arrival_Date) -
                parseDate(a.Arrival_Date)
            );

        });


        return records;


    } catch (error) {

        console.error(
            '❌ Market API Error:',
            error.response?.data ||
            error.message
        );

        throw error;

    }

};


// ==========================================
// FETCH LOCATION + CROP MARKET PRICES
// Used by Crop Recommendation dashboard
// ==========================================

const fetchLocationPrices = async (
    state,
    district,
    commodity
) => {

    try {

        console.log(
            `🌾 Fetching market prices for: ${district}, ${state}, ${commodity}`
        );


        const params = {

            'api-key':
                API_KEY,

            format:
                'json',

            'filters[State]':
                state,

            'filters[District]':
                district,

            limit: 1000,
            offset: 0

        };


        // Add commodity filter when available
        if (commodity) {

            params['filters[Commodity]'] =
                commodity;

        }


        const response =
            await axios.get(
                BASE_URL,
                { params }
            );


        console.log(
            'API Status:',
            response.data.status
        );

        console.log(
            'API Total:',
            response.data.total
        );

        console.log(
            'Records received:',
            response.data.records?.length || 0
        );


        const records =
            response.data.records || [];


        // Sort newest arrival date first
        records.sort((a, b) => {

            return (
                parseDate(b.Arrival_Date) -
                parseDate(a.Arrival_Date)
            );

        });


        return records;


    } catch (error) {

        console.error(
            '❌ Location Market API Error:',
            error.response?.data ||
            error.message
        );

        throw error;

    }

};

// ==========================================
// FETCH ALL KARNATAKA PRICES
// ==========================================

const fetchKarnatakaPrices = async () => {

    try {

        console.log(
            '🌾 Fetching latest Karnataka-wide market prices'
        );


        const response =
            await axios.get(BASE_URL, {

                params: {

                    'api-key':
                        API_KEY,

                    format:
                        'json',

                    'filters[State]':
                        'Karnataka',

                    limit:
                        1000

                }

            });


        const records =
            response.data.records || [];


        // Sort newest first

        records.sort((a, b) => {

            return (
                parseDate(b.Arrival_Date) -
                parseDate(a.Arrival_Date)
            );

        });


        return records;


    } catch (error) {

        console.error(
            '❌ Karnataka market API Error:',
            error.response?.data ||
            error.message
        );

        throw error;

    }

};


// ==========================================
// FIND LATEST CROP PRICE
// SELECTED STATE + DISTRICT
// OPTIMIZED LOOKUP
// ==========================================

// ==========================================
// AGRIMARKET COMMODITY NAME MAPPING
// ==========================================

const CROP_MARKET_NAMES = {
    rice: ['Rice'],
    wheat: ['Wheat'],
    maize: ['Maize'],
    cotton: ['Cotton'],
    sugarcane: ['Sugarcane'],
    coffee: ['Coffee'],
    potato: ['Potato'],
    tomato: ['Tomato'],
    watermelon: ['Water Melon', 'Watermelon'],
    apple: ['Apple'],
    cabbage: ['Cabbage'],
    cauliflower: ['Cauliflower']
};

const fetchLatestCropPrice = async (
    state,
    district,
    cropAliases
) => {

    if (!state || !district || !cropAliases?.length) {

        return {
            found: false,
            scope: null,
            state: state || null,
            district: district || null,
            commodity: null,
            variety: null,
            market: null,
            modalPrice: null,
            minPrice: null,
            maxPrice: null,
            arrivalDate: null
        };

    }


    const aliases =
    cropAliases.map(alias =>
        alias.toLowerCase().trim()
    );

const marketNames = [];

cropAliases.forEach(alias => {

    const key = alias.toLowerCase().trim();

    if (CROP_MARKET_NAMES[key]) {

        marketNames.push(
            ...CROP_MARKET_NAMES[key]
        );

    } else {

        marketNames.push(
            alias.charAt(0).toUpperCase() +
            alias.slice(1).toLowerCase()
        );

    }

});


// ==========================================
// TRY API COMMODITY FILTER FIRST
// ==========================================

for (const marketName of marketNames) {

    try {

        console.log(
            `🌾 Trying direct crop lookup: ${district}, ${state}, ${marketName}`
        );

        const response =
            await axios.get(BASE_URL, {

                params: {

                    'api-key':
                        API_KEY,

                    format:
                        'json',

                    'filters[State]':
                        state,

                    'filters[District]':
                        district,

                    'filters[Commodity]':
                        marketName,

                    limit:
                        1000

                }

            });

        const records =
            response.data.records || [];

        console.log(
            `📦 Direct lookup returned ${records.length} records`
        );

        if (records.length > 0) {

            const matchingRecords =
                records.filter(record => {

                    const commodity =
                        record.Commodity
                            ?.toLowerCase()
                            .trim();

                    if (!commodity) {
                        return false;
                    }

                    return aliases.some(
                        cropAlias =>
                            commodity === cropAlias ||
                            commodity.includes(cropAlias)
                    );

                });

            if (matchingRecords.length > 0) {

                matchingRecords.sort(
                    (a, b) => {

                        return (
                            parseDate(b.Arrival_Date) -
                            parseDate(a.Arrival_Date)
                        );

                    }
                );

                const latest =
                    matchingRecords[0];

                console.log(
                    `✅ Found ${latest.Commodity} price in ${district}, ${state}`
                );

                return {

                    found: true,

                    scope: 'district',

                    state: state,

                    district: district,

                    commodity:
                        latest.Commodity,

                    variety:
                        latest.Variety,

                    market:
                        latest.Market,

                    modalPrice:
                        Number(latest.Modal_Price),

                    minPrice:
                        Number(latest.Min_Price),

                    maxPrice:
                        Number(latest.Max_Price),

                    arrivalDate:
                        latest.Arrival_Date

                };

            }

        }

    } catch (error) {

        console.log(
            `⚠️ Direct lookup failed for ${marketName}:`,
            error.message
        );

    }

}


    // ==========================================
    // FALLBACK: PAGINATED LOCATION SEARCH
    // ==========================================

    console.log(
        `⚠️ Direct crop lookup did not find the crop. Starting paginated search...`
    );


    const pageSize = 1000;

    // Search at most 50,000 records
    const maxRecordsToSearch = 50000;

    let offset = 0;

    let latestMatch = null;


    while (true) {

        console.log(
            `🌾 Searching ${district}, ${state} | offset: ${offset}`
        );


        const response =
            await axios.get(BASE_URL, {

                params: {

                    'api-key':
                        API_KEY,

                    format:
                        'json',

                    'filters[State]':
                        state,

                    'filters[District]':
                        district,

                    limit:
                        pageSize,

                    offset:
                        offset

                }

            });


        const records =
            response.data.records || [];


        const total =
            Number(response.data.total || 0);


        console.log(
            `📦 Received ${records.length} records | Total: ${total}`
        );


        const matchingRecords =
            records.filter(record => {

                const commodity =
                    record.Commodity
                        ?.toLowerCase()
                        .trim();


                if (!commodity) {
                    return false;
                }


                return aliases.some(alias =>
                    commodity === alias ||
                    commodity.includes(alias)
                );

            });


        matchingRecords.forEach(record => {

            if (!latestMatch) {

                latestMatch = record;

                return;

            }


            const currentDate =
                parseDate(
                    latestMatch.Arrival_Date
                );


            const newDate =
                parseDate(
                    record.Arrival_Date
                );


            if (newDate > currentDate) {

                latestMatch = record;

            }

        });


        offset += pageSize;


        if (
            records.length < pageSize ||
            offset >= total ||
            offset >= maxRecordsToSearch
        ) {
            break;
        }

    }


    // ==========================================
    // PAGINATED SEARCH FOUND PRICE
    // ==========================================

    if (latestMatch) {

        console.log(
            `✅ Latest ${latestMatch.Commodity} price found in ${district}, ${state}: ₹${latestMatch.Modal_Price}`
        );


        return {

            found: true,

            scope: 'district',

            state: state,

            district: district,

            commodity:
                latestMatch.Commodity,

            variety:
                latestMatch.Variety,

            market:
                latestMatch.Market,

            modalPrice:
                Number(latestMatch.Modal_Price),

            minPrice:
                Number(latestMatch.Min_Price),

            maxPrice:
                Number(latestMatch.Max_Price),

            arrivalDate:
                latestMatch.Arrival_Date

        };

    }


    // ==========================================
    // NO PRICE FOUND
    // ==========================================

    console.log(
        `❌ No ${aliases.join(', ')} price found in ${district}, ${state}`
    );


    return {

        found: false,

        scope: null,

        state: state,

        district: district,

        commodity: null,

        variety: null,

        market: null,

        modalPrice: null,

        minPrice: null,

        maxPrice: null,

        arrivalDate: null

    };

};

// ==========================================
// KARNATAKA DISTRICTS
// ==========================================

const KARNATAKA_DISTRICTS = [

    'Bagalkot',
    'Ballari',
    'Belagavi',
    'Bengaluru Rural',
    'Bengaluru Urban',
    'Bidar',
    'Chamarajanagar',
    'Chikkaballapur',
    'Chikkamagaluru',
    'Chitradurga',
    'Dakshina Kannada',
    'Davanagere',
    'Dharwad',
    'Gadag',
    'Hassan',
    'Haveri',
    'Kalaburagi',
    'Kodagu',
    'Kolar',
    'Koppal',
    'Mandya',
    'Mysuru',
    'Raichur',
    'Ramanagara',
    'Shivamogga',
    'Tumakuru',
    'Udupi',
    'Uttara Kannada',
    'Vijayapura',
    'Yadgir',
    'Vijayanagara'

];


module.exports = {
    fetchDistrictPrices,
    fetchLocationPrices,
    fetchLatestCropPrice,
    KARNATAKA_DISTRICTS
};