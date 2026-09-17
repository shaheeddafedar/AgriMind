const express = require('express');
const apiController = require('../controllers/apiController');
const router = express.Router();

router.get('/farm/:farmId', apiController.getFarmDataById);

router.get(
    '/seasonal-temperature',
    apiController.getSeasonalTemperature
);

router.get(
    '/seasonal-humidity',
    apiController.getSeasonalHumidity
);

router.get(
    '/historical-rainfall',
    apiController.getHistoricalRainfall
);

router.get('/market-prices', apiController.getMarketPrices);
router.get(
    '/market-prices/districts',
    apiController.getKarnatakaDistricts
);
router.post('/recommend', apiController.postRecommendation);
router.post(
    '/irrigation/check',
    apiController.checkIrrigation
);
router.post('/feedback', apiController.postFeedback);
router.get('/analytics', apiController.getAnalyticsData);
router.get('/feedback', apiController.getFeedback); 
router.get('/recommend/:userId', apiController.getRecentRecommendations);
router.get('/lang/:locale', (req, res) => {
    res.cookie('lang', req.params.locale);
    res.redirect('back'); 
}); 

module.exports = router;