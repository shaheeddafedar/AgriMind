const express = require('express');

const apiController = require('../controllers/apiController');
const userController = require('../controllers/userController');
const isAuth = require('../middleware/isAuth');

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

router.get(
    '/market-prices',
    apiController.getMarketPrices
);

router.get(
    '/market-prices/districts',
    apiController.getKarnatakaDistricts
);

router.post(
    '/recommend',
    isAuth,
    apiController.postRecommendation
);

router.post(
    '/irrigation/check',
    isAuth,
    apiController.checkIrrigation
);

router.post(
    '/feedback',
    isAuth,
    apiController.postFeedback
);

router.get(
    '/analytics',
    apiController.getAnalyticsData
);

router.get(
    '/feedback',
    apiController.getFeedback
);

router.get(
    '/recommend/:userId',
    isAuth,
    apiController.getRecentRecommendations
);

router.get(
    '/home-stats',
    apiController.getHomeStats
);

router.get(
    '/profile',
    isAuth,
    async (req, res) => {
        try {
            const user = await userController.getProfileData(req);

            res.json({
                success: true,
                user
            });
        } catch (error) {
            console.error('API profile error:', error);

            res.status(500).json({
                success: false,
                message: 'Unable to fetch profile'
            });
        }
    }
);

router.get('/lang/:locale', (req, res) => {
    res.cookie('lang', req.params.locale);
    res.redirect('back');
});

module.exports = router;